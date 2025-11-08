import express from "express";
import cors from "cors";
import { SelfBackendVerifier } from "@selfxyz/core";

const app = express();
const PORT = process.env.PORT || 8787;
const SELF_SCOPE = process.env.SELF_SCOPE || "celo-engage-hub";
const SELF_ENDPOINT = process.env.SELF_ENDPOINT || "https://api.self.xyz";
const SELF_USER_IDENTIFIER = process.env.SELF_USER_IDENTIFIER_TYPE || "wallet";

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));

const verifier = new SelfBackendVerifier({
  scope: SELF_SCOPE,
  endpoint: SELF_ENDPOINT,
  userIdentifierType: SELF_USER_IDENTIFIER,
});

app.post("/api/self/verify", async (req, res) => {
  try {
    const proofPayload = req.body?.proof;
    if (!proofPayload) {
      return res.status(400).json({ error: "Missing verification proof" });
    }
    const result = await verifier.verifyProof(proofPayload);
    if (result?.verified) {
      return res.json({ status: "verified" });
    }
    return res.json({ status: "failed" });
  } catch (error) {
    console.error("Verification Error:", error);
    return res.status(500).json({ error: "Verification failed" });
  }
});

app.get("/api/self/health", (_req, res) => {
  res.json({ status: "ok" });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Self verification server listening on port ${PORT}`);
  });
}

export default app;
