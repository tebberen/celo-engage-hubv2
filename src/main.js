// ========================= CELO ENGAGE HUB V2 - MAIN SCRIPT ========================= //
import { connectWalletMetaMask, disconnectWallet } from "./services/walletService.js";
import { 
  setupUserProfile, loadUserProfile,
  loadUserBadges, donateCelo, checkProfile,
  submitEmptyTransaction, sendGmTransaction,
  deployUserContract, getUserDeployedContracts,
  getUserStats, checkBadgeEligibility, mintBadge,
  createProposalAsOwner, checkIfOwner, loadProposals, voteProposal
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

// ✅ YENİ: Profil oluşturma formu - GÜNCELLENDİ (link kaldırıldı)
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
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Username:</label>
          <input type="text" id="usernameInput" placeholder="Enter your username" 
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

// ✅ YENİ: Profil oluşturma fonksiyonu (global) - GÜNCELLENDİ (link kaldırıldı)
window.createProfile = async function() {
  const usernameInput = document.getElementById("usernameInput");
  
  const usernameValue = usernameInput.value.trim();
  
  if (!usernameValue) {
    alert("Please enter a username");
    return;
  }
  
  try {
    // Butonu devre dışı bırak ve yükleme durumunu göster
    const button = document.querySelector('button[onclick="createProfile()"]');
    button.innerHTML = "⏳ Creating Profile...";
    button.disabled = true;
    
    // ✅ DEĞİŞTİ: Sadece kullanıcı adı gönder, boş link
    const success = await setupUserProfile(usernameValue, "");
    
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

// ✅ YENİ: Owner kontrolü ve gösterimi
async function checkAndDisplayOwnerStatus() {
  const userAddress = getUserAddress();
  const isOwner = await checkIfOwner();

  if (userAddress && isOwner) {
    // Owner olduğunu göster
    const walletStatusEl = document.getElementById("walletStatus");
    if (walletStatusEl) {
      const existingOwnerBadge = walletStatusEl.querySelector('.owner-badge');
      if (!existingOwnerBadge) {
        const ownerBadge = document.createElement('div');
        ownerBadge.className = 'owner-badge';
        ownerBadge.innerHTML = '👑 Contract Owner';
        ownerBadge.style.cssText = `
          background: linear-gradient(135deg, #FFD700, #FFA500);
          color: black;
          padding: 4px 8px;
          border-radius: 12px;
          font-weight: bold;
          font-size: 10px;
          margin-top: 5px;
          display: inline-block;
        `;
        walletStatusEl.appendChild(ownerBadge);
      }
    }
  }
}

// DOM loaded
window.addEventListener("DOMContentLoaded", async () => {
  const ecosystemBox = document.querySelector(".ecosystem-box ul");
  if (ecosystemBox && CELO_ECOSYSTEM_LINKS.length) {
    ecosystemBox.innerHTML = CELO_ECOSYSTEM_LINKS
      .map(link => `<li><a href="${link.url}" target="_blank">${link.name}</a></li>`)
      .join("");
  }

  displaySupportLinks();
  
  // ✅ Eğer kullanıcı daha önce bağlanmışsa owner kontrolü yap
  if (getUserAddress()) {
    await checkAndDisplayOwnerStatus();
  }
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
      
      // ✅ YENİ: Cüzdan bağlandıktan sonra profil kontrolü ve owner kontrolü
      await checkAndDisplayOwnerStatus();
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

// ✅ YENİ: Governance butonu - Sadece owner proposal oluşturabilir
governanceBtn.addEventListener("click", async () => {
  const isOwner = await checkIfOwner();
  
  let ownerSection = '';
  if (isOwner) {
    ownerSection = `
      <div style="background: #FFF0C2; padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 2px solid #FFD700;">
        <h3>👑 Owner Only - Create Proposal</h3>
        <input type="text" id="proposalTitle" placeholder="Proposal title" 
               style="width:100%;padding:12px;margin:10px 0;border-radius:8px;border:2px solid #FBCC5C;" />
        <textarea id="proposalDescription" rows="3" placeholder="Proposal description" 
                  style="width:100%;padding:12px;border-radius:8px;border:2px solid #FBCC5C;"></textarea>
        <button id="createProposalBtn" 
                style="background: #35D07F; color: black; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; margin: 10px;">
          📝 Create Proposal
        </button>
      </div>
    `;
  }

  contentArea.innerHTML = `
    <div class="step-indicator">
      <span class="step-number">🏛️</span> Community Governance
    </div>
    <div class="step-container">
      ${isOwner ? ownerSection : '<p style="text-align: center; color: #666;">Only contract owner can create proposals</p>'}
      
      <div style="margin-top: 30px;">
        <h3>🗳️ Active Proposals</h3>
        <div id="proposalList">
          <p style="text-align: center;">No active proposals yet.</p>
        </div>
      </div>
    </div>
  `;

  if (isOwner) {
    document.getElementById("createProposalBtn").addEventListener("click", async () => {
      const title = document.getElementById("proposalTitle").value.trim();
      const desc = document.getElementById("proposalDescription").value.trim();
      
      if (!title || !desc) {
        alert("Please enter both title and description");
        return;
      }
      
      const success = await createProposalAsOwner(title, desc);
      if (success) {
        alert("✅ Proposal created successfully!");
        // Proposal listesini yenile
        await showProposals();
      } else {
        alert("❌ Failed to create proposal");
      }
    });
  }

  await showProposals();
});

// ✅ YENİ: Proposal listesini göster
async function showProposals() {
  const proposals = await loadProposals();
  const list = document.getElementById("proposalList");
  
  if (!list) return;

  if (!proposals || proposals.length === 0) {
    list.innerHTML = "<p style='text-align: center;'>No active proposals yet.</p>";
    return;
  }

  list.innerHTML = '';
  
  proposals.forEach((p) => {
    const card = document.createElement("div");
    card.style.cssText = `
      background: #FFFDF6;
      border: 2px solid #FBCC5C;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 15px;
    `;
    card.innerHTML = `
      <h4 style="margin: 0 0 10px 0;">${p.title}</h4>
      <p style="margin: 0 0 15px 0; color: #666;">${p.description}</p>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="color: #35D07F;">👍 ${p.votesFor}</span>
          <span style="margin: 0 15px;">|</span>
          <span style="color: #EF4444;">👎 ${p.votesAgainst}</span>
        </div>
        <div>
          <button class="voteForBtn" data-id="${p.id}" style="background: #35D07F; color: black; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold; margin-right: 10px;">
            👍 Support
          </button>
          <button class="voteAgainstBtn" data-id="${p.id}" style="background: #EF4444; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold;">
            👎 Oppose
          </button>
        </div>
      </div>
    `;
    list.appendChild(card);
  });

  // Oy butonlarına event listener ekle
  document.querySelectorAll(".voteForBtn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const proposalId = btn.getAttribute("data-id");
      const success = await voteProposal(proposalId, true);
      if (success) {
        alert("✅ Vote submitted!");
        await showProposals();
      }
    });
  });
  
  document.querySelectorAll(".voteAgainstBtn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const proposalId = btn.getAttribute("data-id");
      const success = await voteProposal(proposalId, false);
      if (success) {
        alert("✅ Vote submitted!");
        await showProposals();
      }
    });
  });
}

// Badge button
badgeBtn.addEventListener("click", async () => {
  const badges = await loadUserBadges();
  contentArea.innerHTML = `
    <div class="step-indicator">
      <span class="step-number">🎖️</span> Your Badges
    </div>
    <div class="step-container">
      <h3>Your Achievement Badges</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 20px;">
        ${badges.length ? 
          badges.map((b) => `
            <div style="background: #FFF0C2; padding: 20px; border-radius: 12px; text-align: center; border: 2px solid #FBCC5C;">
              <div style="font-size: 24px; margin-bottom: 10px;">🏅</div>
              <div style="font-weight: bold;">${b}</div>
            </div>
          `).join("") : 
          '<div style="text-align: center; padding: 40px; color: #666;"><p>No badges yet. Complete more actions to earn badges!</p></div>'
        }
      </div>
      <button onclick="displaySupportLinks()" style="background: #35D07F; color: black; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; margin: 20px 10px 0 10px;">
        📋 Back to Support List
      </button>
    </div>
  `;
});

// ✅ GÜNCELLENDİ: Profile button - REPUTATION BİLGİLERİ KALDIRILDI
profileBtn.addEventListener("click", async () => {
  const profile = await loadUserProfile();
  const currentUserAddress = getUserAddress();
  const isOwner = await checkIfOwner();
  
  if (!profile || !profile.isActive) {
    contentArea.innerHTML = `
      <div class="step-indicator">
        <span class="step-number">👤</span> Create Your Profile
      </div>
      <div class="step-container">
        <h3>🚀 Profile Required</h3>
        <p>You need to create a profile first to view your statistics.</p>
        <button onclick="showProfileSetupForm()" style="background: #35D07F; color: black; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; margin: 10px;">
          👤 Create Profile
        </button>
      </div>
    `;
    return;
  }

  const stats = await getUserStats(currentUserAddress);

  contentArea.innerHTML = `
    <div class="step-indicator">
      <span class="step-number">👤</span> Your Profile
    </div>
    <div class="step-container">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2>${profile.username} ${isOwner ? '👑' : ''}</h2>
        <p style="color: #666; word-break: break-all;">${currentUserAddress}</p>
        ${isOwner ? '<p style="color: #FFD700; font-weight: bold;">Contract Owner</p>' : ''}
      </div>

      <!-- REPUTATION BİLGİSİ KALDIRILDI -->
      
      <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 30px;">
        <div class="stat-card" style="background: #FFF0C2; padding: 15px; border-radius: 12px; text-align: center;">
          <div style="font-size: 20px; margin-bottom: 5px;">🌅</div>
          <div style="font-size: 12px; color: #666;">GM Count</div>
          <div style="font-size: 20px; font-weight: bold;">${stats.gmCount}</div>
        </div>
        <div class="stat-card" style="background: #FFF0C2; padding: 15px; border-radius: 12px; text-align: center;">
          <div style="font-size: 20px; margin-bottom: 5px;">🚀</div>
          <div style="font-size: 12px; color: #666;">Deploy Count</div>
          <div style="font-size: 20px; font-weight: bold;">${stats.deployCount}</div>
        </div>
        <div class="stat-card" style="background: #FFF0C2; padding: 15px; border-radius: 12px; text-align: center;">
          <div style="font-size: 20px; margin-bottom: 5px;">🔗</div>
          <div style="font-size: 12px; color: #666;">Links</div>
          <div style="font-size: 20px; font-weight: bold;">${stats.linkCount}</div>
        </div>
      </div>

      <div style="text-align: center; margin-top: 20px;">
        <button onclick="displaySupportLinks()" style="background: #35D07F; color: black; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; margin: 10px;">
          📋 Back to Support List
        </button>
      </div>
    </div>
  `;
});

// ✅ YENİ: Badge mintleme fonksiyonu
window.mintBadgeNow = async function(badgeType) {
  try {
    const success = await mintBadge(badgeType);
    if (success) {
      alert('✅ Badge successfully minted!');
      // Sayfayı yenile
      badgeBtn.click();
    } else {
      alert('❌ Failed to mint badge. Please try again.');
    }
  } catch (error) {
    console.error('Mint badge error:', error);
    alert('❌ Error minting badge.');
  }
};

// ✅ YENİ: Profile setup formunu göster
window.showProfileSetupForm = function() {
  showProfileSetupForm();
};

// Global functions
window.handleSupportClick = handleSupportClick;
window.submitUserLink = submitUserLink;
window.displaySupportLinks = displaySupportLinks;
