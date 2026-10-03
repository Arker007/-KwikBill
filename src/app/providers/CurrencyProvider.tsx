import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound' },
  AED: { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
};

export interface CurrencyContextValue {
  currency: string;
  currencySymbol: string;
  setCurrency: (code: string) => void;
  formatAmount: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

const CURRENCY_STORAGE_KEY = 'selected_currency';

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<string>(() => {
    try {
      return localStorage.getItem(CURRENCY_STORAGE_KEY) || 'INR';
    } catch {
      return 'INR';
    }
  });

  const currencyConfig = CURRENCIES[currency] || CURRENCIES.INR;
  const currencySymbol = currencyConfig.symbol;

  useEffect(() => {
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
    } catch {
      /* ignore */
    }
  }, [currency]);

  const setCurrency = (code: string) => {
    if (CURRENCIES[code] || code) {
      setCurrencyState(code);
    }
  };

  const formatAmount = (amount: number): string => {
    const num = Number(amount) || 0;
    if (currency === 'INR') {
      return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${currencySymbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, currencySymbol, setCurrency, formatAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextValue => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
