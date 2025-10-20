// ========================= CELO ENGAGE HUB V2 - MAIN SCRIPT ========================= //
import { connectWalletMetaMask, disconnectWallet } from "./services/walletService.js";
import { 
  setupUserProfile, createProposal, voteProposal, loadUserProfile,
  loadUserBadges, loadProposals, donateCelo, checkProfile,
  submitEmptyTransaction  // ✅ Yeni kontrat ile link gönderme
} from "./services/contractService.js";
import { INITIAL_SUPPORT_LINKS, CELO_ECOSYSTEM_LINKS } from "./utils/constants.js";

// ✅ EKSİK FONKSİYONU EKLİYORUZ
let userAddress = "";

function getUserAddress() {
    return userAddress || "0x0000000000000000000000000000000000000000";
}

// DOM Elementleri
const walletActionBtn = document.getElementById("walletActionBtn");
const donateButtons = document.querySelectorAll(".donate-buttons button");
const gmBtn = document.getElementById("gmBtn");
const deployBtn = document.getElementById("deployBtn");
const governanceBtn = document.getElementById("governanceBtn");
const badgeBtn = document.getElementById("badgeBtn");
const profileBtn = document.getElementById("profileBtn");
const contentArea = document.getElementById("contentArea");

console.log("🚀 Celo Engage Hub V2 loaded — transaction system active");

// localStorage fonksiyonları
function supportLinkInLocalStorage(link, userAddress) {
  const links = JSON.parse(localStorage.getItem('celoEngageLinks') || '[]');
  const linkIndex = links.findIndex(l => l.link === link);
  
  if (linkIndex !== -1) {
    links[linkIndex].supportCount++;
    localStorage.setItem('celoEngageLinks', JSON.stringify(links));
    return true;
  }
  return false;
}

function saveLinkToLocalStorage(link, userAddress) {
  const links = JSON.parse(localStorage.getItem('celoEngageLinks') || '[]');
  const newLink = {
    link: link,
    submitter: userAddress,
    supportCount: 0,
    timestamp: Date.now()
  };
  links.push(newLink);
  localStorage.setItem('celoEngageLinks', JSON.stringify(links));
}

function getLinksFromLocalStorage() {
  const storedLinks = JSON.parse(localStorage.getItem('celoEngageLinks') || '[]');
  
  if (storedLinks.length === 0) {
    const initialLinks = INITIAL_SUPPORT_LINKS.map(link => ({
      link: link,
      submitter: "community",
      supportCount: 0,
      timestamp: Date.now()
    }));
    localStorage.setItem('celoEngageLinks', JSON.stringify(initialLinks));
    return initialLinks;
  }
  
  return storedLinks;
}

function getPlatformName(url) {
  if (url.includes('x.com') || url.includes('twitter.com')) return '🐦 X';
  if (url.includes('farcaster.xyz') || url.includes('warpcast.com')) return '🔮 Farcaster';
  if (url.includes('github.com')) return '💻 GitHub';
  if (url.includes('youtube.com')) return '📺 YouTube';
  if (url.includes('discord.com')) return '💬 Discord';
  return '🌐 Website';
}

function displaySupportLinks() {
  const container = document.getElementById('linksContainer');
  if (!container) return;

  const links = getLinksFromLocalStorage();
  container.innerHTML = '';
  
  links.forEach((linkData) => {
    const platform = getPlatformName(linkData.link);
    const linkCard = document.createElement('div');
    linkCard.innerHTML = `
      <div class="link-card">
        <div>
          <div class="link-platform">${platform}</div>
          <a href="${linkData.link}" target="_blank" class="support-link">
            ${linkData.link}
          </a>
        </div>
        <div class="link-stats">
          <div class="stat-item">
            <div>Supports</div>
            <div class="stat-value">${linkData.supportCount}/5</div>
          </div>
        </div>
        <button class="supportBtn" onclick="handleSupportClick('${linkData.link}')">👍 Support This Content</button>
      </div>
    `;
    container.appendChild(linkCard);
  });
}

function handleSupportClick(linkUrl) {
  const currentUserAddress = getUserAddress();
  if (!currentUserAddress || currentUserAddress === "0x0000000000000000000000000000000000000000") {
    alert("Lütfen önce wallet bağlayın!");
    return;
  }
  
  const success = supportLinkInLocalStorage(linkUrl, currentUserAddress);
  if (success) {
    showLinkSubmitForm();
  }
}

function showLinkSubmitForm() {
  const contentArea = document.getElementById('contentArea');
  contentArea.innerHTML = `
    <div class="step-indicator">
      <span class="step-number">2</span> Your Turn to Share!
    </div>
    <div class="step-container">
      <h3>🎉 Share Your Own Link</h3>
      <p>You supported a community member. Now share your own link!</p>
      <input type="text" id="userLinkInput" placeholder="Paste your X, Farcaster, GitHub link..." 
             style="width: 80%; padding: 12px; margin: 15px 0; border-radius: 8px; border: 2px solid #FBCC5C;" />
      <button onclick="submitUserLink()" style="background: #35D07F; color: black; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; margin: 10px;">
        ✍️ Submit Your Link
      </button>
      <br>
      <button onclick="displaySupportLinks()" style="background: #666; color: white; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; margin: 5px;">
        ← Back to Support List
      </button>
    </div>
  `;
}

// ✅ GÜNCELLENMİŞ: Yeni kontrat ile link gönderme
async function submitUserLink() {
  const userLink = document.getElementById('userLinkInput').value.trim();
  if (!userLink) return alert("Lütfen linkinizi girin!");
  
  try {
    // ✅ Yeni kontrat ile transaction at (userLink parametresi eklendi)
    const txSuccess = await submitEmptyTransaction(userLink);
    
    // ✅ Transaction başarılıysa hem blockchain'e kaydedildi hem de localStorage'a
    if (txSuccess) {
      const currentUserAddress = getUserAddress();
      saveLinkToLocalStorage(userLink, currentUserAddress);
      alert("✅ Teşekkürler! Linkiniz hem blockchain'de hem de topluluk listesinde yayınlandı.");
      displaySupportLinks();
    }
  } catch (error) {
    console.error("Submit error:", error);
    alert("❌ Link gönderilemedi.");
  }
}

// DOM yüklendiğinde
window.addEventListener("DOMContentLoaded", () => {
  const ecosystemBox = document.querySelector(".ecosystem-box ul");
  if (ecosystemBox && CELO_ECOSYSTEM_LINKS.length) {
    ecosystemBox.innerHTML = CELO_ECOSYSTEM_LINKS
      .map(link => `<li><a href="${link.url}" target="_blank">${link.name}</a></li>`)
      .join("");
  }

  displaySupportLinks();
});

// Wallet bağlantısı
walletActionBtn.addEventListener("click", async () => {
  const isConnected = walletActionBtn.textContent.includes("Disconnect");

  if (isConnected) {
    await disconnectWallet();
    userAddress = "";
    walletActionBtn.textContent = "Connect Wallet";
    document.getElementById("walletStatus").innerHTML = `<p>🔴 Not connected</p><span id="networkLabel">—</span>`;
  } else {
    const result = await connectWalletMetaMask();
    if (result) {
      userAddress = result.userAddress;
      walletActionBtn.textContent = "Disconnect";
      document.getElementById("walletStatus").innerHTML = `<p>✅ Connected: ${result.userAddress.slice(0,6)}...${result.userAddress.slice(-4)}</p><span id="networkLabel">🌕 Celo Mainnet</span>`;
      await checkProfile();
    }
  }
});

// Donate işlemleri
donateButtons.forEach((btn) => {
  btn.addEventListener("click", async () => {
    const amount = btn.getAttribute("data-amount");
    await donateCelo(amount);
  });
});

// GM butonu
gmBtn.addEventListener("click", async () => {
  alert("☀️ Sending GM transaction... (placeholder)");
});

// Deploy butonu
deployBtn.addEventListener("click", async () => {
  alert("🧱 Deploy feature coming soon!");
});

// Governance butonu
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

// Proposal'ları göster
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

// Badge butonu
badgeBtn.addEventListener("click", async () => {
  const badges = await loadUserBadges();
  contentArea.innerHTML = `
    <h2>🎖️ Your Badges</h2>
    <div class="info-card">
      ${badges.length ? badges.map((b) => `<p>🏅 ${b}</p>`).join("") : "<p>No badges yet.</p>"}
    </div>
  `;
});

// Profile butonu
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

// Global functions
window.handleSupportClick = handleSupportClick;
window.submitUserLink = submitUserLink;
window.displaySupportLinks = displaySupportLinks;
