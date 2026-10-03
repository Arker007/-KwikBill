/**
 * Thermal Receipt rendering and layout configurations for 80mm/58mm rolls.
 */

export interface ThermalLayoutOptions {
  widthMm: number;
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  fontFamily: 'mono' | 'sans';
  fontWeight: 'normal' | 'bold' | 'ultra';
  lineSpacing: 'compact' | 'normal' | 'comfortable';
  contrast: 'normal' | 'high' | 'ultra';
}

export const getThermalFontConfig = (options: Partial<ThermalLayoutOptions>, isVeryNarrow: boolean) => {
  const fontSize = options.fontSize || 'medium';
  const fontFamily = options.fontFamily || 'mono';
  const fontWeight = options.fontWeight || 'bold';

  const fontSizeMap: Record<string, number> = {
    small: isVeryNarrow ? 9.5 : 11,
    medium: isVeryNarrow ? 11 : 12.5,
    large: isVeryNarrow ? 12.5 : 14.5,
    xlarge: isVeryNarrow ? 14 : 16.5,
  };

  const fontSizeBase = (fontSizeMap[fontSize] || fontSizeMap.medium) + 'px';

  const fontFamilyCss = fontFamily === 'sans'
    ? '"Arial", "Helvetica", sans-serif'
    : '"Courier New", "Consolas", monospace';

  const baseWeight = fontWeight === 'ultra' ? 800
                   : fontWeight === 'normal' ? 500
                   : 700;

  const strongWeight = Math.min(900, baseWeight + 200);

  return {
    fontSizeBase,
    fontFamilyCss,
    baseWeight,
    strongWeight,
  };
};

export const getThermalContrastFilter = (contrast?: string): string => {
  if (contrast === 'ultra') return 'grayscale(1) contrast(3) brightness(0.85)';
  if (contrast === 'high') return 'grayscale(1) contrast(2) brightness(0.95)';
  return 'grayscale(1) contrast(1.4)';
};
