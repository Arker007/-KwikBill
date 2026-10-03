import React from 'react';
import { Cloud, CloudOff, Database, ArrowRight } from 'lucide-react';
import { BusinessProfileData } from '../types';

interface CloudSyncTabProps {
  selectedSection?: string;
  profile: BusinessProfileData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  driveConnected: boolean;
  connecting: boolean;
  handleConnectDrive: () => Promise<void>;
  handleDisconnectDrive: () => void;
}

export const CloudSyncTab: React.FC<CloudSyncTabProps> = ({
  selectedSection,
  profile,
  handleChange,
  driveConnected,
  connecting,
  handleConnectDrive,
  handleDisconnectDrive,
}) => {
  if (selectedSection && selectedSection !== 'section-cloud') {
    return null;
  }

  return (
    <div id="section-cloud" className="glass-panel p-6 mb-6" style={{ order: 9 }}>
      {/* Dedicated Supabase Cloud Card */}
      <div
        id="supabase-cloud-promo-banner"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.04) 100%)',
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '8px',
                background: '#10b981',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Database size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Supabase Cloud Database (PostgreSQL Hub)
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
                Real-time multi-device sync, schema inspector, auto-backups, and PostgreSQL migration
              </p>
            </div>
          </div>
          <button
            type="button"
            id="open-supabase-hub-from-cloud-btn"
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.set('view', 'supabase');
              window.location.href = url.toString();
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#ffffff',
              background: '#059669',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            Launch Supabase Hub <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <h3 className="section-title">Cloud Backup (Google Drive)</h3>
      <p className="page-subtitle mb-4">
        Auto-sync your invoices to Google Drive — no coding or API setup needed.
      </p>

      {/* Easy method */}
      <div
        style={{
          background: 'var(--bg-secondary, #f8fafc)',
          borderRadius: '10px',
          padding: '1.25rem',
          marginBottom: '1rem',
          border: '1px solid var(--border)',
        }}
      >
        <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Cloud size={18} color="var(--primary)" /> Easiest Way — Google Drive for Desktop (Recommended)
        </h4>
        <ol style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: '1.25rem', margin: 0 }}>
          <li>
            <a
              href="https://www.google.com/drive/download/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--primary)', fontWeight: 600 }}
            >
              Download Google Drive for Desktop
            </a>{' '}
            (free from Google) and install it
          </li>
          <li>
            Sign in with your Google account — a <strong>Google Drive (G:)</strong> folder appears on your PC
          </li>
          <li>Move your app's <strong>Saved Invoices</strong> folder into Google Drive, or set Windows to sync it</li>
          <li>Done! All PDFs automatically sync to your Google Drive cloud</li>
        </ol>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem', marginBottom: 0 }}>
          Your invoices will be accessible from any device, phone, or computer via drive.google.com. No API key needed.
        </p>
      </div>

      {/* Advanced API method - collapsible */}
      <details style={{ fontSize: '0.85rem' }}>
        <summary style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.82rem', padding: '0.5rem 0' }}>
          Advanced: Direct API Upload (for developers)
        </summary>
        <div style={{ paddingTop: '0.75rem' }}>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group full-width">
              <label className="form-label">Google OAuth Client ID</label>
              <input
                type="text"
                name="googleClientId"
                className="form-input"
                value={profile.googleClientId || ''}
                onChange={handleChange}
                placeholder="xxxx.apps.googleusercontent.com"
              />
              <p className="field-hint">
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--primary)' }}
                >
                  Open Google Cloud Console
                </a>{' '}
                &rarr; Create Project &rarr; Enable Drive API &rarr; Create OAuth Client ID (Web app) &rarr; Add{' '}
                <code>http://localhost:5173</code> as origin.
              </p>
            </div>
            <div className="form-group">
              <label className="form-label">Drive Folder Name</label>
              <input
                type="text"
                name="googleDriveFolder"
                className="form-input"
                value={profile.googleDriveFolder || ''}
                onChange={handleChange}
                placeholder="GST Billing Invoices"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <div className="flex gap-2 mt-2">
                {driveConnected ? (
                  <>
                    <span className="status-badge" style={{ background: 'var(--info-bg)', color: 'var(--info-text)' }}>
                      <Cloud size={14} /> Connected
                    </span>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                      onClick={handleDisconnectDrive}
                    >
                      <CloudOff size={14} /> Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                    onClick={handleConnectDrive}
                    disabled={connecting}
                  >
                    <Cloud size={16} /> {connecting ? 'Connecting...' : 'Connect Google Drive'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </details>
    </div>
  );
};
