import React, { useEffect, ReactNode } from 'react';
import { message as antdMessage, ConfigProvider } from 'antd';
import { useIsDarkMode, getAntdTheme } from '../primitives/AntdThemeConfig';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
}

type ToastNoticeFn = (content: ReactNode, type?: ToastType, duration?: number) => void;

let globalNoticeFn: ToastNoticeFn | null = null;

/**
 * Message: Lightweight, non-blocking, operation-triggered feedback displayed at the top center.
 * Auto-dismisses, typically after 3 seconds.
 * Suitable for brief results that require no prolonged attention; avoid for important failures.
 */
export function toast(messageText: ReactNode, type: ToastType = 'info', duration: number = 3000): void {
  // Convert duration to seconds if provided in milliseconds (> 50)
  const durationSec = duration > 50 ? duration / 1000 : duration;
  if (globalNoticeFn) {
    globalNoticeFn(messageText, type, durationSec);
  } else {
    antdMessage.open({
      type: type === 'loading' ? 'loading' : type,
      content: messageText,
      duration: durationSec,
    });
  }
}

export const message = {
  success: (content: ReactNode, duration: number = 3) => toast(content, 'success', duration),
  info: (content: ReactNode, duration: number = 3) => toast(content, 'info', duration),
  warning: (content: ReactNode, duration: number = 3) => toast(content, 'warning', duration),
  error: (content: ReactNode, duration: number = 3) => toast(content, 'error', duration),
  loading: (content: ReactNode, duration: number = 0) => toast(content, 'loading', duration),
  destroy: () => antdMessage.destroy(),
};

export function ToastContainer(): React.ReactElement {
  const isDark = useIsDarkMode();
  const [messageApi, contextHolder] = antdMessage.useMessage({
    top: 24,
    duration: 3,
    maxCount: 3,
  });

  useEffect(() => {
    globalNoticeFn = (content: ReactNode, type: ToastType = 'info', duration: number = 3) => {
      messageApi.open({
        type: type === 'loading' ? 'loading' : type,
        content,
        duration,
      });
    };
    return () => {
      globalNoticeFn = null;
    };
  }, [messageApi]);

  return (
    <ConfigProvider theme={getAntdTheme(isDark)}>
      {contextHolder}
    </ConfigProvider>
  );
}

export default ToastContainer;

