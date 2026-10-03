import React, { useEffect, useState } from 'react';
import { ConfigProvider, App as AntdApp, theme as antdTheme } from 'antd';
import type { ThemeConfig } from 'antd';

export function useIsDarkMode(): boolean {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document === 'undefined') return false;
    return (
      document.documentElement.classList.contains('dark') ||
      document.body.classList.contains('dark') ||
      document.documentElement.getAttribute('data-theme') === 'dark' ||
      document.body.getAttribute('data-theme') === 'dark' ||
      localStorage.getItem('freegstbill_theme') === 'dark'
    );
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const checkDark = () => {
      const dark =
        document.documentElement.classList.contains('dark') ||
        document.body.classList.contains('dark') ||
        document.documentElement.getAttribute('data-theme') === 'dark' ||
        document.body.getAttribute('data-theme') === 'dark' ||
        localStorage.getItem('freegstbill_theme') === 'dark';
      setIsDark(Boolean(dark));
    };

    checkDark();

    const observer = new MutationObserver(() => {
      checkDark();
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-theme'] });

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'freegstbill_theme') {
        checkDark();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      observer.disconnect();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return isDark;
}

export function getAntdTheme(isDark: boolean): ThemeConfig {
  return {
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: '#1d1d1f',
      colorSuccess: '#52c41a',
      colorWarning: '#faad14',
      colorError: '#ff4d4f',
      colorInfo: '#1d1d1f',
      controlItemBgActive: '#e8e8ed',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      
      // Spacing & Grid System (4px baseline scale)
      sizeUnit: 4,
      sizeStep: 4,
      padding: 16,
      paddingXXS: 4,
      paddingXS: 8,
      paddingSM: 12,
      paddingMD: 16,
      paddingLG: 24,
      paddingXL: 32,

      margin: 16,
      marginXXS: 4,
      marginXS: 8,
      marginSM: 12,
      marginMD: 16,
      marginLG: 24,
      marginXL: 32,
      marginXXL: 48,

      // Border Radii Tokens (Standardized to 6px across system)
      borderRadiusXS: 6,
      borderRadiusSM: 6,
      borderRadius: 6,
      borderRadiusLG: 6,
      borderRadiusOuter: 6,

      // Ant Design Motion System Tokens (Natural, Performant, Concise)
      motion: true,
      motionUnit: 0.1,
      motionBase: 0,
      motionEaseInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
      motionEaseOut: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
      motionEaseOutBack: 'cubic-bezier(0.18, 0.89, 0.32, 1.28)',

      // Typography Scale Tokens
      fontSizeSM: 12,
      fontSize: 14,
      fontSizeLG: 16,
      fontSizeXL: 20,
      fontSizeHeading1: 38,
      fontSizeHeading2: 30,
      fontSizeHeading3: 24,
      fontSizeHeading4: 20,
      fontSizeHeading5: 16,
      lineHeightSM: 1.6667,
      lineHeight: 1.5714,
      lineHeightLG: 1.5,

      // Control Heights
      controlHeightXS: 16,
      controlHeightSM: 24,
      controlHeight: 32,
      controlHeightLG: 40,

      // Elevation & Three-Layer Shadows (Ant Design v4 Physical Model)
      boxShadow: isDark
        ? '0px 1px 2px -2px rgba(0, 0, 0, 0.45), 0px 3px 6px 0px rgba(0, 0, 0, 0.35), 0px 5px 12px 4px rgba(0, 0, 0, 0.25)'
        : '0px 1px 2px -2px rgba(0, 0, 0, 0.16), 0px 3px 6px 0px rgba(0, 0, 0, 0.12), 0px 5px 12px 4px rgba(0, 0, 0, 0.09)',
      boxShadowSecondary: isDark
        ? '0px 3px 6px -4px rgba(0, 0, 0, 0.45), 0px 6px 16px 0px rgba(0, 0, 0, 0.35), 0px 9px 28px 8px rgba(0, 0, 0, 0.25)'
        : '0px 3px 6px -4px rgba(0, 0, 0, 0.12), 0px 6px 16px 0px rgba(0, 0, 0, 0.08), 0px 9px 28px 8px rgba(0, 0, 0, 0.05)',
      boxShadowTertiary: isDark
        ? '0px 6px 16px -8px rgba(0, 0, 0, 0.55), 0px 9px 28px 0px rgba(0, 0, 0, 0.45), 0px 12px 48px 16px rgba(0, 0, 0, 0.35)'
        : '0px 6px 16px -8px rgba(0, 0, 0, 0.08), 0px 9px 28px 0px rgba(0, 0, 0, 0.05), 0px 12px 48px 16px rgba(0, 0, 0, 0.03)',

      // Backgrounds & Borders (Ant Design Neutral System)
      wireframe: false,
      colorBgBase: isDark ? '#000000' : '#ffffff',
      colorBgContainer: isDark ? '#141414' : '#ffffff',
      colorBgElevated: isDark ? '#1f1f1f' : '#ffffff',
      colorBgLayout: isDark ? '#000000' : '#f5f5f5',
      colorBorder: isDark ? '#424242' : '#d9d9d9',
      colorBorderSecondary: isDark ? '#303030' : '#f0f0f0',
      colorSplit: isDark ? 'rgba(253, 253, 253, 0.12)' : 'rgba(5, 5, 5, 0.06)',
      colorText: isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.88)',
      colorTextHeading: isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.88)',
      colorTextSecondary: isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)',
      colorTextTertiary: isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)',
      colorTextQuaternary: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.25)',
      colorFill: isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.15)',
      colorFillSecondary: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)',
      colorFillTertiary: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
      colorFillQuaternary: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
    },
    components: {
      Button: {
        borderRadius: 6,
        controlHeightSM: 24,
        controlHeight: 32,
        controlHeightLG: 40,
        paddingInlineSM: 8,
        paddingInline: 15,
        paddingInlineLG: 18,
      },
      Input: {
        borderRadius: 6,
        controlHeightSM: 24,
        controlHeight: 32,
        controlHeightLG: 40,
        paddingBlock: 4,
        paddingBlockSM: 0,
        paddingBlockLG: 7,
        paddingInline: 11,
        paddingInlineSM: 7,
        paddingInlineLG: 11,
        addonBg: 'rgba(0, 0, 0, 0.02)',
        activeBorderColor: '#1d1d1f',
        hoverBorderColor: '#bec3c9',
        errorActiveShadow: '0 0 0 2px rgba(255, 75, 5, 0.1)',
        warningActiveShadow: '0 0 0 2px rgba(255, 215, 5, 0.1)',
        hoverBg: '#ffffff',
        activeBg: '#ffffff',
        inputFontSize: 14,
        inputFontSizeLG: 16,
        inputFontSizeSM: 14,
      },
      InputNumber: {
        borderRadius: 6,
        controlHeightSM: 24,
        controlHeight: 32,
        controlHeightLG: 40,
        activeBorderColor: '#1d1d1f',
        hoverBorderColor: '#bec3c9',
        hoverBg: '#ffffff',
        activeBg: '#ffffff',
      },
      Select: {
        borderRadius: 6,
        controlHeightSM: 24,
        controlHeight: 32,
        controlHeightLG: 40,
        optionSelectedBg: '#e8e8ed',
        activeBorderColor: '#1d1d1f',
        hoverBorderColor: '#bec3c9',
      },
      DatePicker: {
        borderRadius: 6,
        controlHeightSM: 24,
        controlHeight: 32,
        controlHeightLG: 40,
        activeBorderColor: '#1d1d1f',
        hoverBorderColor: '#bec3c9',
      },
      Card: {
        borderRadiusLG: 6,
        paddingLG: 16,
      },
      Table: {
        borderRadiusLG: 6,
        padding: 10,
        paddingSM: 6,
      },
      Modal: {
        borderRadiusLG: 6,
        paddingContentHorizontalLG: 20,
      },
      Drawer: {
        borderRadiusLG: 6,
      },
      Tabs: {
        borderRadius: 6,
        margin: 12,
      },
      Checkbox: {
        borderRadiusSM: 4,
      },
      Switch: {
        trackHeight: 20,
        trackMinWidth: 38,
      },
      Tag: {
        borderRadiusSM: 6,
      },
      Segmented: {
        borderRadius: 6,
        borderRadiusSM: 6,
      },
      Pagination: {
        borderRadius: 6,
        itemSize: 28,
        itemSizeSM: 24,
      },
      Slider: {
        controlHeight: 32,
      },
      Tooltip: {
        borderRadius: 6,
      },
      Alert: {
        borderRadiusLG: 6,
      },
    },
  };
}

export function useAntdToken() {
  const { token } = antdTheme.useToken();
  return token;
}

export const AntdThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isDark = useIsDarkMode();
  return (
    <ConfigProvider theme={getAntdTheme(isDark)}>
      <AntdApp>
        {children}
      </AntdApp>
    </ConfigProvider>
  );
};
