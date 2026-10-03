/**
 * Shared Date & Fiscal Year Utilities
 *
 * Provides statutory and fiscal calendar calculations, GST portal date formatters,
 * and compliance due-date tracking for Indian accounting.
 */

export interface FYOption {
  value: string;
  label: string;
  from: string;
  to: string;
}

export interface UpcomingFiling {
  label: string;
  dueDate: string;
  daysAway: number;
}

export interface DateRange {
  from: string;
  to: string;
}

/**
 * Format date as DD-MM-YYYY (GST portal format).
 * Guard against malformed input — invalid dates return empty string rather than 'NaN-NaN-NaN'.
 *
 * @example
 * formatDateGST('2026-04-15') // '15-04-2026'
 */
export const formatDateGST = (dateStr: string | number | Date | null | undefined): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

/**
 * Single definition of "which financial year start calendar year this date belongs to".
 * India's FY runs from 1 April to 31 March.
 *
 * @example
 * getFinancialYearStart(new Date('2027-01-15')) === 2026 // FY 2026-27
 * getFinancialYearStart(new Date('2027-04-01')) === 2027 // FY 2027-28
 */
export const getFinancialYearStart = (date: Date = new Date()): number => {
  const d = date instanceof Date && !isNaN(date.getTime()) ? date : new Date();
  return d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
};

/**
 * Returns "2026-27" — the short form used on invoice numbers and FY dropdowns.
 *
 * @example
 * getFinancialYearLabel(new Date('2026-08-10')) // "2026-27"
 */
export const getFinancialYearLabel = (date: Date = new Date()): string => {
  const y = getFinancialYearStart(date);
  return `${y}-${String(y + 1).slice(-2)}`;
};

/**
 * Fiscal-year dropdown options for the last N years.
 * Generates structured ranges: `{ value: "2026-2027", label: "FY 2026-27", from: "2026-04-01", to: "2027-03-31" }`.
 */
export const getFYOptions = (n: number = 5, today: Date = new Date()): FYOption[] => {
  const currentYear = getFinancialYearStart(today);
  const options: FYOption[] = [];
  for (let i = 0; i < n; i++) {
    const y = currentYear - i;
    options.push({
      value: `${y}-${y + 1}`,
      label: `FY ${y}-${String(y + 1).slice(-2)}`,
      from: `${y}-04-01`,
      to: `${y + 1}-03-31`,
    });
  }
  return options;
};

/**
 * Get filing period as MMYYYY from a date or date string (e.g. for GSTR return periods).
 *
 * @example
 * getFilingPeriod('2026-04-15') // '042026'
 */
export const getFilingPeriod = (dateStr: string | number | Date | null | undefined): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${mm}${d.getFullYear()}`;
};

/**
 * Upcoming Indian GST / TDS / Advance Tax / ITR filing due dates relative to `today`.
 * Returns an ordered list capped at 60 days out for dashboard notification widgets.
 */
export const getUpcomingFilings = (today: Date = new Date()): UpcomingFiling[] => {
  const out: UpcomingFiling[] = [];
  const validToday = today instanceof Date && !isNaN(today.getTime()) ? today : new Date();
  const t = new Date(validToday.getFullYear(), validToday.getMonth(), validToday.getDate());

  const push = (label: string, dueDate: Date) => {
    const diff = Math.round((dueDate.getTime() - t.getTime()) / 86400000);
    if (diff >= 0 && diff <= 60) {
      out.push({ label, dueDate: dueDate.toISOString().split('T')[0], daysAway: diff });
    }
  };

  // Iterate next 3 months to catch upcoming month-end deadlines.
  for (let i = 0; i < 3; i++) {
    const nextMonth = new Date(t.getFullYear(), t.getMonth() + i, 1);
    const m = nextMonth.getMonth();
    const y = nextMonth.getFullYear();
    push(`GSTR-1 (${nextMonth.toLocaleString('en-IN', { month: 'short', year: 'numeric' })})`, new Date(y, m + 1, 11));
    push(`GSTR-3B (${nextMonth.toLocaleString('en-IN', { month: 'short', year: 'numeric' })})`, new Date(y, m + 1, 20));
    // Quarterly TDS / TCS — applies to the quarter the month falls into.
    const quarterEnd = m % 3 === 2; // Mar / Jun / Sep / Dec
    if (quarterEnd) {
      push(`Form 26Q (TDS Q ending ${nextMonth.toLocaleString('en-IN', { month: 'short' })})`, new Date(y, m + 2, 0)); // last day of next month after quarter
      push(`Form 27EQ (TCS Q ending ${nextMonth.toLocaleString('en-IN', { month: 'short' })})`, new Date(y, m + 1, 15));
    }
  }

  // Advance-tax installments (60-day lookahead)
  const advDates = [
    { label: 'Advance Tax Installment 1 (15% cumulative)', date: new Date(t.getFullYear(), 5, 15) },   // 15 Jun
    { label: 'Advance Tax Installment 2 (45% cumulative)', date: new Date(t.getFullYear(), 8, 15) },   // 15 Sep
    { label: 'Advance Tax Installment 3 (75% cumulative)', date: new Date(t.getFullYear(), 11, 15) },  // 15 Dec
    { label: 'Advance Tax Installment 4 (100% — final)',    date: new Date(t.getFullYear() + (t.getMonth() >= 2 ? 1 : 0), 2, 15) }, // 15 Mar
  ];
  advDates.forEach(a => push(a.label, a.date));

  // ITR filing due dates (annually)
  const itrYear = t.getMonth() >= 3 ? t.getFullYear() : t.getFullYear() - 1;
  push('ITR filing (non-audit) — due', new Date(itrYear + 1, 6, 31));  // 31 July
  push('ITR filing (audit / §44AB) — due', new Date(itrYear + 1, 9, 31)); // 31 Oct

  return out.sort((a, b) => a.daysAway - b.daysAway);
};

/**
 * Standard friendly date display formatter (e.g. "15 Apr 2026").
 */
export const formatDisplayDate = (
  dateStr: string | number | Date | null | undefined,
  locale: string = 'en-IN'
): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Checks if a given due date is strictly in the past relative to today or reference date.
 */
export const isOverdue = (
  dueDateStr: string | number | Date | null | undefined,
  referenceDate: Date = new Date()
): boolean => {
  if (!dueDateStr) return false;
  const d = new Date(dueDateStr);
  if (isNaN(d.getTime())) return false;
  const ref = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const due = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return due.getTime() < ref.getTime();
};

/**
 * Returns the ISO date range string for an Indian Fiscal Year Quarter (Q1 = Apr-Jun, Q2 = Jul-Sep, Q3 = Oct-Dec, Q4 = Jan-Mar).
 *
 * @param quarter Quarter index (1, 2, 3, or 4)
 * @param fyStartYear The calendar year in which the financial year starts (e.g. 2026 for FY 2026-27)
 */
export const getQuarterDates = (quarter: 1 | 2 | 3 | 4, fyStartYear: number): DateRange => {
  switch (quarter) {
    case 1:
      return { from: `${fyStartYear}-04-01`, to: `${fyStartYear}-06-30` };
    case 2:
      return { from: `${fyStartYear}-07-01`, to: `${fyStartYear}-09-30` };
    case 3:
      return { from: `${fyStartYear}-10-01`, to: `${fyStartYear}-12-31` };
    case 4:
      return { from: `${fyStartYear + 1}-01-01`, to: `${fyStartYear + 1}-03-31` };
  }
};
