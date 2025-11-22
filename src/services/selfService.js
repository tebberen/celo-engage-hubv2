// src/services/selfService.js
import { checkSelfVerification } from "./contractService.js";

function formatTimestamp(timestamp) {
  if (!timestamp) return null;
  try {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  } catch {
    return null;
  }
}

export async function loadSelfStatus() {
  const result = await checkSelfVerification();
  return {
    ...result,
    lastVerifiedHuman: formatTimestamp(result.lastVerifiedAt),
  };
}
