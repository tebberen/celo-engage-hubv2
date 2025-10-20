// ========================= CELO ENGAGE HUB V2 - CONTRACT SERVICE ========================= //

import { 
  CONTRACT_ADDRESS, CONTRACT_ABI, DONATION_ADDRESS,
  LINK_CONTRACT_ADDRESS, LINK_CONTRACT_ABI,
  GM_CONTRACT_ADDRESS, GM_CONTRACT_ABI,
  FACTORY_CONTRACT_ADDRESS, FACTORY_CONTRACT_ABI
} from "../utils/constants.js";
import { getProvider, getSigner, getUserAddress } from "./walletService.js";
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";

// ✅ ESKİ Contract yükle (diğer işlemler için)
function getContract() {
  const signer = getSigner();
  if (!signer) throw new Error("Wallet not connected");
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

// ✅ YENİ Contract yükle (sadece link göndermek için)
function getLinkContract() {
  const signer = getSigner();
  if (!signer) throw new Error("Wallet not connected");
  return new ethers.Contract(LINK_CONTRACT_ADDRESS, LINK_CONTRACT_ABI, signer);
}

// ✅ GM Contract yükle
function getGmContract() {
  const signer = getSigner();
  if (!signer) throw new Error("Wallet not connected");
  return new ethers.Contract(GM_CONTRACT_ADDRESS, GM_CONTRACT_ABI, signer);
}

// ✅ Factory Contract yükle
function getFactoryContract() {
  const signer = getSigner();
  if (!signer) throw new Error("Wallet not connected");
  return new ethers.Contract(FACTORY_CONTRACT_ADDRESS, FACTORY_CONTRACT_ABI, signer);
}

// ✅ YENİ: Link gönderim fonksiyonu (alert yok)
export async function submitEmptyTransaction(userLink) {
  try {
    const signer = getSigner();
    if (!signer) {
      return false;
    }

    const contract = getLinkContract();
    const tx = await contract.leaveMyLink(userLink, {
      gasLimit: 200000
    });
    
    await tx.wait();
    return true;
  } catch (err) {
    console.error("Transaction error:", err);
    return false;
  }
}

// ✅ YENİ: GM Transaction fonksiyonu (alert yok)
export async function sendGmTransaction() {
  try {
    const signer = getSigner();
    if (!signer) {
      return false;
    }

    const gmContract = getGmContract();
    const tx = await gmContract.sendGm("🌅 GM from Celo Engage Hub!", {
      gasLimit: 100000
    });
    
    await tx.wait();
    return true;
  } catch (err) {
    console.error("GM transaction error:", err);
    return false;
  }
}

// ✅ YENİ: Kullanıcı için kontrat deploy et (alert yok)
export async function deployUserContract() {
  try {
    const signer = getSigner();
    if (!signer) {
      return null;
    }

    const factoryContract = getFactoryContract();
    const tx = await factoryContract.deployGmContract({
      gasLimit: 500000
    });
    
    const receipt = await tx.wait();
    
    let deployedContractAddress = null;
    if (receipt.events && receipt.events[0]) {
      deployedContractAddress = receipt.events[0].args.contractAddress;
    }
    
    return deployedContractAddress || "deployed";
  } catch (err) {
    console.error("Deploy error:", err);
    return null;
  }
}

// ✅ Kullanıcının deploy ettiği kontratları getir
export async function getUserDeployedContracts() {
  try {
    const provider = getProvider();
    const userAddress = getUserAddress();
    if (!provider || !userAddress) return [];

    const factoryContract = new ethers.Contract(FACTORY_CONTRACT_ADDRESS, FACTORY_CONTRACT_ABI, provider);
    const contracts = await factoryContract.getUserContracts(userAddress);
    return contracts;
  } catch (err) {
    console.error("Get user contracts error:", err);
    return [];
  }
}

// 🧩 Profil kontrolü (GÜNCELLENDİ - daha basit ve etkili)
export async function checkProfile() {
  try {
    const provider = getProvider();
    const userAddress = getUserAddress();

    if (!provider || !userAddress || userAddress === "0x0000000000000000000000000000000000000000") {
      return false;
    }

    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const profile = await contract.getUserProfile(userAddress);
    const isActive = profile.isActive || profile[5];
    
    return isActive;
  } catch (err) {
    console.error("Profile check error:", err);
    return false;
  }
}

// 🧾 Profil oluşturma (on-chain TX) - GÜNCELLENDİ - daha iyi hata yönetimi
export async function setupUserProfile(username, link) {
  try {
    const signer = getSigner();
    if (!signer) {
      console.error("No signer available");
      return false;
    }

    const contract = getContract();
    const tx = await contract.registerUser(username, link, {
      gasLimit: 300000 // Gas limit artırıldı
    });
    
    console.log("Profile creation transaction sent:", tx.hash);
    await tx.wait();
    console.log("Profile created successfully");
    return true;
  } catch (err) {
    console.error("Setup profile error:", err);
    return false;
  }
}

// 💛 Donate işlemi (CELO gönder) - alert yok
export async function donateCelo(amount) {
  const signer = getSigner();
  const userAddress = getUserAddress();

  if (!signer || !userAddress || userAddress === "0x0000000000000000000000000000000000000000") {
    return false;
  }

  try {
    const value = ethers.utils.parseEther(String(amount));
    const tx = await signer.sendTransaction({
      to: DONATION_ADDRESS,
      value
    });
    await tx.wait();
    return true;
  } catch (err) {
    console.error("Donate error:", err);
    return false;
  }
}

// 🏛️ Governance (Proposal oluştur) - alert yok
export async function createProposal(title, description) {
  try {
    const signer = getSigner();
    if (!signer) return;

    const contract = getContract();
    const tx = await contract.createProposal(title, description, 3600);
    await tx.wait();
  } catch (err) {
    console.error("Create proposal error:", err);
  }
}

// 🗳️ Vote Proposal - alert yok
export async function voteProposal(id, support) {
  try {
    const signer = getSigner();
    if (!signer) return;

    const contract = getContract();
    const tx = await contract.voteProposal(id, support);
    await tx.wait();
  } catch (err) {
    console.error("Vote error:", err);
  }
}

// 📜 Proposal listesi (read-only)
export async function loadProposals() {
  try {
    const provider = getProvider();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const count = await contract.getProposalCount();
    const proposals = [];

    for (let i = 0; i < count; i++) {
      const p = await contract.proposals(i);
      proposals.push({
        id: i,
        title: p.title,
        description: p.description,
        votesFor: p.votesFor.toString(),
        votesAgainst: p.votesAgainst.toString(),
      });
    }

    return proposals;
  } catch (err) {
    console.error("Load proposals error:", err);
    return [];
  }
}

// 🎖️ Badge listesi (placeholder)
export async function loadUserBadges() {
  return ["Early Supporter", "Governance Voter", "Community Builder"];
}

// 👤 Profil bilgisi (read-only)
export async function loadUserProfile() {
  try {
    const provider = getProvider();
    const userAddress = getUserAddress();
    if (!provider || !userAddress || userAddress === "0x0000000000000000000000000000000000000000") {
      return null;
    }

    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const profile = await contract.getUserProfile(userAddress);
    return {
      username: profile.username || profile[1],
      link: profile.link || profile[0],
      supportCount: profile.supportCount || profile[2],
      reputation: profile.reputation || profile[3],
      badgeCount: profile.badgeCount || profile[4],
      isActive: profile.isActive || profile[5],
    };
  } catch (err) {
    console.error("Load user profile error:", err);
    return null;
  }
}

// ✅ YENİ: Kullanıcı istatistiklerini getir
export async function getUserStats(userAddress) {
  try {
    const provider = getProvider();
    if (!provider) return null;

    // GM sayısı
    const gmContract = new ethers.Contract(GM_CONTRACT_ADDRESS, GM_CONTRACT_ABI, provider);
    const gmFilter = gmContract.filters.GmSent(userAddress);
    const gmLogs = await provider.getLogs({
      ...gmFilter,
      fromBlock: 0,
      toBlock: 'latest'
    });
    const gmCount = gmLogs.length;

    // Deploy sayısı
    const factoryContract = new ethers.Contract(FACTORY_CONTRACT_ADDRESS, FACTORY_CONTRACT_ABI, provider);
    const deployFilter = factoryContract.filters.ContractDeployed(userAddress);
    const deployLogs = await provider.getLogs({
      ...deployFilter,
      fromBlock: 0,
      toBlock: 'latest'
    });
    const deployCount = deployLogs.length;

    // Proposal sayısı
    const mainContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const proposalFilter = mainContract.filters.ProposalCreated(null, userAddress);
    const proposalLogs = await provider.getLogs({
      ...proposalFilter,
      fromBlock: 0,
      toBlock: 'latest'
    });
    const proposalCount = proposalLogs.length;

    // Oy sayısı
    const voteFilter = mainContract.filters.Voted(null, userAddress);
    const voteLogs = await provider.getLogs({
      ...voteFilter,
      fromBlock: 0,
      toBlock: 'latest'
    });
    const voteCount = voteLogs.length;

    // Link sayısı
    const linkContract = new ethers.Contract(LINK_CONTRACT_ADDRESS, LINK_CONTRACT_ABI, provider);
    const linkFilter = linkContract.filters.LinkAdded(userAddress);
    const linkLogs = await provider.getLogs({
      ...linkFilter,
      fromBlock: 0,
      toBlock: 'latest'
    });
    const linkCount = linkLogs.length;

    // Badge sayısı (mevcut fonksiyonu kullan)
    const badges = await loadUserBadges();
    const badgeCount = badges.length;

    return {
      gmCount,
      deployCount,
      proposalCount,
      voteCount,
      linkCount,
      badgeCount
    };
  } catch (err) {
    console.error("Get user stats error:", err);
    return null;
  }
}

// ✅ YENİ: Badge mintleme fonksiyonu
export async function mintBadge(badgeType) {
  try {
    const signer = getSigner();
    if (!signer) {
      console.error("No signer available");
      return false;
    }

    const contract = getContract();
    const tx = await contract.awardBadge(await signer.getAddress(), badgeType, {
      gasLimit: 200000
    });
    
    console.log("Badge mint transaction sent:", tx.hash);
    await tx.wait();
    console.log("Badge minted successfully");
    return true;
  } catch (err) {
    console.error("Mint badge error:", err);
    return false;
  }
}

// ✅ YENİ: Badge kriterlerini kontrol et
export function checkBadgeEligibility(stats) {
  const eligibleBadges = [];

  if (stats.gmCount >= 1) {
    eligibleBadges.push({
      name: "🎉 GM Master",
      type: "gm_master",
      description: "Sent your first GM",
      unlocked: true
    });
  }

  if (stats.deployCount >= 1) {
    eligibleBadges.push({
      name: "🚀 Contract Deployer",
      type: "contract_deployer", 
      description: "Deployed your first contract",
      unlocked: true
    });
  }

  if (stats.proposalCount >= 1) {
    eligibleBadges.push({
      name: "🏛️ Governance Proposer",
      type: "governance_proposer",
      description: "Created a governance proposal",
      unlocked: true
    });
  }

  if (stats.voteCount >= 1) {
    eligibleBadges.push({
      name: "🗳️ Active Voter",
      type: "active_voter",
      description: "Voted on a proposal",
      unlocked: true
    });
  }

  if (stats.linkCount >= 1) {
    eligibleBadges.push({
      name: "🔗 Link Sharer",
      type: "link_sharer",
      description: "Shared your first link",
      unlocked: true
    });
  }

  if (stats.gmCount >= 5 && stats.deployCount >= 2 && stats.voteCount >= 3) {
    eligibleBadges.push({
      name: "🌟 Celo Super User",
      type: "celo_super_user",
      description: "Active on all platforms",
      unlocked: true
    });
  }

  return eligibleBadges;
}
