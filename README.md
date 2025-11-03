🌐 Celo Engage Hub

Social TX – Where Every Interaction Builds Real Value..


🚀 Overview

Celo Engage Hub is a revolutionary decentralized application built on the Celo blockchain that transforms social interactions into valuable on-chain activities. Every action you take - from sending a simple "GM" to deploying contracts - earns you experience points, levels up your profile, and unlocks exclusive badges.

🎯 Core Philosophy

"If you want support, support first" - We believe in building a community where value flows both ways.

✨ Features

🏠 Home & Community Support

· Support other community members before submitting your own links
· Interactive community link sharing system
· Real-time support tracking

👋 GM Module

· Send decentralized "Good Morning" messages on-chain
· Track your GM count and global statistics
· Build your social reputation through consistent engagement

🚀 Contract Deployment

· Deploy smart contracts directly from the dApp
· No coding experience required
· Track your deployment history and skills

💛 Donation System

· Donate in CELO or cUSD to support the ecosystem
· Transparent donation tracking
· Owner withdrawal system with daily limits
· Minimum donation: 0.1 CELO/cUSD

🔗 Link Sharing

· Share valuable links with the community
· Hourly rate limiting to prevent spam
· Track link engagement and visibility

🗳️ Governance & Voting

· Create and vote on community proposals
· Transparent voting system
· Proposal execution and result tracking

👤 Profile System

· Comprehensive user profiles with on-chain data
· Experience points (XP) system
· Level and tier progression
· Achievement tracking across all modules

🏆 Badge & Achievement System

· Earn badges based on your activities
· Tier system from Beginner to Master
· XP-based leveling mechanism
· Prestige and recognition in the community

🛠️ Technical Architecture

📦 Smart Contract Modules

Module Address Description
Main Contract 0x18351438b1bD20ee433Ea7D25589e913f14ca1A5 Central hub connecting all modules
Profile Module 0xb7574975e18b64d18886D03CCC710d62cdD7E743 User profiles and statistics
GM Module 0x06E065AE4dDa7b669D6381D1F7ec523bfD83e2D7 GM message system
Deploy Module 0xD567149Cf3a2bd97d905408c87Cc8194eb246785 Contract deployment
Donate Module 0x76CA7FCBCdB46881c2715EBf351BCc1aAC7d70FA Donation handling
Link Module 0x5ae32ab13f0458f4fb7a434120747e7e5944ce97 Link sharing system
Governance Module 0xe71c701d66f8c27fba15f3b4a607c741ffedeed1 Proposal and voting
Badge Module 0xd11896d5ba8aa3ed906b37b941a27849e74fd300 Achievement system

🔗 Supported Networks

· Celo Mainnet (Chain ID: 42220)
· Celo Sepolia Testnet (Chain ID: 11144744)

💰 Accepted Tokens

· CELO (Native token)
· cUSD (Celo Dollar stablecoin)
· cEUR (Celo Euro stablecoin)

🎮 Quick Start

1. Connect Your Wallet

```javascript
// Supported Wallets:
- MetaMask (Desktop & Mobile)
- WalletConnect (Coming Soon)
```

2. Create Your Profile

· Choose a unique username (3-32 characters)
· Your profile is stored on the blockchain
· Start with Level 1 and Tier 1

3. Start Engaging

```javascript
// Earn XP through these activities:
- Send GM: +10 XP
- Deploy Contract: +25 XP  
- Make Donation: +15 XP
- Share Link: +5 XP
- Vote on Proposal: +8 XP
```

📊 User Progression System

🎯 Levels & Tiers

Level XP Required Tier Requirements
1 0 Beginner
2 100 Contributor
3 300 Active Member
4 600 Community Leader
5 1000 Ecosystem Expert

🏅 Badge Tiers

1. Bronze - Basic engagement
2. Silver - Consistent participation
3. Gold - High-value contributions
4. Platinum - Ecosystem leadership
5. Diamond - Top-tier influence

🔧 Development & Installation

Prerequisites

· Node.js 16+
· MetaMask wallet
· Celo network configured

Local Development

```bash
# Clone the repository
git clone https://github.com/tebberen/celo-engage-hub.git

# Navigate to project directory
cd celo-engage-hub

# Install dependencies (if any)
npm install

# Start local development server
# Open index.html in your browser or use a local server
python -m http.server 8000
```

Project Structure

```
celo-engage-hub/
├── src/
│   ├── services/
│   │   ├── contractService.js    # Blockchain interactions
│   │   └── walletService.js      # Wallet management
│   ├── utils/
│   │   └── constants.js          # Contract addresses & ABIs
│   └── styles/
│       └── main.css              # Styling
├── index.html                    # Main application
└── README.md
```

🌟 Key Smart Contract Functions

Profile Management

```solidity
function registerUser(address user) external;
function getUserProfile(address user) external view returns (UserProfile memory);
function updateUsername(string memory newUsername) external;
```

GM System

```solidity
function sendGM(address user, string memory message) external;
function getUserGMCount(address user) external view returns (uint256);
```

Donation System

```solidity
function donateCELO(address user) external payable;
function donateCUSD(address user, uint256 amount) external;
function withdraw(address owner) external;
```

📈 Statistics & Analytics

Global Metrics

· Total Visitors: Tracked on-chain
· GM Count: Community engagement
· Contract Deployments: Developer activity
· Links Shared: Content distribution
· Votes Cast: Governance participation
· Badges Earned: Achievement system

User Statistics

· Individual activity counters
· Total XP and level progression
· Donation history and amounts
· Voting participation rate

🔒 Security Features

Smart Contract Security

· Ownable contracts with proper access controls
· Rate limiting on link sharing
· Daily withdrawal limits for donations
· Input validation and sanitization

User Protection

· MetaMask integration with network validation
· Transaction confirmation prompts
· Clear error messages and user feedback
· No hidden fees or unexpected charges

🌍 Community & Ecosystem

Supported Platforms

· Farcaster integration
· Twitter/X sharing
· GitHub repository tracking
· Community forums and discussions

Ecosystem Links

· Celo Official
· Celo Documentation
· Developer Portal
· Celo Explorer

🎯 Use Cases

🤝 For Community Members

· Build your on-chain reputation
· Earn recognition through contributions
· Participate in governance decisions
· Share valuable resources

🏗️ For Developers

· Learn smart contract interaction
· Practice dApp development
· Deploy test contracts risk-free
· Build your Web3 portfolio

💼 For Project Owners

· Transparent community engagement
· On-chain activity tracking
· Donation-based funding model
· Community governance integration

📱 User Interface

Navigation Sections

1. Home - Community support and links
2. GM - Send and track greetings
3. Deploy - Contract deployment interface
4. Donate - Token donation system
5. Links - Content sharing platform
6. Governance - Proposal creation and voting
7. Profile - User statistics and achievements
8. Badges - Achievement display
9. Leaderboard - Community rankings

Responsive Design

· Mobile-first approach
· Cross-browser compatibility
· MetaMask mobile support
· Touch-friendly interface

🔄 Transaction Flow

Single Transaction Model

```javascript
// Before: Multiple transactions
const tx1 = await gm.sendGM(userAddress, message);
await tx1.wait();
const tx2 = await profile.incrementGMCount(userAddress); // ❌ Removed
await tx2.wait();

// After: Single transaction ✅
const tx = await gm.sendGM(userAddress, message);
await tx.wait();
```

🚀 Deployment

Live Deployment

The application is currently deployed and accessible at:
https://tebberen.github.io/celo-engage-hub/

Smart Contract Verification

All contracts are verified on CeloScan:

· Main Contract
· Individual module contracts are also verified

🤝 Contributing

We welcome contributions from the community! Here's how you can help:

Development

1. Fork the repository
2. Create a feature branch (git checkout -b feature/amazing-feature)
3. Commit your changes (git commit -m 'Add amazing feature')
4. Push to the branch (git push origin feature/amazing-feature)
5. Open a Pull Request

Testing

· Test on Celo Sepolia testnet first
· Report bugs and issues
· Suggest new features and improvements

Documentation

· Improve documentation
· Add code comments
· Create tutorials and guides

📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments

· Celo Foundation for building an amazing blockchain ecosystem
· MetaMask for seamless wallet integration
· Community contributors who help improve the platform
· Early testers for valuable feedback and bug reports


🎊 Get Started Today!

Join the Celo Engage Hub community and start building your on-chain reputation. Every interaction counts, every contribution matters, and every member helps grow the ecosystem together.

Connect your wallet, create your profile, and let's build the future of decentralized social engagement!

---

<div align="center">🌟 "Your Engagement Builds Real Value" 🌟


Built with ❤️ on Celo Blockchain

</div>
