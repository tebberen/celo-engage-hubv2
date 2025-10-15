// ========================= CELO ENGAGE HUB V2 - MAIN SCRIPT ========================= //
// 🧠 Tüm UI etkileşimleri, olaylar ve modül bağlantılarını yönetir.

import { connectWalletMetaMask, disconnectWallet, checkCurrentNetwork } from "./services/walletService.js";
import { setupUserProfile, createProposal, voteProposal, loadUserProfile, loadUserBadges, loadProposals, donateCelo, checkProfile } from "./services/contractService.js";
import { INITIAL_SUPPORT_LINKS } from "./utils/constants.js";

// ✅ DOM Elementleri
const connectBtn = document.getElementById("connectWalletBtn");
const donateButtons = document.querySelectorAll(".donate-buttons button");

const gmBtn = document.getElementById("gmBtn");
const deployBtn = document.getElementById("deployBtn");
const governanceBtn = document.getElementById("governanceBtn");
const badgeBtn = document.getElementById("badgeBtn");
const profileBtn = document.getElementById("profileBtn");
const contentArea = document.getElementById("contentArea");

// ✅ Uygulama başlatıldığında
window.addEventListener("load", async () => {
  console.log("🚀 Celo Engage Hub V2 initialized (manual wallet connection mode)");
  // ❌ Artık otomatik bağlantı yok!
  // Sadece chain değişimi dinleniyor
  if (typeof window.ethereum !== "undefined") {
    window.ethereum.on("chainChanged", async () => {
      await checkCurrentNetwork();
    });
  }
});

// ✅ Wallet bağlantısı (manuel)
connectBtn.addEventListener("click", async () => {
  const result = await connectWalletMetaMask();
  if (result) {
    alert("✅ Wallet connected successfully!");
    await checkProfile(); // profil kontrolü eklendi
  }
});

// ✅ Donate işlemleri
donateButtons.forEach((btn) => {
  btn.addEventListener("click", async () => {
    const amount = btn.getAttribute("data-amount");
    await donateCelo(amount);
  });
});

// ✅ GM butonu
gmBtn.addEventListener("click", async () => {
  alert("☀️ Sending GM transaction... (placeholder)");
  await checkCurrentNetwork();
  alert("✅ GM sent successfully!");
});

// ✅ Deploy butonu
deployBtn.addEventListener("click", async () => {
  alert("🧱 Deploy feature coming soon!");
});

// ✅ Governance butonu
governanceBtn.addEventListener("click", async () => {
  contentArea.innerHTML = `
    <h2>🏛️ Community Governance</h2>
    <div class="info-card">
      <h3>Create New Proposal</h3>
      <input type="text" id="proposalTitle" placeholder="Proposal title" style="width:80%;padding:8px;margin:8px 0;border-radius:6px;border:1px solid #ccc;" />
      <textarea id="proposalDescription" rows="3" placeholder="Proposal description" style="width:80%;padding:8px;border-radius:6px;border:1px solid #ccc;"></textarea>
      <button id="createProposalBtn">📝 Submit Proposal</button>
    </div>
    <div id="proposalList"></div>
  `;

  document.getElementById("createProposalBtn").addEventListener("click", async () => {
    const title = document.getElementById("proposalTitle").value.trim();
    const desc = document.getElementById("proposalDescription").value.trim();
    if (!title || !desc) return alert("❌ Please fill all fields.");
    await createProposal(title, desc);
    await showProposals();
  });

  await showProposals();
});

// ✅ Proposal’ları göster
async function showProposals() {
  const proposals = await loadProposals();
  const list = document.getElementById("proposalList");
  list.innerHTML = "";

  if (!proposals.length) {
    list.innerHTML = "<p>No active proposals yet.</p>";
    return;
  }

  proposals.forEach((p) => {
    const card = document.createElement("div");
    card.className = "info-card";
    card.innerHTML = `
      <h4>${p.title}</h4>
      <p>${p.description}</p>
      <p>👍 ${p.votesFor} | 👎 ${p.votesAgainst}</p>
      <button class="voteForBtn" data-id="${p.id}">👍 Support</button>
      <button class="voteAgainstBtn" data-id="${p.id}">👎 Oppose</button>
    `;
    list.appendChild(card);
  });

  document.querySelectorAll(".voteForBtn").forEach((btn) =>
    btn.addEventListener("click", async () => {
      await voteProposal(btn.getAttribute("data-id"), true);
    })
  );
  document.querySelectorAll(".voteAgainstBtn").forEach((btn) =>
    btn.addEventListener("click", async () => {
      await voteProposal(btn.getAttribute("data-id"), false);
    })
  );
}

// ✅ Badge butonu
badgeBtn.addEventListener("click", async () => {
  const badges = await loadUserBadges();
  contentArea.innerHTML = `
    <h2>🎖️ Your Badges</h2>
    <div class="info-card">
      ${badges.length ? badges.map((b) => `<p>🏅 ${b}</p>`).join("") : "<p>No badges yet.</p>"}
    </div>
  `;
});

// ✅ Profile butonu
profileBtn.addEventListener("click", async () => {
  const profile = await loadUserProfile();
  contentArea.innerHTML = `
    <h2>👤 Your Profile</h2>
    <div class="info-card">
      ${
        profile && profile.isActive
          ? `
        <p><strong>Username:</strong> ${profile.username}</p>
        <p><strong>Link:</strong> <a href="${profile.link}" target="_blank">${profile.link}</a></p>
        <p><strong>Supports:</strong> ${profile.supportCount}</p>
        <p><strong>Badges:</strong> ${profile.badgeCount}</p>
      `
          : `
        <p>Setup your profile</p>
        <input type="text" id="username" placeholder="Enter username" style="width:80%;padding:8px;margin:8px 0;border-radius:6px;border:1px solid #ccc;" />
        <input type="text" id="link" placeholder="Enter your link" style="width:80%;padding:8px;margin-bottom:8px;border-radius:6px;border:1px solid #ccc;" />
        <button id="setupProfileBtn">🚀 Setup Profile</button>
      `
      }
    </div>
  `;

  const setupBtn = document.getElementById("setupProfileBtn");
  if (setupBtn) {
    setupBtn.addEventListener("click", async () => {
      const username = document.getElementById("username").value.trim();
      const link = document.getElementById("link").value.trim();
      if (!username || !link) return alert("❌ Please fill all fields.");
      await setupUserProfile(username, link);
      alert("✅ Profile setup complete!");
    });
  }
});
