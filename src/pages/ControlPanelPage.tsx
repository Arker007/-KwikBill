import React, { useState, useEffect } from 'react';
import {
  Download,
  RefreshCw,
  Package,
  FolderOpen,
  HardDrive,
  StopCircle,
  Upload,
  AlertCircle,
  CheckCircle,
  Bell,
  HelpCircle,
  Info,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '@/shared/components/layout';
import {
  toast,
  message,
  notify,
  Alert,
  Popconfirm,
  Popover,
  ProgressBar,
  ProgressCircle,
  LongOperationModal,
  FormField,
  showFailureDialog,
  confirmAction,
} from '@/shared/components/feedback';
import { Badge, Tooltip } from '@/shared/components/ui';

interface ControlPanelStatus {
  controlScriptsAvailable?: boolean;
  launcherType?: string;
  platform?: string;
  node?: string;
  port?: number | string;
  dataSizeBytes?: number;
  error?: string;
}

interface ActionResult {
  action: string;
  ok?: boolean;
  error?: string;
  stdout?: string;
  stderr?: string;
}

export default function ControlPanelPage(): React.ReactElement {
  const [status, setStatus] = useState<ControlPanelStatus | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ActionResult | null>(null);

  // Playground states for interactive UI/UX feedback testing
  const [activeFeedbackTab, setActiveFeedbackTab] = useState<'prompt' | 'process' | 'result'>('prompt');
  const [badgeCount, setBadgeCount] = useState<number>(3);
  const [showDotBadge, setShowDotBadge] = useState<boolean>(true);
  const [validationValue, setValidationValue] = useState<string>('');
  const [hasInputTouched, setHasInputTouched] = useState<boolean>(false);
  const [longOpOpen, setLongOpOpen] = useState<boolean>(false);
  const [longOpProgress, setLongOpProgress] = useState<number>(10);
  const [longOpStatus, setLongOpStatus] = useState<string>('Initializing archive snapshot...');
  const [longOpCancelled, setLongOpCancelled] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/control-panel/status')
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus({ error: 'Could not reach server' }));
  }, []);

  const runAction = async (action: string, method: string = 'POST') => {
    setBusy(action);
    setLastResult(null);
    try {
      const r = await fetch(`/api/control-panel/${action}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await r.json();
      setLastResult({ action, ...data });

      if (data.ok) {
        message.success(`${prettyAction(action)} completed.`);
      } else {
        showFailureDialog({
          title: `${prettyAction(action)} Operation Failed`,
          reason: data.error || 'The system could not complete the requested operation.',
          errorCode: `ERR_CTRL_${action.toUpperCase()}`,
          technicalDetails: data.stderr || data.stdout || data,
          actionLabel: 'Retry Operation',
          onAction: () => runAction(action, method),
        });
      }
    } catch (e: any) {
      setLastResult({ action, ok: false, error: e.message });
      showFailureDialog({
        title: `Communication Error: ${prettyAction(action)}`,
        reason: e.message || 'Network request failed or server unreachable.',
        errorCode: 'ERR_NETWORK_DISCONNECTED',
        actionLabel: 'Retry',
        onAction: () => runAction(action, method),
      });
    } finally {
      setBusy(null);
    }
  };

  const launchScript = async (action: string) => {
    setBusy(action);
    setLastResult(null);
    try {
      const r = await fetch('/api/control-panel/launch-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await r.json();
      setLastResult({ action, ...data });

      if (data.ok) {
        message.success(`${prettyAction(action)} completed.`);
      } else {
        showFailureDialog({
          title: `Script Execution Failed: ${prettyAction(action)}`,
          reason: data.error || 'The launcher script encountered an error during execution.',
          errorCode: `ERR_SCRIPT_${action.toUpperCase()}`,
          technicalDetails: data.stderr || data.stdout || data,
          actionLabel: 'Retry Script',
          onAction: () => launchScript(action),
        });
      }
    } catch (e: any) {
      setLastResult({ action, ok: false, error: e.message });
      showFailureDialog({
        title: `Failed to Launch: ${prettyAction(action)}`,
        reason: e.message || 'Script process could not be spawned on host.',
        errorCode: 'ERR_SPAWN_FAILED',
        actionLabel: 'Retry',
        onAction: () => launchScript(action),
      });
    } finally {
      setBusy(null);
    }
  };

  // Simulated long-running operation (> 2 seconds) with progress and cancellation
  const startSimulatedLongOperation = () => {
    setLongOpOpen(true);
    setLongOpProgress(0);
    setLongOpCancelled(false);
    setLongOpStatus('Verifying flat-file store integrity...');

    const stages = [
      { at: 20, text: 'Scanning 142 invoice vouchers...' },
      { at: 45, text: 'Computing Section 234 tax checksums...' },
      { at: 70, text: 'Compressing JSON flat-files to backup snapshot...' },
      { at: 90, text: 'Writing atomic manifest to disk...' },
      { at: 100, text: 'Operation complete!' },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      setLongOpProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setLongOpOpen(false);
            message.success('Integrity scan & backup snapshot completed successfully.');
          }, 600);
          return 100;
        }
        const stage = stages[currentStep];
        if (stage && prev + 15 >= stage.at) {
          setLongOpStatus(stage.text);
          currentStep++;
        }
        return prev + 12;
      });
    }, 450);

    // Save timer ref to cancel if requested
    (window as any).__longOpTimer = interval;
  };

  const cancelSimulatedLongOperation = () => {
    if ((window as any).__longOpTimer) {
      clearInterval((window as any).__longOpTimer);
    }
    setLongOpCancelled(true);
    setLongOpOpen(false);
    notify.warning('Operation Cancelled', 'The prolonged operation was aborted by the user before completion.');
  };

  const prettyAction = (a: string): string => {
    const map: Record<string, string> = {
      backup: 'Backup',
      update: 'Update',
      restore: 'Restore',
      move: 'Move export',
      stop: 'Stop server',
      'open-data-folder': 'Open data folder',
      'open-backups-folder': 'Open backups folder',
    };
    return map[a] || a;
  };

  const formatSize = (bytes?: number): string => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const scriptsUnavailable = Boolean(status && !status.controlScriptsAvailable);

  return (
    <div id="control-panel-view" className="dashboard-container max-w-6xl mx-auto space-y-6">
      <PageHeader
        icon={<HardDrive size={22} />}
        title="Control Panel & Operations"
        subtitle="Manage the system — update, backup, restore, server controls, and inspect UI/UX feedback patterns."
        meta={status?.launcherType ? `${status.launcherType.toUpperCase()} launcher` : undefined}
      />

      {/* 1. PROMPT FEEDBACK: Alert component (Persistent, non-blocking inline) */}
      {scriptsUnavailable && (
        <Alert
          type="warning"
          title="Launcher scripts not detected"
          description={
            <span>
              This app is running from a local dev clone rather than an installer bundle. Update / Backup / Restore / Move
              launcher scripts live under <code>_system-scripts/</code>. You can still use{' '}
              <em>Settings &rarr; Backup &amp; Restore</em> for flat-file JSON backups.
            </span>
          }
          closable={false}
          className="mb-4"
        />
      )}

      {/* System Status Metrics */}
      {status && !status.error && (
        <div className="glass-panel p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCell label="Platform" value={status.platform || '—'} />
          <StatCell label="Node version" value={status.node || '—'} />
          <StatCell label="Server port" value={status.port || '—'} />
          <StatCell label="Data folder size" value={formatSize(status.dataSizeBytes)} />
        </div>
      )}

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ActionCard
          id="btn-control-update"
          icon={<RefreshCw size={20} />}
          title="Update Software"
          body="Pull latest release from GitHub. Your ./data/ folder is snapshotted first and never touched."
          buttonLabel={busy === 'update' ? 'Updating…' : 'Update Now'}
          disabled={!!busy || scriptsUnavailable}
          onClick={() => launchScript('update')}
          variant="primary"
        />
        <ActionCard
          id="btn-control-backup"
          icon={<Download size={20} />}
          title="Backup Data"
          body="Zips your ./data/ folder into ~/Documents/FreeGSTBill Backups/ with a timestamp."
          buttonLabel={busy === 'backup' ? 'Backing up…' : 'Create Backup'}
          disabled={!!busy || scriptsUnavailable}
          onClick={() => runAction('backup')}
        />
        <ActionCard
          id="btn-control-restore"
          icon={<Upload size={20} />}
          title="Restore Backup"
          body="Pick a previous backup ZIP. Current data is snapshotted first as a safety net before restore."
          buttonLabel={busy === 'restore' ? 'Restoring…' : 'Choose Backup ZIP'}
          disabled={!!busy || scriptsUnavailable}
          onClick={() => launchScript('restore')}
        />
        <ActionCard
          id="btn-control-move"
          icon={<Package size={20} />}
          title="Move to Another PC"
          body="Exports data + settings as one ZIP on your Desktop. Copy it to the new PC, install the app, then Restore."
          buttonLabel={busy === 'move' ? 'Exporting…' : 'Export for Move'}
          disabled={!!busy || scriptsUnavailable}
          onClick={() => launchScript('move')}
        />
        <ActionCard
          id="btn-control-open-data"
          icon={<FolderOpen size={20} />}
          title="Open Data Folder"
          body="Opens the directory where your bills, clients, products, and settings live as local flat-file JSONs."
          buttonLabel="Open"
          disabled={!!busy}
          onClick={() => runAction('open-data-folder')}
        />
        <ActionCard
          id="btn-control-open-backups"
          icon={<FolderOpen size={20} />}
          title="Open Backups Folder"
          body="Opens ~/Documents/FreeGSTBill Backups/ where every automatic and manual backup ZIP is saved."
          buttonLabel="Open"
          disabled={!!busy}
          onClick={() => runAction('open-backups-folder')}
        />
      </div>

      {/* Stop Server: Uses POPCONFIRM for contextual confirmation near target element */}
      <div className="glass-panel p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-red-200/60 dark:border-red-900/40 bg-red-50/20 dark:bg-red-950/10 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-600 flex items-center justify-center shrink-0">
            <StopCircle size={22} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 m-0">
              Stop Local Backend Server
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 m-0 mt-0.5">
              Gracefully shuts down Express on port 3000. Use contextual Popconfirm for confirmation.
            </p>
          </div>
        </div>

        <Popconfirm
          title="Stop local Node server?"
          description="The app will stop responding until you launch it again from the launcher or terminal."
          okText="Stop Server"
          cancelText="Cancel"
          okType="danger"
          placement="topLeft"
          onConfirm={() => launchScript('stop')}
          disabled={!!busy || scriptsUnavailable}
        >
          <button
            id="btn-control-stop-server"
            type="button"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0 disabled:opacity-50"
            disabled={!!busy || scriptsUnavailable}
          >
            {busy === 'stop' ? 'Stopping…' : 'Stop Server'}
          </button>
        </Popconfirm>
      </div>

      {/* Last Action Output Details */}
      {lastResult && (
        <div className="glass-panel p-5">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            {lastResult.ok ? (
              <CheckCircle size={18} className="text-green-500" />
            ) : (
              <AlertCircle size={18} className="text-red-500" />
            )}
            {prettyAction(lastResult.action)} — {lastResult.ok ? 'Completed Successfully' : 'Failed'}
          </h3>
          {lastResult.stdout && (
            <details open className="mt-2">
              <summary className="cursor-pointer text-xs text-slate-500">Output details</summary>
              <pre className="text-xs bg-slate-100 dark:bg-slate-900 p-3 rounded-lg overflow-auto max-h-48 mt-1 font-mono">
                {lastResult.stdout}
              </pre>
            </details>
          )}
          {lastResult.stderr && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-red-500">Error log</summary>
              <pre className="text-xs bg-red-50 dark:bg-red-950/40 text-red-600 p-3 rounded-lg overflow-auto max-h-48 mt-1 font-mono">
                {lastResult.stderr}
              </pre>
            </details>
          )}
          {lastResult.error && (
            <p className="text-xs text-red-600 font-medium mt-2">{lastResult.error}</p>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* UI/UX FEEDBACK SYSTEM SHOWCASE & INTERACTIVE VERIFICATION SUITE           */}
      {/* Implements Ant Design Global Rules for Prompt, Process, & Result Feedback */}
      {/* ========================================================================= */}
      <div className="glass-panel p-6 border border-blue-200/50 dark:border-blue-900/30 rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-600">
                <Sparkles size={16} />
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 m-0">
                UI/UX Feedback System Showcase
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 m-0">
              Interactive testbed verifying Ant Design Prompt, Process, and Result feedback rules.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveFeedbackTab('prompt')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeFeedbackTab === 'prompt'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              1. Prompt Feedback
            </button>
            <button
              type="button"
              onClick={() => setActiveFeedbackTab('process')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeFeedbackTab === 'process'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              2. Process Feedback
            </button>
            <button
              type="button"
              onClick={() => setActiveFeedbackTab('result')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeFeedbackTab === 'result'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              3. Result Feedback
            </button>
          </div>
        </div>

        {/* ---------------- 1. PROMPT / INFORMATION FEEDBACK ---------------- */}
        {activeFeedbackTab === 'prompt' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Alert — Persistent, Non-blocking Inline Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Alert
                  type="info"
                  title="Tax Filing Window Open"
                  description="Quarterly GSTR-1 for Q4 is due by April 11. 14 invoices ready for JSON filing."
                  actionLabel="Review Filing"
                  onAction={() => message.info('Navigating to GSTR-1 module')}
                  closable
                />
                <Alert
                  type="success"
                  title="Cloud Sync Synchronized"
                  description="All local flat-file vouchers match remote backup integrity checksums."
                  closable
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-3 border-t border-slate-200/80 dark:border-slate-800">
              {/* Notification: Upper-right Global System Alerts */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Notification (Upper-Right)
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  Important, system-initiated global information displayed at the upper-right corner.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      notify.info('Quarterly Return Due', 'GSTR-3B filing for current tax period is due in 3 days.', {
                        duration: 4.5,
                      })
                    }
                    className="px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 text-xs font-medium rounded-lg border border-blue-200 dark:border-blue-900 hover:bg-blue-100"
                  >
                    Notify Info
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      notify.success('Auto-Backup Created', 'Nightly snapshot saved to ~/Documents/FreeGSTBill Backups/.', {
                        duration: 4.5,
                      })
                    }
                    className="px-2.5 py-1.5 bg-green-50 dark:bg-green-950/40 text-green-600 text-xs font-medium rounded-lg border border-green-200 dark:border-green-900 hover:bg-green-100"
                  >
                    Notify Success
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      notify.warning('Low Stock Alert', 'HSN item "TMT Steel Bars 12mm" has fallen to 2 units.', {
                        duration: 0, // Sticky
                        btn: (
                          <button
                            type="button"
                            onClick={() => notify.destroy()}
                            className="px-2 py-1 bg-amber-500 text-white text-[11px] font-semibold rounded"
                          >
                            Restock
                          </button>
                        ),
                      })
                    }
                    className="px-2.5 py-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 text-xs font-medium rounded-lg border border-amber-200 dark:border-amber-900 hover:bg-amber-100"
                  >
                    Sticky Warning (0s)
                  </button>
                </div>
              </div>

              {/* Badge: Aggregated Message Indicator */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Badge (Indicators &amp; Red Dot)
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  Numeric counts for important info; red dot for lower-priority updates.
                </p>
                <div className="flex items-center gap-6">
                  {/* Numeric Badge on Icon */}
                  <Badge count={badgeCount} overflowCount={99}>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                      <Bell size={18} />
                    </div>
                  </Badge>

                  {/* Red Dot Badge */}
                  <Badge dot={showDotBadge}>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                      <FolderOpen size={18} />
                    </div>
                  </Badge>

                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => setBadgeCount((c) => (c >= 100 ? 1 : c + 5))}
                      className="text-[11px] text-blue-600 hover:underline"
                    >
                      Count: {badgeCount} (+5)
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDotBadge((d) => !d)}
                      className="text-[11px] text-slate-500 hover:underline"
                    >
                      Toggle Dot ({showDotBadge ? 'on' : 'off'})
                    </button>
                  </div>
                </div>
              </div>

              {/* Popover & Tooltip */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Popover &amp; Tooltip
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  Tooltip: brief hover text. Popover: rich contextual card with actions.
                </p>
                <div className="flex items-center gap-3">
                  {/* Tooltip */}
                  <Tooltip title="Section 206C(1H) TCS at 0.1% for turnover exceeding ₹50 Lakhs" placement="top">
                    <button
                      type="button"
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 inline-flex items-center gap-1.5"
                    >
                      <HelpCircle size={14} /> Hover Tooltip
                    </button>
                  </Tooltip>

                  {/* Popover */}
                  <Popover
                    title="Client Credit Limit"
                    trigger="click"
                    placement="top"
                    content={
                      <div className="space-y-2 max-w-xs text-xs">
                        <p className="text-slate-600 dark:text-slate-300 m-0">
                          Current outstanding: <strong>₹42,500</strong>. Credit ceiling set to ₹1,00,000 with 30-day payment term.
                        </p>
                        <div className="flex justify-end gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => message.info('Opening client credit ledger')}
                            className="px-2 py-1 bg-blue-600 text-white rounded text-[11px] font-semibold"
                          >
                            View Ledger
                          </button>
                        </div>
                      </div>
                    }
                  >
                    <button
                      type="button"
                      className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 text-xs font-medium rounded-lg border border-blue-200 dark:border-blue-900 inline-flex items-center gap-1.5"
                    >
                      <Info size={14} /> Click Popover
                    </button>
                  </Popover>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- 2. PROCESS FEEDBACK ---------------- */}
        {activeFeedbackTab === 'process' && (
          <div className="space-y-6">
            {/* Long Operations (> 2s) with Progress & Cancellation */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 m-0">
                  Loading / Progress — Operations taking &gt;2 seconds with Cancellation
                </h4>
                <button
                  type="button"
                  onClick={startSimulatedLongOperation}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Play size={13} /> Run Long Operation (&gt;2s)
                </button>
              </div>

              <p className="text-xs text-slate-500 mb-3">
                Prompt status feedback for operations taking noticeably long. Displays current status and progress bar, and
                provides cancellation for prolonged operations without unnecessary interruptions.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <span>Exporting GSTR-1 FY 2025-26</span>
                    <span>68%</span>
                  </div>
                  <ProgressBar percent={68} status="active" />
                </div>
                <div className="flex items-center gap-4">
                  <ProgressCircle percent={75} size={54} />
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 m-0">
                      Disk Cache Compression
                    </p>
                    <span className="text-[11px]">75% verified · Rule 119A intact</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Validation: Error text visible until corrective action */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t border-slate-200/80 dark:border-slate-800">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Input Validation (Descriptive &amp; Non-Auto-Dismissing)
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  Places descriptive feedback directly after the field. Keeps error text visible until corrected (never auto-dismisses).
                </p>

                <FormField
                  label="GSTIN / UIN Identifier"
                  required
                  error={
                    hasInputTouched && (!validationValue || validationValue.length !== 15)
                      ? 'GSTIN must contain exactly 15 alphanumeric characters (e.g. 27AAAAA0000A1Z5).'
                      : undefined
                  }
                  helperText={
                    !hasInputTouched || validationValue.length === 15
                      ? 'Format: 2 state digits + 10 PAN characters + 1 entity + 1 "Z" + 1 checksum'
                      : undefined
                  }
                >
                  <input
                    type="text"
                    placeholder="27AAAAA0000A1Z5"
                    value={validationValue}
                    maxLength={15}
                    onChange={(e) => {
                      setValidationValue(e.target.value.toUpperCase());
                      setHasInputTouched(true);
                    }}
                    onBlur={() => setHasInputTouched(true)}
                    className={`w-full px-3 py-2 text-sm rounded-lg border font-mono ${
                      hasInputTouched && (!validationValue || validationValue.length !== 15)
                        ? 'border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20'
                        : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  />
                </FormField>
              </div>

              {/* Popconfirm: Lightweight Floating Confirmation near Target Element */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Popconfirm (Contextual Confirmation)
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  Floating confirmation panel near target element. Preferred over full-screen modal when lightweight confirmation is sufficient.
                </p>

                <div className="flex items-center gap-3">
                  <Popconfirm
                    title="Reset draft line items?"
                    description="This will clear all 4 unsaved product lines in this invoice draft."
                    okText="Reset Lines"
                    cancelText="Keep"
                    okType="danger"
                    placement="top"
                    onConfirm={() => message.success('Draft line items cleared.')}
                  >
                    <button
                      type="button"
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 transition-colors inline-flex items-center gap-1.5"
                    >
                      <RotateCcw size={14} /> Clear Draft (Popconfirm)
                    </button>
                  </Popconfirm>

                  <Popconfirm
                    title="Publish Quotation as Final?"
                    description="Generates final invoice sequence number and locks tax calculations."
                    okText="Publish"
                    cancelText="Dismiss"
                    okType="primary"
                    placement="top"
                    onConfirm={() => message.success('Quotation published as Tax Invoice.')}
                  >
                    <button
                      type="button"
                      className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-600 text-xs font-medium rounded-lg border border-blue-200 dark:border-blue-900 transition-colors"
                    >
                      Publish (Popconfirm)
                    </button>
                  </Popconfirm>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- 3. RESULT FEEDBACK ---------------- */}
        {activeFeedbackTab === 'result' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Message (Top Center, auto-dismissing ~3s) */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Message (Top Center ~3s)
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  Lightweight, non-blocking operation feedback at top center. Auto-dismisses in 3 seconds. Avoid for important failures.
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => message.success('Invoice INV/2026/042 saved successfully.')}
                    className="px-3 py-1.5 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 text-xs font-medium rounded-lg border border-green-200 dark:border-green-900 text-left"
                  >
                    &check; message.success()
                  </button>
                  <button
                    type="button"
                    onClick={() => message.info('PDF download started in background.')}
                    className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-lg border border-blue-200 dark:border-blue-900 text-left"
                  >
                    &bull; message.info()
                  </button>
                  <button
                    type="button"
                    onClick={() => message.warning('Client credit limit reached 90% threshold.')}
                    className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-lg border border-amber-200 dark:border-amber-900 text-left"
                  >
                    &#9888; message.warning()
                  </button>
                </div>
              </div>

              {/* IMPORTANT FAILURES: Persistent Actionable Dialog with Explanation & Reason */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Important Failures (Persistent Dialog)
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  Never use transient toasts for significant failures! Displays persistent dialog with clear reason and recovery action.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    showFailureDialog({
                      title: 'Fiscal Snapshot Backup Failed',
                      reason:
                        'The backup engine was unable to archive ./data/bills/ because disk write permissions were revoked by host OS or filesystem volume is full.',
                      errorCode: 'EACCES_PERMISSION_DENIED',
                      technicalDetails: {
                        path: './data/backups/snapshot-2026-09-27.zip',
                        code: 'EACCES',
                        syscall: 'open',
                        freeDiskSpaceBytes: 1048576,
                        stackTrace: 'Error: EACCES: permission denied\n    at backupEngine.ts:142\n    at async runAction()',
                      },
                      actionLabel: 'Retry Backup',
                      onAction: () => message.info('Retrying backup operation with fallback path...'),
                      secondaryActionLabel: 'Open Storage Settings',
                      onSecondaryAction: () => message.info('Redirecting to storage settings'),
                    })
                  }
                  className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <AlertCircle size={15} /> Trigger Important Failure Dialog
                </button>
              </div>

              {/* DIALOG: Centered Blocking Feedback for Essential Actions */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Dialog (Blocking Confirmation)
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  Centered blocking overlay reserved for critical, destructive actions and essential confirmations.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    const confirmed = await confirmAction({
                      title: 'Permanently Purge Old Trash Vouchers?',
                      message:
                        'This will permanently delete 28 invoices and receipts that have been in Trash for more than 30 days. This operation cannot be undone.',
                      confirmLabel: 'Purge 28 Vouchers',
                      cancelLabel: 'Keep in Trash',
                      tone: 'danger',
                    });
                    if (confirmed) {
                      message.success('Trash successfully purged.');
                    } else {
                      message.info('Purge operation cancelled.');
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <StopCircle size={15} /> Open Blocking Dialog
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Long Operation Modal with Cancellation */}
      <LongOperationModal
        open={longOpOpen}
        title="Validating Accounting Store &amp; Archive"
        statusText={longOpStatus}
        percent={longOpProgress}
        cancellable={true}
        cancelLabel="Cancel Operation"
        onCancel={cancelSimulatedLongOperation}
      />
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
        {label}
      </div>
      <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 break-all">
        {value}
      </div>
    </div>
  );
}

interface ActionCardProps {
  id?: string;
  icon: React.ReactNode;
  title: string;
  body: string;
  buttonLabel: string;
  disabled?: boolean;
  onClick: () => void;
  variant?: 'primary' | 'danger' | 'default';
}

function ActionCard({ id, icon, title, body, buttonLabel, disabled, onClick, variant }: ActionCardProps) {
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';

  return (
    <div className="glass-panel p-5 flex flex-col justify-between gap-3 border border-slate-200/80 dark:border-slate-800 rounded-xl hover:border-blue-400/50 transition-colors">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
          {icon}
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 m-0">{title}</h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 m-0 leading-relaxed">{body}</p>
      </div>
      <button
        id={id}
        type="button"
        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors self-start shadow-xs disabled:opacity-50 disabled:cursor-not-allowed ${
          isPrimary
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : isDanger
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
        }`}
        disabled={disabled}
        onClick={onClick}
      >
        {buttonLabel}
      </button>
    </div>
  );
}
