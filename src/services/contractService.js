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

// 🧩 Profil kontrolü (alert yok)
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

    if (isActive) {
      return true;
    } else {
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
        document.getElementById("setupProfileBtn").addEventListener("click", async () => {
          const username = document.getElementById("username").value.trim();
          const link = document.getElementById("link").value.trim();
          if (!username || !link) return;
          await setupUserProfile(username, link);
        });
      }
      return false;
    }
  } catch (err) {
    console.error("Profile check error:", err);
    return false;
  }
}

// 🧾 Profil oluşturma (on-chain TX) - alert yok
export async function setupUserProfile(username, link) {
  try {
    const signer = getSigner();
    if (!signer) return false;

    const contract = getContract();
    const tx = await contract.registerUser(username, link);
    await tx.wait();
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
