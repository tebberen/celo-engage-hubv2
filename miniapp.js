// 🌍 Global state – sadece mini app için
let miniAppSdk = null;
let miniAppProvider = null;
let miniAppSigner = null;
let miniAppAddress = null;

function shortenAddress(addr) {
  if (!addr) return "—";
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

function updateMiniAppUI() {
  const addrEl = document.getElementById("miniappAddress");
  if (!addrEl) return;

  if (!miniAppAddress) {
    addrEl.textContent = "Not connected";
  } else {
    addrEl.textContent = shortenAddress(miniAppAddress);
  }
}

// 🔑 Farcaster Wallet’e bağlan
async function connectFarcasterWallet() {
  try {
    console.log("[MiniApp] Connecting via Farcaster wallet…");

    const ethProvider = await miniAppSdk.wallet.getEthereumProvider();
    const web3Provider = new ethers.providers.Web3Provider(ethProvider, "any");
    const signer = web3Provider.getSigner();
    const address = await signer.getAddress();

    miniAppProvider = web3Provider;
    miniAppSigner = signer;
    miniAppAddress = address;

    console.log("[MiniApp] Connected:", address);
    updateMiniAppUI();

    // 👉 Buradan sonra GM / Donate kontrat çağrılarını bu signer ile yapacağız
  } catch (err) {
    console.error("[MiniApp] Farcaster wallet connection failed:", err);
  }
}

// 🚀 Mini App init
window.addEventListener("load", async () => {
  miniAppSdk = window.miniAppSdk || window.sdk;

  if (!miniAppSdk) {
    console.error("[MiniApp] SDK not found on window");
    return;
  }

  try {
    miniAppSdk.actions.ready();
    console.log("[MiniApp] sdk.actions.ready() called ✔️");
  } catch (err) {
    console.error("[MiniApp] Error calling sdk.actions.ready():", err);
    return;
  }

  updateMiniAppUI();
  await connectFarcasterWallet();
});
