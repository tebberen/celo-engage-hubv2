// ========================= CELO ENGAGE HUB V2 - MAIN SCRIPT ========================= //
// 🧠 Tüm UI etkileşimleri, olaylar ve modül bağlantılarını yönetir.

import { connectWalletMetaMask, disconnectWallet } from "./services/walletService.js";
import { 
  setupUserProfile, createProposal, voteProposal, loadUserProfile,
  loadUserBadges, loadProposals, donateCelo, checkProfile
} from "./services/contractService.js";
import { INITIAL_SUPPORT_LINKS, CELO_ECOSYSTEM_LINKS } from "./utils/constants.js";

// ✅ DOM Elementleri
const walletActionBtn = document.getElementById("walletActionBtn");
const donateButtons = document.querySelectorAll(".donate-buttons button");
const gmBtn = document.getElementById("gmBtn");
const deployBtn = document.getElementById("deployBtn");
const governanceBtn = document.getElementById("governanceBtn");
const badgeBtn = document.getElementById("badgeBtn");
const profileBtn = document.getElementById("profileBtn");
const contentArea = document.getElementById("contentArea");

console.log("🚀 Celo Engage Hub V2 loaded — ecosystem + wallet + support integration active");

// 🧩 Platforma göre emoji ve rozet belirleme
function getPlatformBadge(url) {
  const lower = url.toLowerCase();

  if (lower.includes("farcaster"))
    return { emoji: "🟣", name: "Farcaster", cssClass: "badge-farcaster" };
  if (lower.includes("x.com") || lower.includes("twitter"))
    return { emoji: "🐦", name: "X", cssClass: "badge-x" };
  if (lower.includes("mirror.xyz"))
    return { emoji: "✍️", name: "Mirror", cssClass: "badge-mirror" };
  if (lower.includes("galxe.com"))
    return { emoji: "🌌", name: "Galxe", cssClass: "badge-galxe" };
  if (lower.includes("warpcast.com"))
    return { emoji: "🧬", name: "Warpcast", cssClass: "badge-warpcast" };
  if (lower.includes("inflynce.xyz"))
    return { emoji: "🟠", name: "Inflynce", cssClass: "badge-inflynce" };
  if (lower.includes("layer3.xyz"))
    return { emoji: "💎", name: "Layer3", cssClass: "badge-layer3" };
  if (lower.includes("talentprotocol.com"))
    return { emoji: "👷", name: "Talent", cssClass: "badge-talent" };
  if (lower.includes("github"))
    return { emoji: "💻", name: "GitHub", cssClass: "badge-github" };
  if (lower.includes("celo") || lower.includes("website"))
    return { emoji: "🌐", name: "Website", cssClass: "badge-website" };

  return { emoji: "🔗", name: "Link", cssClass: "" };
}

// ✅ DOM yüklendiğinde Celo Ecosystem ve Support Members bölümlerini doldur
window.addEventListener("DOMContentLoaded", () => {
  // 🔹 Celo Ecosystem linkleri
  const ecosystemBox = document.querySelector(".ecosystem-box ul");
  if (ecosystemBox && CELO_ECOSYSTEM_LINKS.length) {
    ecosystemBox.innerHTML = CELO_ECOSYSTEM_LINKS
      .map(link => `<li><a href="${link.url}" target="_blank">${link.name}</a></li>`)
      .join("");
  }

  // 🔹 Support Members (INITIAL_SUPPORT_LINKS)
  const linkGrid = document.querySelector(".link-grid");
  if (linkGrid && INITIAL_SUPPORT_LINKS.length) {
    linkGrid.innerHTML = INITIAL_SUPPORT_LINKS.map((link) => {
      const { emoji, name, cssClass } = getPlatformBadge(link);
      return `
        <div class="link-card">
          <div class="platform-badge ${cssClass}">${emoji} ${name}</div>
          <p><a href="${link}" target="_blank">${link}</a></p>
          <p>Supports <b>0/5</b></p>
        </div>
      `;
    }).join("");
  }
});

// ✅ Tek butonla bağlan / çıkış
walletActionBtn.addEventListener("click", async () => {
  const isConnected = walletActionBtn.textContent.includes("Disconnect");

  if (isConnected) {
    await disconnectWallet();
    walletActionBtn.textContent = "Connect Wallet";
    document.getElementById("walletStatus").innerHTML = `<p>🔴 Not connected</p><span id="networkLabel">—</span>`;
  } else {
    const result = await connectWalletMetaMask();
    if (result) {
      walletActionBtn.textContent = "Disconnect";
      document.getElementById("walletStatus").innerHTML = `<p>✅ Connected: ${result.userAddress.slice(0,6)}...${result.userAddress.slice(-4)}</p><span id="networkLabel">🌕 Celo Mainnet</span>`;
      await checkProfile();
    }
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
