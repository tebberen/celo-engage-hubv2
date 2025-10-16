// ========================= CELO ENGAGE HUB V2 - MAIN (FINAL) =========================
import { connectWalletMetaMask, disconnectWallet } from "./services/walletService.js";
import { donateCelo, checkProfile, loadProposals, voteProposal, loadUserBadges, loadUserProfile, createProposal, setupUserProfile } from "./services/contractService.js";
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

// ---- Helpers
function getPlatformBadge(url){
  const u = url.toLowerCase();
  if (u.includes("mirror.xyz"))        return `<span class="platform-badge badge-mirror">✍️ Mirror</span>`;
  if (u.includes("galxe.com"))         return `<span class="platform-badge badge-galxe">🌌 Galxe</span>`;
  if (u.includes("warpcast.com"))      return `<span class="platform-badge badge-warpcast">🧬 Warpcast</span>`;
  if (u.includes("inflynce.xyz"))      return `<span class="platform-badge badge-inflynce">🟠 Inflynce</span>`;
  if (u.includes("layer3.xyz"))        return `<span class="platform-badge badge-layer3">💎 Layer3</span>`;
  if (u.includes("talentprotocol.com"))return `<span class="platform-badge badge-talent">👷 Talent</span>`;

  if (u.includes("farcaster.xyz"))     return `<span class="platform-badge badge-farcaster">🟣 Farcaster</span>`;
  if (u.includes("x.com") || u.includes("twitter.com"))
                                      return `<span class="platform-badge badge-x">🐦 X</span>`;
  if (u.includes("github.com"))        return `<span class="platform-badge badge-github">💻 GitHub</span>`;
  return `<span class="platform-badge badge-website">🌐 Website</span>`;
}

function renderSupportLists(){
  const grid = document.querySelector(".link-grid");
  if (!grid) return;

  const completed = new Set(getCompletedLinks());
  const active = INITIAL_SUPPORT_LINKS.filter(l => !completed.has(l));

  // Aktif kartlar
  grid.innerHTML = active.map(link => {
    const count = getSupportCount(link);
    return `
      <div class="link-card">
        ${getPlatformBadge(link)}
        <p><a href="${link}" target="_blank" class="support-link">${link}</a></p>
        <p>Supports <b class="count">${count}/5</b></p>
      </div>
    `;
  }).join("");

  // Click handler
  grid.querySelectorAll(".support-link").forEach(a => {
    a.addEventListener("click", () => {
      const link = a.getAttribute("href");
      const newCount = addSupport(link);
      a.parentElement.nextElementSibling.querySelector(".count").textContent = `${newCount}/5`;
      if (newCount >= 5) {
        renderSupportLists(); // otomatik completed’a taşır
      }
    });
  });

  // Completed bölümü
  const main = document.querySelector(".main-content");
  const old = document.getElementById("completedSection");
  if (old) old.remove();

  const completedArr = Array.from(completed);
  if (completedArr.length){
    const section = document.createElement("section");
    section.id = "completedSection";
    section.innerHTML = `
      <h3>✅ Completed Links</h3>
      <div class="link-grid">
        ${completedArr.map(link => `
          <div class="link-card" style="opacity:.65">
            ${getPlatformBadge(link)}
            <p><a href="${link}" target="_blank">${link}</a></p>
            <p>✅ Completed (5/5)</p>
          </div>
        `).join("")}
      </div>`;
    main.appendChild(section);
  }
}

// ---- Initial fill
window.addEventListener("DOMContentLoaded", () => {
  const eco = document.querySelector(".ecosystem-box ul");
  if (eco) {
    eco.innerHTML = CELO_ECOSYSTEM_LINKS.map(l => `<li><a href="${l.url}" target="_blank">${l.name}</a></li>`).join("");
  }
  renderSupportLists();
});

// ---- Wallet button
walletActionBtn.addEventListener("click", async () => {
  const isConnected = walletActionBtn.textContent.includes("Disconnect");
  if (isConnected){
    await disconnectWallet();
    walletActionBtn.textContent = "Connect Wallet";
    document.getElementById("walletStatus").innerHTML = `<p>🔴 Not connected</p><span id="networkLabel">—</span>`;
  } else {
    const res = await connectWalletMetaMask();
    if (res){
      walletActionBtn.textContent = "Disconnect";
      document.getElementById("walletStatus").innerHTML = `<p>✅ Connected: ${res.userAddress.slice(0,6)}...${res.userAddress.slice(-4)}</p><span id="networkLabel">🌕 Celo</span>`;
      await checkProfile();
    }
  }
});

// ---- Donate
donateButtons.forEach(btn => btn.addEventListener("click", async () => {
  const amount = btn.getAttribute("data-amount");
  await donateCelo(amount);
}));

// ---- Placeholders / Governance / Profile (eskisiyle aynı akış)
gmBtn.addEventListener("click", () => { alert("☀️ GM!"); });
deployBtn.addEventListener("click", () => { alert("🧱 Deploy feature coming soon!"); });

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
    const t = document.getElementById("proposalTitle").value.trim();
    const d = document.getElementById("proposalDescription").value.trim();
    if (!t || !d) return alert("❌ Please fill all fields.");
    await createProposal(t, d);
    await showProposals();
  });
  await showProposals();
});

async function showProposals(){
  const proposals = await loadProposals();
  const list = document.getElementById("proposalList");
  list.innerHTML = proposals.length ? "" : "<p>No active proposals yet.</p>";
  proposals.forEach(p => {
    const el = document.createElement("div");
    el.className = "info-card";
    el.innerHTML = `
      <h4>${p.title}</h4>
      <p>${p.description}</p>
      <p>👍 ${p.votesFor} | 👎 ${p.votesAgainst}</p>
      <button class="voteForBtn" data-id="${p.id}">👍 Support</button>
      <button class="voteAgainstBtn" data-id="${p.id}">👎 Oppose</button>`;
    list.appendChild(el);
  });
  document.querySelectorAll(".voteForBtn").forEach(b => b.addEventListener("click", async ()=>{ await voteProposal(b.dataset.id,true); }));
  document.querySelectorAll(".voteAgainstBtn").forEach(b => b.addEventListener("click", async ()=>{ await voteProposal(b.dataset.id,false); }));
}

badgeBtn.addEventListener("click", async () => {
  const badges = await loadUserBadges();
  contentArea.innerHTML = `
    <h2>🎖️ Your Badges</h2>
    <div class="info-card">
      ${badges.length ? badges.map(b=>`<p>🏅 ${b}</p>`).join("") : "<p>No badges yet.</p>"}
    </div>`;
});

profileBtn.addEventListener("click", async () => {
  const profile = await loadUserProfile();
  contentArea.innerHTML = `
    <h2>👤 Your Profile</h2>
    <div class="info-card">
      ${profile && profile.isActive ? `
        <p><strong>Username:</strong> ${profile.username}</p>
        <p><strong>Link:</strong> <a href="${profile.link}" target="_blank">${profile.link}</a></p>
        <p><strong>Supports:</strong> ${profile.supportCount}</p>
        <p><strong>Badges:</strong> ${profile.badgeCount}</p>`
      : `
        <p>Setup your profile</p>
        <input type="text" id="username" placeholder="Enter username" style="width:80%;padding:8px;margin:8px 0;border-radius:6px;border:1px solid #ccc;" />
        <input type="text" id="link" placeholder="Enter your link" style="width:80%;padding:8px;margin-bottom:8px;border-radius:6px;border:1px solid #ccc;" />
        <button id="setupProfileBtn">🚀 Setup Profile</button>`}
    </div>`;
  const setupBtn = document.getElementById("setupProfileBtn");
  if (setupBtn){
    setupBtn.addEventListener("click", async ()=>{
      const u = document.getElementById("username").value.trim();
      const l = document.getElementById("link").value.trim();
      if (!u || !l) return alert("❌ Please fill all fields.");
      await setupUserProfile(u, l);
      alert("✅ Profile setup complete!");
    });
  }
});
