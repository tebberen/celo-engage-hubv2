// ========================= CONTRACT SERVICE ========================= //
// src/services/contractService.js

import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";
import {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  MODULES,
  OWNER_ADDRESS,
  DEFAULT_GM_MESSAGE,
  CURRENT_TOKENS,
  MIN_DONATION,
  CURRENT_NETWORK
} from "../utils/constants.js";
import { sendWithReferral } from "./divviReferral.js";

let provider;
let signer;
let mainContract;
let readOnlyProvider;

// ✅ YENİ: Tüm modül contract'larını cache'le
const moduleCache = new Map();

function getActiveProviderInstance() {
  return provider || getReadOnlyProvider();
}

async function resolveEventTimestamps(events, activeProvider) {
  return Promise.all(events.map(async (event) => {
    try {
      const block = await activeProvider.getBlock(event.blockNumber);
      const blockTimestamp = block?.timestamp
        ? block.timestamp * 1000
        : Math.floor(Date.now());
      return blockTimestamp;
    } catch {
      return Date.now();
    }
  }));
}

function dedupeByKey(items, keyFn) {
  const seen = new Set();
  const output = [];

  for (const item of items) {
    const key = keyFn(item);
    if (key) {
      if (seen.has(key)) continue;
      seen.add(key);
    }
    output.push(item);
  }

  return output;
}

async function normalizeLinkEvents(events, activeProvider) {
  const timestamps = await resolveEventTimestamps(events, activeProvider);

  const mapped = events.map((event, index) => ({
    user: event.args?.user,
    link: event.args?.link,
    transactionHash: event.transactionHash,
    blockNumber: event.blockNumber,
    logIndex: event.logIndex,
    timestamp: timestamps[index]
  })).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  return dedupeByKey(mapped, (item) => {
    if (!item.link) return null;
    const userKey = (item.user || "").toLowerCase();
    return `${userKey}::${item.link}`;
  });
}

async function normalizeDeployEvents(events, activeProvider) {
  const timestamps = await resolveEventTimestamps(events, activeProvider);

  const mapped = events.map((event, index) => ({
    user: event.args?.user,
    contractAddress: event.args?.contractAddress,
    contractName: event.args?.contractName,
    transactionHash: event.transactionHash,
    blockNumber: event.blockNumber,
    logIndex: event.logIndex,
    timestamp: timestamps[index]
  })).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  return dedupeByKey(mapped, (item) => (item.contractAddress || "").toLowerCase());
}

// 🧩 Initialize Provider & Contract
export async function initContract() {
  if (typeof window.ethereum === "undefined") {
    alert("🦊 MetaMask not detected!");
    return;
  }

  provider = new ethers.providers.Web3Provider(window.ethereum);
  signer = provider.getSigner();
  mainContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  readOnlyProvider = provider;
  
  // ✅ Tüm modül contract'larını önceden oluştur ve cache'le
  initializeModuleContracts();
  
  console.log("✅ Contract initialized:", CONTRACT_ADDRESS);
  return mainContract;
}

function getReadOnlyProvider() {
  if (readOnlyProvider) {
    return readOnlyProvider;
  }

  readOnlyProvider = new ethers.providers.JsonRpcProvider(CURRENT_NETWORK.rpcUrl);
  return readOnlyProvider;
}

// ✅ YENİ: Tüm modül contract'larını bir kere initialize et
function initializeModuleContracts() {
  Object.keys(MODULES).forEach(moduleName => {
    const mod = MODULES[moduleName];
    const contract = new ethers.Contract(mod.address, mod.abi, signer);
    moduleCache.set(moduleName, contract);
  });
  console.log("✅ All module contracts cached");
}

// ========================= MODULE HELPERS ========================= //

export function getModule(name) {
  // ✅ Cache'lenmiş contract'ı döndür - YENİSİNİ OLUŞTURMA!
  if (moduleCache.has(name)) {
    return moduleCache.get(name);
  }
  
  const mod = MODULES[name];
  if (!mod) throw new Error(`❌ Module not found: ${name}`);
  
  console.warn(`⚠️ Module ${name} not in cache, creating new instance`);
  const contract = new ethers.Contract(mod.address, mod.abi, signer);
  moduleCache.set(name, contract);
  return contract;
}

// ========================= PROFILE REGISTRATION ========================= //

// ✅ YENİ: Profil oluşturma fonksiyonu
export async function registerUserProfile() {
  try {
    const profile = getModule("PROFILE");
    const userAddress = await signer.getAddress();
    
    console.log("🚀 Registering user profile:", userAddress);
    
    // Kullanıcının zaten kayıtlı olup olmadığını kontrol et
    const userExists = await profile.userExists(userAddress);
    if (userExists) {
      console.log("✅ User already registered");
      return { success: true, alreadyRegistered: true };
    }
    
    // Profil oluşturma işlemi
    const { sentTx } = await sendWithReferral(profile, "registerUser", [userAddress]);

    console.log("✅ Profile created successfully");
    return { success: true, txHash: sentTx.hash, alreadyRegistered: false };
  } catch (error) {
    console.error("❌ Profile registration failed:", error);
    throw error;
  }
}

// ✅ YENİ: Username kaydetme fonksiyonu (localStorage ile geçici çözüm)
export async function saveUsername(username) {
  try {
    const userAddress = await signer.getAddress();
    
    // Username'i localStorage'a kaydet
    localStorage.setItem(`celoEngageHub_username_${userAddress}`, username);
    
    console.log("✅ Username saved locally:", username);
    return { success: true, username: username };
  } catch (error) {
    console.error("❌ Username save failed:", error);
    throw error;
  }
}

// ✅ YENİ: Username getirme fonksiyonu
export async function getUsername() {
  try {
    const userAddress = await signer.getAddress();
    const username = localStorage.getItem(`celoEngageHub_username_${userAddress}`);
    return username || null;
  } catch (error) {
    console.error("❌ Username get failed:", error);
    return null;
  }
}

// ========================= GM MODULE ========================= //

export async function sendGM(message = DEFAULT_GM_MESSAGE) {
  try {
    const gm = getModule("GM");
    const userAddress = await signer.getAddress();
    
    console.log("👋 Sending GM from:", userAddress);
    
    // ✅ TEK İŞLEM - Sadece GM gönder (ikinci işlem YOK)
    const { sentTx } = await sendWithReferral(gm, "sendGM", [userAddress, message]);

    console.log("✅ GM sent:", message);
    return { success: true, txHash: sentTx.hash };
  } catch (error) {
    console.error("❌ GM failed:", error);
    throw error;
  }
}

export async function getGMStats() {
  try {
    const gm = getModule("GM");
    const userAddress = await signer.getAddress();
    
    const [total, userCount] = await Promise.all([
      gm.totalGM(),
      gm.getUserGMCount(userAddress)
    ]);
    
    return { 
      total: total.toString(), 
      userCount: userCount.toString() 
    };
  } catch (error) {
    console.error("❌ Get GM stats failed:", error);
    return { total: "0", userCount: "0" };
  }
}

// ========================= DEPLOY MODULE ========================= //

export async function deployContract(contractName = "MyContract") {
  try {
    const deploy = getModule("DEPLOY");
    const userAddress = await signer.getAddress();
    
    console.log("🚀 Deploying contract for:", userAddress);
    
    // ✅ TEK İŞLEM - Sadece contract deploy et (ikinci işlem YOK)
    const { sentTx } = await sendWithReferral(deploy, "deployContract", [userAddress, contractName]);

    console.log("✅ Contract deployed:", contractName);
    return { success: true, txHash: sentTx.hash, contractName: contractName };
  } catch (error) {
    console.error("❌ Deploy failed:", error);
    throw error;
  }
}

export async function getDeployStats() {
  try {
    const deploy = getModule("DEPLOY");
    const userAddress = await signer.getAddress();
    
    const [total, userDeploys] = await Promise.all([
      deploy.totalDeploy(),
      deploy.getUserDeployCount(userAddress)
    ]);
    
    return { 
      total: total.toString(), 
      userDeploys: userDeploys.toString() 
    };
  } catch (error) {
    console.error("❌ Get deploy stats failed:", error);
    return { total: "0", userDeploys: "0" };
  }
}

// ========================= DONATE MODULE ========================= //

export async function donateCELO(amount = MIN_DONATION) {
  try {
    const donate = getModule("DONATE");
    const userAddress = await signer.getAddress();
    
    console.log("💛 Donating CELO from:", userAddress, "Amount:", amount);
    
    // ✅ TEK İŞLEM - Sadece CELO bağışı yap (ikinci işlem YOK)
    const { sentTx } = await sendWithReferral(
      donate,
      "donateCELO",
      [userAddress],
      { value: amount }
    );

    console.log("💛 CELO donated:", amount);
    return { success: true, txHash: sentTx.hash, amount: amount, token: "CELO" };
  } catch (error) {
    console.error("❌ CELO donation failed:", error);
    throw error;
  }
}

export async function donateCUSD(amount = MIN_DONATION) {
  try {
    const donate = getModule("DONATE");
    const userAddress = await signer.getAddress();
    
    console.log("💵 Donating cUSD from:", userAddress, "Amount:", amount);
    
    // ✅ TEK İŞLEM - Sadece cUSD bağışı yap (ikinci işlem YOK)
    const { sentTx } = await sendWithReferral(donate, "donateCUSD", [userAddress, amount]);

    console.log("💚 cUSD donated:", amount);
    return { success: true, txHash: sentTx.hash, amount: amount, token: "cUSD" };
  } catch (error) {
    console.error("❌ cUSD donation failed:", error);
    throw error;
  }
}

export async function getDonateStats() {
  try {
    const donate = getModule("DONATE");
    const userAddress = await signer.getAddress();
    
    const stats = await donate.getDonateStats();
    const userStats = await donate.getUserDonationHistory(userAddress);
    
    return {
      totalDonatedValue: stats.totalDonatedValue.toString(),
      totalDonatorsCount: stats.totalDonatorsCount.toString(),
      dailyWithdrawn: stats.dailyWithdrawn.toString(),
      dailyLimit: stats.dailyLimit.toString(),
      userDonationCount: userStats.count.toString(),
      userTotalDonated: userStats.totalAmount.toString()
    };
  } catch (error) {
    console.error("❌ Get donate stats failed:", error);
    return {
      totalDonatedValue: "0",
      totalDonatorsCount: "0",
      dailyWithdrawn: "0",
      dailyLimit: "0",
      userDonationCount: "0",
      userTotalDonated: "0"
    };
  }
}

// ========================= LINK MODULE ========================= //

export async function shareLink(link) {
  try {
    if (!link) throw new Error("⚠️ Link cannot be empty");
    
    const linkModule = getModule("LINK");
    const userAddress = await signer.getAddress();
    
    console.log("🔗 Sharing link from:", userAddress, "Link:", link);
    
    // ✅ TEK İŞLEM - Sadece link paylaş (ikinci işlem YOK)
    const { sentTx } = await sendWithReferral(linkModule, "shareLink", [userAddress, link]);

    console.log("🔗 Link shared:", link);
    return { success: true, txHash: sentTx.hash, link: link };
  } catch (error) {
    console.error("❌ Share link failed:", error);
    throw error;
  }
}

export async function getLinkStats() {
  try {
    const linkModule = getModule("LINK");
    const userAddress = await signer.getAddress();
    
    const [total, limit] = await linkModule.getLinkStats();
    const userCount = await linkModule.getUserLinkCount(userAddress);
    
    return { 
      total: total.toString(), 
      hourlyLimit: limit.toString(),
      userCount: userCount.toString()
    };
  } catch (error) {
    console.error("❌ Get link stats failed:", error);
    return { total: "0", hourlyLimit: "0", userCount: "0" };
  }
}

// ✅ YENİ: Tüm paylaşılan linkleri getir
export async function getAllSharedLinks() {
  try {
    const linkModule = getModule("LINK");
    
    // Toplam link sayısını al
    const totalLinks = await linkModule.totalLinks();
    console.log("📥 Total links on blockchain:", totalLinks.toString());
    
    // Link sayısı çok fazla olabileceğinden, şimdilik boş döndürüyoruz
    // Gerçek uygulamada bu kısım events veya view fonksiyonları ile doldurulmalı
    return {
      success: true,
      links: [],
      total: totalLinks.toString()
    };
    
  } catch (error) {
    console.error("❌ Get all shared links failed:", error);
    return { success: false, links: [], total: "0" };
  }
}

// ✅ YENİ: Event'lardan linkleri oku
export async function getLinksFromEvents(options = {}) {
  try {
    const { maxLinks = 24, fromBlock: explicitFromBlock } = options;
    const activeProvider = getActiveProviderInstance();
    const linkModule = signer
      ? getModule("LINK")
      : new ethers.Contract(MODULES.LINK.address, MODULES.LINK.abi, activeProvider);

    const filter = linkModule.filters.LinkShared();

    const currentBlock = await activeProvider.getBlockNumber();
    const defaultLookback = 25000;
    const fromBlock = explicitFromBlock !== undefined
      ? Math.max(0, explicitFromBlock)
      : Math.max(0, currentBlock - defaultLookback);

    const events = await linkModule.queryFilter(filter, fromBlock, currentBlock);

    console.log(`📥 Found ${events.length} link events from block ${fromBlock} to ${currentBlock}`);

    const normalized = await normalizeLinkEvents(events, activeProvider);

    return {
      success: true,
      links: normalized.slice(0, maxLinks),
      total: events.length.toString()
    };

  } catch (error) {
    console.error("❌ Get links from events failed:", error);
    return { success: false, links: [], total: "0" };
  }
}

// ✅ YENİ: Belirli bir kullanıcının linklerini getir
export async function getUserSharedLinks(userAddress, options = {}) {
  try {
    const { maxLinks = 24, fromBlock: explicitFromBlock, lookbackBlocks = 25000 } = options;
    const targetAddress = userAddress
      || (signer ? await signer.getAddress() : null);

    if (!targetAddress) {
      throw new Error("User address is required to load shared links");
    }

    const activeProvider = getActiveProviderInstance();
    const linkModule = signer
      ? getModule("LINK")
      : new ethers.Contract(MODULES.LINK.address, MODULES.LINK.abi, activeProvider);

    const filter = linkModule.filters.LinkShared(targetAddress);

    const currentBlock = await activeProvider.getBlockNumber();
    const fromBlock = explicitFromBlock !== undefined
      ? Math.max(0, explicitFromBlock)
      : Math.max(0, currentBlock - lookbackBlocks);

    const events = await linkModule.queryFilter(filter, fromBlock, currentBlock);
    const normalized = await normalizeLinkEvents(events, activeProvider);

    let userLinkCount = normalized.length.toString();
    try {
      const countOnChain = await linkModule.getUserLinkCount(targetAddress);
      userLinkCount = countOnChain.toString();
    } catch (countError) {
      console.warn("⚠️ Falling back to event count for user link total", countError);
    }

    return {
      success: true,
      links: normalized.slice(0, maxLinks),
      count: userLinkCount
    };

  } catch (error) {
    console.error("❌ Get user shared links failed:", error);
    return { success: false, links: [], count: "0" };
  }
}

export async function getUserDeployedContractsHistory(userAddress, options = {}) {
  try {
    const { maxItems = 24, fromBlock: explicitFromBlock, lookbackBlocks = 25000 } = options;
    const targetAddress = userAddress
      || (signer ? await signer.getAddress() : null);

    if (!targetAddress) {
      throw new Error("User address is required to load deployed contracts");
    }

    const activeProvider = getActiveProviderInstance();
    const deployModule = signer
      ? getModule("DEPLOY")
      : new ethers.Contract(MODULES.DEPLOY.address, MODULES.DEPLOY.abi, activeProvider);

    const filter = deployModule.filters.ContractDeployed(targetAddress);

    const currentBlock = await activeProvider.getBlockNumber();
    const fromBlock = explicitFromBlock !== undefined
      ? Math.max(0, explicitFromBlock)
      : Math.max(0, currentBlock - lookbackBlocks);

    const events = await deployModule.queryFilter(filter, fromBlock, currentBlock);
    const normalized = await normalizeDeployEvents(events, activeProvider);

    let userDeployCount = normalized.length.toString();
    try {
      const countOnChain = await deployModule.getUserDeployCount(targetAddress);
      userDeployCount = countOnChain.toString();
    } catch (countError) {
      console.warn("⚠️ Falling back to event count for user deploy total", countError);
    }

    return {
      success: true,
      contracts: normalized.slice(0, maxItems),
      count: userDeployCount
    };

  } catch (error) {
    console.error("❌ Get user deployed contracts failed:", error);
    return { success: false, contracts: [], count: "0" };
  }
}

// ========================= GOVERNANCE MODULE ========================= //

export async function createProposal(title, description, link) {
  try {
    const gov = getModule("GOVERNANCE");
    const userAddress = await signer.getAddress();
    
    console.log("🗳️ Creating proposal from:", userAddress, "Title:", title);
    
    // ✅ TEK İŞLEM - Sadece proposal oluştur (ikinci işlem YOK)
    const { sentTx } = await sendWithReferral(gov, "createProposal", [userAddress, title, description, link]);

    console.log("🗳️ Proposal created:", title);
    return { success: true, txHash: sentTx.hash, title: title };
  } catch (error) {
    console.error("❌ Create proposal failed:", error);
    throw error;
  }
}

export async function vote(proposalId, support) {
  try {
    const gov = getModule("GOVERNANCE");
    const userAddress = await signer.getAddress();
    
    console.log("🗳️ Voting from:", userAddress, "Proposal:", proposalId, "Support:", support);
    
    // ✅ TEK İŞLEM - Sadece oy ver (ikinci işlem YOK)
    const { sentTx } = await sendWithReferral(gov, "vote", [userAddress, proposalId, support]);

    console.log("🗳️ Voted:", proposalId, support);
    return { success: true, txHash: sentTx.hash, proposalId: proposalId, support: support };
  } catch (error) {
    console.error("❌ Vote failed:", error);
    throw error;
  }
}

export async function getGovernanceStats() {
  try {
    const gov = getModule("GOVERNANCE");
    const userAddress = await signer.getAddress();
    
    const [totalProposals, totalVotes] = await gov.getGovernanceStats();
    const userVotes = await gov.getUserVoteCount(userAddress);
    
    return { 
      totalProposals: totalProposals.toString(), 
      totalVotes: totalVotes.toString(),
      userVotes: userVotes.toString()
    };
  } catch (error) {
    console.error("❌ Get governance stats failed:", error);
    return { totalProposals: "0", totalVotes: "0", userVotes: "0" };
  }
}

// ========================= BADGE MODULE ========================= //

export async function getUserBadge(address) {
  try {
    const badge = getModule("BADGE");
    const data = await badge.getUserBadge(address);
    
    return {
      totalXP: data.totalXP.toString(),
      level: data.level.toString(),
      tier: data.tier.toString(),
      lastUpdate: data.lastUpdate.toString()
    };
  } catch (error) {
    console.error("❌ Get user badge failed:", error);
    return {
      totalXP: "0",
      level: "1",
      tier: "1",
      lastUpdate: "0"
    };
  }
}

export async function getBadgeStats() {
  try {
    const badge = getModule("BADGE");
    const total = await badge.totalBadges();
    return total.toString();
  } catch (error) {
    console.error("❌ Get badge stats failed:", error);
    return "0";
  }
}

// ========================= PROFILE MODULE ========================= //

export async function loadUserProfile(address) {
  try {
    const profile = getModule("PROFILE");
    const data = await profile.getUserProfile(address);
    
    return {
      gmCount: data.gmCount.toString(),
      deployCount: data.deployCount.toString(),
      donateCount: data.donateCount.toString(),
      linkCount: data.linkCount.toString(),
      voteCount: data.voteCount.toString(),
      totalXP: data.totalXP.toString(),
      level: data.level.toString(),
      tier: data.tier.toString(),
      totalDonated: data.totalDonated.toString(),
      exists: data.exists
    };
  } catch (error) {
    console.error("❌ Load user profile failed:", error);
    return {
      gmCount: "0",
      deployCount: "0",
      donateCount: "0",
      linkCount: "0",
      voteCount: "0",
      totalXP: "0",
      level: "1",
      tier: "1",
      totalDonated: "0",
      exists: false
    };
  }
}

// ========================= OWNER FUNCTIONS ========================= //

export async function withdrawDonations() {
  try {
    const donate = getModule("DONATE");
    const { sentTx } = await sendWithReferral(donate, "withdraw", [OWNER_ADDRESS]);

    console.log("💸 Withdraw successful!");
    return { success: true, txHash: sentTx.hash };
  } catch (error) {
    console.error("❌ Withdraw failed:", error);
    throw error;
  }
}

// ========================= UTILITY FUNCTIONS ========================= //

// ✅ YENİ: Kullanıcı profil durumunu kontrol et
export async function checkUserProfileStatus() {
  try {
    const userAddress = await signer.getAddress();
    const profile = await loadUserProfile(userAddress);
    const username = await getUsername();
    
    return {
      hasProfile: profile.exists,
      username: username,
      profileData: profile
    };
  } catch (error) {
    console.error("❌ Check user profile status failed:", error);
    return {
      hasProfile: false,
      username: null,
      profileData: null
    };
  }
}

// ✅ YENİ: Tüm kullanıcı istatistiklerini getir
export async function getUserFullStats() {
  try {
    const userAddress = await signer.getAddress();
    
    const [
      profile,
      gmStats,
      deployStats,
      donateStats,
      linkStats,
      govStats,
      badge
    ] = await Promise.all([
      loadUserProfile(userAddress),
      getGMStats(),
      getDeployStats(),
      getDonateStats(),
      getLinkStats(),
      getGovernanceStats(),
      getUserBadge(userAddress)
    ]);
    
    const username = await getUsername();
    
    return {
      username: username,
      profile: profile,
      gmStats: gmStats,
      deployStats: deployStats,
      donateStats: donateStats,
      linkStats: linkStats,
      governanceStats: govStats,
      badge: badge
    };
  } catch (error) {
    console.error("❌ Get user full stats failed:", error);
    return null;
  }
}

// ========================= EXPORTS ========================= //

export default {
  // Core
  initContract,
  getModule,
  
  // Profile Management
  registerUserProfile,
  saveUsername,
  getUsername,
  loadUserProfile,
  checkUserProfileStatus,
  getUserFullStats,
  
  // Modules
  sendGM,
  getGMStats,
  deployContract,
  getDeployStats,
  donateCELO,
  donateCUSD,
  getDonateStats,
  shareLink,
  getLinkStats,
  getAllSharedLinks,
  getLinksFromEvents,
  getUserSharedLinks,
  getUserDeployedContractsHistory,
  createProposal,
  vote,
  getGovernanceStats,
  getUserBadge,
  getBadgeStats,
  withdrawDonations
};

console.log("✅ contractService.js FULLY UPDATED with user links support! 🚀");
