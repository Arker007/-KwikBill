/**
 * Number & Currency Formatting Utilities
 *
 * Provides statutory and display formatters for Indian Rupee (INR) and international currencies,
 * as well as Indian numbering system conversion (Lakhs, Crores) into words.
 */

export interface CurrencyNameUnit {
  major: string;
  minor: string;
}

/**
 * Currency name mapping for major and minor denominations
 * Used for "Amount in Words" rendering across domestic and international currencies.
 */
export const CURRENCY_NAMES: Record<string, CurrencyNameUnit> = {
  INR: { major: 'Rupees', minor: 'Paise' },
  USD: { major: 'Dollars', minor: 'Cents' },
  EUR: { major: 'Euros', minor: 'Cents' },
  GBP: { major: 'Pounds', minor: 'Pence' },
  AUD: { major: 'Dollars', minor: 'Cents' },
  CAD: { major: 'Dollars', minor: 'Cents' },
  SGD: { major: 'Dollars', minor: 'Cents' },
  AED: { major: 'Dirhams', minor: 'Fils' },
  SAR: { major: 'Riyals', minor: 'Halalas' },
  MYR: { major: 'Ringgit', minor: 'Sen' },
  ZAR: { major: 'Rand', minor: 'Cents' },
  NGN: { major: 'Naira', minor: 'Kobo' },
  KES: { major: 'Shillings', minor: 'Cents' },
  NPR: { major: 'Rupees', minor: 'Paisa' },
  BDT: { major: 'Taka', minor: 'Poisha' },
  LKR: { major: 'Rupees', minor: 'Cents' },
  PKR: { major: 'Rupees', minor: 'Paisa' },
  PHP: { major: 'Pesos', minor: 'Centavos' },
  IDR: { major: 'Rupiah', minor: 'Sen' },
  NZD: { major: 'Dollars', minor: 'Cents' },
};

/**
 * Converts a numerical amount into Indian currency words representation.
 * Follows the Indian numbering grouping (Crore, Lakh, Thousand, Hundred) and includes Paise.
 */
export const numberToWords = (num: number): string => {
  if (num === 0) return 'Zero Rupees Only';

  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertToWords = (n: number): string => {
    if (n < 20) return a[n];
    return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
  };

  const getIndianFormatString = (n: number): string => {
    let res = '';
    const crore = Math.floor(n / 10000000);
    n -= crore * 10000000;
    const lakh = Math.floor(n / 100000);
    n -= lakh * 100000;
    const thousand = Math.floor(n / 1000);
    n -= thousand * 1000;
    const hundred = Math.floor(n / 100);
    n -= hundred * 100;

    if (crore > 0) res += convertToWords(crore) + ' Crore ';
    if (lakh > 0) res += convertToWords(lakh) + ' Lakh ';
    if (thousand > 0) res += convertToWords(thousand) + ' Thousand ';
    if (hundred > 0) res += convertToWords(hundred) + ' Hundred ';
    if (n > 0) res += (res !== '' ? 'and ' : '') + convertToWords(n);
    return res.trim();
  };

  const roundedNum = Math.round((Number(num) || 0) * 100) / 100;
  const rupees = Math.floor(roundedNum);
  const paise = Math.round((roundedNum - rupees) * 100);

  let result = getIndianFormatString(rupees) + ' Rupees';
  if (paise > 0) {
    result += ' and ' + getIndianFormatString(paise) + ' Paise';
  }
  return result + ' Only';
};

/**
 * Formats a numeric value into currency format according to locale and currency code.
 * Defaults to 'INR' (en-IN).
 */
export const formatCurrency = (amount: number | string | null | undefined, currency: string = 'INR'): string => {
  const numericAmount = Number(amount) || 0;
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency || 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
};

/**
 * Formats a numeric value in Indian Rupee format (INR / en-IN).
 */
export const formatINR = (amount: number | string | null | undefined): string => {
  return formatCurrency(amount, 'INR');
};

/**
 * Formats a number according to the Indian numbering system without currency symbols.
 */
export const formatIndianNumber = (amount: number | string | null | undefined, decimals: number = 2): string => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

/**
 * Safely parses a formatted number string (e.g. "₹ 1,23,456.78" or "1,234.50") into a clean float.
 */
export const parseFormattedNumber = (value: string | number | null | undefined): number => {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (!value) return 0;
  const cleaned = String(value).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Formats an exchange rate description line for foreign currency invoices.
 */
export const formatExchangeRateLine = (
  currency: string,
  rate: number | string,
  baseCurrency: string = 'INR'
): string => {
  if (!rate || !currency || currency === baseCurrency) return '';
  return `1 ${currency} = ${Number(rate).toFixed(4)} ${baseCurrency}`;
};

const CSV_FORMULA_START = /^[=+\-@\t\r]/;
const CSV_PLAIN_NUMBER = /^-?\d+(\.\d+)?$/;

export const toCsvCell = (value: any): string => {
  let s = String(value ?? '');
  if (s.length > 1 && CSV_FORMULA_START.test(s) && !CSV_PLAIN_NUMBER.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const toCsvLine = (cells: any[]): string => cells.map(toCsvCell).join(',');
