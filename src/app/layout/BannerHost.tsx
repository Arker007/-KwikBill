import React from 'react';
import { Tooltip } from 'antd';
import { Download, X } from 'lucide-react';

export interface BannerHostProps {
  showInstallBanner?: boolean;
  onInstallPWA?: () => void;
  onDismissInstallBanner?: () => void;
  showResumeSetupPill?: boolean;
  onOpenWizard?: () => void;
}

export const BannerHost: React.FC<BannerHostProps> = ({
  showInstallBanner = false,
  onInstallPWA,
  onDismissInstallBanner,
  showResumeSetupPill = false,
  onOpenWizard,
}) => {
  return (
    <>
      {showInstallBanner && (
        <div className="pwa-install-banner" role="banner" aria-label="App Installation Offer">
          <Download size={18} />
          <span>
            <strong>Install as Desktop App</strong> — own icon, no browser, opens instantly. Right-click the icon for quick-jump to New Invoice / GST Returns.
          </span>
          <button type="button" className="pwa-install-btn" onClick={onInstallPWA}>
            Install App
          </button>
          <Tooltip title="Remind me later (re-shows in 14 days)" placement="bottom" mouseEnterDelay={0.3}>
            <button
              type="button"
              className="pwa-dismiss-btn"
              onClick={onDismissInstallBanner}
            >
              <X size={16} />
            </button>
          </Tooltip>
        </div>
      )}

      {showResumeSetupPill && (
        <Tooltip title="Come back to the setup wizard — pick a business type, paper size, and language." placement="left" mouseEnterDelay={0.3}>
          <button
            type="button"
            onClick={onOpenWizard}
            style={{
              position: 'fixed',
              bottom: '1.25rem',
              right: '1.25rem',
              zIndex: 9998,
              padding: '0.6rem 1rem',
              borderRadius: 999,
              background: 'var(--primary)',
              color: '#fff',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(30,64,175,0.35), 0 2px 4px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            ✨ Finish setup
          </button>
        </Tooltip>
      )}
    </>
  );
};

export default BannerHost;
