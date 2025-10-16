// ========================= CELO ENGAGE HUB V2 - MAIN SCRIPT (FINAL FIXED) =========================
import { connectWalletMetaMask, disconnectWallet } from "./services/walletService.js";
import {
  setupUserProfile, createProposal, voteProposal, loadUserProfile,
  loadUserBadges, loadProposals, donateCelo, checkProfile
} from "./services/contractService.js";
import { INITIAL_SUPPORT_LINKS, CELO_ECOSYSTEM_LINKS } from "./utils/constants.js";
import { addSupport, getSupportCount, getCompletedLinks } from "./services/localSupportStore.js";

// DOM
const walletActionBtn = document.getElementById("walletActionBtn");
const donateButtons   = document.querySelectorAll(".donate-buttons button");
const gmBtn           = document.getElementById("gmBtn");
const deployBtn       = document.getElementById("deployBtn");
const governanceBtn   = document.getElementById("governanceBtn");
const badgeBtn        = document.getElementById("badgeBtn");
const profileBtn      = document.getElementById("profileBtn");
const contentArea     = document.getElementById("contentArea");

console.log("🚀 Celo Engage Hub V2 loaded — localStorage support system active");

// Platform etiketi (emoji + rozet)
function getPlatformBadge(url) {
  const u = url.toLowerCase();
  if (u.includes("mirror.xyz"))   return `<span class="platform-badge badge-mirror">✍️ Mirror</span>`;
  if (u.includes("galxe.com"))    return `<span class="platform-badge badge-galxe">🌌 Galxe</span>`;
  if (u.includes("warpcast.com")) return `<span class="platform-badge badge-warpcast">🧬 Warpcast</span>`;
  if (u.includes("inflynce.xyz")) return `<span class="platform-badge badge-inflynce">🟠 Inflynce</span>`;
  if (u.includes("layer3.xyz"))   return `<span class="platform-badge badge-layer3">💎 Layer3</span>`;
  if (u.includes("talentprotocol"))return `<span class="platform-badge badge-talent">👷 Talent</span>`;

  if (u.includes("farcaster.xyz")) return `<span class="platform-badge badge-farcaster">🟣 Farcaster</span>`;
  if (u.includes("warpcast"))      return `<span class="platform-badge badge-farcaster">🟣 Farcaster</span>`;
  if (u.includes("x.com") || u.includes("twitter.com")) return `<span class="platform-badge badge-x">🐦 X</span>`;
  if (u.includes("github.com"))    return `<span class="platform-badge badge-github">💻 GitHub</span>`;
  return `<span class="platform-badge badge-website">🌐 Website</span>`;
}

// Sayfa yüklendiğinde sol menü + link listesi
window.addEventListener("DOMContentLoaded", () => {
  // Celo Ecosystem
  const ecosystemBox = document.querySelector(".ecosystem-box ul");
  if (ecosystemBox && CELO_ECOSYSTEM_LINKS.length) {
    ecosystemBox.innerHTML = CELO_ECOSYSTEM_LINKS
      .map(link => `<li><a href="${link.url}" target="_blank">${link.name}</a></li>`)
      .join("");
  }

  // Support links
  const linkGrid = document.querySelector(".link-grid");
  if (linkGrid) renderSupportList(linkGrid);
});

function renderSupportList(linkGrid) {
  const completed   = getCompletedLinks();
  const activeLinks = INITIAL_SUPPORT_LINKS.filter(link => !completed.includes(link));

  // Aktifler
  linkGrid.innerHTML = activeLinks.map(link => {
    const count = getSupportCount(link);
    return `
      <div class="link-card">
        ${getPlatformBadge(link)}
        <p><a href="${link}" target="_blank" class="support-link">${link}</a></p>
        <p>Supports <b>${count}/5</b></p>
      </div>
    `;
  }).join("");

  // Click handler
  linkGrid.querySelectorAll(".support-link").forEach((a) => {
    a.addEventListener("click", () => {
      const url = a.getAttribute("href");
      const newCount = addSupport(url);
      a.parentElement.nextElementSibling.innerHTML = `Supports <b>${newCount}/5</b>`;
      if (newCount >= 5) {
        alert(`🎉 ${url} completed!`);
        // Completed alanını yeniden kurmak için sayfayı tazele
        location.reload();
      }
    });
  });

  // Completed bölümü
  const main = document.querySelector(".main-content");
  const completedLinks = getCompletedLinks();
  const existing = document.getElementById("completedSection");
  if (existing) existing.remove();

  if (completedLinks.length > 0) {
    const section = document.createElement("section");
    section.id = "completedSection";
    section.innerHTML = `
      <h3>✅ Completed Links</h3>
      <div class="link-grid">
        ${completedLinks.map(link => `
          <div class="link-card" style="opacity:.6">
            ${getPlatformBadge(link)}
            <p><a href="${link}" target="_blank">${link}</a></p>
            <p>✅ Completed (5/5)</p>
          </div>
        `).join("")}
      </div>
    `;
    main.appendChild(section);
  }
}

// Wallet connect / disconnect
walletActionBtn.addEventListener("click", async () => {
  const isConnected = walletActionBtn.textContent.includes("Disconnect");
  if (isConnected) {
    await disconnectWallet();
    walletActionBtn.textContent = "Connect Wallet";
    document.getElementById("walletStatus").innerHTML = `<p>🔴 Not connected</p><span id="networkLabel">—</span>`;
  } else {
    const res = await connectWalletMetaMask();
    if (res) {
      walletActionBtn.textContent = "Disconnect";
      document.getElementById("walletStatus").innerHTML =
        `<p>✅ Connected: ${res.userAddress.slice(0,6)}...${res.userAddress.slice(-4)}</p><span id="networkLabel">🌕 Celo Mainnet</span>`;
      await checkProfile();
    }
  }
});

// Donate
donateButtons.forEach((btn) => {
  btn.addEventListener("click", async () => {
    const amount = btn.getAttribute("data-amount");
    await donateCelo(amount);
  });
});

// GM / Deploy (placeholder)
gmBtn.addEventListener("click", () => { alert("☀️ Sending GM transaction..."); alert("✅ GM sent successfully!"); });
deployBtn.addEventListener("click", () => { alert("🧱 Deploy feature coming soon!"); });

// Governance
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
    const desc  = document.getElementById("proposalDescription").value.trim();
    if (!title || !desc) return alert("❌ Please fill all fields.");
    await createProposal(title, desc);
    await showProposals();
  });
  await showProposals();
});

async function showProposals() {
  const proposals = await loadProposals();
  const list = document.getElementById("proposalList");
  list.innerHTML = "";
  if (!proposals.length) { list.innerHTML = "<p>No active proposals yet.</p>"; return; }

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
    btn.addEventListener("click", async () => { await voteProposal(btn.getAttribute("data-id"), true); })
  );
  document.querySelectorAll(".voteAgainstBtn").forEach((btn) =>
    btn.addEventListener("click", async () => { await voteProposal(btn.getAttribute("data-id"), false); })
  );
}

// Profile
badgeBtn.addEventListener("click", async () => {
  const badges = await loadUserBadges();
  contentArea.innerHTML = `
    <h2>🎖️ Your Badges</h2>
    <div class="info-card">
      ${badges.length ? badges.map((b) => `<p>🏅 ${b}</p>`).join("") : "<p>No badges yet.</p>"}
    </div>
  `;
});

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
