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

function getModule(name) {
  const mod = MODULES[name];
  if (!mod) throw new Error(`❌ Module not found: ${name}`);
  return new ethers.Contract(mod.address, mod.abi, signer);
}

// ========================= GM MODULE ========================= //

export async function sendGM(message = DEFAULT_GM_MESSAGE) {
  const gm = getModule("GM");
  const tx = await gm.sendGM(await signer.getAddress(), message);
  await tx.wait();
  console.log("✅ GM sent:", message);
  return tx.hash;
}

export async function getGMStats() {
  const gm = getModule("GM");
  const [total, userCount] = await gm.getGMStats();
  return { total: total.toString(), userCount: userCount.toString() };
}

// ========================= DEPLOY MODULE ========================= //

export async function deployContract(contractName = "MyContract") {
  const deploy = getModule("DEPLOY");
  const tx = await deploy.deployContract(await signer.getAddress(), contractName);
  await tx.wait();
  console.log("✅ Contract deployed:", contractName);
  return tx.hash;
}

export async function getDeployStats() {
  const deploy = getModule("DEPLOY");
  const [total, userDeploys] = await deploy.getDeployStats();
  return { total: total.toString(), userDeploys: userDeploys.toString() };
}

// ========================= DONATE MODULE ========================= //

export async function donateCELO(amount = MIN_DONATION) {
  const donate = getModule("DONATE");
  const tx = await donate.donateCELO(await signer.getAddress(), { value: amount });
  await tx.wait();
  console.log("💛 CELO donated:", amount);
  return tx.hash;
}

export async function donateCUSD(amount = MIN_DONATION) {
  const donate = getModule("DONATE");
  const tx = await donate.donateCUSD(await signer.getAddress(), amount);
  await tx.wait();
  console.log("💚 cUSD donated:", amount);
  return tx.hash;
}

export async function getDonateStats() {
  const donate = getModule("DONATE");
  const stats = await donate.getDonateStats();
  return {
    totalDonatedValue: stats.totalDonatedValue.toString(),
    totalDonatorsCount: stats.totalDonatorsCount.toString()
  };
}

// ========================= LINK MODULE ========================= //

export async function shareLink(link) {
  if (!link) throw new Error("⚠️ Link cannot be empty");
  const linkModule = getModule("LINK");
  const tx = await linkModule.shareLink(await signer.getAddress(), link);
  await tx.wait();
  console.log("🔗 Link shared:", link);
  return tx.hash;
}

export async function getLinkStats() {
  const linkModule = getModule("LINK");
  const [total, limit] = await linkModule.getLinkStats();
  return { total: total.toString(), hourlyLimit: limit.toString() };
}

// ========================= GOVERNANCE MODULE ========================= //

export async function createProposal(title, description, link) {
  const gov = getModule("GOVERNANCE");
  const tx = await gov.createProposal(await signer.getAddress(), title, description, link);
  await tx.wait();
  console.log("🗳️ Proposal created:", title);
  return tx.hash;
}

export async function vote(proposalId, support) {
  const gov = getModule("GOVERNANCE");
  const tx = await gov.vote(await signer.getAddress(), proposalId, support);
  await tx.wait();
  console.log("🗳️ Voted:", proposalId, support);
  return tx.hash;
}

export async function getGovernanceStats() {
  const gov = getModule("GOVERNANCE");
  const [totalProposals, totalVotes] = await gov.getGovernanceStats();
  return { totalProposals: totalProposals.toString(), totalVotes: totalVotes.toString() };
}

// ========================= BADGE MODULE ========================= //

export async function getUserBadge(address) {
  const badge = getModule("BADGE");
  const data = await badge.getUserBadge(address);
  return {
    totalXP: data.totalXP.toString(),
    level: data.level.toString(),
    tier: data.tier.toString(),
    lastUpdate: data.lastUpdate.toString()
  };
}

export async function getBadgeStats() {
  const badge = getModule("BADGE");
  const total = await badge.getBadgeStats();
  return total.toString();
}

// ========================= PROFILE MODULE ========================= //

export async function loadUserProfile(address) {
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
}

// ========================= OWNER FUNCTIONS ========================= //

export async function withdrawDonations() {
  const donate = getModule("DONATE");
  const tx = await donate.withdraw(OWNER_ADDRESS);
  await tx.wait();
  console.log("💸 Withdraw successful!");
  return tx.hash;
}

// ========================= EXPORTS ========================= //

export default {
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
};

console.log("✅ contractService.js loaded and connected to constants.js");
