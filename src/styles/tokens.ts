/**
 * Ant Design (AntD v5) Design Tokens — TypeScript Definition
 *
 * Implements Ant Design's two-level color system:
 * 1. System-Level Color System: 12 Base Palettes (120 derivative steps), Neutral Palette, and Data Viz Palette.
 * 2. Product-Level Color System: Brand Color, Functional Colors (Success, Warning, Error/Danger, Info), and Neutral Text/Surfaces.
 * 
 * Follows enterprise design principles: 60-30-10 color allocation, restrained operational signaling, and WCAG AA contrast.
 */

export const AntSeedTokens = {
  colorPrimary: '#1677ff',
  colorSuccess: '#52c41a',
  colorWarning: '#faad14',
  colorError: '#ff4d4f',
  colorInfo: '#1677ff',
  colorTextBase: '#000000',
  colorBgBase: '#ffffff',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
  fontSize: 14,
  lineWidth: 1,
  lineType: 'solid',
  borderRadius: 6,
  sizeUnit: 4,
  sizeStep: 4,
} as const;

/**
 * Ant Design 12 System-Level Color Palettes (120 Derivative Colors)
 * Step 6 is the primary baseline hue for each palette.
 */
export const AntColorPalettes = {
  blue: {
    1: '#e6f4ff',
    2: '#bae0ff',
    3: '#91caff',
    4: '#69b1ff',
    5: '#4096ff',
    6: '#1677ff', // Brand Primary
    7: '#0958d9',
    8: '#003eb3',
    9: '#002c8c',
    10: '#001d66',
  },
  purple: {
    1: '#f9f0ff',
    2: '#efdbff',
    3: '#d3adf7',
    4: '#b37feb',
    5: '#9254de',
    6: '#722ed1',
    7: '#531dab',
    8: '#391085',
    9: '#22075e',
    10: '#120338',
  },
  cyan: {
    1: '#e6fffb',
    2: '#b5f5ec',
    3: '#87e8de',
    4: '#5cdbd3',
    5: '#36cfc9',
    6: '#13c2c2',
    7: '#08979c',
    8: '#006d75',
    9: '#00474f',
    10: '#002329',
  },
  green: {
    1: '#f6ffed',
    2: '#d9f7be',
    3: '#b7eb8f',
    4: '#95de64',
    5: '#73d13d',
    6: '#52c41a', // Success Base
    7: '#389e0d',
    8: '#237804',
    9: '#135200',
    10: '#092b00',
  },
  magenta: {
    1: '#fff0f6',
    2: '#ffd6e7',
    3: '#ffadd2',
    4: '#ff85c0',
    5: '#f759ab',
    6: '#eb2f96',
    7: '#c41d7f',
    8: '#9e1068',
    9: '#780650',
    10: '#520339',
  },
  pink: {
    1: '#fff0f6',
    2: '#ffd6e7',
    3: '#ffadd2',
    4: '#ff85c0',
    5: '#f759ab',
    6: '#eb2f96',
    7: '#c41d7f',
    8: '#9e1068',
    9: '#780650',
    10: '#520339',
  },
  red: {
    1: '#fff1f0',
    2: '#ffccc7',
    3: '#ffa39e',
    4: '#ff7875',
    5: '#ff4d4f',
    6: '#f5222d', // Error Base
    7: '#cf1322',
    8: '#a8071a',
    9: '#820014',
    10: '#5c0011',
  },
  orange: {
    1: '#fff7e6',
    2: '#ffe7ba',
    3: '#ffd591',
    4: '#ffc069',
    5: '#ffa940',
    6: '#fa8c16',
    7: '#d46b08',
    8: '#ad4e00',
    9: '#873800',
    10: '#612500',
  },
  yellow: {
    1: '#feffe6',
    2: '#ffffb8',
    3: '#fffb8f',
    4: '#fff566',
    5: '#ffec3d',
    6: '#fadb14',
    7: '#d4b106',
    8: '#ad8b00',
    9: '#876800',
    10: '#614700',
  },
  volcano: {
    1: '#fff2e8',
    2: '#ffd8bf',
    3: '#ffbb96',
    4: '#ff9c6e',
    5: '#ff7a45',
    6: '#fa541c',
    7: '#d4380d',
    8: '#ad2102',
    9: '#871400',
    10: '#610b00',
  },
  geekblue: {
    1: '#f0f5ff',
    2: '#d6e4ff',
    3: '#adc6ff',
    4: '#85a5ff',
    5: '#597ef7',
    6: '#2f54eb',
    7: '#1d39c4',
    8: '#10239e',
    9: '#061178',
    10: '#030852',
  },
  lime: {
    1: '#fcffe6',
    2: '#f4ffb8',
    3: '#eaff8f',
    4: '#d3f261',
    5: '#a0d911',
    6: '#7cb305',
    7: '#5b8c00',
    8: '#3f6600',
    9: '#254000',
    10: '#142b00',
  },
  gold: {
    1: '#fffbe6',
    2: '#fff1b8',
    3: '#ffe58f',
    4: '#ffd666',
    5: '#ffc53d',
    6: '#faad14', // Warning Base
    7: '#d48806',
    8: '#ad6800',
    9: '#874d00',
    10: '#613400',
  },
} as const;

/**
 * Product-Level Semantic Functional Color Tokens
 */
export const AntFunctionalTokens = {
  brand: {
    primary: AntColorPalettes.blue[6],
    hover: AntColorPalettes.blue[5],
    active: AntColorPalettes.blue[7],
    bg: AntColorPalettes.blue[1],
    border: AntColorPalettes.blue[3],
  },
  success: {
    primary: AntColorPalettes.green[6],
    hover: AntColorPalettes.green[5],
    active: AntColorPalettes.green[7],
    bg: AntColorPalettes.green[1],
    border: AntColorPalettes.green[3],
  },
  warning: {
    primary: AntColorPalettes.gold[6],
    hover: AntColorPalettes.gold[5],
    active: AntColorPalettes.gold[7],
    bg: AntColorPalettes.gold[1],
    border: AntColorPalettes.gold[3],
  },
  error: {
    primary: '#ff4d4f', // Ant Design standard red error seed
    hover: '#ff7875',
    active: '#d9363e',
    bg: '#fff2f0',
    border: '#ffccc7',
  },
  info: {
    primary: AntColorPalettes.blue[6],
    hover: AntColorPalettes.blue[5],
    active: AntColorPalettes.blue[7],
    bg: AntColorPalettes.blue[1],
    border: AntColorPalettes.blue[3],
  },
} as const;

/**
 * Product-Level Neutral Palette Tokens (WCAG 2.0 Compliant Transparency Scales)
 */
export const AntNeutralTokens = {
  light: {
    colorTextHeading: 'rgba(0, 0, 0, 0.88)',
    colorText: 'rgba(0, 0, 0, 0.88)',
    colorTextSecondary: 'rgba(0, 0, 0, 0.65)',
    colorTextTertiary: 'rgba(0, 0, 0, 0.45)',
    colorTextQuaternary: 'rgba(0, 0, 0, 0.25)',
    colorTextDisabled: 'rgba(0, 0, 0, 0.25)',
    colorBorder: '#d9d9d9',
    colorBorderSecondary: '#f0f0f0',
    colorSplit: 'rgba(5, 5, 5, 0.06)',
    colorBgLayout: '#f5f5f5',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgSpotlight: 'rgba(0, 0, 0, 0.85)',
    colorBgMask: 'rgba(0, 0, 0, 0.45)',
    colorFill: 'rgba(0, 0, 0, 0.15)',
    colorFillSecondary: 'rgba(0, 0, 0, 0.06)',
    colorFillTertiary: 'rgba(0, 0, 0, 0.04)',
    colorFillQuaternary: 'rgba(0, 0, 0, 0.02)',
  },
  dark: {
    colorTextHeading: 'rgba(255, 255, 255, 0.85)',
    colorText: 'rgba(255, 255, 255, 0.85)',
    colorTextSecondary: 'rgba(255, 255, 255, 0.65)',
    colorTextTertiary: 'rgba(255, 255, 255, 0.45)',
    colorTextQuaternary: 'rgba(255, 255, 255, 0.25)',
    colorTextDisabled: 'rgba(255, 255, 255, 0.25)',
    colorBorder: '#424242',
    colorBorderSecondary: '#303030',
    colorSplit: 'rgba(253, 253, 253, 0.12)',
    colorBgLayout: '#000000',
    colorBgContainer: '#141414',
    colorBgElevated: '#1f1f1f',
    colorBgSpotlight: '#424242',
    colorBgMask: 'rgba(0, 0, 0, 0.45)',
    colorFill: 'rgba(255, 255, 255, 0.18)',
    colorFillSecondary: 'rgba(255, 255, 255, 0.12)',
    colorFillTertiary: 'rgba(255, 255, 255, 0.08)',
    colorFillQuaternary: 'rgba(255, 255, 255, 0.04)',
  },
} as const;

export const AntControlTokens = {
  controlHeightSM: 24,
  controlHeight: 32,
  controlHeightLG: 40,
  borderRadiusXS: 2,
  borderRadiusSM: 4,
  borderRadius: 6,
  borderRadiusLG: 8,
  borderRadiusXL: 12,
  borderRadiusOuter: 10,
} as const;

export const AntSpacingTokens = {
  sizeUnit: 4,
  sizeStep: 4,
  paddingXXS: 4,
  paddingXS: 8,
  paddingSM: 12,
  padding: 16,
  paddingMD: 16,
  paddingLG: 24,
  paddingXL: 32,
  marginXXS: 4,
  marginXS: 8,
  marginSM: 12,
  margin: 16,
  marginMD: 16,
  marginLG: 24,
  marginXL: 32,
  marginXXL: 48,
} as const;

export const AntMotionTokens = {
  // Timing Functions
  easeOut: 'cubic-bezier(0.215, 0.61, 0.355, 1)', // Natural entrance & deceleration
  easeIn: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)', // Fast exit & acceleration
  easeInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)', // Continuous state transitions
  easeOutBack: 'cubic-bezier(0.18, 0.89, 0.32, 1.28)', // Rebound & physical spring feedback
  easeSmooth: 'cubic-bezier(0.2, 0, 0, 1)', // Restrained smooth camera/layout glide

  // Durations
  durationFast: '0.1s', // Micro-interactions: button active, toggle, icon feedback
  durationMid: '0.2s', // Standard: dropdowns, accordions, popovers, tooltips
  durationSlow: '0.28s', // Structural: modals, drawers, view transitions
  durationExit: '0.14s', // Rapid dismiss: exits move faster than entrances
} as const;

/**
 * Motion presets for motion/react (framer-motion) and React transitions
 * Enforces Ant Design Motion Core Principles: Natural, Performant, Concise.
 */
export const AntMotionPresets = {
  // Button press feedback: subtle depress and physics-inspired rebound
  buttonPress: {
    scale: 0.98,
    transition: { duration: 0.1, ease: [0.215, 0.61, 0.355, 1] },
  },
  // Fade & Slide in (Modals / Cards / Tooltips)
  fadeIn: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.96 },
    transition: { duration: 0.2, ease: [0.215, 0.61, 0.355, 1] },
  },
  // Concise fast exit for dismissals (disappear simultaneously, faster velocity)
  fastExit: {
    exit: { opacity: 0, scale: 0.97 },
    transition: { duration: 0.14, ease: [0.55, 0.055, 0.675, 0.19] },
  },
  // Accordion reveal
  accordion: {
    initial: { height: 0, opacity: 0 },
    animate: { height: 'auto', opacity: 1 },
    exit: { height: 0, opacity: 0 },
    transition: { duration: 0.2, ease: [0.215, 0.61, 0.355, 1] },
  },
} as const;

/**
 * CSS Variable Names for Ant Design Tokens
 */
export const AntCssVars = {
  // Primary / Brand
  colorPrimary: 'var(--ant-color-primary)',
  colorPrimaryHover: 'var(--ant-color-primary-hover)',
  colorPrimaryActive: 'var(--ant-color-primary-active)',
  colorPrimaryBg: 'var(--ant-color-primary-bg)',
  colorPrimaryBorder: 'var(--ant-color-primary-border)',

  // Success
  colorSuccess: 'var(--ant-color-success)',
  colorSuccessBg: 'var(--ant-color-success-bg)',
  colorSuccessBorder: 'var(--ant-color-success-border)',

  // Warning
  colorWarning: 'var(--ant-color-warning)',
  colorWarningBg: 'var(--ant-color-warning-bg)',
  colorWarningBorder: 'var(--ant-color-warning-border)',

  // Error
  colorError: 'var(--ant-color-error)',
  colorErrorBg: 'var(--ant-color-error-bg)',
  colorErrorBorder: 'var(--ant-color-error-border)',

  // Neutral Text
  colorText: 'var(--ant-color-text)',
  colorTextHeading: 'var(--ant-color-text-heading)',
  colorTextSecondary: 'var(--ant-color-text-secondary)',
  colorTextTertiary: 'var(--ant-color-text-tertiary)',
  colorTextQuaternary: 'var(--ant-color-text-quaternary)',
  colorTextDisabled: 'var(--ant-color-text-disabled)',

  // Background
  colorBgLayout: 'var(--ant-color-bg-layout)',
  colorBgContainer: 'var(--ant-color-bg-container)',
  colorBgElevated: 'var(--ant-color-bg-elevated)',
  colorBgSider: 'var(--ant-color-bg-sider)',

  // Border & Fill
  colorBorder: 'var(--ant-color-border)',
  colorBorderSecondary: 'var(--ant-color-border-secondary)',
  colorSplit: 'var(--ant-color-split)',
  colorFill: 'var(--ant-color-fill)',
  colorFillSecondary: 'var(--ant-color-fill-secondary)',
  colorFillTertiary: 'var(--ant-color-fill-tertiary)',

  // Elevation
  boxShadow: 'var(--ant-box-shadow)',
  boxShadowSecondary: 'var(--ant-box-shadow-secondary)',
  boxShadowTertiary: 'var(--ant-box-shadow-tertiary)',

  // Directional 3-Layer Shadow Tokens
  shadow0: 'var(--ant-shadow-0)',
  shadow1Up: 'var(--ant-shadow-1-up)',
  shadow1Down: 'var(--ant-shadow-1-down)',
  shadow1Left: 'var(--ant-shadow-1-left)',
  shadow1Right: 'var(--ant-shadow-1-right)',

  shadow2Up: 'var(--ant-shadow-2-up)',
  shadow2Down: 'var(--ant-shadow-2-down)',
  shadow2Left: 'var(--ant-shadow-2-left)',
  shadow2Right: 'var(--ant-shadow-2-right)',

  shadow3Up: 'var(--ant-shadow-3-up)',
  shadow3Down: 'var(--ant-shadow-3-down)',
  shadow3Left: 'var(--ant-shadow-3-left)',
  shadow3Right: 'var(--ant-shadow-3-right)',
} as const;

/**
 * Ant Design v4 Three-Layer Shadow System
 * 
 * Levels:
 * - L0: Ground level (inputs, flat containers)
 * - L1: Low elevation (hover cards, raised interactive elements)
 * - L2: Medium elevation (anchored floating elements: dropdowns, popovers, select menus)
 * - L3: High elevation (independent elevated overlays: dialogs, modals, drawers, toasts)
 * 
 * Directions:
 * - down: Default (components, cards, modals, popovers)
 * - up: Bottom navigation, floating action toolbars
 * - left: Right-side navigation, drawers, sticky headers
 * - right: Left-side navigation, sidebar, drawers
 */
export const AntShadowTokens = {
  // L0: Ground-level (no defined shadow)
  0: 'none',
  none: 'none',

  // L1: Low Elevation (interactive hover / transient elevation)
  1: {
    up: '0px -1px 2px -2px rgba(0, 0, 0, 0.16), 0px -3px 6px 0px rgba(0, 0, 0, 0.12), 0px -5px 12px 4px rgba(0, 0, 0, 0.09)',
    down: '0px 1px 2px -2px rgba(0, 0, 0, 0.16), 0px 3px 6px 0px rgba(0, 0, 0, 0.12), 0px 5px 12px 4px rgba(0, 0, 0, 0.09)',
    left: '-1px 0px 2px -2px rgba(0, 0, 0, 0.16), -3px 0px 6px 0px rgba(0, 0, 0, 0.12), -5px 0px 12px 4px rgba(0, 0, 0, 0.09)',
    right: '1px 0px 2px -2px rgba(0, 0, 0, 0.16), 3px 0px 6px 0px rgba(0, 0, 0, 0.12), 5px 0px 12px 4px rgba(0, 0, 0, 0.09)',
  },

  // L2: Medium Elevation (anchored floating elements)
  2: {
    up: '0px -3px 6px -4px rgba(0, 0, 0, 0.12), 0px -6px 16px 0px rgba(0, 0, 0, 0.08), 0px -9px 28px 8px rgba(0, 0, 0, 0.05)',
    down: '0px 3px 6px -4px rgba(0, 0, 0, 0.12), 0px 6px 16px 0px rgba(0, 0, 0, 0.08), 0px 9px 28px 8px rgba(0, 0, 0, 0.05)',
    left: '-3px 0px 6px -4px rgba(0, 0, 0, 0.12), -6px 0px 16px 0px rgba(0, 0, 0, 0.08), -9px 0px 28px 8px rgba(0, 0, 0, 0.05)',
    right: '3px 0px 6px -4px rgba(0, 0, 0, 0.12), 6px 0px 16px 0px rgba(0, 0, 0, 0.08), 9px 0px 28px 8px rgba(0, 0, 0, 0.05)',
  },

  // L3: High Elevation (independent overlays & dialogs)
  3: {
    up: '0px -6px 16px -8px rgba(0, 0, 0, 0.08), 0px -9px 28px 0px rgba(0, 0, 0, 0.05), 0px -12px 48px 16px rgba(0, 0, 0, 0.03)',
    down: '0px 6px 16px -8px rgba(0, 0, 0, 0.08), 0px 9px 28px 0px rgba(0, 0, 0, 0.05), 0px 12px 48px 16px rgba(0, 0, 0, 0.03)',
    left: '-6px 0px 16px -8px rgba(0, 0, 0, 0.08), -9px 0px 28px 0px rgba(0, 0, 0, 0.05), -12px 0px 48px 16px rgba(0, 0, 0, 0.03)',
    right: '6px 0px 16px -8px rgba(0, 0, 0, 0.08), 9px 0px 28px 0px rgba(0, 0, 0, 0.05), 12px 0px 48px 16px rgba(0, 0, 0, 0.03)',
  },
} as const;

export type AntShadowLevel = 0 | 1 | 2 | 3;
export type AntShadowDirection = 'up' | 'down' | 'left' | 'right';

export type AntCssVarKey = keyof typeof AntCssVars;
