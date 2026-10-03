/**
 * Statutory & Format Validators
 *
 * Provides statutory validation logic and pattern checks for Indian GSTINs,
 * PANs, IFSC codes, UPI Virtual Payment Addresses, and international tax identifiers.
 */

import {
  GST_STATE_CODES,
  LEGACY_STATE_CODE_MAP,
  UTS_WITHOUT_LEGISLATURE,
  COUNTRIES,
} from '../constants/index.ts';

/**
 * Standard Indian GSTIN Regex (15 alphanumeric characters)
 * - Format: 2 digits (State Code) + 5 letters + 4 digits + 1 letter (PAN) + 1 digit/letter (Entity Number) + 'Z' (Default) + 1 digit/letter (Checksum)
 */
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;

/**
 * Standard Indian Permanent Account Number (PAN) Regex (10 characters)
 * - Format: 5 uppercase letters + 4 numeric digits + 1 uppercase letter
 */
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;

/**
 * Indian Financial System Code (IFSC) Regex (11 characters)
 * - Format: 4 alphabetic bank code + '0' (reserved) + 6 alphanumeric branch code
 */
export const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/i;

/**
 * Soft UPI VPA format check.
 * Allows alphanumerics, dot, hyphen, underscore on either side of '@'
 */
export const UPI_REGEX = /^[\w.-]+@[\w.-]+$/;

/**
 * Character set used for Indian GSTIN Modulo-36 checksum calculation
 */
const GSTIN_CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Calculates the statutory 15th check character for a 14-character GSTIN prefix using Modulo-36.
 */
export const calculateGSTINChecksum = (gstin14: string): string => {
  if (!gstin14 || gstin14.length < 14) return '';
  const clean = gstin14.substring(0, 14).toUpperCase();
  let sum = 0;

  for (let i = 0; i < 14; i++) {
    const char = clean[i];
    const val = GSTIN_CHARSET.indexOf(char);
    if (val === -1) return '';
    const factor = i % 2 === 0 ? 1 : 2;
    const product = val * factor;
    sum += Math.floor(product / 36) + (product % 36);
  }

  const remainder = sum % 36;
  const checkDigitIndex = (36 - remainder) % 36;
  return GSTIN_CHARSET[checkDigitIndex] || '';
};

/**
 * Verifies whether a 15-character GSTIN passes the statutory Modulo-36 checksum algorithm.
 */
export const verifyGSTINChecksum = (gstin: string): boolean => {
  if (!gstin || typeof gstin !== 'string') return false;
  const clean = gstin.trim().toUpperCase();
  if (clean.length !== 15) return false;
  const expected = calculateGSTINChecksum(clean.substring(0, 14));
  return clean[14] === expected;
};

/**
 * Extracts the 2-digit state code from a 15-digit GSTIN or returns an empty string.
 */
export const extractStateFromGSTIN = (gstin: string): string => {
  if (!gstin || typeof gstin !== 'string') return '';
  const trimmed = gstin.trim();
  if (/^\d{2}[A-Z0-9]{13}$/i.test(trimmed)) {
    const prefix = trimmed.substring(0, 2);
    return LEGACY_STATE_CODE_MAP[prefix] || prefix;
  }
  return '';
};

/**
 * Extracts the 10-character Permanent Account Number (PAN) from a 15-digit GSTIN.
 */
export const extractPanFromGSTIN = (gstin: string): string => {
  if (!gstin || typeof gstin !== 'string') return '';
  const trimmed = gstin.trim().toUpperCase();
  if (trimmed.length === 15) {
    const pan = trimmed.substring(2, 12);
    if (PAN_REGEX.test(pan)) {
      return pan;
    }
  }
  return '';
};

/**
 * Resolves a 2-digit GST state code from a state name or GSTIN string.
 */
export const getStateCode = (stateOrGstin: string): string => {
  if (!stateOrGstin || typeof stateOrGstin !== 'string') return '';
  const s = stateOrGstin.trim();
  if (/^\d{2}[A-Z0-9]{13}$/i.test(s)) {
    const prefix = s.substring(0, 2);
    return LEGACY_STATE_CODE_MAP[prefix] || prefix;
  }
  const code = GST_STATE_CODES[s.toLowerCase()] || '';
  return LEGACY_STATE_CODE_MAP[code] || code;
};

/**
 * Identifies whether a given GST state code represents a Union Territory without its own legislature.
 */
export const isUnionTerritoryWithoutLegislature = (stateCode: string | number): boolean => {
  if (!stateCode) return false;
  return UTS_WITHOUT_LEGISLATURE.has(String(stateCode).padStart(2, '0'));
};

export interface GSTINValidationResult {
  ok: boolean;
  message: string;
  stateCode?: string;
  pan?: string;
  isChecksumValid?: boolean;
}

/**
 * Validates an Indian Goods and Services Tax Identification Number (GSTIN).
 */
export const validateGSTIN = (gstin: string, strictChecksum: boolean = false): GSTINValidationResult => {
  if (!gstin || !gstin.trim()) {
    return { ok: true, message: '' }; // Optional field
  }

  const clean = gstin.trim().toUpperCase();

  if (clean.length !== 15) {
    return {
      ok: false,
      message: `GSTIN must be exactly 15 characters long (currently ${clean.length}).`,
    };
  }

  if (!GSTIN_REGEX.test(clean)) {
    return {
      ok: false,
      message: 'Invalid GSTIN format. Expected format: 22AAAAA0000A1Z5',
    };
  }

  const stateCode = clean.substring(0, 2);
  const pan = clean.substring(2, 12);
  const checksumMatch = verifyGSTINChecksum(clean);

  if (strictChecksum && !checksumMatch) {
    const expected = calculateGSTINChecksum(clean.substring(0, 14));
    return {
      ok: false,
      message: `Invalid GSTIN checksum digit. Expected '${expected}', got '${clean[14]}'.`,
      stateCode,
      pan,
      isChecksumValid: false,
    };
  }

  return {
    ok: true,
    message: '',
    stateCode,
    pan,
    isChecksumValid: checksumMatch,
  };
};

export interface PANValidationResult {
  ok: boolean;
  message: string;
}

/**
 * Validates an Indian Permanent Account Number (PAN).
 */
export const validatePAN = (pan: string): PANValidationResult => {
  if (!pan || !pan.trim()) {
    return { ok: true, message: '' }; // Optional field
  }

  const clean = pan.trim().toUpperCase();

  if (clean.length !== 10) {
    return {
      ok: false,
      message: `PAN must be exactly 10 characters (currently ${clean.length}).`,
    };
  }

  if (!PAN_REGEX.test(clean)) {
    return {
      ok: false,
      message: 'Invalid PAN format. Expected 5 letters, 4 numbers, 1 letter (e.g. ABCDE1234F).',
    };
  }

  return { ok: true, message: '' };
};

export interface IFSCValidationResult {
  ok: boolean;
  message: string;
}

/**
 * Validates an Indian Financial System Code (IFSC).
 */
export const validateIFSC = (ifsc: string): IFSCValidationResult => {
  if (!ifsc || !ifsc.trim()) {
    return { ok: true, message: '' }; // Optional field
  }

  const clean = ifsc.trim().toUpperCase();

  if (clean.length !== 11) {
    return {
      ok: false,
      message: `IFSC must be exactly 11 characters (currently ${clean.length}).`,
    };
  }

  if (!IFSC_REGEX.test(clean)) {
    return {
      ok: false,
      message: 'Invalid IFSC format. Expected 4 letters, 0, then 6 alphanumeric characters (e.g. HDFC0001234).',
    };
  }

  return { ok: true, message: '' };
};

/**
 * Validates whether a given string is a valid UPI Virtual Payment Address (VPA).
 */
export const isValidUpiId = (s: string): boolean => {
  if (!s) return false;
  return UPI_REGEX.test(String(s).trim());
};

/**
 * Helper to retrieve country configuration based on country name or code.
 */
export const getCountryConfig = (countryName?: string) => {
  if (!countryName) return COUNTRIES[0]; // default India
  return (
    COUNTRIES.find((c) => c.name === countryName) ||
    COUNTRIES.find((c) => c.code === countryName) ||
    COUNTRIES[COUNTRIES.length - 1]
  );
};

export interface TaxIdValidationResult {
  ok: boolean;
  message: string;
}

/**
 * Validates tax identifiers across India (GSTIN) and international jurisdictions (VAT/SST/ABN/etc.).
 */
export const validateTaxId = (countryName: string, value: string): TaxIdValidationResult => {
  if (!value || !value.trim()) return { ok: true, message: '' };
  const cc = getCountryConfig(countryName);
  if (!cc.taxIdRegex) return { ok: true, message: '' };
  const ok = cc.taxIdRegex.test(value.trim().toUpperCase());
  return ok
    ? { ok: true, message: '' }
    : {
        ok: false,
        message: `${cc.taxIdLabel} format looks unusual. Expected like: ${cc.taxIdPlaceholder}`,
      };
};

export const htmlHasText = (html?: string): boolean => {
  if (!html) return false;
  try {
    const doc = new DOMParser().parseFromString(String(html), 'text/html');
    return (doc.body?.textContent || '').trim().length > 0;
  } catch {
    return String(html).replace(/<[^>]*>/g, '').trim().length > 0;
  }
};

export const splitNumberedTerms = (html?: string): string => {
  if (!html || typeof html !== 'string') return html || '';
  if (/<(li|br)[ />]/i.test(html)) return html;
  const marker = /(^|[\s>])(\d{1,2})\.\s+/g;
  const count = (html.match(marker) || []).length;
  if (count < 3) return html;
  let seen = 0;
  return html.replace(marker, (m, pre, num) => {
    seen += 1;
    return seen === 1 ? m : `${pre}<br />${num}. `;
  });
};
