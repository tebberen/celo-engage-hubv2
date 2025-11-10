import { TALENT_PROTOCOL_API_BASE_URL, TALENT_PROTOCOL_API_KEY } from "../utils/constants.js";

const TALENT_PROFILE_ENDPOINT = "me";

function buildUrl(path) {
  const base = TALENT_PROTOCOL_API_BASE_URL.endsWith("/")
    ? TALENT_PROTOCOL_API_BASE_URL
    : `${TALENT_PROTOCOL_API_BASE_URL}/`;
  return `${base}${path}`;
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
    response.data ||
    response.profile ||
    response.talent ||
    response;

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const username = payload.username || payload.handle || payload.slug || "";
  const name = payload.name || payload.full_name || payload.display_name || username || "";
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

  let profileUrl = payload.profile_url || payload.profile_link || payload.url || "";
  if (!profileUrl && username) {
    profileUrl = `https://app.talentprotocol.com/u/${username}`;
  }

  return {
    name,
    username,
    bio,
    profileImage,
    supporters,
    badges,
    profileUrl,
  };
}

export async function fetchTalentProfile({ signal } = {}) {
  const url = buildUrl(TALENT_PROFILE_ENDPOINT);
  const headers = new Headers({
    Accept: "application/json",
  });

  if (TALENT_PROTOCOL_API_KEY) {
    headers.set("Authorization", `Bearer ${TALENT_PROTOCOL_API_KEY}`);
  } else {
    console.warn("Talent Protocol API key is missing. Requests may fail with 404/401 responses.");
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers,
      signal,
      credentials: "omit",
    });

    if (!response.ok) {
      const error = new Error(`Talent Protocol request failed with status ${response.status}`);
      error.status = response.status;
      if (response.status === 404) {
        error.userMessage = "Talent data unavailable. Check API key.";
      }
      throw error;
    }

    const data = await response.json().catch(() => ({}));
    const profile = normalizeProfile(data);

    if (!profile) {
      const error = new Error("Talent Protocol profile response was empty");
      error.status = 422;
      throw error;
    }

    return profile;
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }
    throw error;
  }
}
