import React, { useEffect, ReactNode } from 'react';
import { notification as antdNotification, ConfigProvider } from 'antd';
import type { NotificationArgsProps } from 'antd';
import { useIsDarkMode, getAntdTheme } from '../primitives/AntdThemeConfig';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationOptions {
  title: ReactNode;
  description?: ReactNode;
  message?: ReactNode; // Alias for title
  type?: NotificationType;
  duration?: number; // In seconds. 0 means persistent until closed. Default: 4.5
  key?: string;
  btn?: ReactNode;
  icon?: ReactNode;
  onClose?: () => void;
  placement?: 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft';
}

type NotificationFn = (options: NotificationOptions) => void;
type DestroyFn = (key?: string) => void;

let globalNotifyFn: NotificationFn | null = null;
let globalDestroyFn: DestroyFn | null = null;

/**
 * Global notification service: upper-right, system-initiated global information.
 */
export const notify = {
  open: (options: NotificationOptions): void => {
    if (globalNotifyFn) {
      globalNotifyFn(options);
    } else {
      antdNotification.open({
        title: options.title || options.message,
        description: options.description,
        duration: options.duration ?? 4.5,
        key: options.key,
        actions: options.btn,
        icon: options.icon,
        onClose: options.onClose,
        placement: options.placement || 'topRight',
      } as any);
    }
  },
  info: (title: ReactNode, description?: ReactNode, options?: Partial<NotificationOptions>): void => {
    notify.open({ ...options, title, description, type: 'info' });
  },
  success: (title: ReactNode, description?: ReactNode, options?: Partial<NotificationOptions>): void => {
    notify.open({ ...options, title, description, type: 'success' });
  },
  warning: (title: ReactNode, description?: ReactNode, options?: Partial<NotificationOptions>): void => {
    notify.open({ ...options, title, description, type: 'warning' });
  },
  error: (title: ReactNode, description?: ReactNode, options?: Partial<NotificationOptions>): void => {
    notify.open({ ...options, title, description, type: 'error' });
  },
  destroy: (key?: string): void => {
    if (globalDestroyFn) {
      globalDestroyFn(key);
    } else {
      antdNotification.destroy(key);
    }
  },
};

/**
 * Top-level Notification container component providing upper-right Ant Design notification rendering.
 */
export function NotificationContainer(): React.ReactElement {
  const isDark = useIsDarkMode();
  const [api, contextHolder] = antdNotification.useNotification({
    placement: 'topRight',
    duration: 4.5,
  });

  useEffect(() => {
    globalNotifyFn = (options: NotificationOptions) => {
      const type = options.type || 'info';
      const msg = options.title || options.message;
      const fn = type in api && typeof (api as any)[type] === 'function' ? (api as any)[type] : api.open;

      fn({
        title: msg,
        description: options.description,
        duration: options.duration !== undefined ? options.duration : 4.5,
        key: options.key,
        actions: options.btn,
        icon: options.icon,
        onClose: options.onClose,
        placement: options.placement || 'topRight',
      } as any);
    };

    globalDestroyFn = (key?: string) => {
      api.destroy(key);
    };

    return () => {
      globalNotifyFn = null;
      globalDestroyFn = null;
    };
  }, [api]);

  return (
    <ConfigProvider theme={getAntdTheme(isDark)}>
      {contextHolder}
    </ConfigProvider>
  );
}

export default NotificationContainer;
