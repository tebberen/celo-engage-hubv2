// ========================= CELO ENGAGE HUB V2 - CONTRACT SERVICE ========================= //
// 💡 Akıllı kontrat fonksiyonlarını yönetir (register, update, proposal, vote, badges)

import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/constants.js";
import { getProvider, getSigner, getUserAddress } from "./walletService.js";
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";

// ✅ Kontrat bağlantısını oluştur
function getContractInstance() {
  const provider = getProvider();
  if (!provider) throw new Error("Provider not initialized");
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}

// ✅ Kullanıcı profili yükle
export async function loadUserProfile() {
  const provider = getProvider();
  const userAddress = getUserAddress();
  if (!provider || !userAddress) return null;

  try {
    const contract = getContractInstance();
    const profile = await contract.getUserProfile(userAddress);

    return {
      link: profile[0],
      username: profile[1],
      supportCount: profile[2].toString(),
      reputation: profile[3].toString(),
      badgeCount: profile[4].toString(),
      isActive: profile[5],
      timestamp: profile[6].toString()
    };
  } catch (err) {
    console.error("Error loading profile:", err);
    return null;
  }
}

// ✅ Profil oluştur / güncelle
export async function setupUserProfile(username, link) {
  const signer = getSigner();
  const userAddress = getUserAddress();
  if (!signer || !userAddress) {
    alert("Please connect your wallet first!");
    return;
  }

  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    const userProfile = await contract.getUserProfile(userAddress);
    let tx;

    if (userProfile.isActive) {
      console.log("🔄 Updating existing profile...");
      tx = await contract.updateProfile(username, link, { gasLimit: 300000 });
    } else {
      console.log("🚀 Registering new user...");
      tx = await contract.registerUser(username, link, { gasLimit: 500000 });
    }

    alert("⏳ Transaction sent. Waiting for confirmation...");
    await tx.wait();
    alert("✅ Profile updated successfully!");
    return true;
  } catch (err) {
    console.error("Profile setup error:", err);
    alert("❌ Error: " + err.message);
    return false;
  }
}

// ✅ Proposal oluşturma
export async function createProposal(title, description) {
  const signer = getSigner();
  if (!signer) {
    alert("Please connect your wallet first!");
    return;
  }

  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    const duration = 3 * 24 * 60 * 60; // 3 gün
    const tx = await contract.createProposal(title, description, duration, { gasLimit: 600000 });

    alert("🗳️ Proposal submitted! TX Hash: " + tx.hash);
    await tx.wait();
    alert("✅ Proposal created successfully!");
    return true;
  } catch (err) {
    console.error("Proposal creation error:", err);
    alert("❌ Failed to create proposal: " + err.message);
    return false;
  }
}

// ✅ Oy verme
export async function voteProposal(proposalId, support) {
  const signer = getSigner();
  if (!signer) {
    alert("Please connect your wallet first!");
    return;
  }

  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    const tx = await contract.voteProposal(proposalId, support, { gasLimit: 400000 });

    alert("🗳️ Vote sent! TX Hash: " + tx.hash);
    await tx.wait();
    alert("✅ Vote successful!");
    return true;
  } catch (err) {
    console.error("Voting error:", err);
    alert("❌ Voting failed: " + err.message);
    return false;
  }
}

// ✅ Badge'leri yükle
export async function loadUserBadges() {
  const provider = getProvider();
  const userAddress = getUserAddress();
  if (!provider || !userAddress) return [];

  try {
    const contract = getContractInstance();
    const badges = await contract.getUserBadges(userAddress);
    return badges;
  } catch (err) {
    console.error("Error loading badges:", err);
    return [];
  }
}

// ✅ Aktif Proposal’ları listele
export async function loadProposals() {
  const provider = getProvider();
  if (!provider) return [];

  try {
    const contract = getContractInstance();
    const activeProposals = await contract.getActiveProposals();

    const proposalDetails = [];
    for (let id of activeProposals) {
      const details = await contract.getProposalDetails(id);
      proposalDetails.push({
        id: id.toString(),
        title: details.title,
        description: details.description,
        votesFor: details.votesFor.toString(),
        votesAgainst: details.votesAgainst.toString()
      });
    }

    return proposalDetails;
  } catch (err) {
    console.error("Error loading proposals:", err);
    return [];
  }
}

// ✅ Donate placeholder (gerçek işlem eklenecek)
export async function donateCelo(amount) {
  const signer = getSigner();
  if (!signer) {
    alert("Please connect your wallet first!");
    return;
  }

  try {
    const tx = await signer.sendTransaction({
      to: CONTRACT_ADDRESS,
      value: ethers.utils.parseEther(amount.toString())
    });
    alert(`💛 Donating ${amount} CELO... TX Hash: ${tx.hash}`);
    await tx.wait();
    alert("✅ Donation successful!");
    return true;
  } catch (err) {
    console.error("Donation error:", err);
    alert("❌ Donation failed: " + err.message);
    return false;
  }
}
