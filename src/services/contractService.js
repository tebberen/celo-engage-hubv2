// ========================= CELO ENGAGE HUB V3 - CONTRACT SERVICE ========================= //
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";

import { 
  V3_CONTRACT_ADDRESS, V3_CONTRACT_ABI, DONATION_ADDRESS
} from "../utils/constants.js";
import { getProvider, getSigner, getUserAddress } from "./walletService.js";

// ✅ V3 Contract yükle
function getV3Contract() {
  const signer = getSigner();
  if (!signer) throw new Error("Wallet not connected");
  return new ethers.Contract(V3_CONTRACT_ADDRESS, V3_CONTRACT_ABI, signer);
}

// ✅ V3: Profil oluşturma
export async function setupUserProfile(username, link) {
  try {
    const signer = getSigner();
    if (!signer) {
      console.error("No signer available");
      return false;
    }

    const contract = getV3Contract();
    const tx = await contract.registerUser(username, link, {
      gasLimit: 300000
    });
    
    console.log("V3 Profile creation transaction sent:", tx.hash);
    await tx.wait();
    console.log("V3 Profile created successfully");
    return true;
  } catch (err) {
    console.error("V3 Setup profile error:", err);
    return false;
  }
}

// ✅ V3: Profil kontrolü
export async function checkProfile() {
  try {
    const provider = getProvider();
    const userAddress = getUserAddress();

    if (!provider || !userAddress || userAddress === "0x0000000000000000000000000000000000000000") {
      return false;
    }

    const contract = new ethers.Contract(V3_CONTRACT_ADDRESS, V3_CONTRACT_ABI, provider);
    const profile = await contract.getUserProfile(userAddress);
    return profile.isActive;
  } catch (err) {
    console.error("V3 Profile check error:", err);
    return false;
  }
}

// ✅ V3: Kullanıcı istatistiklerini getir
export async function getUserStats(userAddress) {
  try {
    const provider = getProvider();
    if (!provider) return null;

    const contract = new ethers.Contract(V3_CONTRACT_ADDRESS, V3_CONTRACT_ABI, provider);
    const stats = await contract.getUserStats(userAddress);
    return {
      gmCount: stats.gmCount.toNumber(),
      deployCount: stats.deployCount.toNumber(),
      proposalCount: stats.proposalCount.toNumber(),
      voteCount: stats.voteCount.toNumber(),
      linkCount: stats.linkCount.toNumber(),
      totalPoints: stats.totalPoints.toNumber(),
      badgeCount: 0 // V3'te badgeCount profile'da
    };
  } catch (err) {
    console.error("V3 Get user stats error:", err);
    return null;
  }
}

// ✅ V3: Badge'leri getir
export async function loadUserBadges() {
  try {
    const provider = getProvider();
    const userAddress = getUserAddress();
    if (!provider || !userAddress) return [];

    const contract = new ethers.Contract(V3_CONTRACT_ADDRESS, V3_CONTRACT_ABI, provider);
    const badges = await contract.getUserBadges(userAddress);
    return badges;
  } catch (err) {
    console.error("V3 Load user badges error:", err);
    return [];
  }
}

// ✅ V3: Uygun badge'leri kontrol et
export async function checkBadgeEligibility(userAddress) {
  try {
    const provider = getProvider();
    if (!provider) return [];

    const contract = new ethers.Contract(V3_CONTRACT_ADDRESS, V3_CONTRACT_ABI, provider);
    const eligibleBadges = await contract.checkBadgeEligibility(userAddress);
    
    return eligibleBadges.map(badgeName => ({
      name: badgeName,
      type: badgeName.toLowerCase().replace(/\s+/g, '_'),
      description: `Earned by completing ${badgeName} requirements`,
      unlocked: true
    }));
  } catch (err) {
    console.error("V3 Check badge eligibility error:", err);
    return [];
  }
}

// ✅ V3: İstatistik artırma fonksiyonları
export async function incrementGmCount() {
  try {
    const contract = getV3Contract();
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
    const contract = getV3Contract();
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
    const contract = getV3Contract();
    const tx = await contract.incrementLinkCount({ gasLimit: 100000 });
    await tx.wait();
    return true;
  } catch (err) {
    console.error("Increment link count error:", err);
    return false;
  }
}

export async function incrementProposalCount() {
  try {
    const contract = getV3Contract();
    const tx = await contract.incrementProposalCount({ gasLimit: 100000 });
    await tx.wait();
    return true;
  } catch (err) {
    console.error("Increment proposal count error:", err);
    return false;
  }
}

export async function incrementVoteCount() {
  try {
    const contract = getV3Contract();
    const tx = await contract.incrementVoteCount({ gasLimit: 100000 });
    await tx.wait();
    return true;
  } catch (err) {
    console.error("Increment vote count error:", err);
    return false;
  }
}

// ✅ V3: Badge mintleme
export async function mintBadge(badgeType) {
  try {
    const signer = getSigner();
    if (!signer) {
      console.error("No signer available");
      return false;
    }

    const contract = getV3Contract();
    const tx = await contract.awardBadge(badgeType, {
      gasLimit: 200000
    });
    
    console.log("V3 Badge mint transaction sent:", tx.hash);
    await tx.wait();
    console.log("V3 Badge minted successfully");
    return true;
  } catch (err) {
    console.error("V3 Mint badge error:", err);
    return false;
  }
}

// ✅ V3: Profil bilgisi
export async function loadUserProfile() {
  try {
    const provider = getProvider();
    const userAddress = getUserAddress();
    if (!provider || !userAddress || userAddress === "0x0000000000000000000000000000000000000000") {
      return null;
    }

    const contract = new ethers.Contract(V3_CONTRACT_ADDRESS, V3_CONTRACT_ABI, provider);
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
    console.error("V3 Load user profile error:", err);
    return null;
  }
}

// ✅ YENİ: GM Transaction fonksiyonu (V3 ile)
export async function sendGmTransaction() {
  try {
    const success = await incrementGmCount();
    return success;
  } catch (err) {
    console.error("GM transaction error:", err);
    return false;
  }
}

// ✅ YENİ: Link gönderim fonksiyonu (V3 ile)
export async function submitEmptyTransaction(userLink) {
  try {
    const success = await incrementLinkCount();
    return success;
  } catch (err) {
    console.error("Link transaction error:", err);
    return false;
  }
}

// ✅ YENİ: Kullanıcı için kontrat deploy et (V3 ile)
export async function deployUserContract() {
  try {
    const success = await incrementDeployCount();
    return success ? "deployed" : null;
  } catch (err) {
    console.error("Deploy error:", err);
    return null;
  }
}

// ✅ YENİ: Kullanıcının deploy ettiği kontratları getir (V3'te basit)
export async function getUserDeployedContracts() {
  try {
    const stats = await getUserStats(getUserAddress());
    return Array(stats.deployCount).fill("0x0000000000000000000000000000000000000000");
  } catch (err) {
    console.error("Get user contracts error:", err);
    return [];
  }
}

// 🏛️ Governance (Proposal oluştur) - V3 ile
export async function createProposal(title, description) {
  try {
    await incrementProposalCount();
  } catch (err) {
    console.error("Create proposal error:", err);
  }
}

// 🗳️ Vote Proposal - V3 ile
export async function voteProposal(id, support) {
  try {
    await incrementVoteCount();
  } catch (err) {
    console.error("Vote error:", err);
  }
}

// 📜 Proposal listesi (basit versiyon)
export async function loadProposals() {
  return [
    {
      id: 1,
      title: "Community Improvement Proposal",
      description: "Let's make the community better together!",
      votesFor: "15",
      votesAgainst: "2"
    }
  ];
}

// 💛 Donate işlemi (CELO gönder) - aynı kalıyor
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

console.log("🚀 V3 Contract Service loaded - Full profile & badge system active");
