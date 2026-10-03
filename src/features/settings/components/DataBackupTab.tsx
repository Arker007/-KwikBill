import React, { useState, useEffect, useRef } from 'react';
import { Download, Upload, Save as SaveIcon } from 'lucide-react';
import { ALL_BACKUP_PARTS } from '../constants';
import { BackupInspection, BusinessProfileData, DailyBackup, TrashedBill } from '../types';
import {
  exportAllData,
  importData,
  inspectBackup,
  getProfile,
  getBackupsList,
  restoreBackup,
  triggerBackup,
  deleteBackup,
  getTrashedBills,
  restoreTrashedBill,
  purgeTrashedBill,
} from '../../../store';
import { ensureToken, findOrCreateFolder, uploadJSON } from '../services/googleDrive';
import { toast } from '../../../shared/components/feedback/Toast';
import { confirmAction } from '../../../shared/components/feedback/ConfirmModal';

interface DataBackupTabProps {
  selectedSection?: string;
  profile: BusinessProfileData;
  setProfile: React.Dispatch<React.SetStateAction<BusinessProfileData>>;
  onSaved?: (p: BusinessProfileData) => void;
  loadTemplates: () => Promise<void>;
  loadBusinessProfiles: () => Promise<void>;
}

export const DataBackupTab: React.FC<DataBackupTabProps> = ({
  selectedSection,
  profile,
  setProfile,
  onSaved,
  loadTemplates,
  loadBusinessProfiles,
}) => {
  // Backups & Trash State
  const [backups, setBackups] = useState<DailyBackup[]>([]);
  const [trash, setTrash] = useState<TrashedBill[]>([]);
  const [loading, setLoading] = useState(false);

  // Import / Export State
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [exportSel, setExportSel] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(ALL_BACKUP_PARTS.map(p => [p.id, true]))
  );
  const [importSel, setImportSel] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(ALL_BACKUP_PARTS.map(p => [p.id, true]))
  );
  const [importInspection, setImportInspection] = useState<BackupInspection | null>(null);
  const [importJsonText, setImportJsonText] = useState('');
  const [exportToDrive, setExportToDrive] = useState(false);
  const [drivePending, setDrivePending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [b, t] = await Promise.all([
        getBackupsList().catch(() => []),
        getTrashedBills().catch(() => []),
      ]);
      setBackups(b);
      setTrash(t);
    } catch {
      /* ignore */
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleRestoreBackup = async (date: string) => {
    if (
      !(await confirmAction({
        title: `Restore all data from backup ${date}?`,
        message:
          'This OVERWRITES your current data. A snapshot of the current state will be taken first — if the restore looks wrong, you can roll back.',
        confirmLabel: 'Restore backup',
        tone: 'warning',
      }))
    )
      return;
    try {
      await triggerBackup();
      await restoreBackup(date);
      toast('Backup restored — please reload the page to see the data', 'success');
    } catch (err: any) {
      toast('Restore failed: ' + err.message, 'error');
    }
  };

  const handleRestoreTrash = async (id: string) => {
    try {
      await restoreTrashedBill(id);
      toast('Invoice restored', 'success');
      loadAll();
    } catch (err: any) {
      toast('Restore failed: ' + err.message, 'error');
    }
  };

  const handlePurgeTrash = async (id: string) => {
    if (
      !(await confirmAction({
        title: 'Permanently delete this invoice?',
        message: 'This bypasses the 30-day Trash grace period. The invoice and its PDF are gone for good.',
        confirmLabel: 'Delete permanently',
        tone: 'danger',
      }))
    )
      return;
    try {
      await purgeTrashedBill(id);
      toast('Invoice permanently deleted', 'info');
      loadAll();
    } catch (err: any) {
      toast('Purge failed: ' + err.message, 'error');
    }
  };

  const handleDeleteBackup = async (date: string) => {
    if (
      !(await confirmAction({
        title: `Delete backup ${date}?`,
        message:
          'Auto-backups still run daily, so future data will be safe. This just removes the archived snapshot.',
        confirmLabel: 'Delete backup',
        tone: 'danger',
      }))
    )
      return;
    try {
      await deleteBackup(date);
      toast(`Backup ${date} deleted`, 'info');
      loadAll();
    } catch (err: any) {
      toast('Delete failed: ' + err.message, 'error');
    }
  };

  const toggleExport = (id: string) => setExportSel(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleImport = (id: string) => setImportSel(prev => ({ ...prev, [id]: !prev[id] }));
  const exportToggleAll = (val: boolean) =>
    setExportSel(Object.fromEntries(ALL_BACKUP_PARTS.map(p => [p.id, val])));
  const importToggleAll = (val: boolean) =>
    setImportSel(Object.fromEntries(ALL_BACKUP_PARTS.map(p => [p.id, val])));

  const runExport = async () => {
    try {
      const json = await exportAllData(exportSel);
      const fileName = `freegstbill-backup-${new Date().toISOString().split('T')[0]}.json`;

      // Local download
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);

      // Optional Google Drive copy
      if (exportToDrive) {
        if (!profile?.googleClientId) {
          toast(
            'Google Drive not configured. Set Google Client ID in Settings to enable Drive backups.',
            'warning'
          );
        } else {
          setDrivePending(true);
          const ok = await ensureToken(profile.googleClientId);
          if (!ok) {
            toast('Drive auth failed — backup downloaded locally only', 'warning');
          } else {
            const folderName = (profile.googleDriveFolder || 'GST Billing Invoices') + ' - Backups';
            const folderId = await findOrCreateFolder(folderName);
            const result = await uploadJSON(fileName, json, folderId);
            toast(`Saved to Drive — ${result.name}`, 'success');
          }
          setDrivePending(false);
        }
      }

      toast('Backup downloaded', 'success');
      setShowExportModal(false);
    } catch (err: any) {
      console.error(err);
      toast('Export failed: ' + (err.message || 'unknown error'), 'error');
      setDrivePending(false);
    }
  };

  const handleImportPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const inspection = inspectBackup(text);
      if (!inspection.valid) {
        toast("This file doesn't look like a Free GST Billing backup.", 'error');
        return;
      }
      setImportInspection(inspection);
      setImportJsonText(text);
      const auto: Record<string, boolean> = {};
      ALL_BACKUP_PARTS.forEach(p => {
        auto[p.id] = (inspection.counts[p.id] || 0) > 0;
      });
      setImportSel(auto);
      setShowImportModal(true);
    } catch {
      toast('Could not read the file', 'error');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const runImport = async () => {
    try {
      const result = await importData(importJsonText, importSel);
      const parts: string[] = [];
      if (result.billCount) parts.push(`${result.billCount} invoice(s)`);
      if (result.hasProfile) parts.push('profile');
      if (result.templateCount) parts.push(`${result.templateCount} template(s)`);
      if (result.clientCount) parts.push(`${result.clientCount} client(s)`);
      if (result.productCount) parts.push(`${result.productCount} product(s)`);
      toast(parts.length ? `Restored: ${parts.join(', ')}` : 'Restore complete', 'success');
      if (importSel.profile) {
        const p = await getProfile();
        setProfile(p);
        if (onSaved) onSaved(p);
      }
      if (importSel.termsTemplates) loadTemplates();
      if (importSel.profiles) loadBusinessProfiles();
      setShowImportModal(false);
      setImportInspection(null);
      setImportJsonText('');
    } catch (err: any) {
      console.error(err);
      toast('Import failed: ' + (err.message || 'unknown error'), 'error');
    }
  };

  const showAll = !selectedSection;

  return (
    <>
      {/* v1.9.5 — Backup Management + Trash Bin */}
      {(showAll || selectedSection === 'section-backups') && (
        <div id="section-backups" style={{ order: 8 }}>
        <div className="glass-panel p-6 mb-6">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '0.75rem',
            }}
          >
            <div>
              <h3 className="section-title" style={{ marginTop: 0, marginBottom: '0.25rem' }}>
                💾 Backup Management + 🗑 Trash Bin
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                Automatic daily snapshots kept for 30 days · Deleted invoices soft-trash for 30 days (v1.9.5+).
              </p>
            </div>
            <button
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem' }}
              onClick={async () => {
                await triggerBackup();
                toast('Manual backup triggered', 'success');
                loadAll();
              }}
            >
              <SaveIcon size={14} /> Backup now
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1rem',
              marginTop: '1rem',
            }}
          >
            {/* Backups list */}
            <div style={{ padding: '0.85rem', background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem' }}>📅 Daily backups ({backups.length})</h4>
              {loading && backups.length === 0 && (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Loading…</p>
              )}
              {!loading && backups.length === 0 && (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  No backups yet — the first will be created at midnight or click "Backup now" above.
                </p>
              )}
              <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                {backups.map(b => (
                  <div
                    key={b.date}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.4rem 0.6rem',
                      marginBottom: '0.25rem',
                      background: 'var(--card)',
                      borderRadius: 4,
                      fontSize: '0.82rem',
                    }}
                  >
                    <div>
                      <strong>{b.date}</strong>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {b.createdAt ? new Date(b.createdAt).toLocaleTimeString('en-IN') : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                        onClick={() => handleRestoreBackup(b.date)}
                      >
                        Restore
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{
                          fontSize: '0.72rem',
                          padding: '0.2rem 0.5rem',
                          color: '#dc2626',
                          borderColor: '#fca5a5',
                        }}
                        onClick={() => handleDeleteBackup(b.date)}
                        title="Delete this backup"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trash bin */}
            <div style={{ padding: '0.85rem', background: 'var(--bg-secondary)', borderRadius: 8 }}>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem' }}>🗑 Trash bin ({trash.length})</h4>
              {loading && trash.length === 0 && (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Loading…</p>
              )}
              {!loading && trash.length === 0 && (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  No deleted invoices. Anything you delete lands here for 30 days.
                </p>
              )}
              <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                {trash.map(bill => (
                  <div
                    key={bill.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.4rem 0.6rem',
                      marginBottom: '0.25rem',
                      background: 'var(--card)',
                      borderRadius: 4,
                      fontSize: '0.82rem',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong>{bill.invoiceNumber}</strong>
                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: 'var(--text-muted)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {bill.clientName} · deleted{' '}
                        {bill._trashedAt ? new Date(bill._trashedAt).toLocaleDateString('en-IN') : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem' }}
                        onClick={() => handleRestoreTrash(bill.id)}
                      >
                        Restore
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{
                          fontSize: '0.7rem',
                          padding: '0.2rem 0.4rem',
                          color: '#dc2626',
                          borderColor: '#fca5a5',
                        }}
                        onClick={() => handlePurgeTrash(bill.id)}
                      >
                        Delete forever
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* Data Management (Import / Export) */}
      {(showAll || selectedSection === 'section-data') && (
        <div id="section-data" className="glass-panel p-6 mb-6" style={{ order: 10 }}>
          <h3 className="section-title">Data Management</h3>

          {/* Privacy notice */}
          <div className="notice notice-info" style={{ marginBottom: '1rem' }}>
            <span className="notice-icon">🔒</span>
            <div>
              <strong>Your data is on this computer only.</strong> Nothing is uploaded to us, our servers, or any third
              party — not invoices, not clients, not settings. The only time anything leaves your machine is if you
              explicitly click <em>Save to Drive</em> below (uploads to <strong>your own</strong> Google Drive account).
              Files live under <code>data/</code> and <code>Saved Invoices/</code> next to the app.
            </div>
          </div>

          <p className="page-subtitle mb-6">
            Choose what to back up or restore — invoices, clients, products, settings, custom units, or just specific parts.
            Backup files are plain JSON you can keep on a USB drive, OneDrive, or your own Google Drive.
          </p>
          <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-primary" onClick={() => setShowExportModal(true)}>
              <Download size={18} /> Export Backup…
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
              <Upload size={18} /> Import Backup…
            </button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportPick} style={{ display: 'none' }} />
          </div>
        </div>
      )}

      {/* Export modal */}
      {showExportModal && (
        <div className="modal-overlay" onClick={() => !drivePending && setShowExportModal(false)}>
          <div className="modal-content" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <h3 className="section-title" style={{ marginTop: 0 }}>
              Export Backup
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.75rem' }}>
              Choose what to include. Everything is on by default — uncheck anything you don't want.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => exportToggleAll(true)}
                style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
              >
                Select all
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => exportToggleAll(false)}
                style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
              >
                Clear all
              </button>
            </div>
            <div className="cbx-list">
              {ALL_BACKUP_PARTS.map(p => (
                <label key={p.id} className="cbx-row">
                  <input type="checkbox" checked={!!exportSel[p.id]} onChange={() => toggleExport(p.id)} />
                  <span>
                    <span className="cbx-label">{p.label}</span>
                    <span className="cbx-hint">{p.hint}</span>
                  </span>
                </label>
              ))}
            </div>

            {/* Optional: Google Drive copy */}
            <label className="cbx-row" style={{ marginTop: '0.5rem' }}>
              <input type="checkbox" checked={exportToDrive} onChange={e => setExportToDrive(e.target.checked)} />
              <span>
                <span className="cbx-label">Also save a copy to my Google Drive</span>
                <span className="cbx-hint">
                  Uploads to <em>{(profile.googleDriveFolder || 'GST Billing Invoices')} - Backups</em> in your Drive.
                  Requires Google Client ID configured above. The file always downloads to your computer too.
                </span>
              </span>
            </label>

            <div className="flex gap-2 justify-end mt-4">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowExportModal(false)}
                disabled={drivePending}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={runExport}
                disabled={drivePending || !Object.values(exportSel).some(Boolean)}
              >
                {drivePending ? (
                  'Uploading…'
                ) : (
                  <>
                    <Download size={16} /> Download Backup
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import modal */}
      {showImportModal && importInspection && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal-content" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <h3 className="section-title" style={{ marginTop: 0 }}>
              Restore from Backup
            </h3>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.75rem' }}>
              File contents preview
              {importInspection.exportedAt && (
                <span> — exported {new Date(importInspection.exportedAt).toLocaleString()}</span>
              )}
              {importInspection.version && <span> · v{importInspection.version}</span>}
            </div>
            <div
              style={{
                padding: '0.6rem 0.85rem',
                borderRadius: '6px',
                background: 'var(--warn-bg)',
                border: '1px solid var(--warn-border)',
                fontSize: '0.78rem',
                color: 'var(--warn-text)',
                marginBottom: '0.75rem',
              }}
            >
              ⚠ Restoring will <strong>overwrite matching records by ID</strong> in the categories you select. Records
              you didn't tick are untouched. We recommend exporting a fresh backup of your current data first.
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => importToggleAll(true)}
                style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
              >
                Select all (with data)
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => importToggleAll(false)}
                style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
              >
                Clear all
              </button>
            </div>
            <div className="cbx-list">
              {ALL_BACKUP_PARTS.map(p => {
                const count = importInspection.counts[p.id] || 0;
                return (
                  <label key={p.id} className={`cbx-row${count === 0 ? ' is-disabled' : ''}`}>
                    <input
                      type="checkbox"
                      checked={!!importSel[p.id]}
                      disabled={count === 0}
                      onChange={() => toggleImport(p.id)}
                    />
                    <span style={{ flex: 1 }}>
                      <span className="cbx-label">{p.label}</span>
                      <span className="cbx-hint">{p.hint}</span>
                    </span>
                    <span
                      className="cbx-meta"
                      style={count > 0 ? { color: 'var(--success)', fontWeight: 600 } : undefined}
                    >
                      {count > 0 ? `${count} item${count !== 1 ? 's' : ''}` : 'empty'}
                    </span>
                  </label>
                );
              })}
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button type="button" className="btn btn-secondary" onClick={() => setShowImportModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={runImport}
                disabled={!Object.values(importSel).some(Boolean)}
              >
                <Upload size={16} /> Restore selected
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
