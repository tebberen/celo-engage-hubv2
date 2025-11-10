import { ethers } from "../utils/cdn-modules.js";
import {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  MODULES,
  MODULE_ADDRESS_BOOK,
  DEFAULT_NETWORK,
  CURRENT_NETWORK,
  OWNER_ADDRESS,
  UI_MESSAGES,
  MIN_DONATION,
  THE_GRAPH_ENDPOINT,
  DUNE_DASHBOARD_URL,
  MODULE_VERSIONS,
  NETWORK_KEYS,
  NETWORKS,
  CUSD_TOKEN_ADDRESS,
  CEUR_TOKEN_ADDRESS,
} from "../utils/constants.js";
import { getWalletDetails } from "./walletService.js";

const readProvider = new ethers.providers.JsonRpcProvider(CURRENT_NETWORK.rpcUrl);
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
];

const DONATE_TOKEN_ABI = ["function donateToken(address token, address user, uint256 amount)"];

let toastHandler = () => {};

export function registerToastHandler(callback) {
  toastHandler = callback;
}

function emitToast(type, message, txHash) {
  if (typeof toastHandler === "function") {
    toastHandler({ type, message, hash: txHash, explorer: txHash ? `${CURRENT_NETWORK.explorer}/tx/${txHash}` : null });
  }
}

function getActiveNetworkKey() {
  return DEFAULT_NETWORK;
}

function resolveModuleAddress(key) {
  const networkKey = getActiveNetworkKey();
  const book = MODULE_ADDRESS_BOOK[networkKey] || {};
  return book[key] || MODULES[key]?.address || null;
}

function getTokenAddressBySymbol(symbol) {
  const networkKey = getActiveNetworkKey();
  const map = {
    cUSD: CUSD_TOKEN_ADDRESS[networkKey],
    cEUR: CEUR_TOKEN_ADDRESS[networkKey],
  };
  const address = map[symbol];
  if (!address) {
    throw new Error(`${symbol} adresi bulunamadı`);
  }
  return address;
}

function requireSigner() {
  const details = getWalletDetails();
  if (!details?.signer || !details?.address) {
    throw new Error(UI_MESSAGES.walletNotConnected);
  }
  return details;
}

function withSigner(contract) {
  const { signer } = requireSigner();
  return contract.connect(signer);
}

function createContract(address, abi, withWrite = false) {
  if (!address) {
    throw new Error("Kontrat adresi bulunamadı.");
  }
  const base = new ethers.Contract(address, abi, readProvider);
  return withWrite ? withSigner(base) : base;
}

export function getHub(withWrite = false) {
  const address = resolveModuleAddress("HUB") || CONTRACT_ADDRESS;
  return createContract(address, CONTRACT_ABI, withWrite);
}

export function getGM(withWrite = false) {
  return createContract(resolveModuleAddress("GM"), MODULES.GM.abi, withWrite);
}

export function getDeploy(withWrite = false) {
  return createContract(resolveModuleAddress("DEPLOY"), MODULES.DEPLOY.abi, withWrite);
}

export function getDonate(withWrite = false) {
  return createContract(resolveModuleAddress("DONATE"), MODULES.DONATE.abi, withWrite);
}

export function getLink(withWrite = false) {
  return createContract(resolveModuleAddress("LINK"), MODULES.LINK.abi, withWrite);
}

export function getGov(withWrite = false) {
  return createContract(resolveModuleAddress("GOVERNANCE"), MODULES.GOVERNANCE.abi, withWrite);
}

export function getProfile(withWrite = false) {
  return createContract(resolveModuleAddress("PROFILE"), MODULES.PROFILE.abi, withWrite);
}

export function getBadge(withWrite = false) {
  return createContract(resolveModuleAddress("BADGE"), MODULES.BADGE.abi, withWrite);
}

export function getBadgeVersions() {
  return MODULE_VERSIONS;
}

export function getAnalyticsConfig() {
  return {
    graph: THE_GRAPH_ENDPOINT,
    dune: DUNE_DASHBOARD_URL,
  };
}

function ensureMinDonation(amount) {
  if (Number(amount) < MIN_DONATION) {
    throw new Error(UI_MESSAGES.minDonation);
  }
}

function parseAmount(amount) {
  return ethers.utils.parseUnits(amount.toString(), 18);
}

export async function doGM(message = "") {
  const { address } = requireSigner();
  const gm = getGM(true);
  const tx = await gm.sendGM(address, message || "");
  emitToast("pending", "GM gönderiliyor...", tx.hash);
  const receipt = await tx.wait();
  emitToast("success", UI_MESSAGES.success, tx.hash);
  return receipt;
}

export async function doDeploy(contractName) {
  const { address } = requireSigner();
  const deployName = contractName?.trim() || `AutoName-${Date.now()}`;
  const deployModule = getDeploy(true);
  const tx = await deployModule.deployContract(address, deployName);
  emitToast("pending", "Kontrat dağıtılıyor...", tx.hash);
  const receipt = await tx.wait();
  emitToast("success", UI_MESSAGES.success, tx.hash);
  return receipt;
}

export async function doDonateCELO(amount) {
  ensureMinDonation(amount);
  const { address } = requireSigner();
  const donate = getDonate(true);
  const value = ethers.utils.parseEther(amount.toString());
  const tx = await donate.donateCELO(address, { value });
  emitToast("pending", "CELO bağışı gönderiliyor...", tx.hash);
  const receipt = await tx.wait();
  emitToast("success", UI_MESSAGES.success, tx.hash);
  return receipt;
}

async function approveToken(symbol, amount) {
  ensureMinDonation(amount);
  const { signer } = requireSigner();
  const spender = resolveModuleAddress("DONATE");
  const tokenAddress = getTokenAddressBySymbol(symbol);
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
  const value = parseAmount(amount);
  const tx = await token.approve(spender, value);
  emitToast("pending", `${symbol} onayı bekleniyor...`, tx.hash);
  const receipt = await tx.wait();
  emitToast("success", UI_MESSAGES.success, tx.hash);
  return receipt;
}

async function donateToken(symbol, amount) {
  ensureMinDonation(amount);
  const { address, signer } = requireSigner();
  const donateAddress = resolveModuleAddress("DONATE");
  const tokenAddress = getTokenAddressBySymbol(symbol);
  const value = parseAmount(amount);
  const donateInterface = new ethers.Contract(donateAddress, DONATE_TOKEN_ABI, signer);

  try {
    await donateInterface.callStatic.donateToken(tokenAddress, address, value);
  } catch (staticError) {
    const missingMethod = !staticError?.data || staticError?.data === "0x";
    if (symbol === "cUSD" && missingMethod) {
      const donate = getDonate(true);
      const legacyTx = await donate.donateCUSD(address, value);
      emitToast("pending", "cUSD bağışı gönderiliyor...", legacyTx.hash);
      const legacyReceipt = await legacyTx.wait();
      emitToast("success", UI_MESSAGES.success, legacyTx.hash);
      return legacyReceipt;
    }
    throw staticError;
  }

  const tx = await donateInterface.donateToken(tokenAddress, address, value);
  emitToast("pending", `${symbol} bağışı gönderiliyor...`, tx.hash);
  const receipt = await tx.wait();
  emitToast("success", UI_MESSAGES.success, tx.hash);
  return receipt;
}

export async function doApproveCUSD(amount) {
  return approveToken("cUSD", amount);
}

export async function doDonateCUSD(amount) {
  return donateToken("cUSD", amount);
}

export async function doApproveCEUR(amount) {
  return approveToken("cEUR", amount);
}

export async function doDonateCEUR(amount) {
  return donateToken("cEUR", amount);
}

export async function withdrawDonations(token, amount) {
  const { address } = requireSigner();
  if (address.toLowerCase() !== OWNER_ADDRESS.toLowerCase()) {
    throw new Error(UI_MESSAGES.ownerOnly);
  }
  const donate = getDonate(true);
  const tx = await donate.withdraw(address);
  emitToast("pending", `Çekim işlemi başlatıldı (${token} ${amount || ""})`, tx.hash);
  const receipt = await tx.wait();
  emitToast("success", UI_MESSAGES.success, tx.hash);
  return receipt;
}

export async function doShareLink(url) {
  const { address } = requireSigner();
  const linkModule = getLink(true);
  const tx = await linkModule.shareLink(address, url);
  emitToast("pending", "Link paylaşımı gönderildi...", tx.hash);
  const receipt = await tx.wait();
  emitToast("success", "Link successfully shared!", tx.hash);
  return receipt;
}

export async function govCreateProposal(title, description, link) {
  const { address } = requireSigner();
  if (address.toLowerCase() !== OWNER_ADDRESS.toLowerCase()) {
    throw new Error(UI_MESSAGES.ownerOnly);
  }
  const gov = getGov(true);
  const tx = await gov.createProposal(title, description, link || "");
  emitToast("pending", "Öneri oluşturuluyor...", tx.hash);
  const receipt = await tx.wait();
  emitToast("success", UI_MESSAGES.success, tx.hash);
  return receipt;
}

export async function govVote(proposalId, support) {
  const { address } = requireSigner();
  const gov = getGov(true);
  const tx = await gov.vote(address, proposalId, support);
  emitToast("pending", "Oy gönderiliyor...", tx.hash);
  const receipt = await tx.wait();
  emitToast("success", UI_MESSAGES.success, tx.hash);
  return receipt;
}

export async function registerProfile(username) {
  const { address } = requireSigner();
  const profile = getProfile(true);
  const tx = await profile.registerUser(address);
  emitToast("pending", "Profil kaydediliyor...", tx.hash);
  const receipt = await tx.wait();
  if (username) {
    try {
      const updateTx = await profile.updateUsername(username);
      emitToast("pending", "Kullanıcı adı güncelleniyor...", updateTx.hash);
      await updateTx.wait();
    } catch (error) {
      console.warn("Username update failed", error);
    }
  }
  emitToast("success", UI_MESSAGES.success, tx.hash);
  return receipt;
}

function mapProfile(result, address) {
  if (!result) return null;
  const [gmCount, deployCount, donateCount, linkCount, voteCount, totalXP, level, tier, totalDonated, username, exists] = result;
  return {
    address,
    exists,
    username,
    gmCount: Number(gmCount || 0),
    deployCount: Number(deployCount || 0),
    donateCount: Number(donateCount || 0),
    linkCount: Number(linkCount || 0),
    voteCount: Number(voteCount || 0),
    totalXP: Number(totalXP || 0),
    level: Number(level || 0),
    tier: Number(tier || 0),
    badgeCount: Number(tier || 0),
    totalDonated: totalDonated ? Number(ethers.utils.formatEther(totalDonated)) : 0,
  };
}

export async function loadProfile(address) {
  const target = address || getWalletDetails().address;
  if (!target) return null;
  const profile = getProfile();
  const data = await profile.getUserProfile(target);
  return mapProfile(data, target);
}

export async function loadUserDeployments(address) {
  const target = address || getWalletDetails().address;
  if (!target) return [];
  const deploy = getDeploy();
  return deploy.getUserDeployedContracts(target).catch(() => []);
}

export async function loadRecentLinks(limit = 20) {
  const linkContract = getLink();
  const currentBlock = await readProvider.getBlockNumber();
  const fromBlock = Math.max(currentBlock - 15000, 0);
  const events = await linkContract.queryFilter(linkContract.filters.LinkShared(), fromBlock, "latest");
  const sorted = events
    .map((event) => ({
      user: event.args?.user,
      link: event.args?.link,
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
    }))
    .sort((a, b) => b.blockNumber - a.blockNumber)
    .slice(0, limit);
  return sorted;
}

export async function loadGlobalStats() {
  const hub = getHub();
  const donate = getDonate();
  const badge = getBadge();
  const gov = getGov();

  const [global, donationStats, totalDonated, totalDonors, badgeStats, governanceStats] = await Promise.all([
    hub.getGlobalStats(),
    donate.getDonateStats().catch(() => [ethers.constants.Zero, ethers.constants.Zero, ethers.constants.Zero, ethers.constants.Zero]),
    donate.totalDonated().catch(() => ethers.constants.Zero),
    donate.totalDonators().catch(() => ethers.constants.Zero),
    badge.getBadgeStats().catch(() => [ethers.constants.Zero]),
    gov.getGovernanceStats().catch(() => [ethers.constants.Zero, ethers.constants.Zero]),
  ]);

  const [visitors, gm, deploy, links, votes, badges] = global;
  const [totalDonatedValue, totalDonatorsCount, totalCeloDonated, totalCusdDonated] = donationStats;
  const [totalProposals, totalVotes] = governanceStats;

  return {
    visitors: Number(visitors || 0),
    gm: Number(gm || 0),
    deploy: Number(deploy || 0),
    links: Number(links || 0),
    votes: Number(votes || 0),
    badges: Number(badges || 0),
    donors: Number(totalDonors || totalDonatorsCount || 0),
    totalCelo: Number(ethers.utils.formatEther(totalCeloDonated || totalDonated || 0)),
    totalCusd: Number(ethers.utils.formatEther(totalCusdDonated || 0)),
    totalProposals: Number(totalProposals || 0),
    totalVotesOnChain: Number(totalVotes || 0),
  };
}

export async function loadGovernance() {
  const gov = getGov();
  const activeIds = await gov.getActiveProposals();
  const completedIds = await gov.getCompletedProposals();

  const fetchProposal = async (id) => {
    const data = await gov.getProposal(id);
    const [title, description, link, creator, startTime, endTime, yesVotes, noVotes, executed] = data;
    return {
      id: Number(id),
      title,
      description,
      link,
      creator,
      startTime: Number(startTime || 0),
      endTime: Number(endTime || 0),
      yesVotes: Number(yesVotes || 0),
      noVotes: Number(noVotes || 0),
      executed,
    };
  };

  const active = await Promise.all(activeIds.map(fetchProposal));
  const completed = await Promise.all(completedIds.map(fetchProposal));
  return { active, completed };
}

export async function loadLeaderboard() {
  const donate = getDonate();
  const gm = getGM();
  const deploy = getDeploy();
  const link = getLink();
  const gov = getGov();
  const profile = getProfile();

  const [topDonorsRaw, recentLinks] = await Promise.all([
    donate.getTopDonors().catch(() => [[], []]),
    loadRecentLinks(40).catch(() => []),
  ]);

  const donors = (topDonorsRaw[0] || []).map((addr, index) => ({
    address: addr,
    value: Number(ethers.utils.formatEther(topDonorsRaw[1]?.[index] || 0)),
  }));

  const candidateSet = new Set(donors.map((item) => item.address));
  recentLinks.forEach((item) => candidateSet.add(item.user));

  const candidates = Array.from(candidateSet).slice(0, 25);

  const stats = await Promise.all(
    candidates.map(async (addr) => {
      const [profileData, gmCount, deployCount, linkCount, voteCount, donationHistory] = await Promise.all([
        profile.getUserProfile(addr).catch(() => null),
        gm.getUserGMCount(addr).catch(() => ethers.constants.Zero),
        deploy.getUserDeployCount(addr).catch(() => ethers.constants.Zero),
        link.userLinkCount(addr).catch(() => ethers.constants.Zero),
        gov.userVoteCount(addr).catch(() => ethers.constants.Zero),
        donate.getUserDonationHistory(addr).catch(() => [ethers.constants.Zero, ethers.constants.Zero, false]),
      ]);

      const mappedProfile = profileData ? mapProfile(profileData, addr) : null;
      const [, totalDonationAmount] = donationHistory;

      return {
        address: addr,
        gm: Number(gmCount || 0),
        deploy: Number(deployCount || 0),
        links: Number(linkCount || 0),
        votes: Number(voteCount || 0),
        level: mappedProfile?.level || 0,
        tier: mappedProfile?.tier || 0,
        badges: mappedProfile?.badgeCount || mappedProfile?.tier || 0,
        xp: mappedProfile?.totalXP || 0,
        cusd: Number(ethers.utils.formatEther(totalDonationAmount || 0)),
        profile: mappedProfile,
      };
    })
  );

  const sortDesc = (list, key) =>
    [...list]
      .sort((a, b) => (b[key] || 0) - (a[key] || 0))
      .filter((item) => item[key] > 0)
      .slice(0, 10)
      .map((item) => ({ address: item.address, value: item[key], tier: item.tier, level: item.level, xp: item.xp }));

  return {
    donors: donors.sort((a, b) => (b.value || 0) - (a.value || 0)).slice(0, 10),
    gm: sortDesc(stats, "gm"),
    deploy: sortDesc(stats, "deploy"),
    links: sortDesc(stats, "links"),
    votes: sortDesc(stats, "votes"),
    badges: sortDesc(stats, "level"),
    cusdDonors: sortDesc(stats, "cusd"),
  };
}

export async function fetchGraph(query, variables = {}) {
  if (!THE_GRAPH_ENDPOINT || THE_GRAPH_ENDPOINT.includes("YOUR_SUBGRAPH_ID")) {
    return null;
  }

  const response = await fetch(THE_GRAPH_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error("The Graph isteği başarısız oldu");
  }

  return response.json();
}

export async function loadUserLinks(address) {
  const linkContract = getLink();
  const links = await linkContract.getUserLinks?.(address).catch(() => []);
  if (!links?.length) return [];
  return links.map((link) => ({ address, link }));
}

export function getNetworkOptions() {
  return NETWORK_KEYS.map((key) => ({
    key,
    name: NETWORKS[key].name,
    chainId: NETWORKS[key].chainId,
  }));
}

export function explorerLink(hash) {
  return `${CURRENT_NETWORK.explorer}/tx/${hash}`;
}
