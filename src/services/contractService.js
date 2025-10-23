// ========================= CELO ENGAGE HUB V4 - CONTRACT SERVICE ========================= //
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";

import { 
  V4_CONTRACT_ADDRESS, 
  V4_CONTRACT_ABI, 
  ACCEPTED_TOKENS,
  DONATION_ADDRESS
} from "../utils/constants.js";
import { getProvider, getSigner, getUserAddress } from "./walletService.js";

// ✅ V4 Contract yükle
function getV4Contract() {
  const signer = getSigner();
  if (!signer) throw new Error("Wallet not connected");
  return new ethers.Contract(V4_CONTRACT_ADDRESS, V4_CONTRACT_ABI, signer);
}

// ✅ V4: Profil oluşturma
export async function setupUserProfile(username, link) {
  try {
    const signer = getSigner();
    if (!signer) {
      console.error("No signer available");
      return false;
    }

    const contract = getV4Contract();
    const tx = await contract.registerUser(username, link, {
      gasLimit: 300000
    });
    
    console.log("V4 Profile creation transaction sent:", tx.hash);
    await tx.wait();
    console.log("V4 Profile created successfully");
    return true;
  } catch (err) {
    console.error("V4 Setup profile error:", err);
    return false;
  }
}

// ✅ V4: Profil kontrolü
export async function checkProfile() {
  try {
    const provider = getProvider();
    const userAddress = getUserAddress();

    if (!provider || !userAddress || userAddress === "0x0000000000000000000000000000000000000000") {
      return false;
    }

    const contract = new ethers.Contract(V4_CONTRACT_ADDRESS, V4_CONTRACT_ABI, provider);
    const profile = await contract.getUserProfile(userAddress);
    return profile.isActive;
  } catch (err) {
    console.error("V4 Profile check error:", err);
    return false;
  }
}

// ✅ V4: Kullanıcı istatistiklerini getir
export async function getUserStats(userAddress) {
  try {
    const provider = getProvider();
    if (!provider) return null;

    const contract = new ethers.Contract(V4_CONTRACT_ADDRESS, V4_CONTRACT_ABI, provider);
    const stats = await contract.getUserStats(userAddress);
    return {
      gmCount: stats.gmCount.toNumber(),
      deployCount: stats.deployCount.toNumber(),
      linkCount: stats.linkCount.toNumber(),
      totalPoints: stats.totalPoints.toNumber(),
      badgeCount: 0 // V4'te badgeCount profile'da
    };
  } catch (err) {
    console.error("V4 Get user stats error:", err);
    return null;
  }
}

// ✅ V4: Badge'leri getir
export async function loadUserBadges() {
  try {
    const provider = getProvider();
    const userAddress = getUserAddress();
    if (!provider || !userAddress) return [];

    const contract = new ethers.Contract(V4_CONTRACT_ADDRESS, V4_CONTRACT_ABI, provider);
    const badges = await contract.getUserBadges(userAddress);
    return badges;
  } catch (err) {
    console.error("V4 Load user badges error:", err);
    return [];
  }
}

// ✅ V4: Uygun badge'leri kontrol et
export async function checkBadgeEligibility(userAddress) {
  try {
    const provider = getProvider();
    if (!provider) return [];

    const contract = new ethers.Contract(V4_CONTRACT_ADDRESS, V4_CONTRACT_ABI, provider);
    const eligibleBadges = await contract.checkBadgeEligibility(userAddress);
    
    return eligibleBadges.map(badgeName => ({
      name: badgeName,
      type: badgeName.toLowerCase().replace(/\s+/g, '_'),
      description: `Earned by completing ${badgeName} requirements`,
      unlocked: true
    }));
  } catch (err) {
    console.error("V4 Check badge eligibility error:", err);
    return [];
  }
}

// ✅ V4: İstatistik artırma fonksiyonları
export async function incrementGmCount() {
  try {
    const contract = getV4Contract();
    const tx = await contract.incrementGmCount({ gasLimit: 100000 });
    await tx.wait();
    return true;
  } catch (err) {
    console.error("Increment GM count error:", err);
    return false;
  }
}

export async function incrementDeployCount() {
  try {
    const contract = getV4Contract();
    const tx = await contract.incrementDeployCount({ gasLimit: 100000 });
    await tx.wait();
    return true;
  } catch (err) {
    console.error("Increment deploy count error:", err);
    return false;
  }
}

export async function incrementLinkCount() {
  try {
    const contract = getV4Contract();
    const tx = await contract.incrementLinkCount({ gasLimit: 100000 });
    await tx.wait();
    return true;
  } catch (err) {
    console.error("Increment link count error:", err);
    return false;
  }
}

// ✅ V4: Badge mintleme
export async function mintBadge(badgeType) {
  try {
    const signer = getSigner();
    if (!signer) {
      console.error("No signer available");
      return false;
    }

    const contract = getV4Contract();
    const tx = await contract.awardBadge(badgeType, {
      gasLimit: 200000
    });
    
    console.log("V4 Badge mint transaction sent:", tx.hash);
    await tx.wait();
    console.log("V4 Badge minted successfully");
    return true;
  } catch (err) {
    console.error("V4 Mint badge error:", err);
    return false;
  }
}

// ✅ V4: Profil bilgisi
export async function loadUserProfile() {
  try {
    const provider = getProvider();
    const userAddress = getUserAddress();
    if (!provider || !userAddress || userAddress === "0x0000000000000000000000000000000000000000") {
      return null;
    }

    const contract = new ethers.Contract(V4_CONTRACT_ADDRESS, V4_CONTRACT_ABI, provider);
    const profile = await contract.getUserProfile(userAddress);
    return {
      username: profile.username,
      link: profile.link,
      supportCount: profile.supportCount.toNumber(),
      reputation: profile.reputation.toNumber(),
      badgeCount: profile.badgeCount.toNumber(),
      isActive: profile.isActive,
      createdAt: profile.createdAt.toNumber()
    };
  } catch (err) {
    console.error("V4 Load user profile error:", err);
    return null;
  }
}

// 🏛️ V4: Governance fonksiyonları - YENİDEN EKLENDİ
export async function createProposal(title, description) {
  try {
    const contract = getV4Contract();
    const tx = await contract.createProposal(title, description, {
      gasLimit: 300000
    });
    await tx.wait();
    return true;
  } catch (err) {
    console.error("Create proposal error:", err);
    return false;
  }
}

// ✅ YENİ: Sadece owner için proposal oluşturma
export async function createProposalAsOwner(title, description) {
  try {
    const contract = getV4Contract();
    
    // Owner kontrolü
    const contractOwner = await contract.owner();
    const userAddress = getUserAddress();
    
    if (userAddress.toLowerCase() === contractOwner.toLowerCase()) {
      // Owner ise proposal oluştur
      const tx = await contract.createProposal(title, description, {
        gasLimit: 300000
      });
      await tx.wait();
      return true;
    } else {
      throw new Error("Sadece owner proposal oluşturabilir");
    }
  } catch (err) {
    console.error("Create proposal as owner error:", err);
    return false;
  }
}

export async function voteProposal(proposalId, support) {
  try {
    const contract = getV4Contract();
    const tx = await contract.voteProposal(proposalId, support, {
      gasLimit: 200000
    });
    await tx.wait();
    return true;
  } catch (err) {
    console.error("Vote error:", err);
    return false;
  }
}

// 📜 Proposal listesi
export async function loadProposals() {
  try {
    const provider = getProvider();
    if (!provider) return [];

    const contract = new ethers.Contract(V4_CONTRACT_ADDRESS, V4_CONTRACT_ABI, provider);
    
    // Basit implementasyon - gerçek projede tüm proposal'ları getir
    // Bu kısım kontratınıza göre özelleştirilmelidir
    return [
      {
        id: 1,
        title: "Community Improvement Proposal",
        description: "Let's make the community better together!",
        votesFor: "15",
        votesAgainst: "2"
      }
    ];
  } catch (err) {
    console.error("Load proposals error:", err);
    return [];
  }
}

// ✅ YENİ: Kontrat owner'ını getir
export async function getContractOwner() {
  try {
    const provider = getProvider();
    if (!provider) return null;

    const contract = new ethers.Contract(V4_CONTRACT_ADDRESS, V4_CONTRACT_ABI, provider);
    const owner = await contract.owner();
    return owner;
  } catch (err) {
    console.error("Get contract owner error:", err);
    return null;
  }
}

// ✅ YENİ: Owner kontrolü
export async function checkIfOwner() {
  try {
    const userAddress = getUserAddress();
    const contractOwner = await getContractOwner();
    
    return userAddress && contractOwner && 
           userAddress.toLowerCase() === contractOwner.toLowerCase();
  } catch (err) {
    console.error("Check owner error:", err);
    return false;
  }
}

// 💰 V4: CELO bağış (native)
export async function donateCelo(amount) {
  const signer = getSigner();
  const userAddress = getUserAddress();

  if (!signer || !userAddress || userAddress === "0x0000000000000000000000000000000000000000") {
    return false;
  }

  try {
    const value = ethers.utils.parseEther(String(amount));
    const contract = getV4Contract();
    
    const tx = await contract.donateCelo({
      value: value,
      gasLimit: 100000
    });
    
    await tx.wait();
    return true;
  } catch (err) {
    console.error("Donate CELO error:", err);
    return false;
  }
}

// 🔄 Geriye uyumluluk için V3 fonksiyonları
export async function sendGmTransaction() {
  return await incrementGmCount();
}

export async function submitEmptyTransaction(userLink) {
  return await incrementLinkCount();
}

export async function deployUserContract() {
  const success = await incrementDeployCount();
  return success ? "deployed" : null;
}

export async function getUserDeployedContracts() {
  try {
    const stats = await getUserStats(getUserAddress());
    return Array(stats.deployCount).fill("0x0000000000000000000000000000000000000000");
  } catch (err) {
    console.error("Get user contracts error:", err);
    return [];
  }
}

console.log("🚀 V4 Contract Service loaded - Governance system reactivated with owner-only proposals!");
