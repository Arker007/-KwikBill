import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  Upload,
  Save as SaveIcon,
  Trash2,
  RotateCcw,
  ShieldCheck,
  FolderArchive,
  AlertTriangle,
  History,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
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
} from '@/store';
import { ensureToken, findOrCreateFolder, uploadJSON } from '../services/googleDrive';
import { toast } from '@/shared/components/feedback/Toast';
import { confirmAction } from '@/shared/components/feedback/ConfirmModal';

export interface AdvancedFeaturesViewProps {
  profile: BusinessProfileData;
  setProfile: React.Dispatch<React.SetStateAction<BusinessProfileData>>;
  onSaved?: (p: BusinessProfileData) => void;
  loadTemplates: () => Promise<void>;
  loadBusinessProfiles: () => Promise<void>;
}

export const AdvancedFeaturesView: React.FC<AdvancedFeaturesViewProps> = ({
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
    Object.fromEntries(ALL_BACKUP_PARTS.map((p) => [p.id, true]))
  );
  const [importSel, setImportSel] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(ALL_BACKUP_PARTS.map((p) => [p.id, true]))
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
      toast('Backup restored — please reload to refresh all views', 'success');
      loadAll();
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
          'Auto-backups still run daily, so future data will be safe. This removes the archived snapshot.',
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

  const toggleExport = (id: string) => setExportSel((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleImport = (id: string) => setImportSel((prev) => ({ ...prev, [id]: !prev[id] }));
  const exportToggleAll = (val: boolean) =>
    setExportSel(Object.fromEntries(ALL_BACKUP_PARTS.map((p) => [p.id, val])));
  const importToggleAll = (val: boolean) =>
    setImportSel(Object.fromEntries(ALL_BACKUP_PARTS.map((p) => [p.id, val])));

  const runExport = async () => {
    try {
      const json = await exportAllData(exportSel);
      const fileName = `freegstbill-backup-${new Date().toISOString().split('T')[0]}.json`;

      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);

      if (exportToDrive) {
        if (!profile?.googleClientId) {
          toast('Google Drive not configured in Integrations settings.', 'warning');
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

      toast('Backup file downloaded successfully', 'success');
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
      ALL_BACKUP_PARTS.forEach((p) => {
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
      loadAll();
    } catch (err: any) {
      console.error(err);
      toast('Import failed: ' + (err.message || 'unknown error'), 'error');
    }
  };

  return (
    <div className="space-y-8" id="advanced-features-view">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center space-x-2">
            <FolderArchive className="w-5 h-5 text-[#1E61EB]" />
            <span>Data Management &amp; Disaster Recovery</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Full-system JSON backup exports, selective restoration wizards, automated daily snapshots, and trash bin.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={async () => {
              await triggerBackup();
              toast('Snapshot created successfully', 'success');
              loadAll();
            }}
            className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-medium py-1.5 px-3 rounded-md transition-colors flex items-center space-x-1"
          >
            <SaveIcon className="w-3.5 h-3.5" />
            <span>Create Snapshot</span>
          </button>
          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            className="bg-[#1E61EB] hover:bg-[#174ec4] text-white text-xs font-semibold py-1.5 px-4 rounded-md transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Full Backup</span>
          </button>
        </div>
      </div>

      {/* Section 1: Data Backup & Import/Export Hub */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-2 pb-2 border-b border-gray-100">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Local-First Data Portability</span>
        </h3>

        <div className="p-3.5 bg-blue-50/50 rounded-lg border border-blue-100 text-xs text-gray-700 space-y-1">
          <div className="font-bold text-blue-900">100% Offline &amp; Private Storage</div>
          <p className="text-[11px] text-gray-600">
            All records live exclusively on your computer in flat-file JSON formats. You can move this entire application across machines simply by copying your backup file or USB drive.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            className="border border-gray-200 hover:bg-gray-50 text-gray-800 text-xs font-medium py-2 px-4 rounded-md transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4 text-[#1E61EB]" />
            <span>Export Data (.JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="border border-gray-200 hover:bg-gray-50 text-gray-800 text-xs font-medium py-2 px-4 rounded-md transition-colors flex items-center space-x-2"
          >
            <Upload className="w-4 h-4 text-purple-600" />
            <span>Import / Restore Backup</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportPick}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Section 2: Snapshots & Trash Bin Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Backups */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-2">
              <History className="w-4 h-4 text-gray-500" />
              <span>Daily Snapshots ({backups.length})</span>
            </h3>
            <span className="text-[10px] text-gray-400">30-day retention</span>
          </div>

          {loading && backups.length === 0 && (
            <p className="text-xs text-gray-400 py-3 text-center">Loading snapshots...</p>
          )}
          {!loading && backups.length === 0 && (
            <p className="text-xs text-gray-400 py-3 text-center">
              No daily snapshots found. Click "Create Snapshot" above to generate one now.
            </p>
          )}

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {backups.map((b) => (
              <div
                key={b.date}
                className="flex items-center justify-between p-2.5 rounded bg-gray-50 border border-gray-100 text-xs"
              >
                <div>
                  <div className="font-bold text-gray-900">{b.date}</div>
                  <div className="text-[10px] text-gray-400">
                    {b.createdAt ? new Date(b.createdAt).toLocaleTimeString('en-IN') : 'Automated'}
                  </div>
                </div>
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => handleRestoreBackup(b.date)}
                    className="bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-[11px] font-medium py-1 px-2.5 rounded transition-colors"
                  >
                    Restore
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBackup(b.date)}
                    className="text-gray-400 hover:text-red-600 p-1 rounded"
                    title="Delete snapshot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trashed Invoices */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-2">
              <Trash2 className="w-4 h-4 text-gray-500" />
              <span>Trash Bin ({trash.length})</span>
            </h3>
            <span className="text-[10px] text-gray-400">Soft-delete protection</span>
          </div>

          {loading && trash.length === 0 && (
            <p className="text-xs text-gray-400 py-3 text-center">Loading trash...</p>
          )}
          {!loading && trash.length === 0 && (
            <p className="text-xs text-gray-400 py-3 text-center">
              Trash bin is empty. Deleted invoices land here safely for 30 days.
            </p>
          )}

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {trash.map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between p-2.5 rounded bg-gray-50 border border-gray-100 text-xs"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="font-bold text-gray-900 truncate">{bill.invoiceNumber}</div>
                  <div className="text-[10px] text-gray-400 truncate">
                    {bill.clientName} · {bill._trashedAt ? new Date(bill._trashedAt).toLocaleDateString('en-IN') : ''}
                  </div>
                </div>
                <div className="flex items-center space-x-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleRestoreTrash(bill.id)}
                    className="bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-[11px] font-medium py-1 px-2.5 rounded transition-colors flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3 h-3 text-emerald-600" />
                    <span>Restore</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePurgeTrash(bill.id)}
                    className="text-gray-400 hover:text-red-600 p-1 rounded"
                    title="Permanently delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4 border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Custom Export Backup</h3>
              <button
                type="button"
                onClick={() => !drivePending && setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Select which dataset modules to include in your exported JSON file:
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => exportToggleAll(true)}
                className="text-[11px] text-[#1E61EB] font-medium hover:underline"
              >
                Select all
              </button>
              <span className="text-gray-300">·</span>
              <button
                type="button"
                onClick={() => exportToggleAll(false)}
                className="text-[11px] text-gray-500 font-medium hover:underline"
              >
                Clear all
              </button>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1.5 border border-gray-100 rounded-lg p-2 bg-gray-50/50">
              {ALL_BACKUP_PARTS.map((p) => (
                <label key={p.id} className="flex items-center justify-between p-2 rounded bg-white hover:bg-gray-50 cursor-pointer border border-gray-100 text-xs">
                  <div>
                    <span className="font-semibold text-gray-800 block">{p.label}</span>
                    <span className="text-[10px] text-gray-400">{p.hint}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!exportSel[p.id]}
                    onChange={() => toggleExport(p.id)}
                    className="w-4 h-4 text-[#1E61EB] rounded focus:ring-0"
                  />
                </label>
              ))}
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                disabled={drivePending}
                className="border border-gray-200 text-gray-700 text-xs font-medium py-1.5 px-4 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={runExport}
                disabled={drivePending || !Object.values(exportSel).some(Boolean)}
                className="bg-[#1E61EB] text-white text-xs font-semibold py-1.5 px-5 rounded-md hover:bg-[#174ec4] shadow-sm flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{drivePending ? 'Uploading to Drive...' : 'Download JSON File'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && importInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4 border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Restore from Backup</h3>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <div className="p-3 bg-amber-50 rounded-md border border-amber-200 text-[11px] text-amber-800 space-y-0.5">
              <div className="font-bold flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Overwrites Matching Records by ID</span>
              </div>
              <p>
                Unchecked sections are completely untouched. A safety snapshot is automatically taken before applying changes.
              </p>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1.5 border border-gray-100 rounded-lg p-2 bg-gray-50/50">
              {ALL_BACKUP_PARTS.map((p) => {
                const count = importInspection.counts[p.id] || 0;
                return (
                  <label
                    key={p.id}
                    className={`flex items-center justify-between p-2 rounded bg-white border border-gray-100 text-xs ${
                      count === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <span className="font-semibold text-gray-800 block">{p.label}</span>
                      <span className="text-[10px] text-gray-400">{p.hint}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-bold ${count > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {count > 0 ? `${count} records` : 'empty'}
                      </span>
                      <input
                        type="checkbox"
                        checked={!!importSel[p.id]}
                        disabled={count === 0}
                        onChange={() => toggleImport(p.id)}
                        className="w-4 h-4 text-[#1E61EB] rounded focus:ring-0"
                      />
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="border border-gray-200 text-gray-700 text-xs font-medium py-1.5 px-4 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={runImport}
                disabled={!Object.values(importSel).some(Boolean)}
                className="bg-[#1E61EB] text-white text-xs font-semibold py-1.5 px-5 rounded-md hover:bg-[#174ec4] shadow-sm flex items-center space-x-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Restore Selected Data</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFeaturesView;
