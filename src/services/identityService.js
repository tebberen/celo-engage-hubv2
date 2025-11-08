const STORAGE_KEY = "celo-engage-verified-humans";
const SELF_SCOPE = "celo-engage-hub";
const SELF_VERSION = 2;
const SELF_BACKEND_PATH = "/api/self/verify";
const SELF_DISCLOSURES = {
  minimumAge: 18,
  excludedCountries: [],
  nationality: ["TR"],
  userIdentifierType: "wallet",
};

let verifiedHuman = false;
let modulesPromise = null;
let activeSessionCleanup = null;

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

function getBackendEndpoint() {
  if (typeof window !== "undefined" && window?.location?.origin) {
    return `${window.location.origin}${SELF_BACKEND_PATH}`;
  }
  if (typeof process !== "undefined" && process?.env?.SELF_BACKEND_URL) {
    return process.env.SELF_BACKEND_URL;
  }
  return `https://your-backend-domain.com${SELF_BACKEND_PATH}`;
}

async function loadSelfModules() {
  if (modulesPromise) return modulesPromise;
  modulesPromise = Promise.all([
    import("https://esm.sh/@selfxyz/core@2?bundle"),
    import("https://esm.sh/@selfxyz/qrcode@2?bundle"),
  ])
    .then(([core, qr]) => {
      const SelfAppBuilder = core?.SelfAppBuilder || core?.default?.SelfAppBuilder;
      const renderQRCode = qr?.renderQRCode || qr?.default?.renderQRCode || qr?.default;
      if (!SelfAppBuilder || typeof renderQRCode !== "function") {
        throw new Error("identityService: failed to load Self SDK modules");
      }
      return { SelfAppBuilder, renderQRCode };
    })
    .catch((error) => {
      modulesPromise = null;
      console.error("identityService: failed to load Self SDK", error);
      throw error;
    });
  return modulesPromise;
}

function cleanupActiveSession() {
  if (typeof activeSessionCleanup === "function") {
    try {
      activeSessionCleanup();
    } catch (error) {
      console.warn("identityService: failed to cleanup session", error);
    }
  }
  activeSessionCleanup = null;
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
  cleanupActiveSession();
  verifiedHuman = false;
}

export function getVerifiedFlag() {
  return verifiedHuman;
}

export function syncVerifiedFlag(address) {
  verifiedHuman = getVerifiedHuman(address);
  return verifiedHuman;
}

function attachWalletIdentifier(app, address) {
  if (!app || !address) return;
  const normalized = normalizeAddress(address);
  if (!normalized) return;
  if (typeof app.withUserIdentifier === "function") {
    try {
      const next = app.withUserIdentifier({ type: "wallet", value: normalized });
      if (next) {
        return next;
      }
    } catch (error) {
      console.warn("identityService: failed to set identifier via withUserIdentifier", error);
    }
  }
  if (typeof app.setUserIdentifier === "function") {
    try {
      app.setUserIdentifier({ type: "wallet", value: normalized });
      return app;
    } catch (error) {
      console.warn("identityService: failed to set identifier via setUserIdentifier", error);
    }
  }
  try {
    // eslint-disable-next-line no-param-reassign
    app.userIdentifier = { type: "wallet", value: normalized };
  } catch (error) {
    console.warn("identityService: unable to assign userIdentifier", error);
  }
  return app;
}

function extractDeepLink(app, qrResult) {
  if (qrResult && typeof qrResult === "object") {
    if (typeof qrResult.deepLink === "string") return qrResult.deepLink;
    if (typeof qrResult.link === "string") return qrResult.link;
  }
  if (!app) return null;
  if (typeof app.getDeepLink === "function") return app.getDeepLink();
  if (typeof app.getUniversalLink === "function") return app.getUniversalLink();
  if (typeof app.getDeeplink === "function") return app.getDeeplink();
  if (typeof app.deepLink === "string") return app.deepLink;
  if (typeof app.link === "string") return app.link;
  return null;
}

function buildCleanup({ qrCleanup, unsubscribers, app }) {
  return () => {
    unsubscribers.forEach((unsubscribe) => {
      if (typeof unsubscribe === "function") {
        try {
          unsubscribe();
        } catch (error) {
          console.warn("identityService: failed to unsubscribe", error);
        }
      }
    });
    if (typeof qrCleanup === "function") {
      try {
        qrCleanup();
      } catch (error) {
        console.warn("identityService: failed to cleanup QR renderer", error);
      }
    }
    if (app && typeof app.close === "function") {
      try {
        app.close();
      } catch (error) {
        console.warn("identityService: failed to close Self app", error);
      }
    }
  };
}

export async function openSelfVerification({
  address,
  container,
  onVerified,
  onError,
  onStatus,
  onDeepLink,
}) {
  if (!address) {
    const error = new Error("Wallet address is required for Self verification");
    if (onError) onError(error);
    throw error;
  }

  cleanupActiveSession();

  const { SelfAppBuilder, renderQRCode } = await loadSelfModules();
  if (container) {
    container.innerHTML = "";
  }

  let builder;
  try {
    builder = new SelfAppBuilder({
      scope: SELF_SCOPE,
      version: SELF_VERSION,
      endpoint: getBackendEndpoint(),
      disclosures: SELF_DISCLOSURES,
    });
  } catch (error) {
    console.error("identityService: failed to initialize SelfAppBuilder", error);
    if (onError) onError(error);
    throw error;
  }

  let app;
  try {
    app = builder.build ? builder.build() : builder;
  } catch (error) {
    console.warn("identityService: failed to build app, using builder instance", error);
    app = builder;
  }

  app = attachWalletIdentifier(app, address) || app;

  let qrCleanup = null;
  let qrResult = null;
  if (typeof renderQRCode === "function") {
    try {
      qrResult = renderQRCode.length > 1 ? renderQRCode(app, { container }) : renderQRCode(app);
      if (container && qrResult instanceof HTMLElement) {
        container.appendChild(qrResult);
      } else if (container && !container.childElementCount && !(qrResult instanceof HTMLElement)) {
        container.textContent = "Open the Self app and scan the QR code.";
      }
      if (qrResult && typeof qrResult === "object") {
        if (qrResult.element instanceof HTMLElement && container && !container.contains(qrResult.element)) {
          container.appendChild(qrResult.element);
        }
        if (typeof qrResult.cleanup === "function") {
          qrCleanup = qrResult.cleanup;
        }
        if (typeof qrResult.destroy === "function") {
          const prevCleanup = qrCleanup;
          qrCleanup = () => {
            if (typeof prevCleanup === "function") prevCleanup();
            qrResult.destroy();
          };
        }
      } else if (typeof qrResult === "function") {
        qrCleanup = qrResult;
      }
    } catch (error) {
      console.error("identityService: failed to render Self QR", error);
      if (container) {
        container.textContent = "Unable to render Self verification QR.";
      }
      if (onError) onError(error);
      throw error;
    }
  }

  const deepLink = extractDeepLink(app, qrResult);
  if (deepLink && typeof onDeepLink === "function") {
    onDeepLink(deepLink);
  }

  const unsubscribers = [];
  const handleVerified = (payload) => {
    setVerifiedHuman(address, true);
    if (typeof onStatus === "function") {
      onStatus("verified", payload);
    }
    if (typeof onVerified === "function") {
      onVerified(payload);
    }
  };
  const handleFailed = (error) => {
    if (typeof onStatus === "function") {
      onStatus("failed", error);
    }
    if (onError) onError(error instanceof Error ? error : new Error("Self verification failed"));
  };
  const handleStatus = (status) => {
    if (typeof onStatus === "function") {
      onStatus(status);
    }
  };

  const subscribe = (eventName, callback) => {
    if (!app || typeof app.on !== "function" || typeof eventName !== "string") return null;
    try {
      const off = app.on(eventName, callback);
      return typeof off === "function" ? off : null;
    } catch (error) {
      console.warn(`identityService: failed to subscribe to ${eventName}`, error);
      return null;
    }
  };

  unsubscribers.push(subscribe("verified", handleVerified));
  unsubscribers.push(subscribe("error", handleFailed));
  unsubscribers.push(subscribe("failed", handleFailed));
  unsubscribers.push(subscribe("status", handleStatus));

  if (app && typeof app.start === "function") {
    Promise.resolve()
      .then(() => app.start())
      .catch((error) => {
        console.error("identityService: Self app start error", error);
        handleFailed(error);
      });
  }

  activeSessionCleanup = buildCleanup({ qrCleanup, unsubscribers, app });
  return { app, cleanup: activeSessionCleanup, deepLink };
}

export function closeSelfVerification() {
  cleanupActiveSession();
}
