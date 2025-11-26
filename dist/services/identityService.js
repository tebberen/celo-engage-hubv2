const STORAGE_KEY = "celo-engage-verified-humans";

let verifiedHuman = false;

function normalizeAddress(address) {
  return typeof address === "string" ? address.toLowerCase() : null;
}

function getVerificationMap() {
  if (typeof localStorage === "undefined") return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch (error) {
    console.warn("identityService: failed to parse storage", error);
    return {};
  }
}

function persistVerificationMap(map) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (error) {
    console.warn("identityService: failed to persist storage", error);
  }
}

export function getVerifiedHuman(address) {
  const map = getVerificationMap();
  const key = normalizeAddress(address);
  return key ? Boolean(map[key]) : false;
}

export function setVerifiedHuman(address, value) {
  const key = normalizeAddress(address);
  if (!key) return false;
  const map = getVerificationMap();
  if (value) {
    map[key] = true;
  } else {
    delete map[key];
  }
  persistVerificationMap(map);
  verifiedHuman = Boolean(value);
  return verifiedHuman;
}

export function clearVerificationState(address = null) {
  if (address) {
    const key = normalizeAddress(address);
    if (key) {
      const map = getVerificationMap();
      if (map[key]) {
        delete map[key];
        if (Object.keys(map).length) {
          persistVerificationMap(map);
        } else if (typeof localStorage !== "undefined") {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }
  }
  verifiedHuman = false;
}

export function getVerifiedFlag() {
  return verifiedHuman;
}

export function syncVerifiedFlag(address) {
  verifiedHuman = getVerifiedHuman(address);
  return verifiedHuman;
}
