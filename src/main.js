// ========================= CELO ENGAGE HUB V2 - MAIN SCRIPT ========================= //
import { connectWalletMetaMask, disconnectWallet } from "./services/walletService.js";
import { 
  setupUserProfile, createProposal, voteProposal, loadUserProfile,
  loadUserBadges, loadProposals, donateCelo, checkProfile,
  submitEmptyTransaction, sendGmTransaction,
  deployUserContract, getUserDeployedContracts
} from "./services/contractService.js";
import { INITIAL_SUPPORT_LINKS, CELO_ECOSYSTEM_LINKS } from "./utils/constants.js";

// ✅ GÜNCELLENDİ: Kullanıcı adı state'i eklendi
let userAddress = "";
let username = "";

function getUserAddress() {
    return userAddress || "0x0000000000000000000000000000000000000000";
}

// ✅ YENİ: Otomatik profil kontrolü ve oluşturma
async function handleProfileAfterConnect() {
  const hasProfile = await checkProfile();
  
  if (!hasProfile) {
    // Profil yoksa, otomatik olarak profil oluşturma formunu göster
    showProfileSetupForm();
  } else {
    // Profil varsa, ana sayfayı göster
    displaySupportLinks();
    // Profil bilgilerini yükle
    const profile = await loadUserProfile();
    if (profile) {
      username = profile.username;
    }
  }
}

// ✅ YENİ: Profil oluşturma formu
function showProfileSetupForm() {
  const contentArea = document.getElementById("contentArea");
  contentArea.innerHTML = `
    <div class="step-indicator">
      <span class="step-number">👤</span> Create Your Profile
    </div>
    <div class="step-container">
      <h3>🚀 Welcome to Celo Engage Hub!</h3>
      <p>To get started, please create your profile on the Celo network.</p>
      
      <div style="text-align: left; max-width: 400px; margin: 0 auto;">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Username:</label>
          <input type="text" id="usernameInput" placeholder="Enter your username" 
                 style="width: 100%; padding: 12px; border-radius: 8px; border: 2px solid #FBCC5C;" />
        </div>
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Profile Link (optional):</label>
          <input type="text" id="linkInput" placeholder="https://x.com/yourprofile" 
                 style="width: 100%; padding: 12px; border-radius: 8px; border: 2px solid #FBCC5C;" />
        </div>
      </div>

      <button onclick="createProfile()" 
              style="background: #35D07F; color: black; padding: 12px 30px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 16px; margin: 10px;">
        ✅ Create Profile on Celo
      </button>
      
      <p style="font-size: 12px; color: #666; margin-top: 15px;">
        This will create your profile on the Celo blockchain. Gas fees may apply.
      </p>
    </div>
  `;
}

// ✅ YENİ: Profil oluşturma fonksiyonu (global)
window.createProfile = async function() {
  const usernameInput = document.getElementById("usernameInput");
  const linkInput = document.getElementById("linkInput");
  
  const usernameValue = usernameInput.value.trim();
  const linkValue = linkInput.value.trim() || `https://celo.org/u/${usernameValue}`;
  
  if (!usernameValue) {
    alert("Please enter a username");
    return;
  }
  
  try {
    // Butonu devre dışı bırak ve yükleme durumunu göster
    const button = document.querySelector('button[onclick="createProfile()"]');
    button.innerHTML = "⏳ Creating Profile...";
    button.disabled = true;
    
    const success = await setupUserProfile(usernameValue, linkValue);
    
    if (success) {
      username = usernameValue;
      button.innerHTML = "✅ Profile Created!";
      setTimeout(() => {
        displaySupportLinks();
      }, 1500);
    } else {
      button.innerHTML = "❌ Failed - Try Again";
      button.disabled = false;
    }
  } catch (error) {
    console.error("Profile creation error:", error);
    const button = document.querySelector('button[onclick="createProfile()"]');
    button.innerHTML = "❌ Error - Try Again";
    button.disabled = false;
  }
};

// DOM Elements
const walletActionBtn = document.getElementById("walletActionBtn");
const donateButtons = document.querySelectorAll(".donate-buttons button");
const gmBtn = document.getElementById("gmBtn");
const deployBtn = document.getElementById("deployBtn");
const governanceBtn = document.getElementById("governanceBtn");
const badgeBtn = document.getElementById("badgeBtn");
const profileBtn = document.getElementById("profileBtn");
const contentArea = document.getElementById("contentArea");

console.log("🚀 Celo Engage Hub V2 loaded — GM & Deploy transaction system active");

// localStorage functions
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

// ✅ UPDATED: Send link with new contract (no alerts)
async function submitUserLink() {
  const userLink = document.getElementById('userLinkInput').value.trim();
  if (!userLink) return;
  
  try {
    const txSuccess = await submitEmptyTransaction(userLink);
    
    if (txSuccess) {
      const currentUserAddress = getUserAddress();
      saveLinkToLocalStorage(userLink, currentUserAddress);
      displaySupportLinks();
    }
  } catch (error) {
    console.error("Submit error:", error);
  }
}

// DOM loaded
window.addEventListener("DOMContentLoaded", () => {
  const ecosystemBox = document.querySelector(".ecosystem-box ul");
  if (ecosystemBox && CELO_ECOSYSTEM_LINKS.length) {
    ecosystemBox.innerHTML = CELO_ECOSYSTEM_LINKS
      .map(link => `<li><a href="${link.url}" target="_blank">${link.name}</a></li>`)
      .join("");
  }

  displaySupportLinks();
});

// Wallet connection - GÜNCELLENDİ
walletActionBtn.addEventListener("click", async () => {
  const isConnected = walletActionBtn.textContent.includes("Disconnect");

  if (isConnected) {
    await disconnectWallet();
    userAddress = "";
    username = "";
    walletActionBtn.textContent = "Connect Wallet";
    document.getElementById("walletStatus").innerHTML = `<p>🔴 Not connected</p><span id="networkLabel">—</span>`;
  } else {
    const result = await connectWalletMetaMask();
    if (result) {
      userAddress = result.userAddress;
      walletActionBtn.textContent = "Disconnect";
      document.getElementById("walletStatus").innerHTML = `<p>✅ Connected: ${result.userAddress.slice(0,6)}...${result.userAddress.slice(-4)}</p><span id="networkLabel">🌕 Celo Mainnet</span>`;
      
      // ✅ YENİ: Cüzdan bağlandıktan sonra profil kontrolü
      await handleProfileAfterConnect();
    }
  }
});

// Donate operations
donateButtons.forEach((btn) => {
  btn.addEventListener("click", async () => {
    const amount = btn.getAttribute("data-amount");
    await donateCelo(amount);
  });
});

// ✅ UPDATED: GM button - No alerts
gmBtn.addEventListener("click", async () => {
  await sendGmTransaction();
});

// ✅ UPDATED: Deploy button - No alerts
deployBtn.addEventListener("click", async () => {
  const deployedAddress = await deployUserContract();
  if (deployedAddress) {
    const userContracts = await getUserDeployedContracts();
    contentArea.innerHTML = `
      <div class="step-indicator">
        <span class="step-number">🎉</span> Your Contract Has Been Deployed!
      </div>
      <div class="step-container">
        <h3>🚀 Your Smart Contract is Ready!</h3>
        <div class="info-card">
          <p><strong>Contract Address:</strong> ${deployedAddress !== "deployed" ? deployedAddress : "Could not retrieve from event"}</p>
          <p><strong>Your Total Contracts:</strong> ${userContracts.length}</p>
          <p><strong>Network:</strong> Celo Mainnet</p>
        </div>
        <button onclick="displaySupportLinks()" style="background: #35D07F; color: black; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; margin: 10px;">
          📋 Back to Support List
        </button>
      </div>
    `;
  }
});

// Governance button
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
    if (!title || !desc) return;
    await createProposal(title, desc);
    await showProposals();
  });

  await showProposals();
});

// Show proposals
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

// Badge button
badgeBtn.addEventListener("click", async () => {
  const badges = await loadUserBadges();
  contentArea.innerHTML = `
    <h2>🎖️ Your Badges</h2>
    <div class="info-card">
      ${badges.length ? badges.map((b) => `<p>🏅 ${b}</p>`).join("") : "<p>No badges yet.</p>"}
    </div>
  `;
});

// Profile button
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
      if (!username || !link) return;
      await setupUserProfile(username, link);
    });
  }
});

// Global functions
window.handleSupportClick = handleSupportClick;
window.submitUserLink = submitUserLink;
window.displaySupportLinks = displaySupportLinks;
