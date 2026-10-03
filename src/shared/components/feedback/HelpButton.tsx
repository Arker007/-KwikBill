import React, { useState } from 'react';
import { Modal as AntModal, Button as AntButton, ConfigProvider } from 'antd';
import { HelpCircle } from 'lucide-react';
import { useIsDarkMode, getAntdTheme } from '../ui/AntdThemeConfig';

export interface HelpButtonProps {
  title: string;
  body?: React.ReactNode;
  children?: React.ReactNode;
  size?: number;
}

export default function HelpButton({
  title,
  body,
  children,
  size = 18,
}: HelpButtonProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const isDark = useIsDarkMode();

  return (
    <ConfigProvider theme={getAntdTheme(isDark)}>
      <button
        type="button"
        className="icon-btn"
        title="How to use this section"
        onClick={() => setOpen(true)}
        style={{ color: 'var(--primary)' }}
      >
        <HelpCircle size={size} />
      </button>
      <AntModal
        open={open}
        onCancel={() => setOpen(false)}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HelpCircle size={18} style={{ color: '#1677ff' }} />
            <span>{title}</span>
          </div>
        }
        footer={[
          <AntButton key="close" type="primary" onClick={() => setOpen(false)}>
            Close
          </AntButton>
        ]}
        width={560}
        centered
        destroyOnHidden
      >
        <div style={{ fontSize: '0.9rem', lineHeight: 1.55, paddingTop: '0.5rem' }}>
          {children ? children : (
            <div style={{ whiteSpace: 'pre-wrap' }}>{body}</div>
          )}
        </div>
      </AntModal>
    </ConfigProvider>
  );
}

