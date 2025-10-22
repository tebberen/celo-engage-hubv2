* // ========================= CELO ENGAGE HUB V2 - MAIN SCRIPT ========================= //
* import { connectWalletMetaMask, disconnectWallet } from "./services/walletService.js";
* import { 
*   setupUserProfile, createProposal, voteProposal, loadUserProfile,
*   loadUserBadges, loadProposals, donateCelo, checkProfile,
*   submitEmptyTransaction, sendGmTransaction,
*   deployUserContract, getUserDeployedContracts,
*   getUserStats, checkBadgeEligibility, mintBadge
* } from "./services/contractService.js";
* import { INITIAL_SUPPORT_LINKS, CELO_ECOSYSTEM_LINKS } from "./utils/constants.js";
* 
* // ✅ GÜNCELLENDİ: Kullanıcı adı state'i eklendi
* let userAddress = "";
* let username = "";
* 
* function getUserAddress() {
*     return userAddress || "0x0000000000000000000000000000000000000000";
* }
* 
* // ✅ YENİ: Otomatik profil kontrolü ve oluşturma
* async function handleProfileAfterConnect() {
*   const hasProfile = await checkProfile();
*   
*   if (!hasProfile) {
*     // Profil yoksa, otomatik olarak profil oluşturma formunu göster
*     showProfileSetupForm();
*   } else {
*     // Profil varsa, ana sayfayı göster
*     displaySupportLinks();
*     // Profil bilgilerini yükle
*     const profile = await loadUserProfile();
*     if (profile) {
*       username = profile.username;
*     }
*   }
* }
* 
* // ✅ YENİ: Profil oluşturma formu - GÜNCELLENDİ (link kaldırıldı)
* function showProfileSetupForm() {
*   const contentArea = document.getElementById("contentArea");
*   contentArea.innerHTML = `
*     <div class="step-indicator">
*       <span class="step-number">👤</span> Create Your Profile
*     </div>
*     <div class="step-container">
*       <h3>🚀 Welcome to Celo Engage Hub!</h3>
*       <p>To get started, please create your profile on the Celo network.</p>
*       
*       <div style="text-align: left; max-width: 400px; margin: 0 auto;">
*         <div style="margin-bottom: 20px;">
*           <label style="display: block; margin-bottom: 5px; font-weight: bold;">Username:</label>
*           <input type="text" id="usernameInput" placeholder="Enter your username" 
*                  style="width: 100%; padding: 12px; border-radius: 8px; border: 2px solid #FBCC5C;" />
*         </div>
*       </div>
* 
*       <button onclick="createProfile()" 
*               style="background: #35D07F; color: black; padding: 12px 30px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 16px; margin: 10px;">
*         ✅ Create Profile on Celo
*       </button>
*       
*       <p style="font-size: 12px; color: #666; margin-top: 15px;">
*         This will create your profile on the Celo blockchain. Gas fees may apply.
*       </p>
*     </div>
*   `;
* }
* 
* // ✅ YENİ: Profil oluşturma fonksiyonu (global) - GÜNCELLENDİ (link kaldırıldı)
* window.createProfile = async function() {
*   const usernameInput = document.getElementById("usernameInput");
*   
*   const usernameValue = usernameInput.value.trim();
*   
*   if (!usernameValue) {
*     alert("Please enter a username");
*     return;
*   }
*   
*   try {
*     // Butonu devre dışı bırak ve yükleme durumunu göster
*     const button = document.querySelector('button[onclick="createProfile()"]');
*     button.innerHTML = "⏳ Creating Profile...";
*     button.disabled = true;
*     
*     // ✅ DEĞİŞTİ: Sadece kullanıcı adı gönder, boş link
*     const success = await setupUserProfile(usernameValue, "");
*     
*     if (success) {
*       username = usernameValue;
*       button.innerHTML = "✅ Profile Created!";
*       setTimeout(() => {
*         displaySupportLinks();
*       }, 1500);
*     } else {
*       button.innerHTML = "❌ Failed - Try Again";
*       button.disabled = false;
*     }
*   } catch (error) {
*     console.error("Profile creation error:", error);
*     const button = document.querySelector('button[onclick="createProfile()"]');
*     button.innerHTML = "❌ Error - Try Again";
*     button.disabled = false;
*   }
* };
* 
* // DOM Elements
* const walletActionBtn = document.getElementById("walletActionBtn");
* const donateButtons = document.querySelectorAll(".donate-buttons button");
* const gmBtn = document.getElementById("gmBtn");
* const deployBtn = document.getElementById("deployBtn");
* const governanceBtn = document.getElementById("governanceBtn");
* const badgeBtn = document.getElementById("badgeBtn");
* const profileBtn = document.getElementById("profileBtn");
* const contentArea = document.getElementById("contentArea");
* 
* console.log("🚀 Celo Engage Hub V2 loaded — GM & Deploy transaction system active");
* 
* // localStorage functions
* function supportLinkInLocalStorage(link, userAddress) {
*   const links = JSON.parse(localStorage.getItem('celoEngageLinks') || '[]');
*   const linkIndex = links.findIndex(l => l.link === link);
*   
*   if (linkIndex !== -1) {
*     links[linkIndex].supportCount++;
*     localStorage.setItem('celoEngageLinks', JSON.stringify(links));
*     return true;
*   }
*   return false;
* }
* 
* function saveLinkToLocalStorage(link, userAddress) {
*   const links = JSON.parse(localStorage.getItem('celoEngageLinks') || '[]');
*   const newLink = {
*     link: link,
*     submitter: userAddress,
*     supportCount: 0,
*     timestamp: Date.now()
*   };
*   links.push(newLink);
*   localStorage.setItem('celoEngageLinks', JSON.stringify(links));
* }
* 
* function getLinksFromLocalStorage() {
*   const storedLinks = JSON.parse(localStorage.getItem('celoEngageLinks') || '[]');
*   
*   if (storedLinks.length === 0) {
*     const initialLinks = INITIAL_SUPPORT_LINKS.map(link => ({
*       link: link,
*       submitter: "community",
*       supportCount: 0,
*       timestamp: Date.now()
*     }));
*     localStorage.setItem('celoEngageLinks', JSON.stringify(initialLinks));
*     return initialLinks;
*   }
*   
*   return storedLinks;
* }
* 
* function getPlatformName(url) {
*   if (url.includes('x.com') || url.includes('twitter.com')) return '🐦 X';
*   if (url.includes('farcaster.xyz') || url.includes('warpcast.com')) return '🔮 Farcaster';
*   if (url.includes('github.com')) return '💻 GitHub';
*   if (url.includes('youtube.com')) return '📺 YouTube';
*   if (url.includes('discord.com')) return '💬 Discord';
*   return '🌐 Website';
* }
* 
* function displaySupportLinks() {
*   const container = document.getElementById('linksContainer');
*   if (!container) return;
* 
*   const links = getLinksFromLocalStorage();
*   container.innerHTML = '';
*   
*   links.forEach((linkData) => {
*     const platform = getPlatformName(linkData.link);
*     const linkCard = document.createElement('div');
*     linkCard.innerHTML = `
*       <div class="link-card">
*         <div>
*           <div class="link-platform">${platform}</div>
*           <a href="${linkData.link}" target="_blank" class="support-link">
*             ${linkData.link}
*           </a>
*         </div>
*         <div class="link-stats">
*           <div class="stat-item">
*             <div>Supports</div>
*             <div class="stat-value">${linkData.supportCount}/5</div>
*           </div>
*         </div>
*         <button class="supportBtn" onclick="handleSupportClick('${linkData.link}')">👍 Support This Content</button>
*       </div>
*     `;
*     container.appendChild(linkCard);
*   });
* }
* 
* function handleSupportClick(linkUrl) {
*   const currentUserAddress = getUserAddress();
*   if (!currentUserAddress || currentUserAddress === "0x0000000000000000000000000000000000000000") {
*     return;
*   }
*   
*   const success = supportLinkInLocalStorage(linkUrl, currentUserAddress);
*   if (success) {
*     showLinkSubmitForm();
*   }
* }
* 
* function showLinkSubmitForm() {
*   const contentArea = document.getElementById('contentArea');
*   contentArea.innerHTML = `
*     <div class="step-indicator">
*       <span class="step-number">2</span> Your Turn to Share!
*     </div>
*     <div class="step-container">
*       <h3>🎉 Share Your Own Link</h3>
*       <p>You supported a community member. Now share your own link!</p>
*       <input type="text" id="userLinkInput" placeholder="Paste your X, Farcaster, GitHub link..." 
*              style="width: 80%; padding: 12px; margin: 15px 0; border-radius: 8px; border: 2px solid #FBCC5C;" />
*       <button onclick="submitUserLink()" style="background: #35D07F; color: black; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; margin: 10px;">
*         ✍️ Submit Your Link
*       </button>
*       <br>
*       <button onclick="displaySupportLinks()" style="background: #666; color: white; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; margin: 5px;">
*         ← Back to Support List
*       </button>
*     </div>
*   `;
* }
* 
* // ✅ UPDATED: Send link with new contract (no alerts)
* async function submitUserLink() {
*   const userLink = document.getElementById('userLinkInput').value.trim();
*   if (!userLink) return;
*   
*   try {
*     const txSuccess = await submitEmptyTransaction(userLink);
*     
*     if (txSuccess) {
*       const currentUserAddress = getUserAddress();
*       saveLinkToLocalStorage(userLink, currentUserAddress);
*       displaySupportLinks();
*     }
*   } catch (error) {
*     console.error("Submit error:", error);
*   }
* }
* 
* // DOM loaded
* window.addEventListener("DOMContentLoaded", () => {
*   const ecosystemBox = document.querySelector(".ecosystem-box ul");
*   if (ecosystemBox && CELO_ECOSYSTEM_LINKS.length) {
*     ecosystemBox.innerHTML = CELO_ECOSYSTEM_LINKS
*       .map(link => `<li><a href="${link.url}" target="_blank">${link.name}</a></li>`)
*       .join("");
*   }
* 
*   displaySupportLinks();
* });
* 
* // Wallet connection - GÜNCELLENDİ
* walletActionBtn.addEventListener("click", async () => {
*   const isConnected = walletActionBtn.textContent.includes("Disconnect");
* 
*   if (isConnected) {
*     await disconnectWallet();
*     userAddress = "";
*     username = "";
*     walletActionBtn.textContent = "Connect Wallet";
*     document.getElementById("walletStatus").innerHTML = `<p>🔴 Not connected</p><span id="networkLabel">—</span>`;
*   } else {
*     const result = await connectWalletMetaMask();
*     if (result) {
*       userAddress = result.userAddress;
*       walletActionBtn.textContent = "Disconnect";
*       document.getElementById("walletStatus").innerHTML = `<p>✅ Connected: ${result.userAddress.slice(0,6)}...${result.userAddress.slice(-4)}</p><span id="networkLabel">🌕 Celo Mainnet</span>`;
*       
*       // ✅ YENİ: Cüzdan bağlandıktan sonra profil kontrolü
*       await handleProfileAfterConnect();
*     }
*   }
* });
* 
* // Donate operations
* donateButtons.forEach((btn) => {
*   btn.addEventListener("click", async () => {
*     const amount = btn.getAttribute("data-amount");
*     await donateCelo(amount);
*   });
* });
* 
* // ✅ UPDATED: GM button - No alerts
* gmBtn.addEventListener("click", async () => {
*   await sendGmTransaction();
* });
* 
* // ✅ UPDATED: Deploy button - No alerts
* deployBtn.addEventListener("click", async () => {
*   const deployedAddress = await deployUserContract();
*   if (deployedAddress) {
*     const userContracts = await getUserDeployedContracts();
*     contentArea.innerHTML = `
*       <div class="step-indicator">
*         <span class="step-number">🎉</span> Your Contract Has Been Deployed!
*       </div>
*       <div class="step-container">
*         <h3>🚀 Your Smart Contract is Ready!</h3>
*         <div class="info-card">
*           <p><strong>Contract Address:</strong> ${deployedAddress !== "deployed" ? deployedAddress : "Could not retrieve from event"}</p>
*           <p><strong>Your Total Contracts:</strong> ${userContracts.length}</p>
*           <p><strong>Network:</strong> Celo Mainnet</p>
*         </div>
*         <button onclick="displaySupportLinks()" style="background: #35D07F; color: black; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; margin: 10px;">
*           📋 Back to Support List
*         </button>
*       </div>
*     `;
*   }
* });
* 
* // Governance button - GÜNCELLENDİ (REPUTATION GÖSTERİMİ EKLENDİ)
* governanceBtn.addEventListener("click", async () => {
*   const profile = await loadUserProfile();
*   
*   let reputationWarning = '';
*   if (profile && profile.reputation < 20) {
*     reputationWarning = `
*       <div style="background: #FFE4E4; padding: 15px; border-radius: 8px; border: 2px solid #FF4444; margin-bottom: 20px;">
*         <h4 style="color: #D32F2F; margin: 0 0 10px 0;">⚠️ Reputation Yetersiz</h4>
*         <p style="margin: 0; color: #666;">
*           Proposal oluşturmak için <strong>20 reputation</strong> gerekiyor. 
*           Mevcut reputation: <strong>${profile.reputation}</strong><br>
*           Daha fazla GM göndererek, link bırakarak veya deploy yaparak reputation kazanabilirsin.
*         </p>
*       </div>
*     `;
*   }
* 
*   contentArea.innerHTML = `
*     <h2>🏛️ Community Governance</h2>
*     ${reputationWarning}
*     <div class="info-card">
*       <h3>Create New Proposal</h3>
*       <input type="text" id="proposalTitle" placeholder="Proposal title" style="width:80%;padding:8px;margin:8px 0;border-radius:6px;border:1px solid #ccc;" />
*       <textarea id="proposalDescription" rows="3" placeholder="Proposal description" style="width:80%;padding:8px;border-radius:6px;border:1px solid #ccc;"></textarea>
*       <button id="createProposalBtn" style="background: #35D07F; color: black; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; margin: 10px;">
*         📝 Submit Proposal
*       </button>
*       ${profile && profile.reputation < 20 ? '<p style="color: #666; font-size: 12px;">Not: 20 reputation gerekiyor</p>' : ''}
*     </div>
*     <div id="proposalList"></div>
*   `;
* 
*   document.getElementById("createProposalBtn").addEventListener("click", async () => {
*     const title = document.getElementById("proposalTitle").value.trim();
*     const desc = document.getElementById("proposalDescription").value.trim();
*     if (!title || !desc) {
*       alert("Please fill in both title and description");
*       return;
*     }
*     
*     // Reputation kontrolü
*     if (profile && profile.reputation < 20) {
*       alert(`❌ Reputation yetersiz! Proposal oluşturmak için 20 reputation gerekiyor. Mevcut reputation: ${profile.reputation}`);
*       return;
*     }
*     
*     const success = await createProposal(title, desc);
*     if (success) {
*       alert("✅ Proposal created successfully!");
*       await showProposals();
*     } else {
*       alert("❌ Failed to create proposal. Please check the console for details.");
*     }
*   });
* 
*   await showProposals();
* });
* 
* // Show proposals
* async function showProposals() {
*   const proposals = await loadProposals();
*   const list = document.getElementById("proposalList");
*   list.innerHTML = "";
* 
*   if (!proposals.length) {
*     list.innerHTML = "<p>No active proposals yet.</p>";
*     return;
*   }
* 
*   proposals.forEach((p) => {
*     const card = document.createElement("div");
*     card.className = "info-card";
*     card.innerHTML = `
*       <h4>${p.title}</h4>
*       <p>${p.description}</p>
*       <p>👍 ${p.votesFor} | 👎 ${p.votesAgainst}</p>
*       <button class="voteForBtn" data-id="${p.id}">👍 Support</button>
*       <button class="voteAgainstBtn" data-id="${p.id}">👎 Oppose</button>
*     `;
*     list.appendChild(card);
*   });
* 
*   document.querySelectorAll(".voteForBtn").forEach((btn) =>
*     btn.addEventListener("click", async () => {
*       await voteProposal(btn.getAttribute("data-id"), true);
*     })
*   );
*   document.querySelectorAll(".voteAgainstBtn").forEach((btn) =>
*     btn.addEventListener("click", async () => {
*       await voteProposal(btn.getAttribute("data-id"), false);
*     })
*   );
* }
* 
* // Badge button
* badgeBtn.addEventListener("click", async () => {
*   const badges = await loadUserBadges();
*   contentArea.innerHTML = `
*     <h2>🎖️ Your Badges</h2>
*     <div class="info-card">
*       ${badges.length ? badges.map((b) => `<p>🏅 ${b}</p>`).join("") : "<p>No badges yet.</p>"}
*     </div>
*   `;
* });
* 
* // Profile button - TAMAMEN YENİLENDİ (REPUTATION GÖSTERİMİ EKLENDİ)
* profileBtn.addEventListener("click", async () => {
*   const profile = await loadUserProfile();
*   const currentUserAddress = getUserAddress();
*   
*   if (!profile || !profile.isActive) {
*     contentArea.innerHTML = `
*       <div class="step-indicator">
*         <span class="step-number">👤</span> Create Your Profile
*       </div>
*       <div class="step-container">
*         <h3>🚀 Profile Required</h3>
*         <p>You need to create a profile first to view your statistics.</p>
*         <button onclick="showProfileSetupForm()" style="background: #35D07F; color: black; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; margin: 10px;">
*           👤 Create Profile
*         </button>
*       </div>
*     `;
*     return;
*   }
* 
*   const stats = await getUserStats(currentUserAddress);
*   const eligibleBadges = await checkBadgeEligibility(currentUserAddress);
* 
*   contentArea.innerHTML = `
*     <div class="step-indicator">
*       <span class="step-number">👤</span> Your Profile & Statistics
*     </div>
*     <div class="step-container">
*       <div style="text-align: center; margin-bottom: 30px;">
*         <h2>${profile.username}</h2>
*         <p style="color: #666; word-break: break-all;">${currentUserAddress}</p>
*       </div>
* 
*       <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px;">
*         <div class="stat-card" style="background: #FFF0C2; padding: 20px; border-radius: 12px; text-align: center;">
*           <div style="font-size: 24px; margin-bottom: 5px;">🌅</div>
*           <div style="font-size: 12px; color: #666;">GM Count</div>
*           <div style="font-size: 24px; font-weight: bold;">${stats.gmCount}</div>
*         </div>
*         <div class="stat-card" style="background: #FFF0C2; padding: 20px; border-radius: 12px; text-align: center;">
*           <div style="font-size: 24px; margin-bottom: 5px;">🚀</div>
*           <div style="font-size: 12px; color: #666;">Deploy Count</div>
*           <div style="font-size: 24px; font-weight: bold;">${stats.deployCount}</div>
*         </div>
*         <div class="stat-card" style="background: #FFF0C2; padding: 20px; border-radius: 12px; text-align: center;">
*           <div style="font-size: 24px; margin-bottom: 5px;">🔗</div>
*           <div style="font-size: 12px; color: #666;">Links</div>
*           <div style="font-size: 24px; font-weight: bold;">${stats.linkCount}</div>
*         </div>
*         <div class="stat-card" style="background: #FFF0C2; padding: 20px; border-radius: 12px; text-align: center;">
*           <div style="font-size: 24px; margin-bottom: 5px;">⭐</div>
*           <div style="font-size: 12px; color: #666;">Reputation</div>
*           <div style="font-size: 24px; font-weight: bold;">${profile.reputation}</div>
*         </div>
*         <div class="stat-card" style="background: #FFF0C2; padding: 20px; border-radius: 12px; text-align: center;">
*           <div style="font-size: 24px; margin-bottom: 5px;">🏛️</div>
*           <div style="font-size: 12px; color: #666;">Proposals</div>
*           <div style="font-size: 24px; font-weight: bold;">${stats.proposalCount}</div>
*         </div>
*         <div class="stat-card" style="background: #FFF0C2; padding: 20px; border-radius: 12px; text-align: center;">
*           <div style="font-size: 24px; margin-bottom: 5px;">🗳️</div>
*           <div style="font-size: 12px; color: #666;">Votes</div>
*           <div style="font-size: 24px; font-weight: bold;">${stats.voteCount}</div>
*         </div>
*       </div>
* 
*       <!-- REPUTATION BİLGİ KARTI EKLENDİ -->
*       <div style="background: #FFF8E1; padding: 20px; border-radius: 12px; border: 2px solid #FBCC5C; margin-bottom: 20px;">
*         <h3 style="text-align: center; margin-bottom: 15px;">⭐ Reputation Sistemi</h3>
*         <div style="text-align: left;">
*           <p><strong>Mevcut Reputation:</strong> ${profile.reputation} / 20 (Proposal için gereken min. reputation)</p>
*           <p><strong>Reputation Nasıl Kazanılır:</strong></p>
*           <ul style="margin-left: 20px;">
*             <li>🌅 GM Gönder = <strong>+5 reputation</strong></li>
*             <li>🔗 Link Bırak = <strong>+10 reputation</strong></li>
*             <li>🚀 Deploy Yap = <strong>+20 reputation</strong></li>
*             <li>🏛️ Proposal Oluştur = <strong>+15 reputation</strong></li>
*             <li>🗳️ Oy Kullan = <strong>+8 reputation</strong></li>
*           </ul>
*           <p style="margin-top: 10px; color: #666; font-size: 14px;">
*             <strong>Not:</strong> Proposal oluşturmak için en az <strong>20 reputation</strong> gerekiyor.
*           </p>
*         </div>
*       </div>
* 
*       <div style="background: #FFF8E1; padding: 20px; border-radius: 12px; border: 2px solid #FBCC5C;">
*         <h3 style="text-align: center; margin-bottom: 20px;">🎁 Available Badges</h3>
*         <div id="badgesContainer" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
*           ${eligibleBadges.length > 0 ? 
*             eligibleBadges.map(badge => `
*               <div class="badge-card" style="background: white; padding: 15px; border-radius: 8px; text-align: center; border: 2px solid #35D07F;">
*                 <div style="font-size: 20px; margin-bottom: 10px;">${badge.name}</div>
*                 <div style="font-size: 12px; color: #666; margin-bottom: 10px;">${badge.description}</div>
*                 <button onclick="mintBadgeNow('${badge.type}')" 
*                         style="background: #35D07F; color: black; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold;">
*                   🎉 Mint Badge
*                 </button>
*               </div>
*             `).join('') : 
*             '<p style="text-align: center; color: #666;">Complete more actions to unlock badges!</p>'
*           }
*         </div>
*       </div>
* 
*       <div style="text-align: center; margin-top: 20px;">
*         <button onclick="displaySupportLinks()" style="background: #35D07F; color: black; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; margin: 10px;">
*           📋 Back to Support List
*         </button>
*       </div>
*     </div>
*   `;
* });
* 
* // ✅ YENİ: Badge mintleme fonksiyonu
* window.mintBadgeNow = async function(badgeType) {
*   try {
*     const success = await mintBadge(badgeType);
*     if (success) {
*       alert('✅ Badge successfully minted!');
*       // Sayfayı yenile
*       profileBtn.click();
*     } else {
*       alert('❌ Failed to mint badge. Please try again.');
*     }
*   } catch (error) {
*     console.error('Mint badge error:', error);
*     alert('❌ Error minting badge.');
*   }
* };
* 
* // ✅ YENİ: Profile setup formunu göster
* window.showProfileSetupForm = function() {
*   showProfileSetupForm();
* };
* 
* // Global functions
* window.handleSupportClick = handleSupportClick;
* window.submitUserLink = submitUserLink;
* window.displaySupportLinks = displaySupportLinks;
