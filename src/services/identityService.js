const STORAGE_KEY = "celo-engage-verified-humans";
const WORLD_ID_APP_ID = "app_249ff6ed2c94ae9705016381300a30f6";
const ACTION_ID = "celo-engage-hub-verification";

let cachedModule = null;
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

export function clearVerificationState() {
  verifiedHuman = false;
}

export function getVerifiedFlag() {
  return verifiedHuman;
}

export function syncVerifiedFlag(address) {
  verifiedHuman = getVerifiedHuman(address);
  return verifiedHuman;
}

async function loadWorldIdModule() {
  if (cachedModule) return cachedModule;
  try {
    cachedModule = await import("https://cdn.jsdelivr.net/npm/@worldcoin/idkit@1.3.0/dist/esm/index.js");
  } catch (error) {
    console.error("identityService: failed to load World ID SDK", error);
    throw error;
  }
  return cachedModule;
}

export async function openWorldIdVerification({ signal, onSuccess, onError, onClose }) {
  if (!signal) {
    const missingSignalError = new Error("Missing verification signal");
    if (onError) onError(missingSignalError);
    throw missingSignalError;
  }
  try {
    const module = await loadWorldIdModule();
    const widget = module?.IDKitWidget || module?.default?.IDKitWidget || module?.default;
    if (!widget?.open) {
      const widgetError = new Error("World ID widget is unavailable");
      if (onError) onError(widgetError);
      throw widgetError;
    }
    await widget.open({
      app_id: WORLD_ID_APP_ID,
      action: ACTION_ID,
      signal,
      enableTelemetry: true,
      theme: "light",
      autoClose: true,
      onSuccess: (result) => {
        setVerifiedHuman(signal, true);
        if (typeof onSuccess === "function") {
          onSuccess(result);
        }
      },
      onError: (error) => {
        if (typeof onError === "function") {
          onError(error);
        }
      },
      onClose: () => {
        if (typeof onClose === "function") {
          onClose();
        }
      },
    });
  } catch (error) {
    if (onError && !(error instanceof Error && error.message === "Missing verification signal")) {
      onError(error);
    }
    throw error;
  }
}
