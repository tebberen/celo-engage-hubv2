// ==== FARCASTER MINI APP: UI RENDERER ====

function renderMiniApp(root) {
  root.classList.remove("miniapp-placeholder");
  root.innerHTML = `
    <div class="miniapp-container">
      <div class="miniapp-header">
        <p class="miniapp-subtitle">Farcaster MiniPlay</p>
        <h1 class="miniapp-title">Celo Engage Hub – Mini App</h1>
        <p class="miniapp-subtitle">GM, Deploy, Donate, and Profiles for Farcaster</p>
      </div>

      <div class="miniapp-actions">
        <button id="btn-gm">✨ Send GM</button>
        <button id="btn-deploy">🚀 Open Deploy Panel</button>
        <button id="btn-donate">💛 Donate on Celo</button>
      </div>

      <div class="miniapp-footer">Mini app view optimized for mobile Farcaster frames.</div>
    </div>
  `;

  root.querySelector("#btn-gm")?.addEventListener("click", () => {
    console.log("[MiniApp] GM clicked");
    alert("GM from Celo Engage Hub Mini App!");
  });

  root.querySelector("#btn-deploy")?.addEventListener("click", () => {
    console.log("[MiniApp] Deploy clicked");
    alert("Deploy panel coming soon…");
  });

  root.querySelector("#btn-donate")?.addEventListener("click", () => {
    console.log("[MiniApp] Donate clicked");
    alert("Donate flow coming soon…");
  });
}

function initMiniApp() {
  const root = document.getElementById("miniapp-root");
  if (!root) {
    console.error("[MiniApp] Root element #miniapp-root not found");
    return;
  }

  renderMiniApp(root);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMiniApp);
} else {
  initMiniApp();
}
// ==== FARCASTER MINI APP: END ====
