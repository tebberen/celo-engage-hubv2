// src/services/communityService.js
// Lightweight utilities for fetching community-facing datasets that complement
// on-chain information. These helpers emulate asynchronous data fetching so the
// rest of the app can treat them like remote services.

import { BADGE_CATALOG, LEADERBOARD_SNAPSHOT } from "../data/communityData.js";

const NETWORK_LATENCY_MS = 220;

export async function getBadgeCatalog() {
  await simulateLatency();
  return BADGE_CATALOG.map(badge => ({ ...badge }));
}

export async function fetchLeaderboardData({ limit = 10 } = {}) {
  await simulateLatency();
  const sorted = [...LEADERBOARD_SNAPSHOT]
    .sort((a, b) => (b.totalXP || 0) - (a.totalXP || 0))
    .slice(0, limit)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

  return sorted;
}

async function simulateLatency() {
  return new Promise(resolve => setTimeout(resolve, NETWORK_LATENCY_MS));
}

export default {
  getBadgeCatalog,
  fetchLeaderboardData
};
