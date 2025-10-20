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
  if (!signer) throw new Error("❌ Wallet not connected");
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

// ✅ YENİ Contract yükle (sadece link göndermek için)
function getLinkContract() {
  const signer = getSigner();
  if (!signer) throw new Error("❌ Wallet not connected");
  return new ethers.Contract(LINK_CONTRACT_ADDRESS, LINK_CONTRACT_ABI, signer);
}

// ✅ GM Contract yükle
function getGmContract() {
  const signer = getSigner();
  if (!signer) throw new Error("❌ Wallet not connected");
  return new ethers.Contract(GM_CONTRACT_ADDRESS, GM_CONTRACT_ABI, signer);
}

// ✅ Factory Contract yükle
function getFactoryContract() {
  const signer = getSigner();
  if (!signer) throw new Error("❌ Wallet not connected");
  return new ethers.Contract(FACTORY_CONTRACT_ADDRESS, FACTORY_CONTRACT_ABI, signer);
}

// ✅ YENİ: Link gönderim fonksiyonu (YENİ kontrat ile)
export async function submitEmptyTransaction(userLink) {
  try {
    const signer = getSigner();
    if (!signer) {
      alert("⚠️ Lütfen önce wallet bağlayın!");
      return false;
    }

    const contract = getLinkContract(); // ✅ YENİ kontratı kullan
    
    // ✅ Yeni kontratın leaveMyLink fonksiyonunu çağır
    const tx = await contract.leaveMyLink(userLink, {
      gasLimit: 200000
    });
    
    alert("⏳ Celo ağına transaction gönderiliyor...\nTX: " + tx.hash);
    await tx.wait();
    alert("✅ Transaction onaylandı! Linkiniz blockchain'de kaydedildi.");
    return true;
  } catch (err) {
    console.error("Transaction error:", err);
    if (err.code === 4001) {
      alert("❌ Transaction kullanıcı tarafından reddedildi.");
    } else if (err.code === 'INSUFFICIENT_FUNDS') {
      alert("❌ Gas ücreti için yeterli CELO yok. Lütfen CELO ekleyin.");
    } else {
      alert("⚠️ Transaction başarısız: " + (err?.message || err));
    }
    return false;
  }
}

// ✅ YENİ: GM Transaction fonksiyonu
export async function sendGmTransaction() {
  try {
    const signer = getSigner();
    if (!signer) {
      alert("⚠️ Lütfen önce wallet bağlayın!");
      return false;
    }

    const gmContract = getGmContract();
    
    // GM mesajı ile transaction gönder
    const tx = await gmContract.sendGm("🌅 GM from Celo Engage Hub!", {
      gasLimit: 100000
    });
    
    alert("⏳ GM transactionı gönderiliyor...\nTX: " + tx.hash);
    await tx.wait();
    alert("✅ GM başarıyla gönderildi! Blockchain'de kaydedildi.");
    return true;
  } catch (err) {
    console.error("GM gönderim hatası:", err);
    if (err.code === 4001) {
      alert("❌ Transaction kullanıcı tarafından reddedildi.");
    } else if (err.code === 'INSUFFICIENT_FUNDS') {
      alert("❌ Gas ücreti için yeterli CELO yok.");
    } else {
      alert("⚠️ GM gönderilemedi: " + (err?.message || err));
    }
    return false;
  }
}

// ✅ YENİ: Kullanıcı için kontrat deploy et
export async function deployUserContract() {
  try {
    const signer = getSigner();
    if (!signer) {
      alert("⚠️ Lütfen önce wallet bağlayın!");
      return null;
    }

    const factoryContract = getFactoryContract();
    
    // Factory üzerinden yeni kontrat deploy et
    const tx = await factoryContract.deployGmContract({
      gasLimit: 500000
    });
    
    alert("⏳ Yeni kontratınız deploy ediliyor...\nTX: " + tx.hash);
    const receipt = await tx.wait();
    
    // Event'ten kontrat adresini al
    let deployedContractAddress = null;
    if (receipt.events && receipt.events[0]) {
      deployedContractAddress = receipt.events[0].args.contractAddress;
    }
    
    if (deployedContractAddress) {
      alert(`✅ Kontrat başarıyla deploy edildi!\nAdres: ${deployedContractAddress}`);
      return deployedContractAddress;
    } else {
      alert("✅ Kontrat deploy edildi! (Adres alınamadı)");
      return "deployed";
    }
  } catch (err) {
    console.error("Deploy error:", err);
    if (err.code === 4001) {
      alert("❌ Transaction kullanıcı tarafından reddedildi.");
    } else if (err.code === 'INSUFFICIENT_FUNDS') {
      alert("❌ Gas ücreti için yeterli CELO yok.");
    } else {
      alert("⚠️ Kontrat deploy edilemedi: " + (err?.message || err));
    }
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

// 🧩 Profil kontrolü (ESKİ kontrat ile - AYNI KALDI)
export async function checkProfile() {
  try {
    const provider = getProvider();
    const userAddress = getUserAddress();

    if (!provider || !userAddress || userAddress === "0x0000000000000000000000000000000000000000") {
      alert("⚠️ Wallet not connected. Please reconnect MetaMask.");
      return false;
    }

    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const profile = await contract.getUserProfile(userAddress);
    const isActive = profile.isActive || profile[5];

    if (isActive) {
      alert("👤 Profile detected on-chain. Welcome back!");
      return true;
    } else {
      alert("🆕 No profile found. Please create one.");

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

// 🧾 Profil oluşturma (on-chain TX) - ESKİ kontrat ile - AYNI KALDI
export async function setupUserProfile(username, link) {
  try {
    const signer = getSigner();
    if (!signer) return alert("Please connect your wallet first.");

    const contract = getContract();
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

// 💛 Donate işlemi (CELO gönder) - AYNI KALDI
export async function donateCelo(amount) {
  const signer = getSigner();
  const userAddress = getUserAddress();

  if (!signer || !userAddress || userAddress === "0x0000000000000000000000000000000000000000") {
    alert("⚠️ Please connect your wallet first!");
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

// 🏛️ Governance (Proposal oluştur) - ESKİ kontrat ile - AYNI KALDI
export async function createProposal(title, description) {
  try {
    const signer = getSigner();
    if (!signer) return alert("Please connect your wallet first.");

    const contract = getContract();
    const tx = await contract.createProposal(title, description, 3600);

    alert("📡 Creating proposal...");
    await tx.wait();
    alert("✅ Proposal created!");
  } catch (err) {
    console.error("Create proposal error:", err);
    alert("⚠️ Failed to create proposal.");
  }
}

// 🗳️ Vote Proposal - ESKİ kontrat ile - AYNI KALDI
export async function voteProposal(id, support) {
  try {
    const signer = getSigner();
    if (!signer) return alert("Please connect your wallet first.");

    const contract = getContract();
    const tx = await contract.voteProposal(id, support);

    alert("📡 Sending vote transaction...");
    await tx.wait();
    alert("✅ Vote recorded!");
  } catch (err) {
    console.error("Vote error:", err);
    alert("⚠️ Vote failed.");
  }
}

// 📜 Proposal listesi (read-only) - ESKİ kontrat ile - AYNI KALDI
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

// 🎖️ Badge listesi (placeholder) - AYNI KALDI
export async function loadUserBadges() {
  return ["Early Supporter", "Governance Voter", "Community Builder"];
}

// 👤 Profil bilgisi (read-only) - ESKİ kontrat ile - AYNI KALDI
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
