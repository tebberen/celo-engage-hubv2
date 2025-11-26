// src/services/divviReferral.js
// Divvi referral yardımcı fonksiyonları

import { getReferralTag, submitReferral } from "https://cdn.jsdelivr.net/npm/@divvi/referral-sdk@2.0.0/+esm";
import { DIVVI_CONSUMER_ADDRESS } from "../utils/constants.js";

function hasOverrides(overrides) {
  return overrides && Object.keys(overrides).length > 0;
}

export async function sendWithReferral(contract, methodName, args = [], overrides = {}) {
  if (!contract) {
    throw new Error("Contract instance is required for Divvi referral send");
  }

  const callArgs = Array.isArray(args) ? [...args] : [];
  const includeOverrides = hasOverrides(overrides);
  const invocationArgs = includeOverrides ? [...callArgs, overrides] : callArgs;

  const signer = contract.signer;
  const sendWithoutReferral = async (reason) => {
    if (reason) {
      console.warn(`⚠️ Divvi referral skipped for ${methodName}:`, reason);
    }

    if (typeof contract[methodName] !== "function") {
      throw new Error(`Method ${methodName} is not available on contract`);
    }

    const fallbackTx = await contract[methodName](...invocationArgs);
    const receipt = await fallbackTx.wait();
    return { sentTx: fallbackTx, receipt };
  };

  if (!signer || typeof signer.getAddress !== "function") {
    return sendWithoutReferral("missing signer");
  }

  let userAddress;
  try {
    userAddress = await signer.getAddress();
  } catch (error) {
    return sendWithoutReferral(error);
  }

  const populate = contract.populateTransaction?.[methodName];
  if (!populate) {
    return sendWithoutReferral("populateTransaction not available");
  }

  let txRequest;
  try {
    txRequest = await populate(...invocationArgs);
  } catch (error) {
    return sendWithoutReferral(error);
  }

  if (!txRequest || !txRequest.data) {
    return sendWithoutReferral("missing calldata");
  }

  let referralTag;
  try {
    referralTag = getReferralTag({
      user: userAddress,
      consumer: DIVVI_CONSUMER_ADDRESS
    });
  } catch (error) {
    return sendWithoutReferral(error);
  }

  const sanitizedTag = referralTag?.startsWith("0x") ? referralTag.slice(2) : referralTag;
  if (sanitizedTag) {
    const lowerData = txRequest.data.toLowerCase();
    const lowerTag = sanitizedTag.toLowerCase();
    if (!lowerData.endsWith(lowerTag)) {
      txRequest.data = `${txRequest.data}${sanitizedTag}`;
    }
  }

  txRequest.from = userAddress;

  if (includeOverrides) {
    if (overrides.value !== undefined) {
      txRequest.value = overrides.value;
    }
    if (overrides.gasLimit !== undefined) {
      txRequest.gasLimit = overrides.gasLimit;
    }
    if (overrides.gasPrice !== undefined) {
      txRequest.gasPrice = overrides.gasPrice;
    }
  }

  let sentTx;
  let receipt;
  try {
    sentTx = await signer.sendTransaction(txRequest);
    receipt = await sentTx.wait();
  } catch (error) {
    return sendWithoutReferral(error);
  }

  try {
    const provider = signer.provider;
    if (!provider || typeof provider.getNetwork !== "function") {
      throw new Error("Provider unavailable for Divvi submission");
    }

    const network = await provider.getNetwork();
    await submitReferral({
      txHash: sentTx.hash,
      chainId: Number(network.chainId)
    });
    console.log("✅ Divvi referral submitted", sentTx.hash);
  } catch (error) {
    console.warn("⚠️ Divvi referral submission failed", error);
  }

  return { sentTx, receipt };
}

export default {
  sendWithReferral
};
