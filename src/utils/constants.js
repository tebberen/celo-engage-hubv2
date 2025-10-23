// ========================= CELO ENGAGE HUB V4 - CONSTANTS ========================= //

// ✅ YENİ V4 KONTART
export const V4_CONTRACT_ADDRESS = "0x6b7a7b3cb36a8bdcfa283b107285bb50645e8477";
export const V4_CONTRACT_ABI = [
    // ✅ OWNER FONKSİYONU EKLENDİ:
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
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
		"inputs": [
			{
				"internalType": "string",
				"name": "_title",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_description",
				"type": "string"
			}
		],
		"name": "createProposal",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "donateCelo",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_token",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "donateToken",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
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
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_proposalId",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "_support",
				"type": "bool"
			}
		],
		"name": "voteProposal",
		"outputs": [],
		"stateMutability": "nonpayable",
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
	}
];

// ✅ Multi-token desteği - Alfajores Testnet
export const ACCEPTED_TOKENS = {
  CELO: {
    address: "0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9",
    symbol: "CELO",
    decimals: 18
  },
  cUSD: {
    address: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
    symbol: "cUSD",
    decimals: 18
  },
  cEUR: {
    address: "0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F",
    symbol: "cEUR",
    decimals: 18
  }
};

// 🎯 V3'ü V4 ile değiştiriyoruz (geriye uyumluluk için)
export const V3_CONTRACT_ADDRESS = V4_CONTRACT_ADDRESS;
export const V3_CONTRACT_ABI = V4_CONTRACT_ABI;

// Diğer sabitler
export const DONATION_ADDRESS = "0x90B265EB08d3ce4D364177FB3Af72B8e890c4238";

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
  { name: "📰 Celo Blog",          url: "https://blog.celo.org" },
  { name: "💻 Celo GitHub",        url: "https://github.com/celo-org" }
];

console.log("✅ constants.js güncellendi - Owner fonksiyonu eklendi, V4 kontratı aktif!");
