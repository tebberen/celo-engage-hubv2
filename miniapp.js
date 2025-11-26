let miniAppSdk = null;
let miniAppProvider = null;
let miniAppSigner = null;
let miniAppAddress = null;

async function initializeMiniApp() {
  miniAppSdk = window.miniAppSdk || window.sdk;

  const addressLabel = document.getElementById("miniappAddress");

  if (!miniAppSdk) {
    console.error("Farcaster Mini App SDK not found on window");
    if (addressLabel) {
      addressLabel.textContent = "SDK not available";
    }
    return;
  }

  try {
    await miniAppSdk.actions.ready();
  } catch (error) {
    console.error("Error calling sdk.actions.ready():", error);
  }

  try {
    const ethProvider = await miniAppSdk.wallet.getEthereumProvider();
    miniAppProvider = new ethers.providers.Web3Provider(ethProvider, "any");
    miniAppSigner = miniAppProvider.getSigner();
    miniAppAddress = await miniAppSigner.getAddress();

    if (addressLabel) {
      addressLabel.textContent = miniAppAddress;
    }
  } catch (error) {
    console.error("Failed to connect to Farcaster wallet:", error);
    if (addressLabel) {
      addressLabel.textContent = "Connection failed";
    }
  }
}

window.addEventListener("load", () => {
  initializeMiniApp();
});
