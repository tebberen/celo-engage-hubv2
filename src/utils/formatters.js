import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";

const DEFAULT_NUMBER_FORMATTER = new Intl.NumberFormat("en-US");

function createCurrencyFormatter(minFractionDigits = 2, maxFractionDigits = 2) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: minFractionDigits,
    maximumFractionDigits: maxFractionDigits
  });
}

export function formatNumber(value, { defaultValue = "0", formatter = DEFAULT_NUMBER_FORMATTER } = {}) {
  if (value === null || value === undefined) return defaultValue;

  try {
    const numericValue = typeof value === "string" ? Number(value) : Number(value);
    if (Number.isNaN(numericValue)) return defaultValue;
    return formatter.format(numericValue);
  } catch (error) {
    console.warn("⚠️ formatNumber failed, returning default", error);
    return defaultValue;
  }
}

export function formatCeloAmount(value, {
  includeSymbol = true,
  minFractionDigits = 2,
  maxFractionDigits = 2,
  defaultValue = includeSymbol ? "0 CELO" : "0"
} = {}) {
  try {
    const bigValue = ethers.BigNumber.isBigNumber(value)
      ? value
      : value !== undefined && value !== null
        ? ethers.BigNumber.from(value)
        : ethers.BigNumber.from(0);

    const formattedEther = ethers.utils.formatEther(bigValue);
    const numericValue = Number(formattedEther);

    if (Number.isNaN(numericValue)) {
      return defaultValue;
    }

    const formatter = createCurrencyFormatter(minFractionDigits, maxFractionDigits);
    const formatted = formatter.format(numericValue);
    return includeSymbol ? `${formatted} CELO` : formatted;
  } catch (error) {
    console.warn("⚠️ formatCeloAmount failed, returning default", error);
    return defaultValue;
  }
}

export function formatCeloAmountCompact(value, options = {}) {
  const {
    includeSymbol = true,
    defaultValue = includeSymbol ? "0 CELO" : "0"
  } = options;

  try {
    const bigValue = ethers.BigNumber.isBigNumber(value)
      ? value
      : value !== undefined && value !== null
        ? ethers.BigNumber.from(value)
        : ethers.BigNumber.from(0);

    const formattedEther = ethers.utils.formatEther(bigValue);
    const numericValue = Number(formattedEther);

    if (Number.isNaN(numericValue)) {
      return defaultValue;
    }

    const formatter = new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1
    });

    const formatted = formatter.format(numericValue);
    return includeSymbol ? `${formatted} CELO` : formatted;
  } catch (error) {
    console.warn("⚠️ formatCeloAmountCompact failed, returning default", error);
    return defaultValue;
  }
}
