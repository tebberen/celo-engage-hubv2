// ========================= CELO ENGAGE HUB V2 - MAIN SCRIPT (FINAL ON-CHAIN) ========================= //
// 🧠 UI, Wallet, Support, Link Submission ve Governance modüllerini yönetir

import { connectWalletMetaMask, disconnectWallet } from "./services/walletService.js";
import {
  setupUserProfile, createProposal, voteProposal, loadUserProfile,
  loadUserBadges, loadProposals, donateCelo, checkProfile, submitLinkOnChain
} from "./services/contractService.js";
import { INITIAL_SUPPORT_LINKS, CELO_ECOSYSTEM_LINKS } from "./utils/constants.js";
import { addSupport, getSupportCount, getCompletedLinks } from "./services/localSupportStore.js";

// ✅ DOM Elemanları
const walletActionBtn = document.getElementById("walletActionBtn");
const donateButtons = document.querySelectorAll(".donate-buttons button");
const gmBtn = document.getElementById("gmBtn");
const deployBtn = document.getElementById("deployBtn");
const governanceBtn = document.getElementById("governanceBtn");
const badgeBtn = document.getElementById("badgeBtn");
const profileBtn = document.getElementById("profileBtn");
const contentArea = document.getElementById("contentArea");

let hasSupported = false; // Kullanıcı destek verdiyse true olur
console.log("🚀 Celo Engage Hub V2 loaded — support + on-chain link system active");

// ✅ Sayfa yüklendiğinde
window.addEventListener("DOMContentLoaded", () => {
  // 🔹 Celo Ecosystem
  const ecosystemBox = document.querySelector(".ecosystem-box ul");
  if (ecosystemBox && CELO_ECOSYSTEM_LINKS.length) {
    ecosystemBox.innerHTML = CELO_ECOSYSTEM_LINKS
      .map(link => `<li><a href="${link.url}" target="_blank">${link.name}</a></li>`)
      .join("");
  }

  // 🔹 Support Members
  renderSupportLinks();
});

// 🧩 Support bölümü
function renderSupportLinks() {
  const linkGrid = document.querySelector(".link-grid");
  if (!linkGrid) return;

  const completed = getCompletedLinks();
  const activeLinks = INITIAL_SUPPORT_LINKS.filter(link => !completed.includes(link));

  linkGrid.innerHTML = activeLinks.map(link => {
    const count = getSupportCount(link);
    return `
      <div class="link-card">
        <span class="icon">🌐</span>
        <p><a href="${link}" target="_blank" class="support-link">${link}</a></p>
        <p>Supports <b>${count}/5</b></p>
      </div>`;
  }).join("");

  // ✅ Completed links
  const completedLinks = getCompletedLinks();
  const completedSection = document.createElement("section");
  completedSection.innerHTML = `
    <h3>✅ Completed Links</h3>
    <div class="link-grid">
      ${completedLinks.length
        ? completedLinks.map(link => `
          <div class="link-card" style="opacity:0.6;">
            <p><a href="${link}" target="_blank">${link}</a></p>
            <p>✅ Completed (5/5)</p>
          </div>`).join("")
        : `<p>No completed links yet.</p>`}
    </div>`;
  document.querySelector(".main-content").appendChild(completedSection);

  // 🔸 Destek tıklamaları
  document.querySelectorAll(".support-link").forEach(linkEl => {
    linkEl.addEventListener("click", () => {
      const link = linkEl.getAttribute("href");
      const newCount = addSupport(link);
      linkEl.parentElement.nextElementSibling.innerHTML = `Supports <b>${newCount}/5</b>`;
      hasSupported = true;

      if (newCount >= 5) {
        alert(`🎉 ${link} completed!`);
        location.reload();
      } else {
        showSubmitLinkSection(); // 1 destek verildiyse link bırakma bölümü açılır
      }
    });
  });
}

// 🧩 Link bırakma bölümü (UI)
function showSubmitLinkSection() {
  contentArea.innerHTML = `
    <h2>✍️ Submit Your Link</h2>
    <div class="info-card">
      <p>💡 You supported a community member! Now share your own link.</p>
      <input type="text" id="userLinkInput" placeholder="Enter your link (https://...)" 
        style="width:80%;padding:8px;margin-bottom:10px;border-radius:6px;border:1px solid #ccc;" />
      <button id="submitLinkBtn">🚀 Submit On-Chain</button>
    </div>`;

  document.getElementById("submitLinkBtn").addEventListener("click", async () => {
    const link = document.getElementById("userLinkInput").value.trim();
    if (!link) return alert("❌ Please enter a link before submitting.");
    try {
      document.getElementById("submitLinkBtn").disabled = true;
      document.getElementById("submitLinkBtn").textContent = "⏳ Sending TX...";
      const tx = await submitLinkOnChain(link);
      if (tx) {
        alert("✅ Link submitted successfully on-chain!");
        location.reload();
      }
    } catch (err) {
      console.error(err);
      alert("❌ Failed to submit link on-chain.");
    } finally {
      document.getElementById("submitLinkBtn").disabled = false;
      document.getElementById("submitLinkBtn").textContent = "🚀 Submit On-Chain";
    }
  });
}

// ✅ Wallet Connect / Disconnect
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
      document.getElementById("walletStatus").innerHTML =
        `<p>✅ Connected: ${result.userAddress.slice(0,6)}...${result.userAddress.slice(-4)}</p><span id="networkLabel">🌕 Celo Mainnet</span>`;
      await checkProfile();
    }
  }
});

// ✅ Donate işlemi
donateButtons.forEach(btn => {
  btn.addEventListener("click", async () => {
    const amount = btn.getAttribute("data-amount");
    await donateCelo(amount);
  });
});

// ✅ GM, Deploy, Governance, Badge, Profile Butonları
gmBtn.addEventListener("click", () => alert("☀️ GM sent successfully!"));
deployBtn.addEventListener("click", () => alert("🧱 Deploy feature coming soon!"));

// 🏛️ Governance
governanceBtn.addEventListener("click", async () => {
  contentArea.innerHTML = `
    <h2>🏛️ Governance</h2>
    <div class="info-card">
      <h3>Create Proposal</h3>
      <input type="text" id="proposalTitle" placeholder="Title" style="width:80%;padding:8px;margin:8px 0;border-radius:6px;border:1px solid #ccc;" />
      <textarea id="proposalDesc" rows="3" placeholder="Description" style="width:80%;padding:8px;border-radius:6px;border:1px solid #ccc;"></textarea>
      <button id="createProposalBtn">📝 Submit</button>
    </div>
    <div id="proposalList"></div>`;

  document.getElementById("createProposalBtn").addEventListener("click", async () => {
    const title = document.getElementById("proposalTitle").value.trim();
    const desc = document.getElementById("proposalDesc").value.trim();
    if (!title || !desc) return alert("❌ Fill all fields.");
    await createProposal(title, desc);
    await showProposals();
  });

  await showProposals();
});

async function showProposals() {
  const proposals = await loadProposals();
  const list = document.getElementById("proposalList");
  list.innerHTML = proposals.length
    ? proposals.map(p => `
        <div class="info-card">
          <h4>${p.title}</h4>
          <p>${p.description}</p>
          <p>👍 ${p.votesFor} | 👎 ${p.votesAgainst}</p>
          <button class="voteForBtn" data-id="${p.id}">👍</button>
          <button class="voteAgainstBtn" data-id="${p.id}">👎</button>
        </div>`).join("")
    : "<p>No proposals yet.</p>";

  document.querySelectorAll(".voteForBtn").forEach(btn =>
    btn.addEventListener("click", () => voteProposal(btn.dataset.id, true))
  );
  document.querySelectorAll(".voteAgainstBtn").forEach(btn =>
    btn.addEventListener("click", () => voteProposal(btn.dataset.id, false))
  );
}

// 🎖️ Badges
badgeBtn.addEventListener("click", async () => {
  const badges = await loadUserBadges();
  contentArea.innerHTML = `
    <h2>🎖️ Your Badges</h2>
    <div class="info-card">
      ${badges.length ? badges.map(b => `<p>🏅 ${b}</p>`).join("") : "<p>No badges yet.</p>"}
    </div>`;
});

// 👤 Profile
profileBtn.addEventListener("click", async () => {
  const profile = await loadUserProfile();
  contentArea.innerHTML = `
    <h2>👤 Your Profile</h2>
    <div class="info-card">
      ${
        profile && profile.isActive
          ? `
        <p><b>Username:</b> ${profile.username}</p>
        <p><b>Link:</b> <a href="${profile.link}" target="_blank">${profile.link}</a></p>
        <p><b>Supports:</b> ${profile.supportCount}</p>
        <p><b>Badges:</b> ${profile.badgeCount}</p>`
          : `
        <p>Setup your profile:</p>
        <input type="text" id="username" placeholder="Username" style="width:80%;padding:8px;margin:8px;border-radius:6px;border:1px solid #ccc;" />
        <input type="text" id="link" placeholder="Your link" style="width:80%;padding:8px;margin-bottom:8px;border-radius:6px;border:1px solid #ccc;" />
        <button id="setupProfileBtn">🚀 Setup</button>`
      }
    </div>`;

  const setupBtn = document.getElementById("setupProfileBtn");
  if (setupBtn) {
    setupBtn.addEventListener("click", async () => {
      const username = document.getElementById("username").value.trim();
      const link = document.getElementById("link").value.trim();
      if (!username || !link) return alert("❌ Fill all fields.");
      await setupUserProfile(username, link);
      alert("✅ Profile setup complete!");
    });
  }
});
