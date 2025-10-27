// src/utils/constants.js

// ========================= CELO ENGAGE HUB - CONSTANTS ========================= //

// Ağ Seçimi: 'mainnet' veya 'sepolia' olarak ayarlayın
// Eğer VITE_DEFAULT_NETWORK tanımlı değilse, 'mainnet' kullan
export const DEFAULT_NETWORK = 'mainnet'; // Varsayılan olarak mainnet kullan

// Ağ Yapılandırmaları
export const NETWORKS = {
  mainnet: {
    name: "Celo Mainnet",
    chainId: "0xa4ec", // 42220
    rpcUrl: "https://forno.celo.org",
    blockExplorer: "https://celoscan.io",
    iconUrls: ["future"]
  },
  sepolia: {
    name: "Celo Sepolia",
    chainId: "0xAA044C", // 11144744
    rpcUrl: "https://forno.celo-sepolia.org",
    blockExplorer: "https://celo-sepolia.blockscout.com",
    iconUrls: ["future"]
  }
};

// Mevcut Ağ Yapılandırması
export const CURRENT_NETWORK = NETWORKS[DEFAULT_NETWORK];

// ✅ YENİ ANA KONTART
export const CONTRACT_ADDRESS = "0x18351438b1bD20ee433Ea7D25589e913f14ca1A5";
export const CONTRACT_ABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "moduleName",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "moduleAddress",
				"type": "address"
			}
		],
		"name": "ModuleConnected",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "PROJECT_OWNER",
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
		"inputs": [],
		"name": "badgeModule",
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
				"name": "moduleName",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "moduleAddress",
				"type": "address"
			}
		],
		"name": "connectModule",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "deployModule",
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
		"inputs": [],
		"name": "donateModule",
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
		"inputs": [],
		"name": "gmModule",
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
		"inputs": [],
		"name": "governanceModule",
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
		"inputs": [],
		"name": "linkModule",
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
		"inputs": [],
		"name": "profileModule",
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
		"inputs": [],
		"name": "registerUser",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "message",
				"type": "string"
			}
		],
		"name": "sendGM",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];

// 🎯 Geriye uyumluluk için V3 ve V4 tanımları
export const V4_CONTRACT_ADDRESS = CONTRACT_ADDRESS;
export const V4_CONTRACT_ABI = CONTRACT_ABI;
export const V3_CONTRACT_ADDRESS = CONTRACT_ADDRESS;
export const V3_CONTRACT_ABI = CONTRACT_ABI;

// Modül Kontrat Adresleri ve ABI'ları
export const MODULES = {
  BADGE: {
    address: "0xd11896d5ba8aa3ed906b37b941a27849e74fd300",
    abi: [
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
					"name": "newTier",
					"type": "uint256"
				}
			],
			"name": "BadgeEarned",
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
					"name": "newLevel",
					"type": "uint256"
				}
			],
			"name": "LevelUp",
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
					"name": "xpAmount",
					"type": "uint256"
				}
			],
			"name": "XPAdded",
			"type": "event"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "user",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "xpAmount",
					"type": "uint256"
				}
			],
			"name": "addXP",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "xp",
					"type": "uint256"
				}
			],
			"name": "calculateLevel",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "pure",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "level",
					"type": "uint256"
				},
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
					"name": "donateCount",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "linkCount",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "voteCount",
					"type": "uint256"
				}
			],
			"name": "calculateTier",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "pure",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "getBadgeStats",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "totalBadgesCount",
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
					"name": "user",
					"type": "address"
				}
			],
			"name": "getNextTierRequirements",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "currentTier",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "nextTier",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "levelRequired",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "gmRequired",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "deployRequired",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "donateRequired",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "linkRequired",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "voteRequired",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "tier",
					"type": "uint256"
				}
			],
			"name": "getRequirementsForTier",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "levelRequired",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "gmRequired",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "deployRequired",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "donateRequired",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "linkRequired",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "voteRequired",
					"type": "uint256"
				}
			],
			"stateMutability": "pure",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "user",
					"type": "address"
				}
			],
			"name": "getUserBadge",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "totalXP",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "level",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "tier",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "lastUpdate",
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
					"name": "user",
					"type": "address"
				}
			],
			"name": "getUserLevel",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
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
					"name": "user",
					"type": "address"
				}
			],
			"name": "getUserTier",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
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
					"name": "user",
					"type": "address"
				}
			],
			"name": "getUserXP",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "level",
					"type": "uint256"
				}
			],
			"name": "getXPForLevel",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "pure",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "user",
					"type": "address"
				}
			],
			"name": "registerUser",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "totalBadges",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
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
					"name": "user",
					"type": "address"
				},
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
					"name": "donateCount",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "linkCount",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "voteCount",
					"type": "uint256"
				}
			],
			"name": "updateTier",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"name": "userBadges",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "totalXP",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "level",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "tier",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "lastUpdate",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		}
	]
  },
  DEPLOY: {
    address: "0xD567149Cf3a2bd97d905408c87Cc8194eb246785",
    abi: [
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
					"internalType": "address",
					"name": "contractAddress",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "string",
					"name": "contractName",
					"type": "string"
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
			"name": "DeployCountUpdated",
			"type": "event"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"name": "allDeployedContracts",
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
					"name": "",
					"type": "string"
				}
			],
			"name": "contractNameExists",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "user",
					"type": "address"
				},
				{
					"internalType": "string",
					"name": "contractName",
					"type": "string"
				}
			],
			"name": "deployContract",
			"outputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "getAllDeployedContracts",
			"outputs": [
				{
					"internalType": "address[]",
					"name": "",
					"type": "address[]"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "getDeployStats",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "total",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "userDeploys",
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
					"name": "user",
					"type": "address"
				}
			],
			"name": "getUserDeployCount",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
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
					"name": "user",
					"type": "address"
				}
			],
			"name": "getUserDeployedContracts",
			"outputs": [
				{
					"internalType": "address[]",
					"name": "",
					"type": "address[]"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "totalDeploy",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
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
					"name": "",
					"type": "address"
				}
			],
			"name": "userDeployCount",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
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
					"name": "",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"name": "userDeployedContracts",
			"outputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"stateMutability": "view",
			"type": "function"
		}
	]
  },
  DONATE: {
    address: "0x76CA7FCBCdB46881c2715EBf351BCc1aAC7d70FA",
    abi: [
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "_cUSDToken",
					"type": "address"
				}
			],
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
					"internalType": "uint256",
					"name": "newCount",
					"type": "uint256"
				}
			],
			"name": "DonateCountUpdated",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "donor",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "amount",
					"type": "uint256"
				},
				{
					"indexed": false,
					"internalType": "address",
					"name": "token",
					"type": "address"
				}
			],
			"name": "DonationMade",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "owner",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "amount",
					"type": "uint256"
				}
			],
			"name": "Withdrawn",
			"type": "event"
		},
		{
			"inputs": [],
			"name": "DAILY_WITHDRAW_LIMIT",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "MIN_DONATION",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "cUSDToken",
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
					"internalType": "address",
					"name": "user",
					"type": "address"
				}
			],
			"name": "donateCELO",
			"outputs": [],
			"stateMutability": "payable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "user",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "amount",
					"type": "uint256"
				}
			],
			"name": "donateCUSD",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"name": "donors",
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
			"inputs": [],
			"name": "getDonateStats",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "totalDonatedValue",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "totalDonatorsCount",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "dailyWithdrawn",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "dailyLimit",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "getTopDonors",
			"outputs": [
				{
					"internalType": "address[]",
					"name": "",
					"type": "address[]"
				},
				{
					"internalType": "uint256[]",
					"name": "",
					"type": "uint256[]"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "user",
					"type": "address"
				}
			],
			"name": "getUserDonateCount",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
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
					"name": "user",
					"type": "address"
				}
			],
			"name": "getUserDonationHistory",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "count",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "totalAmount",
					"type": "uint256"
				},
				{
					"internalType": "bool",
					"name": "hasDonatedBefore",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "user",
					"type": "address"
				}
			],
			"name": "getUserTotalDonated",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
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
					"name": "",
					"type": "address"
				}
			],
			"name": "hasDonated",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"name": "isDonor",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "lastWithdrawTime",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "totalDonated",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "totalDonators",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "totalWithdrawnToday",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
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
					"name": "",
					"type": "address"
				}
			],
			"name": "userDonateCount",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
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
					"name": "",
					"type": "address"
				}
			],
			"name": "userTotalDonated",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
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
					"name": "owner",
					"type": "address"
				}
			],
			"name": "withdraw",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		}
	]
  },
  GM: {
    address: "0x06E065AE4dDa7b669D6381D1F7ec523bfD83e2D7",
    abi: [
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
			"name": "GMCountUpdated",
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
					"name": "message",
					"type": "string"
				}
			],
			"name": "GMSent",
			"type": "event"
		},
		{
			"inputs": [],
			"name": "getGMStats",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "total",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "userCount",
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
					"name": "user",
					"type": "address"
				}
			],
			"name": "getUserGMCount",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
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
					"name": "user",
					"type": "address"
				}
			],
			"name": "getUserGMMessages",
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
					"name": "user",
					"type": "address"
				},
				{
					"internalType": "string",
					"name": "message",
					"type": "string"
				}
			],
			"name": "sendGM",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "totalGM",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
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
					"name": "",
					"type": "address"
				}
			],
			"name": "userGMCount",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
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
					"name": "",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"name": "userGMMessages",
			"outputs": [
				{
					"internalType": "string",
					"name": "",
					"type": "string"
				}
			],
			"stateMutability": "view",
			"type": "function"
		}
	]
  },
  GOVERNANCE: {
    address: "0xe71c701d66f8c27fba15f3b4a607c741ffedeed1",
    abi: [
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "initialOwner",
					"type": "address"
				}
			],
			"stateMutability": "nonpayable",
			"type": "constructor"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "owner",
					"type": "address"
				}
			],
			"name": "OwnableInvalidOwner",
			"type": "error"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "account",
					"type": "address"
				}
			],
			"name": "OwnableUnauthorizedAccount",
			"type": "error"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "previousOwner",
					"type": "address"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "newOwner",
					"type": "address"
				}
			],
			"name": "OwnershipTransferred",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "uint256",
					"name": "proposalId",
					"type": "uint256"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "creator",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "string",
					"name": "title",
					"type": "string"
				}
			],
			"name": "ProposalCreated",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "uint256",
					"name": "proposalId",
					"type": "uint256"
				}
			],
			"name": "ProposalExecuted",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "uint256",
					"name": "proposalId",
					"type": "uint256"
				},
				{
					"indexed": true,
					"internalType": "address",
					"name": "voter",
					"type": "address"
				},
				{
					"indexed": false,
					"internalType": "bool",
					"name": "support",
					"type": "bool"
				}
			],
			"name": "Voted",
			"type": "event"
		},
		{
			"inputs": [],
			"name": "VOTE_DURATION",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
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
					"name": "creator",
					"type": "address"
				},
				{
					"internalType": "string",
					"name": "title",
					"type": "string"
				},
				{
					"internalType": "string",
					"name": "description",
					"type": "string"
				},
				{
					"internalType": "string",
					"name": "link",
					"type": "string"
				}
			],
			"name": "createProposal",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "proposalId",
					"type": "uint256"
				}
			],
			"name": "executeProposal",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "getActiveProposals",
			"outputs": [
				{
					"internalType": "uint256[]",
					"name": "",
					"type": "uint256[]"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "getCompletedProposals",
			"outputs": [
				{
					"internalType": "uint256[]",
					"name": "",
					"type": "uint256[]"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "getGovernanceStats",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "totalProposals",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "totalVotesCount",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "proposalId",
					"type": "uint256"
				}
			],
			"name": "getProposal",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "id",
					"type": "uint256"
				},
				{
					"internalType": "address",
					"name": "creator",
					"type": "address"
				},
				{
					"internalType": "string",
					"name": "title",
					"type": "string"
				},
				{
					"internalType": "string",
					"name": "description",
					"type": "string"
				},
				{
					"internalType": "string",
					"name": "link",
					"type": "string"
				},
				{
					"internalType": "uint256",
					"name": "startTime",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "endTime",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "forVotes",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "againstVotes",
					"type": "uint256"
				},
				{
					"internalType": "bool",
					"name": "executed",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "proposalId",
					"type": "uint256"
				}
			],
			"name": "getProposalResults",
			"outputs": [
				{
					"internalType": "bool",
					"name": "approved",
					"type": "bool"
				},
				{
					"internalType": "uint256",
					"name": "forVotes",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "againstVotes",
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
					"name": "user",
					"type": "address"
				}
			],
			"name": "getUserVoteCount",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "proposalId",
					"type": "uint256"
				},
				{
					"internalType": "address",
					"name": "user",
					"type": "address"
				}
			],
			"name": "hasUserVoted",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
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
			"inputs": [],
			"name": "proposalCount",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				},
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"name": "proposalVoters",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"name": "proposals",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "id",
					"type": "uint256"
				},
				{
					"internalType": "address",
					"name": "creator",
					"type": "address"
				},
				{
					"internalType": "string",
					"name": "title",
					"type": "string"
				},
				{
					"internalType": "string",
					"name": "description",
					"type": "string"
				},
				{
					"internalType": "string",
					"name": "link",
					"type": "string"
				},
				{
					"internalType": "uint256",
					"name": "startTime",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "endTime",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "forVotes",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "againstVotes",
					"type": "uint256"
				},
				{
					"internalType": "bool",
					"name": "executed",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "renounceOwnership",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "newOwner",
					"type": "address"
				}
			],
			"name": "transferOwnership",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "totalVotes",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
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
					"name": "",
					"type": "address"
				}
			],
			"name": "userVoteCount",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
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
					"name": "user",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "proposalId",
					"type": "uint256"
				},
				{
					"internalType": "bool",
					"name": "support",
					"type": "bool"
				}
			],
			"name": "vote",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		}
	]
  },
  LINK: {
    address: "0x5ae32ab13f0458f4fb7a434120747e7e5944ce97",
    abi: [
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
			"name": "LinkCountUpdated",
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
					"name": "link",
					"type": "string"
				}
			],
			"name": "LinkShared",
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
					"name": "tryCount",
					"type": "uint256"
				}
			],
			"name": "SpamProtectionTriggered",
			"type": "event"
		},
		{
			"inputs": [],
			"name": "LINKS_PER_HOUR_LIMIT",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "ONE_HOUR",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
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
					"name": "user",
					"type": "address"
				}
			],
			"name": "canUserShareLink",
			"outputs": [
				{
					"internalType": "bool",
					"name": "canShare",
					"type": "bool"
				},
				{
					"internalType": "uint256",
					"name": "recentCount",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "limit",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "getLinkStats",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "total",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "hourlyLimit",
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
					"name": "user",
					"type": "address"
				}
			],
			"name": "getUserLinkCount",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
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
					"name": "user",
					"type": "address"
				}
			],
			"name": "getUserRecentLinkCount",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
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
					"name": "user",
					"type": "address"
				}
			],
			"name": "getUserSharedLinks",
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
					"name": "",
					"type": "address"
				}
			],
			"name": "lastLinkTime",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
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
					"name": "user",
					"type": "address"
				},
				{
					"internalType": "string",
					"name": "link",
					"type": "string"
				}
			],
			"name": "shareLink",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "totalLinks",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
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
					"name": "",
					"type": "address"
				}
			],
			"name": "userLinkCount",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
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
					"name": "",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"name": "userLinkTimestamps",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
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
					"name": "",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"name": "userSharedLinks",
			"outputs": [
				{
					"internalType": "string",
					"name": "",
					"type": "string"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "string",
					"name": "link",
					"type": "string"
				}
			],
			"name": "validateLink",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "pure",
			"type": "function"
		}
	]
  },
  // ✅ YENİ GÜNCELLENMİŞ PROFILE MODULE - USERNAME DESTEKLİ
  PROFILE: {
    address: "0xb7574975e18b64d18886D03CCC710d62cdD7E743",
    abi: [
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
					"internalType": "address",
					"name": "contractAddress",
					"type": "address"
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
					"internalType": "string",
					"name": "link",
					"type": "string"
				}
			],
			"name": "LinkAdded",
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
					"name": "newLevel",
					"type": "uint256"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "newTier",
					"type": "uint256"
				}
			],
			"name": "ProfileUpdated",
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
				}
			],
			"name": "UserRegistered",
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
					"name": "newUsername",
					"type": "string"
				}
			],
			"name": "UsernameUpdated",
			"type": "event"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "user",
					"type": "address"
				},
				{
					"internalType": "address",
					"name": "contractAddress",
					"type": "address"
				}
			],
			"name": "addUserContract",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "user",
					"type": "address"
				},
				{
					"internalType": "string",
					"name": "link",
					"type": "string"
				}
			],
			"name": "addUserLink",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "xp",
					"type": "uint256"
				}
			],
			"name": "calculateLevel",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "pure",
			"type": "function"
		},
		{
			"inputs": [
				{
					"components": [
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
							"name": "donateCount",
							"type": "uint256"
						},
						{
							"internalType": "uint256",
							"name": "linkCount",
							"type": "uint256"
						},
						{
							"internalType": "uint256",
							"name": "voteCount",
							"type": "uint256"
						},
						{
							"internalType": "uint256",
							"name": "totalXP",
							"type": "uint256"
						},
						{
							"internalType": "uint256",
							"name": "level",
							"type": "uint256"
						},
						{
							"internalType": "uint256",
							"name": "tier",
							"type": "uint256"
						},
						{
							"internalType": "uint256",
							"name": "totalDonated",
							"type": "uint256"
						},
						{
							"internalType": "string",
							"name": "username",
							"type": "string"
						},
						{
							"internalType": "bool",
							"name": "exists",
							"type": "bool"
						}
					],
					"internalType": "struct ProfileModule.UserProfile",
					"name": "profile",
					"type": "tuple"
				}
			],
			"name": "calculateTier",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "pure",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "getGlobalStats",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "visitors",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "gm",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "deploy",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "links",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "votes",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "badges",
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
					"name": "user",
					"type": "address"
				}
			],
			"name": "getUserContracts",
			"outputs": [
				{
					"internalType": "address[]",
					"name": "",
					"type": "address[]"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "user",
					"type": "address"
				}
			],
			"name": "getUserLinks",
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
					"name": "user",
					"type": "address"
				}
			],
			"name": "getUserProfile",
			"outputs": [
				{
					"components": [
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
							"name": "donateCount",
							"type": "uint256"
						},
						{
							"internalType": "uint256",
							"name": "linkCount",
							"type": "uint256"
						},
						{
							"internalType": "uint256",
							"name": "voteCount",
							"type": "uint256"
						},
						{
							"internalType": "uint256",
							"name": "totalXP",
							"type": "uint256"
						},
						{
							"internalType": "uint256",
							"name": "level",
							"type": "uint256"
						},
						{
							"internalType": "uint256",
							"name": "tier",
							"type": "uint256"
						},
						{
							"internalType": "uint256",
							"name": "totalDonated",
							"type": "uint256"
						},
						{
							"internalType": "string",
							"name": "username",
							"type": "string"
						},
						{
							"internalType": "bool",
							"name": "exists",
							"type": "bool"
						}
					],
					"internalType": "struct ProfileModule.UserProfile",
					"name": "",
					"type": "tuple"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "user",
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
					"name": "donateCount",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "linkCount",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "voteCount",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "totalXP",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "level",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "tier",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "totalDonated",
					"type": "uint256"
				},
				{
					"internalType": "string",
					"name": "username",
					"type": "string"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "user",
					"type": "address"
				}
			],
			"name": "incrementDeployCount",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "user",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "amount",
					"type": "uint256"
				}
			],
			"name": "incrementDonateCount",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "user",
					"type": "address"
				}
			],
			"name": "incrementGMCount",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "user",
					"type": "address"
				}
			],
			"name": "incrementLinkCount",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "user",
					"type": "address"
				}
			],
			"name": "incrementVoteCount",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "user",
					"type": "address"
				}
			],
			"name": "registerUser",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "totalBadges",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "totalDeploy",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "totalGM",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "totalLinks",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "totalVisitors",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "totalVotes",
			"outputs": [
				{
					"internalType": "uint256",
					"name": "",
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
					"name": "user",
					"type": "address"
				}
			],
			"name": "updateLevel",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "user",
					"type": "address"
				}
			],
			"name": "updateTier",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "string",
					"name": "_newUsername",
					"type": "string"
				}
			],
			"name": "updateUsername",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"name": "userDeployedContracts",
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
					"internalType": "address",
					"name": "user",
					"type": "address"
				}
			],
			"name": "userExists",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "",
					"type": "uint256"
				}
			],
			"name": "userLinks",
			"outputs": [
				{
					"internalType": "string",
					"name": "",
					"type": "string"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "string",
					"name": "",
					"type": "string"
				}
			],
			"name": "usernameTaken",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"name": "users",
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
					"name": "donateCount",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "linkCount",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "voteCount",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "totalXP",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "level",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "tier",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "totalDonated",
					"type": "uint256"
				},
				{
					"internalType": "string",
					"name": "username",
					"type": "string"
				},
				{
					"internalType": "bool",
					"name": "exists",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		}
	]
  }
};

// Cüzdan Bağlantı Parametreleri 
export const CELO_PARAMS = {
  chainId: CURRENT_NETWORK.chainId,
  chainName: CURRENT_NETWORK.name,
  nativeCurrency: {
    name: "Celo",
    symbol: "CELO",
    decimals: 18,
  },
  rpcUrls: [CURRENT_NETWORK.rpcUrl],
  blockExplorerUrls: [CURRENT_NETWORK.blockExplorer],
  iconUrls: CURRENT_NETWORK.iconUrls,
};

// ✅ Multi-token desteği - Ağa göre token adresleri
export const ACCEPTED_TOKENS = {
  mainnet: {
    CELO: {
      address: null, // Native token - address yok
      symbol: "CELO",
      decimals: 18
    },
    cUSD: {
      address: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
      symbol: "cUSD",
      decimals: 18
    },
    cEUR: {
      address: "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73",
      symbol: "cEUR",
      decimals: 18
    }
  },
  sepolia: {
    CELO: {
      address: null,
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
  }
};

// Mevcut ağ için token listesi
export const CURRENT_TOKENS = ACCEPTED_TOKENS[DEFAULT_NETWORK];

// cUSD Token Adresi (geriye uyumluluk için)
export const CUSD_TOKEN_ADDRESS = {
  mainnet: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
  sepolia: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"
};

// Diğer sabitler
export const DONATION_ADDRESS = "0x90B265EB08d3ce4D364177FB3Af72B8e890c4238";

// Owner Adresi
export const OWNER_ADDRESS = "0x09dFa0d77125978997dD9f94A0F870D3f2900DA5";

// Varsayılan GM Mesajı
export const DEFAULT_GM_MESSAGE = "Hello from Celo Engage Hub!";

// Minimum Bağış Miktarı (wei cinsinden)
export const MIN_DONATION = "100000000000000000"; // 0.1 CELO/cUSD

// Zincir ID Kontrolü
export const SUPPORTED_CHAIN_IDS = {
  MAINNET: "0xa4ec",
  SEPOLIA: "0xAA044C"
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
  { name: "📰 Celo Blog",          url: "https://blog.celo.org" },
  { name: "💻 Celo GitHub",        url: "https://github.com/celo-org" }
];

console.log("✅ constants.js GÜNCELLENDİ - Yeni ProfileModule aktif! Username desteği hazır!");
