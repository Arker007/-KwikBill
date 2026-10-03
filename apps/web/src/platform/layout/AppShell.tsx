import React from 'react';
import { FileText } from 'lucide-react';

export interface AppShellProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  bannerHost?: React.ReactNode;
  serverDown?: boolean;
  contentClassName?: string;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  header,
  sidebar,
  bannerHost,
  serverDown = false,
  contentClassName = '',
}) => {
  if (serverDown) {
    return (
      <div className="server-down-overlay">
        <div className="server-down-modal">
          <FileText size={48} color="#3b82f6" />
          <h2>Free GST Billing Software Needs a Quick Start</h2>
          <p>
            Your data is <strong>100% safe</strong> on your computer — nothing is lost.
            The app just needs to be started once.
          </p>
          <a href="freegstbill://start" className="server-start-btn">
            Open GST Billing
          </a>
          <div className="server-down-steps">
            <p className="server-down-hint">Or start manually:</p>
            <ol>
              <li>Double-click <strong>Free GST Billing Software</strong> on your Desktop</li>
              <li>Or search <strong>"Free GST Billing"</strong> in Start Menu</li>
            </ol>
          </div>
          <p className="server-down-safe">
            All your invoices, clients, and data are safely stored on your computer. They are never deleted or shared.
          </p>
          <div className="server-down-waiting">
            <div className="server-down-spinner" />
            <span>Starting... this page will open automatically.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {bannerHost}
      {header}
      <div className="app-body">
        {sidebar}
        <main className={`main-content ${contentClassName}`.trim()} id="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
