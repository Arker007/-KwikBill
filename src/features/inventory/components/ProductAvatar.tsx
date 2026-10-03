import React from 'react';

export interface ProductAvatarProps {
  name: string;
  category?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const colorPairs = [
  { bg: 'bg-[#f0f5ff] dark:bg-[rgba(22,119,255,0.18)]', text: 'text-[#2f54eb] dark:text-[#85a5ff]', border: 'border-[#adc6ff] dark:border-[rgba(22,119,255,0.3)]' },
  { bg: 'bg-[#f9f0ff] dark:bg-[rgba(114,46,209,0.18)]', text: 'text-[#722ed1] dark:text-[#b37feb]', border: 'border-[#d3adf7] dark:border-[rgba(114,46,209,0.3)]' },
  { bg: 'bg-[#e6f4ff] dark:bg-[rgba(22,119,255,0.15)]', text: 'text-[#1677ff] dark:text-[#69b1ff]', border: 'border-[#91caff] dark:border-[rgba(22,119,255,0.25)]' },
  { bg: 'bg-[#f6ffed] dark:bg-[rgba(82,196,26,0.18)]', text: 'text-[#52c41a] dark:text-[#95de64]', border: 'border-[#b7eb8f] dark:border-[rgba(82,196,26,0.3)]' },
  { bg: 'bg-[#fffbe6] dark:bg-[rgba(250,173,20,0.18)]', text: 'text-[#d48806] dark:text-[#ffd666]', border: 'border-[#ffe58f] dark:border-[rgba(250,173,20,0.3)]' },
  { bg: 'bg-[#fff0f6] dark:bg-[rgba(235,47,150,0.18)]', text: 'text-[#c41d7f] dark:text-[#ff85c0]', border: 'border-[#ffadd2] dark:border-[rgba(235,47,150,0.3)]' },
  { bg: 'bg-[#e6fffb] dark:bg-[rgba(19,194,194,0.18)]', text: 'text-[#08979c] dark:text-[#5cdbd3]', border: 'border-[#87e8de] dark:border-[rgba(19,194,194,0.3)]' },
];

function getInitials(name: string): string {
  if (!name) return 'IT';
  const clean = name.trim().replace(/[^a-zA-Z0-9 ]/g, '');
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'IT';
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export const ProductAvatar: React.FC<ProductAvatarProps> = ({
  name,
  category,
  className = '',
  size = 'md',
}) => {
  const seed = (category ? `${category}_${name}` : name) || 'Item';
  const colorIndex = hashString(seed) % colorPairs.length;
  const colors = colorPairs[colorIndex];
  const initials = getInitials(name);

  const sizeClass =
    size === 'sm'
      ? 'w-8 h-8 text-xs'
      : size === 'lg'
      ? 'w-12 h-12 text-base'
      : 'w-10 h-10 text-sm';

  return (
    <div
      className={`rounded-full shrink-0 flex items-center justify-center font-bold tracking-tight border select-none transition-transform duration-150 ${sizeClass} ${colors.bg} ${colors.text} ${colors.border} ${className}`.trim()}
      title={name}
      aria-label={name}
    >
      {initials}
    </div>
  );
};
