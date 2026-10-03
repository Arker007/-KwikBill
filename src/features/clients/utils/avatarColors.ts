/**
 * Deterministic pastel avatar color pair generator for customer initials matching code.html
 */
const COLOR_PAIRS = [
  { bg: 'bg-[#fed7aa]', text: 'text-[#9a3412]' }, // VE - orange-200 / orange-800
  { bg: 'bg-[#fde68a]', text: 'text-[#854d0e]' }, // VP - amber-200 / amber-800
  { bg: 'bg-[#fed7aa]', text: 'text-[#c2410c]' }, // UF - orange-200 / orange-700
  { bg: 'bg-[#ccfbf1]', text: 'text-[#0f766e]' }, // RL - teal-100 / teal-700
  { bg: 'bg-[#e0f2fe]', text: 'text-[#0369a1]' }, // MS - sky-100 / sky-700
  { bg: 'bg-[#dcfce7]', text: 'text-[#15803d]' }, // CF - green-100 / green-700
  { bg: 'bg-[#d1fae5]', text: 'text-[#065f46]' }, // NF - emerald-100 / emerald-800
  { bg: 'bg-[#ffe4e6]', text: 'text-[#be123c]' }, // DK - rose-100 / rose-700
  { bg: 'bg-[#e0f2fe]', text: 'text-[#0284c7]' }, // AA - sky-100 / sky-600
  { bg: 'bg-[#fce7f3]', text: 'text-[#db2777]' }, // BB - pink-100 / pink-600
  { bg: 'bg-[#fee2e2]', text: 'text-[#dc2626]' }, // AE - red-100 / red-600
  { bg: 'bg-[#fef3c7]', text: 'text-[#d97706]' }, // GA - amber-100 / amber-600
];

export function getAvatarColorPair(name: string) {
  if (!name) return COLOR_PAIRS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLOR_PAIRS.length;
  return COLOR_PAIRS[index];
}

export function getCustomerInitials(name: string) {
  if (!name) return 'CU';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
