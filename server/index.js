import express from "express";
import cors from "cors";
import { ethers } from "ethers";

const app = express();
const PORT = process.env.PORT || 8787;

const verifiedWallets = new Map();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

function normalizeAddress(address) {
  if (typeof address !== "string") return null;
  try {
    return ethers.utils.getAddress(address.trim());
  } catch (error) {
    return null;
  }
}

function extractVerificationPayload(body = {}) {
  if (!body || typeof body !== "object") return {};
  const payload = body.proof || body.payload || body;
  const nestedSignature = payload?.signature || payload?.signedMessage || payload?.proofSignature;
  const nestedMessage =
    payload?.message || payload?.statement || payload?.originalMessage || payload?.payload || payload?.signedPayload;
  const nestedAddress = payload?.address || payload?.wallet || payload?.walletAddress || payload?.user || payload?.account;

  const signature = body.signature || nestedSignature || (payload?.siwe && payload.siwe.signature) || null;
  const message = body.message || nestedMessage || (payload?.siwe && payload.siwe.message) || null;
  const address =
    normalizeAddress(body.address || nestedAddress || (payload?.siwe && payload.siwe.address) || payload?.issuer) || null;

  return { signature, message, address };
}

function storeVerification(address, extra = {}) {
  if (!address) return;
  const record = {
    verified: true,
    address,
    timestamp: Date.now(),
    ...extra,
  };
  verifiedWallets.set(address.toLowerCase(), record);
}

function isVerified(address) {
  if (!address) return false;
  const record = verifiedWallets.get(address.toLowerCase());
  return Boolean(record?.verified);
}

app.get("/api/self/check", (req, res) => {
  try {
    const address = normalizeAddress(req.query.address || req.query.wallet || req.query.account);
    const verified = isVerified(address);
    return res.json({ verified });
  } catch (error) {
    console.error("❌ [Self] Check endpoint error", error);
    return res.status(500).json({ verified: false });
  }
});

app.post("/api/self/verify", async (req, res) => {
  try {
    const { signature, message, address } = extractVerificationPayload(req.body);

    if (!signature || !message || !address) {
      return res.status(400).json({ verified: false, error: "Missing signature payload" });
    }

    let recovered = null;
    try {
      recovered = ethers.utils.verifyMessage(message, signature);
    } catch (verifyError) {
      console.error("❌ [Self] Signature verification error", verifyError);
      return res.status(400).json({ verified: false, error: "Invalid signature" });
    }

    const normalizedRecovered = normalizeAddress(recovered);
    if (!normalizedRecovered || normalizedRecovered.toLowerCase() !== address.toLowerCase()) {
      return res.status(400).json({ verified: false, error: "Address mismatch" });
    }

    storeVerification(address, { messageHash: ethers.utils.hashMessage(message) });
    return res.json({ verified: true });
  } catch (error) {
    console.error("❌ [Self] Verification error", error);
    return res.status(500).json({ verified: false, error: "Verification failed" });
  }
});

app.get("/api/self/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use((err, _req, res, _next) => {
  console.error("❌ [Self] Unhandled server error", err);
  res.status(500).json({ verified: false, error: "Internal server error" });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Self verification server listening on port ${PORT}`);
  });
}

export default app;
