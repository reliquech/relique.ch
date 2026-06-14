/**
 * Supported display currencies for the marketplace.
 * User selection is persisted in localStorage and used for price formatting.
 */
export const SUPPORTED_CURRENCIES = [
  "USD",
  "VND",
  "EUR",
  "GBP",
  "JPY",
  "AUD",
  "SGD",
  "THB",
  "MYR",
  "IDR",
  "PHP",
  "KRW",
  "CNY",
] as const;

export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

export const CURRENCY_LABELS: Record<Currency, string> = {
  USD: "USD",
  VND: "VND",
  EUR: "EUR",
  GBP: "GBP",
  JPY: "JPY",
  AUD: "AUD",
  SGD: "SGD",
  THB: "THB",
  MYR: "MYR",
  IDR: "IDR",
  PHP: "PHP",
  KRW: "KRW",
  CNY: "CNY",
};

export const DEFAULT_CURRENCY: Currency = "USD";
