// ========================= CELO ENGAGE HUB V2 - CONSTANTS ========================= //
// 📜 Bu dosya proje genelinde kullanılacak sabitleri içerir.

// ✅ Güncel Celo Smart Contract Adresi
export const CONTRACT_ADDRESS = "0x22eA49c074098931a478F381f971C77486d185b2"; // senin gönderdiğin adres

// ✅ Güncel Contract ABI
export const CONTRACT_ABI = [
  "function registerUser(string memory _username, string memory _link) public",
  "function updateProfile(string memory _username, string memory _link) public",
  "function createProposal(string memory _title, string memory _description, uint256 _duration) public",
  "function voteProposal(uint256 _proposalId, bool _support) public",
  "function awardBadge(address _user, string memory _badge) public",
  "function getUserProfile(address _user) public view returns (string memory link, string memory username, uint256 supportCount, uint256 reputation, uint256 badgeCount, bool isActive, uint256 timestamp)",
  "function getUserBadges(address _user) public view returns (string[] memory)",
  "function getActiveProposals() public view returns (uint256[] memory)",
  "function getProposalDetails(uint256 _proposalId) public view returns (uint256 id, string memory title, string memory description, address creator, uint256 votesFor, uint256 votesAgainst, uint256 deadline, bool executed)",
  "function totalUsers() public view returns (uint256)",
  "function proposalCount() public view returns (uint256)",
  "function getAllUsers() public view returns (address[] memory)",
  "event UserRegistered(address indexed user, string username)",
  "event ProposalCreated(uint256 indexed proposalId, string title, address creator)",
  "event Voted(uint256 indexed proposalId, address indexed voter, bool support)",
  "event BadgeAwarded(address indexed user, string badge)"
];

// ✅ Celo Mainnet Parametreleri
export const CELO_MAINNET_PARAMS = {
  chainId: "0xA4EC", // 42220 (Hex)
  chainName: "Celo Mainnet",
  nativeCurrency: {
    name: "CELO",
    symbol: "CELO",
    decimals: 18
  },
  rpcUrls: ["https://forno.celo.org"],
  blockExplorerUrls: ["https://celoscan.io/"]
};

// ✅ Celo Testnet (Alfajores)
export const CELO_ALFAJORES_PARAMS = {
  chainId: "0xAEF3", // 44787 (Hex)
  chainName: "Celo Alfajores Testnet",
  nativeCurrency: {
    name: "CELO",
    symbol: "CELO",
    decimals: 18
  },
  rpcUrls: ["https://alfajores-forno.celo-testnet.org"],
  blockExplorerUrls: ["https://alfajores.celoscan.io/"]
};

// ✅ Başlangıçta gösterilecek linkler
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
