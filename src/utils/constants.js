// ========================= CELO ENGAGE HUB V2 — CONSTANTS =========================

// On-chain adresler
export const CONTRACT_ADDRESS  = "0x22eA49c074098931a478F381f971C77486d185b2";
export const DONATION_ADDRESS  = "0x90B265EB08d3ce4D364177FB3Af72B8e890c4238";

// Contract ABI (senin verdiğin)
export const CONTRACT_ABI = [
  "function registerUser(string _username, string _link) public",
  "function updateProfile(string _username, string _link) public",
  "function createProposal(string _title, string _description, uint256 _duration) public",
  "function voteProposal(uint256 _proposalId, bool _support) public",
  "function awardBadge(address _user, string _badge) public",
  "function getUserProfile(address _user) public view returns (string link, string username, uint256 supportCount, uint256 reputation, uint256 badgeCount, bool isActive, uint256 timestamp)",
  "function getActiveProposals() public view returns (uint256[] memory)",
  "function getProposalDetails(uint256 _proposalId) public view returns (uint256 id, string title, string description, address creator, uint256 votesFor, uint256 votesAgainst, uint256 deadline, bool executed)",
  "function totalUsers() public view returns (uint256)",
  "function proposalCount() public view returns (uint256)"
];

// Celo ağ parametreleri
export const CELO_MAINNET_PARAMS = {
  chainId: "0xA4EC", chainName: "Celo Mainnet",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: ["https://forno.celo.org"], blockExplorerUrls: ["https://celoscan.io/"]
};
export const CELO_ALFAJORES_PARAMS = {
  chainId: "0xAEF3", chainName: "Celo Alfajores Testnet",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: ["https://alfajores-forno.celo-testnet.org"], blockExplorerUrls: ["https://alfajores.celoscan.io/"]
};

// Destek linkleri (orijinal liste)
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

// Sol panel Celo ekosistemi
export const CELO_ECOSYSTEM_LINKS = [
  { name: "🌍 Celo Official",      url: "https://celo.org" },
  { name: "📘 Celo Documentation", url: "https://docs.celo.org" },
  { name: "💻 Developer Portal",   url: "https://developers.celo.org" },
  { name: "🔎 Celo Explorer",      url: "https://celoscan.io" },
  { name: "💬 Celo Forum",         url: "https://forum.celo.org" },
  { name: "🐦 Celo Twitter",       url: "https://x.com/Celo" },
  { name: "💬 Celo Discord",       url: "https://chat.celo.org" },
  { name: "📰 Celo Blog",          url: "https://blog.celo.org" },
  { name: "💻 Celo GitHub",        url: "https://github.com/celo-org" },
  { name: "📺 YouTube Channel",    url: "https://www.youtube.com/@CeloOrg" },
  { name: "✈️ Telegram Global",    url: "https://t.me/CeloOrg" }
];
