# 🌐 Celo Engage Hub V2

> **Community-driven Web3 dApp** built on the **Celo blockchain**, where every interaction creates on-chain value.  
> Designed, built and deployed by [@luckyfromnecef](https://x.com/luckyfromnecef) 💛 

---

## 🚀 Overview

**Celo Engage Hub V2** is a modular, decentralized engagement platform that rewards community participation on the Celo network.  
Users can connect their wallet, support others, submit links, vote in governance, earn badges, and donate to the ecosystem — all within a clean and responsive interface.

---

## 🧩 Features

### 🟡 Core Modules
| Feature | Description |
|----------|--------------|
| **GM** | On-chain GM transaction (daily engagement) |
| **Deploy** | Smart contract deployment (coming soon) |
| **Governance** | Create and vote on community proposals |
| **Badge** | View badges earned through participation |
| **Profile** | Create and manage your on-chain profile |
| **Donate** | Support the hub with CELO donations |

---

## 💛 Donate to Support Hub
Choose between `0.5`, `1`, `5`, or `10 CELO` to donate directly on-chain.  
All donations go to the community fund contract address:

0x22eA49c074098931a478F381f971C77486d185b2

---

## ⚙️ Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES Modules)
- **Blockchain:** CELO Mainnet / Alfajores Testnet
- **Libraries:** [ethers.js v5.7.2](https://docs.ethers.io/v5/)
- **Wallet Integration:** MetaMask
- **Hosting:** GitHub Pages
- **Structure:** Modular Architecture  

celo-engage-hubv2/
├── index.html
├── src/
│   ├── styles/main.css
│   ├── services/
│   │   ├── walletService.js
│   │   └── contractService.js
│   ├── utils/constants.js
│   └── main.js
└── README.md

---

## 🔗 Live Demo

👉 **[View the live dApp here](https://tebberen.github.io/celo-engage-hubv2/)**  
(If the link isn’t active yet, go to **Settings → Pages → Source → main / (root)** and click **Save**)

---

## 🧠 Developer Notes

- Make sure MetaMask is connected to **Celo Mainnet** or **Alfajores Testnet**.
- To test locally, use VS Code + “Live Server” plugin to avoid CORS errors.
- All blockchain interactions happen through your connected wallet — fully decentralized.

---

## 🪙 Smart Contract

Deployed Contract Address:

0x22eA49c074098931a478F381f971C77486d185b2

Contract functions include:
- `registerUser(string username, string link)`
- `createProposal(string title, string description, uint256 duration)`
- `voteProposal(uint256 proposalId, bool support)`
- `awardBadge(address user, string badge)`
- `getUserProfile(address user)`

---

## 🧑‍💻 Author

**Developed by:** [@luckyfromnecef](https://x.com/luckyfromnecef)  
**GitHub:** [https://github.com/tebberen](https://github.com/tebberen)  
**Network:** [Celo](https://celo.org)

---

### 💫 “If you want support, support first.”  
_Celo Engage Hub — Social TX for builders and dreamers.._
