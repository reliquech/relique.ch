"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  type Currency,
  SUPPORTED_CURRENCIES,
  DEFAULT_CURRENCY,
} from "@/lib/constants/currency";

const CURRENCY_STORAGE_KEY = "relique-currency";

function isCurrency(value: string): value is Currency {
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(value);
}

function loadCurrency(): Currency {
  if (typeof window === "undefined") return DEFAULT_CURRENCY;
  try {
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (stored && isCurrency(stored)) return stored;
  } catch {
    // ignore
  }
  return DEFAULT_CURRENCY;
}

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (price: number, showCents?: boolean) => string;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(DEFAULT_CURRENCY);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCurrencyState(loadCurrency());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
    } catch {
      // ignore
    }
  }, [mounted, currency]);

  const setCurrency = useCallback((value: Currency) => {
    setCurrencyState(value);
  }, []);

  const formatPrice = useCallback(
    (price: number, showCents = false) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: showCents ? 2 : 0,
        maximumFractionDigits: showCents ? 2 : 0,
      }).format(price);
    },
    [currency]
  );

  const value = useMemo(
    () => ({ currency, setCurrency, formatPrice }),
    [currency, setCurrency, formatPrice]
  );

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}
