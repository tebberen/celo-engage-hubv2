import {
  TALENT_PROTOCOL_API_BASE_URL,
  TALENT_PROTOCOL_API_KEY,
  TALENT_PROTOCOL_DEFAULT_USERNAME,
} from "../utils/constants.js";

const TALENT_PROFILE_ENDPOINT_TEMPLATE = "profiles/{username}";
const TALENT_API_FALLBACK_BASES = [
  "https://api.talentprotocol.com/api/v4/",
  "https://app.talentprotocol.com/api/v4/",
  "https://app.talentprotocol.com/api/v3/",
];

function buildUrl(base, path) {
  const normalizedBase = typeof base === "string" && base.trim().length ? base.trim() : "";
  const sanitizedBase = normalizedBase.endsWith("/") ? normalizedBase : `${normalizedBase}/`;
  const sanitizedPath = path.startsWith("/") ? path.slice(1) : path;
  return `${sanitizedBase}${sanitizedPath}`;
}

function getApiBaseCandidates() {
  const configured = Array.isArray(TALENT_PROTOCOL_API_BASE_URL)
    ? TALENT_PROTOCOL_API_BASE_URL
    : [TALENT_PROTOCOL_API_BASE_URL];
  return [...configured, ...TALENT_API_FALLBACK_BASES]
    .map((base) => (typeof base === "string" ? base.trim() : ""))
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index);
}

function resolveConfiguredUsername() {
  const fallbacks = [
    (() => {
      if (typeof window !== "undefined") {
        const fromGlobal = window.__CELO_TALENT_USERNAME || window.__CELO_ENGAGE_TALENT_USERNAME;
        if (typeof fromGlobal === "string" && fromGlobal.trim()) {
          return fromGlobal.trim();
        }
      }
      return null;
    })(),
    (() => {
      if (typeof process !== "undefined" && process?.env) {
        const envValue =
          process.env.TALENT_PROTOCOL_USERNAME ||
          process.env.VITE_TALENT_PROTOCOL_USERNAME ||
          process.env.PUBLIC_TALENT_PROTOCOL_USERNAME;
        if (typeof envValue === "string" && envValue.trim()) {
          return envValue.trim();
        }
      }
      return null;
    })(),
    TALENT_PROTOCOL_DEFAULT_USERNAME,
  ];

  return fallbacks.find((value) => typeof value === "string" && value.length > 0) || "";
}

function normalizeBadges(rawBadges) {
  if (!Array.isArray(rawBadges)) return [];
  return rawBadges
    .map((badge, index) => {
      if (!badge || typeof badge !== "object") {
        return null;
      }
      const name = badge.name || badge.title || badge.label || "";
      const icon = badge.icon_url || badge.image_url || badge.icon || badge.image || "";
      const description = badge.description || badge.subtitle || "";
      const slug = badge.slug || badge.id || `${index}`;
      if (!name && !icon) {
        return null;
      }
      return { id: slug, name, icon, description };
    })
    .filter(Boolean);
}

function normalizeProfile(response) {
  if (!response || typeof response !== "object") {
    return null;
  }

  const payload =
    response.data?.attributes ||
    response.data?.profile ||
    response.data ||
    response.profile ||
    response.talent ||
    response;

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const username = payload.username || payload.handle || payload.slug || "";
  const name = payload.name || payload.full_name || payload.display_name || username || "";
  const displayName = payload.display_name || payload.preferred_name || name;
  const headline = payload.headline || payload.tagline || payload.title || "";
  const bio =
    payload.bio ||
    payload.about ||
    payload.headline ||
    payload.description ||
    "";
  const profileImage =
    payload.profile_picture_url ||
    payload.profile_picture ||
    payload.avatar_url ||
    payload.image_url ||
    payload.photo_url ||
    "";
  const supporters =
    payload.supporters_count ||
    payload.total_supporters ||
    payload.followers_count ||
    payload.supporters ||
    0;
  const badges = normalizeBadges(payload.badges || payload.achievements || payload.honors);
  const stats = normalizeStats(payload);

  let profileUrl = payload.profile_url || payload.profile_link || payload.url || "";
  if (!profileUrl && username) {
    profileUrl = `https://app.talentprotocol.com/u/${username}`;
  }

  return {
    name,
    username,
    displayName,
    headline,
    bio,
    profileImage,
    supporters,
    badges,
    profileUrl,
    stats,
  };
}

function normalizeStats(payload) {
  const statsSource =
    (payload?.stats && typeof payload.stats === "object" ? payload.stats : null) ||
    (payload?.metrics && typeof payload.metrics === "object" ? payload.metrics : null) ||
    null;

  const badgeCount = Array.isArray(payload?.badges)
    ? payload.badges.length
    : Number(payload?.badge_count || payload?.badges_count || 0) || 0;

  if (statsSource) {
    return {
      xp:
        Number(statsSource.xp ?? statsSource.experience_points ?? statsSource.experience ?? payload?.xp ?? 0) || 0,
      points: Number(statsSource.points ?? statsSource.total_points ?? payload?.points ?? 0) || 0,
      supporters:
        Number(
          statsSource.supporters ??
            statsSource.supporters_count ??
            payload?.supporters_count ??
            payload?.total_supporters ??
            payload?.followers_count ??
            0
        ) || 0,
      badges: Number(statsSource.badges ?? statsSource.badges_count ?? badgeCount) || 0,
      rank: statsSource.rank ?? statsSource.level ?? null,
      streak: Number(statsSource.streak ?? statsSource.activity_streak ?? 0) || 0,
    };
  }

  return {
    xp: Number(payload?.xp ?? payload?.experience_points ?? 0) || 0,
    points: Number(payload?.points ?? 0) || 0,
    supporters:
      Number(payload?.supporters_count ?? payload?.total_supporters ?? payload?.followers_count ?? 0) || 0,
    badges: badgeCount,
    rank: payload?.level ?? payload?.rank ?? null,
    streak: Number(payload?.streak ?? payload?.activity_streak ?? 0) || 0,
  };
}

export async function fetchTalentProfile({ signal } = {}) {
  const username = resolveConfiguredUsername();
  if (!username) {
    const error = new Error("Talent Protocol username is not configured");
    console.error("❌ [Talent] Missing username configuration");
    throw error;
  }

  const endpoint = TALENT_PROFILE_ENDPOINT_TEMPLATE.replace("{username}", encodeURIComponent(username));
  const attempts = [];
  for (const base of getApiBaseCandidates()) {
    try {
      return await requestProfileFromBase(base, endpoint, { signal });
    } catch (error) {
      if (error.name === "AbortError") {
        throw error;
      }
      attempts.push({ base, error });
      console.warn(`⚠️ [Talent] Attempt via ${base} failed`, error);
    }
  }

  const aggregateError = new Error(
    attempts.length
      ? `Talent Protocol request failed after ${attempts.length} attempts`
      : "Talent Protocol request failed"
  );
  aggregateError.attempts = attempts;
  throw aggregateError;
}

function appendApiKeyQuery(url) {
  if (!TALENT_PROTOCOL_API_KEY) return url;
  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.has("api_key")) {
      parsed.searchParams.set("api_key", TALENT_PROTOCOL_API_KEY);
    }
    return parsed.toString();
  } catch (error) {
    return url;
  }
}

function createTalentHeaders() {
  const headers = new Headers({
    Accept: "application/json",
    "Cache-Control": "no-cache",
  });
  if (TALENT_PROTOCOL_API_KEY) {
    headers.set("Authorization", `Bearer ${TALENT_PROTOCOL_API_KEY}`);
    headers.set("X-API-Key", TALENT_PROTOCOL_API_KEY);
    headers.set("X-Api-Key", TALENT_PROTOCOL_API_KEY);
  } else {
    console.warn("Talent Protocol API key is missing. Requests may fail with 404/401 responses.");
  }
  return headers;
}

async function requestProfileFromBase(base, endpoint, { signal } = {}) {
  if (!base) {
    throw new Error("Talent Protocol API base URL is not configured");
  }
  const urlWithQuery = appendApiKeyQuery(buildUrl(base, endpoint));
  const response = await fetch(urlWithQuery, {
    method: "GET",
    headers: createTalentHeaders(),
    signal,
    credentials: "omit",
    mode: "cors",
    cache: "no-store",
  });

  if (!response.ok) {
    const error = new Error(`Talent Protocol request failed with status ${response.status}`);
    error.status = response.status;
    error.base = base;
    if (response.status === 404) {
      error.userMessage = "Talent profile not found.";
    }
    throw error;
  }

  const data = await response.json().catch(() => ({}));
  const profile = normalizeProfile(data);

  if (!profile) {
    const error = new Error("Talent Protocol profile response was empty");
    error.status = 422;
    error.base = base;
    throw error;
  }

  return profile;
}
