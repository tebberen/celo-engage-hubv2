// ========================= CELO ENGAGE HUB - FULL MAIN ========================= //
// src/main.js

import {
  initContract,
  sendGM,
  getGMStats,
  deployContract,
  getDeployStats,
  donateCELO,
  donateCUSD,
  getDonateStats,
  shareLink,
  getLinkStats,
  createProposal,
  vote,
  getGovernanceStats,
  getUserBadge,
  getBadgeStats,
  loadUserProfile,
  withdrawDonations
} from "./src/services/contractService.js";

import {
  OWNER_ADDRESS,
  DEFAULT_GM_MESSAGE,
  INITIAL_SUPPORT_LINKS,
  CELO_ECOSYSTEM_LINKS,
  CURRENT_NETWORK,
  MIN_DONATION
} from "./src/utils/constants.js";

import {
  connectWalletMetaMask,
  disconnectWallet,
  checkCurrentNetwork
} from "./src/services/walletService.js";

let userAddress = "";
let appInitialized = false;
let isLoading = false;

// ========================= APP INIT ========================= //

document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Celo Engage Hub - Starting...");
  setupUI();
  await initializeApp();
});

// ========================= INITIALIZATION ========================= //

async function initializeApp() {
  try {
    toggleLoading(true, "Connecting to wallet...");
    userAddress = await connectWalletMetaMask();
    if (!userAddress) throw new Error("Wallet not connected");
    await checkCurrentNetwork();
    document.getElementById("wallet-address").innerText = shortenAddress(userAddress);

    await initContract();
    await loadDashboard();
    renderCommunityLinks();
    renderCeloLinks();
    appInitialized = true;
    toggleLoading(false);
  } catch (err) {
    console.error("❌ Initialization failed:", err);
    toggleLoading(false);
  }
}

// ========================= DASHBOARD LOADER ========================= //

async function loadDashboard() {
  try {
    toggleLoading(true, "Loading your profile...");

    const [
      gm,
      deploy,
      donate,
      link,
      gov,
      badge,
      profile
    ] = await Promise.all([
      getGMStats(),
      getDeployStats(),
      getDonateStats(),
      getLinkStats(),
      getGovernanceStats(),
      getBadgeStats(),
      loadUserProfile(userAddress)
    ]);

    document.getElementById("gm-total").innerText = gm.total;
    document.getElementById("deploy-total").innerText = deploy.total;
    document.getElementById("donate-total").innerText = donate.totalDonatedValue;
    document.getElementById("link-total").innerText = link.total;
    document.getElementById("proposal-total").innerText = gov.totalProposals;
    document.getElementById("badge-total").innerText = badge;
    document.getElementById("level").innerText = profile.level;
    document.getElementById("tier").innerText = profile.tier;
    document.getElementById("xp").innerText = profile.totalXP;
    document.getElementById("donate-count").innerText = profile.donateCount;

    console.log("📊 Dashboard loaded successfully");
    toggleLoading(false);
  } catch (err) {
    console.error("⚠️ Dashboard Error:", err);
    toggleLoading(false);
  }
}

// ========================= GM MODULE ========================= //

async function handleGM() {
  try {
    if (!ensureConnected()) return;
    const msg = prompt("Write your GM message:", DEFAULT_GM_MESSAGE);
    if (!msg) return alert("Message cannot be empty!");
    toggleLoading(true, "Sending GM...");
    await sendGM(msg);
    alert("✅ GM sent successfully!");
    await loadDashboard();
  } catch (err) {
    console.error("❌ GM Error:", err);
    alert("GM failed. Check console for details.");
  } finally {
    toggleLoading(false);
  }
}

// ========================= DEPLOY MODULE ========================= //

async function handleDeploy() {
  try {
    if (!ensureConnected()) return;
    const name = prompt("Enter new contract name:", "MyCeloContract");
    if (!name) return;
    toggleLoading(true, "Deploying contract...");
    await deployContract(name);
    alert("✅ Contract deployed successfully!");
    await loadDashboard();
  } catch (err) {
    console.error("❌ Deploy Error:", err);
    alert("Failed to deploy contract.");
  } finally {
    toggleLoading(false);
  }
}

// ========================= DONATE MODULE ========================= //

async function handleDonate() {
  try {
    if (!ensureConnected()) return;
    const choice = confirm("Donate in CELO? (Cancel for cUSD)");
    const amount = prompt("Enter amount:", "0.1");
    if (!amount) return;
    const wei = ethers.utils.parseEther(amount);
    toggleLoading(true, "Sending donation...");

    if (choice) {
      await donateCELO(wei);
    } else {
      await donateCUSD(wei);
    }

    alert("💛 Donation sent successfully!");
    await loadDashboard();
  } catch (err) {
    console.error("❌ Donation Error:", err);
    alert("Donation failed.");
  } finally {
    toggleLoading(false);
  }
}

// ========================= LINK MODULE ========================= //

async function handleShareLink() {
  try {
    if (!ensureConnected()) return;
    const link = prompt("Enter link to share (Farcaster / X / GitHub):");
    if (!link) return;
    toggleLoading(true, "Sharing link...");
    await shareLink(link);
    alert("🔗 Link shared!");
    await loadDashboard();
  } catch (err) {
    console.error("❌ Link Error:", err);
    alert("Failed to share link.");
  } finally {
    toggleLoading(false);
  }
}

// ========================= GOVERNANCE MODULE ========================= //

async function handleCreateProposal() {
  try {
    if (!ensureConnected()) return;
    const title = prompt("Proposal title:");
    const desc = prompt("Proposal description:");
    const ref = prompt("Reference link (optional):", "");
    toggleLoading(true, "Creating proposal...");
    await createProposal(title, desc, ref);
    alert("🗳️ Proposal created successfully!");
    await loadDashboard();
  } catch (err) {
    console.error("❌ Proposal Error:", err);
    alert("Failed to create proposal.");
  } finally {
    toggleLoading(false);
  }
}

async function handleVote() {
  try {
    if (!ensureConnected()) return;
    const id = prompt("Enter Proposal ID:");
    const choice = confirm("Vote YES? (Cancel for NO)");
    toggleLoading(true, "Submitting vote...");
    await vote(id, choice);
    alert(`🗳️ Vote submitted (${choice ? "YES" : "NO"})!`);
    await loadDashboard();
  } catch (err) {
    console.error("❌ Vote Error:", err);
    alert("Voting failed.");
  } finally {
    toggleLoading(false);
  }
}

// ========================= BADGE & PROFILE MODULE ========================= //

async function showBadgeInfo() {
  try {
    toggleLoading(true, "Loading badge info...");
    const badge = await getUserBadge(userAddress);
    alert(
      `🏅 Badge Info\nLevel: ${badge.level}\nTier: ${badge.tier}\nXP: ${badge.totalXP}`
    );
  } catch (err) {
    console.error("❌ Badge Error:", err);
    alert("Failed to load badge info.");
  } finally {
    toggleLoading(false);
  }
}

// ========================= OWNER WITHDRAW ========================= //

async function handleWithdraw() {
  try {
    if (userAddress.toLowerCase() !== OWNER_ADDRESS.toLowerCase())
      return alert("🚫 Only owner can withdraw!");
    toggleLoading(true, "Withdrawing donations...");
    await withdrawDonations();
    alert("💸 Withdraw successful!");
    await loadDashboard();
  } catch (err) {
    console.error("❌ Withdraw Error:", err);
    alert("Withdraw failed.");
  } finally {
    toggleLoading(false);
  }
}

// ========================= UI HELPERS ========================= //

function setupUI() {
  document.getElementById("connectWalletBtn")?.addEventListener("click", initializeApp);
  document.getElementById("gmBtn")?.addEventListener("click", handleGM);
  document.getElementById("deployBtn")?.addEventListener("click", handleDeploy);
  document.getElementById("donateBtn")?.addEventListener("click", handleDonate);
  document.getElementById("shareLinkBtn")?.addEventListener("click", handleShareLink);
  document.getElementById("proposalBtn")?.addEventListener("click", handleCreateProposal);
  document.getElementById("voteBtn")?.addEventListener("click", handleVote);
  document.getElementById("badgeBtn")?.addEventListener("click", showBadgeInfo);
  document.getElementById("withdrawBtn")?.addEventListener("click", handleWithdraw);
}

function shortenAddress(addr) {
  return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";
}

function toggleLoading(state, message = "Loading...") {
  const loader = document.getElementById("loader");
  if (!loader) return;
  loader.style.display = state ? "flex" : "none";
  loader.innerText = message;
  isLoading = state;
}

function ensureConnected() {
  if (!userAddress) {
    alert("⚠️ Please connect your wallet first!");
    return false;
  }
  return true;
}

function renderCommunityLinks() {
  const container = document.getElementById("support-links");
  container.innerHTML = INITIAL_SUPPORT_LINKS
    .map(link => `<a href="${link}" target="_blank">${link}</a>`)
    .join("<br>");
}

function renderCeloLinks() {
  const container = document.getElementById("celo-links");
  container.innerHTML = CELO_ECOSYSTEM_LINKS
    .map(item => `<a href="${item.url}" target="_blank">${item.name}</a>`)
    .join("<br>");
}

console.log("✅ Full main.js loaded successfully!");
