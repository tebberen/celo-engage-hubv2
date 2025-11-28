// src/services/divviReferral.js
// Divvi referral yardımcı fonksiyonları - Farcaster Fix

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

  // Yardımcı: Referanssız gönderme fonksiyonu (Sadece ilk gönderim başarısız olursa çalışır)
  const sendWithoutReferral = async (reason) => {
    if (reason) {
      console.warn(`⚠️ Divvi referral skipped for ${methodName}:`, reason);
    }

    if (typeof contract[methodName] !== "function") {
      throw new Error(`Method ${methodName} is not available on contract`);
    }

    // Fallback işlemi gönder
    const fallbackTx = await contract[methodName](...invocationArgs);

    // Fallback işleminin sonucunu bekle (Hata olsa bile tx'i döndür)
    let receipt = null;
    try {
      receipt = await fallbackTx.wait();
    } catch (waitError) {
      console.warn("⚠️ Fallback wait error (ignored, tx sent):", waitError);
    }
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

  // 1. İşlem verisini (calldata) hazırla
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

  // 2. Referral Tag Ekle
  try {
    const referralTag = getReferralTag({
      user: userAddress,
      consumer: DIVVI_CONSUMER_ADDRESS
    });

    const sanitizedTag = referralTag?.startsWith("0x") ? referralTag.slice(2) : referralTag;
    if (sanitizedTag) {
      const lowerData = txRequest.data.toLowerCase();
      const lowerTag = sanitizedTag.toLowerCase();
      // Eğer data zaten tag ile bitmiyorsa ekle
      if (!lowerData.endsWith(lowerTag)) {
        txRequest.data = `${txRequest.data}${sanitizedTag}`;
      }
    }
  } catch (error) {
    console.warn("Referral tag generation failed, proceeding without tag", error);
  }

  txRequest.from = userAddress;

  // Override'ları uygula (Gas Limit, Value vb.)
  if (includeOverrides) {
    if (overrides.value !== undefined) txRequest.value = overrides.value;
    if (overrides.gasLimit !== undefined) txRequest.gasLimit = overrides.gasLimit;
    if (overrides.gasPrice !== undefined) txRequest.gasPrice = overrides.gasPrice;
  }

  let sentTx;

  // 3. İŞLEMİ GÖNDER (Kritik Ayrım)
  try {
    // Sadece burası hata verirse fallback çalışsın
    sentTx = await signer.sendTransaction(txRequest);
  } catch (sendError) {
    console.error("❌ Primary transaction send failed:", sendError);
    return sendWithoutReferral(sendError);
  }

  // 4. İŞLEM SONUCUNU BEKLE (Bağımsız Blok)
  // Buradaki hata artık akışı bozmayacak ve 2. işlemi tetiklemeyecek
  let receipt = null;
  try {
    receipt = await sentTx.wait();
  } catch (waitError) {
    console.warn("⚠️ Transaction sent but wait() failed (Farcaster RPC issue). Tx Hash:", sentTx.hash);
    // Receipt yok ama işlem başarılı kabul ediliyor
  }

  // 5. Divvi'ye Bildir (Arka planda)
  try {
    const provider = signer.provider;
    if (provider && typeof provider.getNetwork === "function") {
      const network = await provider.getNetwork();
      await submitReferral({
        txHash: sentTx.hash,
        chainId: Number(network.chainId)
      });
      console.log("✅ Divvi referral submitted", sentTx.hash);
    }
  } catch (error) {
    console.warn("⚠️ Divvi referral submission failed", error);
  }

  return { sentTx, receipt };
}

export default {
  sendWithReferral
};
