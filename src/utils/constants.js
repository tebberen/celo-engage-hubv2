// ========================= CELO ENGAGE HUB V2 - CONSTANTS ========================= //

// ✅ YENİ V3 KONTART (tüm profil, istatistik ve badge'ler için)
export const V3_CONTRACT_ADDRESS = "0x5a3ddc1c12338bbbadd24469b3b01b236fc5761a";
export const V3_CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_badge",
				"type": "string"
			}
		],
		"name": "awardBadge",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "badge",
				"type": "string"
			}
		],
		"name": "BadgeAwarded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newCount",
				"type": "uint256"
			}
		],
		"name": "ContractDeployed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newCount",
				"type": "uint256"
			}
		],
		"name": "GmSent",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "incrementDeployCount",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "incrementGmCount",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "incrementLinkCount",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "incrementProposalCount",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "incrementVoteCount",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "link",
				"type": "string"
			}
		],
		"name": "LinkAdded",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_username",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_link",
				"type": "string"
			}
		],
		"name": "registerUser",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "totalPoints",
				"type": "uint256"
			}
		],
		"name": "StatsUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "username",
				"type": "string"
			}
		],
		"name": "UserRegistered",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "checkBadgeEligibility",
		"outputs": [
			{
				"internalType": "string[]",
				"name": "",
				"type": "string[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "getUserBadges",
		"outputs": [
			{
				"internalType": "string[]",
				"name": "",
				"type": "string[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "getUserProfile",
		"outputs": [
			{
				"internalType": "string",
				"name": "username",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "link",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "supportCount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "reputation",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "badgeCount",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isActive",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "createdAt",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "getUserStats",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "gmCount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "deployCount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "proposalCount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "voteCount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "linkCount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalPoints",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

// ESKİ KONTARTLARI KALDIRIYORUZ - ARTIK SADECE V3 KULLANACAĞIZ
export const CONTRACT_ADDRESS = V3_CONTRACT_ADDRESS;
export const CONTRACT_ABI = V3_CONTRACT_ABI;

// Diğer kontratları da kaldırıyoruz çünkü V3'te tüm fonksiyonlar var
export const LINK_CONTRACT_ADDRESS = V3_CONTRACT_ADDRESS;
export const LINK_CONTRACT_ABI = V3_CONTRACT_ABI;

export const GM_CONTRACT_ADDRESS = V3_CONTRACT_ADDRESS; 
export const GM_CONTRACT_ABI = V3_CONTRACT_ABI;

export const FACTORY_CONTRACT_ADDRESS = V3_CONTRACT_ADDRESS;
export const FACTORY_CONTRACT_ABI = V3_CONTRACT_ABI;

// Diğer sabitler aynı kalabilir
export const DONATION_ADDRESS = "0x90B265EB08d3ce4D364177FB3Af72B8e890c4238";

// ✅ Celo ağ parametreleri
export const CELO_MAINNET_PARAMS = {
  chainId: "0xA4EC",
  chainName: "Celo Mainnet",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: ["https://forno.celo.org"],
  blockExplorerUrls: ["https://celoscan.io/"]
};

export const CELO_ALFAJORES_PARAMS = {
  chainId: "0xAEF3",
  chainName: "Celo Alfajores Testnet", 
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: ["https://alfajores-forno.celo-testnet.org"],
  blockExplorerUrls: ["https://alfajores.celoscan.io/"]
};

// 🌍 Support Community Links
export const INITIAL_SUPPORT_LINKS = [
  "https://farcaster.xyz/teberen/0x391c5713",
  "https://farcaster.xyz/ertu",
  "https://farcaster.xyz/ratmubaba", 
  "https://x.com/erturulsezar13",
  "https://x.com/egldmvx",
  "https://tebberen.github.io/celo-engage-hub/",
  "https://x.com/meelioodas",
  "https://x.com/luckyfromnecef/status/1972371920290259437",
  "https://github.com/tebberen"
];

// 🟡 Celo Ecosystem bağlantıları
export const CELO_ECOSYSTEM_LINKS = [
  { name: "🌍 Celo Official",       url: "https://celo.org" },
  { name: "📘 Celo Documentation",  url: "https://docs.celo.org" },
  { name: "💻 Developer Portal",    url: "https://developers.celo.org" },
  { name: "🔎 Celo Explorer",       url: "https://celoscan.io" },
  { name: "💬 Celo Forum",          url: "https://forum.celo.org" },
  { name: "🐦 Celo Twitter",        url: "https://x.com/Celo" },
  { name: "💬 Celo Discord",        url: "https://chat.celo.org" },
  { name: "📰 Celo Blog",           url: "https://blog.celo.org" },
  { name: "💻 Celo GitHub",         url: "https://github.com/celo-org" },
  { name: "📺 YouTube Channel",     url: "https://www.youtube.com/@CeloOrg" },
  { name: "📲 Telegram Global",     url: "https://t.me/CeloOrg" }
];
