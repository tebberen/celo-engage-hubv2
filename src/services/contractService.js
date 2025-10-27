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
  MIN_DONATION
} from "../utils/constants.js";

let provider;
let signer;
let mainContract;

// 🧩 Initialize Provider & Contract
export async function initContract() {
  if (typeof window.ethereum === "undefined") {
    alert("🦊 MetaMask not detected!");
    return;
  }

  provider = new ethers.providers.Web3Provider(window.ethereum);
  signer = provider.getSigner();
  mainContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  console.log("✅ Contract initialized:", CONTRACT_ADDRESS);
  return mainContract;
}

// ========================= MODULE HELPERS ========================= //

export function getModule(name) {
  const mod = MODULES[name];
  if (!mod) throw new Error(`❌ Module not found: ${name}`);
  return new ethers.Contract(mod.address, mod.abi, signer);
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
    const tx = await profile.registerUser(userAddress);
    await tx.wait();
    
    console.log("✅ Profile created successfully");
    return { success: true, txHash: tx.hash, alreadyRegistered: false };
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
    
    const tx = await gm.sendGM(userAddress, message);
    await tx.wait();
    
    // GM sayısını artır
    const profile = getModule("PROFILE");
    const incrementTx = await profile.incrementGMCount(userAddress);
    await incrementTx.wait();
    
    console.log("✅ GM sent:", message);
    return { success: true, txHash: tx.hash };
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
    
    const tx = await deploy.deployContract(userAddress, contractName);
    await tx.wait();
    
    // Deploy sayısını artır
    const profile = getModule("PROFILE");
    const incrementTx = await profile.incrementDeployCount(userAddress);
    await incrementTx.wait();
    
    console.log("✅ Contract deployed:", contractName);
    return { success: true, txHash: tx.hash, contractName: contractName };
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
    
    const tx = await donate.donateCELO(userAddress, { value: amount });
    await tx.wait();
    
    // Donate sayısını artır
    const profile = getModule("PROFILE");
    const incrementTx = await profile.incrementDonateCount(userAddress, amount);
    await incrementTx.wait();
    
    console.log("💛 CELO donated:", amount);
    return { success: true, txHash: tx.hash, amount: amount, token: "CELO" };
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
    
    const tx = await donate.donateCUSD(userAddress, amount);
    await tx.wait();
    
    // Donate sayısını artır
    const profile = getModule("PROFILE");
    const incrementTx = await profile.incrementDonateCount(userAddress, amount);
    await incrementTx.wait();
    
    console.log("💚 cUSD donated:", amount);
    return { success: true, txHash: tx.hash, amount: amount, token: "cUSD" };
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
    
    const tx = await linkModule.shareLink(userAddress, link);
    await tx.wait();
    
    // Link sayısını artır
    const profile = getModule("PROFILE");
    const incrementTx = await profile.incrementLinkCount(userAddress);
    await incrementTx.wait();
    
    console.log("🔗 Link shared:", link);
    return { success: true, txHash: tx.hash, link: link };
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

// ========================= GOVERNANCE MODULE ========================= //

export async function createProposal(title, description, link) {
  try {
    const gov = getModule("GOVERNANCE");
    const userAddress = await signer.getAddress();
    
    console.log("🗳️ Creating proposal from:", userAddress, "Title:", title);
    
    const tx = await gov.createProposal(userAddress, title, description, link);
    await tx.wait();
    
    console.log("🗳️ Proposal created:", title);
    return { success: true, txHash: tx.hash, title: title };
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
    
    const tx = await gov.vote(userAddress, proposalId, support);
    await tx.wait();
    
    // Vote sayısını artır
    const profile = getModule("PROFILE");
    const incrementTx = await profile.incrementVoteCount(userAddress);
    await incrementTx.wait();
    
    console.log("🗳️ Voted:", proposalId, support);
    return { success: true, txHash: tx.hash, proposalId: proposalId, support: support };
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
    const tx = await donate.withdraw(OWNER_ADDRESS);
    await tx.wait();
    
    console.log("💸 Withdraw successful!");
    return { success: true, txHash: tx.hash };
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
  createProposal,
  vote,
  getGovernanceStats,
  getUserBadge,
  getBadgeStats,
  withdrawDonations
};

console.log("✅ contractService.js loaded with profile creation system!");
