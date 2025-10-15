// ========================= CELO ENGAGE HUB V2 - CONTRACT SERVICE ========================= //
// 🔗 Akıllı kontrat ile etkileşimleri yönetir: profil, governance, bağış vb.

import { CONTRACT_ADDRESS, CONTRACT_ABI, DONATION_ADDRESS } from "../utils/constants.js";
import { getProvider, getSigner, getUserAddress } from "./walletService.js";
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";

// 🧩 Profil kontrolü
export async function checkProfile() {
  try {
    const provider = getProvider();
    const userAddress = getUserAddress();
    if (!provider || !userAddress) return false;

    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const profile = await contract.getUserProfile(userAddress);

    const isActive = profile.isActive || profile[5];
    console.log("Profile check:", profile);

    if (isActive) {
      alert("👤 Profile detected on-chain. Welcome back!");
      return true;
    } else {
      alert("🆕 No profile found. Please create one.");
      // Profil oluşturma alanını göster
      const contentArea = document.getElementById("contentArea");
      if (contentArea) {
        contentArea.innerHTML = `
          <h2>🆔 Setup Your Profile</h2>
          <div class="info-card">
            <input type="text" id="username" placeholder="Enter username" style="width:80%;padding:8px;margin:8px 0;border-radius:6px;border:1px solid #ccc;" />
            <input type="text" id="link" placeholder="Enter your link (e.g. https://x.com/...)" style="width:80%;padding:8px;margin-bottom:8px;border-radius:6px;border:1px solid #ccc;" />
            <button id="setupProfileBtn">🚀 Setup Profile</button>
          </div>
        `;
        const setupBtn = document.getElementById("setupProfileBtn");
        setupBtn.addEventListener("click", async () => {
          const username = document.getElementById("username").value.trim();
          const link = document.getElementById("link").value.trim();
          if (!username || !link) return alert("❌ Please fill all fields.");
          await setupUserProfile(username, link);
        });
      }
      return false;
    }
  } catch (err) {
    console.error("Profile check error:", err);
    alert("⚠️ Profile check failed. Please try again.");
    return false;
  }
}

// 🧾 Profil oluşturma (on-chain TX)
export async function setupUserProfile(username, link) {
  try {
    const signer = getSigner();
    if (!signer) return alert("Please connect your wallet first.");

    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    const tx = await contract.registerUser(username, link);

    alert("📡 Sending transaction to Celo...");
    await tx.wait();

    alert("✅ Profile setup complete!");
    return true;
  } catch (err) {
    console.error("Setup profile error:", err);
    if (err.code === 4001) alert("❌ Transaction rejected by user.");
    else alert("⚠️ Profile creation failed.");
    return false;
  }
}

// 💛 Donate işlemi (CELO gönder)
export async function donateCelo(amount) {
  const signer = getSigner();
  if (!signer) {
    alert("Please connect your wallet first!");
    return false;
  }

  try {
    const value = ethers.utils.parseEther(String(amount));
    const tx = await signer.sendTransaction({
      to: DONATION_ADDRESS,
      value
    });
    alert(`💛 Donating ${amount} CELO...\nTX: ${tx.hash}`);
    await tx.wait();
    alert("✅ Donation successful! Thank you.");
    return true;
  } catch (err) {
    console.error("Donate error:", err);
    if (err.code === 4001) alert("❌ Transaction rejected by user.");
    else if (String(err).includes("insufficient funds")) alert("❌ Insufficient funds.");
    else alert("❌ Donation failed: " + (err?.message || err));
    return false;
  }
}

// 🏛️ Governance (Proposal oluştur)
export async function createProposal(title, description) {
  try {
    const signer = getSigner();
    if (!signer) return alert("Please connect your wallet first.");
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    const tx = await contract.createProposal(title, description, 3600); // 1 saat süresi
    alert("📡 Creating proposal...");
    await tx.wait();
    alert("✅ Proposal created!");
  } catch (err) {
    console.error("Create proposal error:", err);
    alert("⚠️ Failed to create proposal.");
  }
}

// 🗳️ Vote Proposal
export async function voteProposal(id, support) {
  try {
    const signer = getSigner();
    if (!signer) return alert("Please connect your wallet first.");
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    const tx = await contract.voteProposal(id, support);
    alert("📡 Sending vote transaction...");
    await tx.wait();
    alert("✅ Vote recorded!");
  } catch (err) {
    console.error("Vote error:", err);
    alert("⚠️ Vote failed.");
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
// ========================= CELO ENGAGE HUB V2 - CONTRACT SERVICE ========================= //
// ⚙️ Smart contract işlemleri (profil, governance, badge, donate)

import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/constants.js";
import { getProvider, getSigner, getUserAddress } from "./walletService.js";

// 🔹 Contract yükle
function getContract() {
  const signer = getSigner();
  if (!signer) throw new Error("❌ Wallet not connected");
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

// 🔹 Profil var mı kontrol et
export async function checkProfile() {
  try {
    const user = getUserAddress();
    const contract = getContract();
    const profile = await contract.getUserProfile(user);

    // profile[5] = isActive
    if (!profile[5]) {
      alert("🚀 You don't have a profile yet. Let's create one!");
      const contentArea = document.getElementById("contentArea");
      contentArea.innerHTML = `
        <h2>👤 Setup Your Profile</h2>
        <div class="info-card">
          <input type="text" id="username" placeholder="Enter username" style="width:80%;padding:8px;margin:8px 0;border-radius:6px;border:1px solid #ccc;" />
          <input type="text" id="link" placeholder="Enter your link (X, Farcaster, GitHub...)" style="width:80%;padding:8px;margin-bottom:8px;border-radius:6px;border:1px solid #ccc;" />
          <button id="setupProfileBtn">🚀 Create Profile On-Chain</button>
        </div>
      `;

      document.getElementById("setupProfileBtn").addEventListener("click", async () => {
        const username = document.getElementById("username").value.trim();
        const link = document.getElementById("link").value.trim();
        if (!username || !link) return alert("❌ Please fill all fields.");
        await setupUserProfile(username, link);
      });
    }
  } catch (err) {
    console.error("Profile check error:", err);
  }
}

// 🔹 Profil oluştur
export async function setupUserProfile(username, link) {
  try {
    const contract = getContract();
    const tx = await contract.registerUser(username, link);
    alert("🟡 Transaction sent... please wait for confirmation");
    await tx.wait();
    alert("✅ Profile successfully created on-chain!");
  } catch (err) {
    console.error("Profile creation error:", err);
    alert("❌ Failed to create profile: " + (err?.message || err));
  }
}
