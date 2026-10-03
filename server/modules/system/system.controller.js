import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { SERVER_DIR, DATA_DIR, INVOICES_DIR, PORT_FILE, ERRORS_LOG } from '../../config/paths.js';
import { safePathSegment, isPathInside } from '../../shared/utils/pathUtils.js';
import { errRes } from '../../shared/middleware/errorHandler.js';

const isWindows = process.platform === 'win32';
const isMac = process.platform === 'darwin';

const CONTROL_SCRIPT_CANDIDATES = [
  path.join(SERVER_DIR, '..', '_system-scripts'),
  path.join(SERVER_DIR, '..', 'release-templates', '_system-scripts'),
  path.join(SERVER_DIR, '..', '..', '_system-scripts'),
];
const controlScriptDir = CONTROL_SCRIPT_CANDIDATES.find(p => {
  try { return fs.statSync(p).isDirectory(); } catch { return false; }
}) || null;

function pickScript(name) {
  if (!controlScriptDir) return null;
  const suffix = isWindows ? '-windows.ps1' : '-unix.sh';
  const p = path.join(controlScriptDir, name + suffix);
  return fs.existsSync(p) ? p : null;
}

function runControlScript(scriptPath) {
  return new Promise((resolve) => {
    if (!scriptPath) { resolve({ ok: false, error: 'Script not found for this platform' }); return; }
    const [cmd, args] = isWindows
      ? ['powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptPath]]
      : ['bash', [scriptPath]];
    let out = '', err = '';
    try {
      const child = spawn(cmd, args, { detached: false, windowsHide: false });
      child.stdout?.on('data', d => { out += d.toString(); });
      child.stderr?.on('data', d => { err += d.toString(); });
      child.on('error', e => resolve({ ok: false, error: e.message }));
      child.on('exit', code => resolve({ ok: code === 0, exitCode: code, stdout: out.slice(-4000), stderr: err.slice(-2000) }));
    } catch (e) {
      resolve({ ok: false, error: e.message });
    }
  });
}

function compareSemver(a, b) {
  const pa = String(a || '0').split('.').map(n => parseInt(n, 10) || 0);
  const pb = String(b || '0').split('.').map(n => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) > (pb[i] || 0)) return 1;
    if ((pa[i] || 0) < (pb[i] || 0)) return -1;
  }
  return 0;
}

const pkg = JSON.parse(fs.readFileSync(path.join(SERVER_DIR, '..', 'package.json'), 'utf-8'));

export const SystemController = {
  savePdf(req, res) {
    try {
      if (!fs.existsSync(INVOICES_DIR)) fs.mkdirSync(INVOICES_DIR, { recursive: true });
      const rawName = req.query.name || `invoice-${Date.now()}.pdf`;
      const safeClient = safePathSegment(req.query.client, 'General');
      const safeMonth = safePathSegment(req.query.month, new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' }));
      let safeName = safePathSegment(rawName, `invoice-${Date.now()}.pdf`);
      if (!safeName.toLowerCase().endsWith('.pdf')) safeName += '.pdf';

      const folderPath = path.join(INVOICES_DIR, safeClient, safeMonth);
      const filePath = path.join(folderPath, safeName);
      if (!isPathInside(filePath, INVOICES_DIR)) return errRes(res, 400, 'invalid-path');

      if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
      fs.writeFileSync(filePath, req.body);
      res.json({ saved: true, relPath: path.relative(path.join(SERVER_DIR, '..'), filePath).split(path.sep).join('/') });
    } catch (err) {
      errRes(res, 500, 'server-error', err);
    }
  },

  getVersion(req, res) {
    res.json({ current: pkg.version });
  },

  async checkUpdate(req, res) {
    res.json({
      current: pkg.version,
      latest: pkg.version,
      updateAvailable: false,
      releaseNotes: null,
      releaseUrl: null,
      releasePublishedAt: null,
      releaseTag: null,
    });
  },

  controlPanelStatus(req, res) {
    const dataSize = (() => {
      try {
        let total = 0;
        const walk = (dir) => {
          for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const p = path.join(dir, entry.name);
            if (entry.isDirectory()) walk(p);
            else { try { total += fs.statSync(p).size; } catch { /* ignore */ } }
          }
        };
        if (fs.existsSync(DATA_DIR)) walk(DATA_DIR);
        return total;
      } catch { return 0; }
    })();

    let activePort = 3000;
    try {
      if (fs.existsSync(PORT_FILE)) {
        activePort = parseInt(fs.readFileSync(PORT_FILE, 'utf-8'), 10) || 3000;
      }
    } catch { /* keep fallback */ }

    // Attempt to grab port from req object if express passed it through the app
    if (req.app && req.app.locals && req.app.locals.activePort) {
      activePort = req.app.locals.activePort;
    }

    res.json({
      platform: process.platform,
      node: process.version,
      controlScriptsAvailable: !!controlScriptDir,
      dataFolder: DATA_DIR,
      dataSizeBytes: dataSize,
      port: activePort,
      launcherType: controlScriptDir ? (isWindows ? 'hta' : (isMac ? 'command' : 'sh')) : 'none',
    });
  },

  async controlPanelBackup(req, res) {
    const script = pickScript('backup');
    const result = await runControlScript(script);
    res.json(result);
  },

  controlPanelOpenData(req, res) {
    try {
      if (isWindows) spawn('explorer.exe', [DATA_DIR], { detached: true }).unref();
      else if (isMac) spawn('open', [DATA_DIR], { detached: true }).unref();
      else spawn('xdg-open', [DATA_DIR], { detached: true }).unref();
      res.json({ ok: true });
    } catch (e) { res.json({ ok: false, error: e.message }); }
  },

  controlPanelOpenBackups(req, res) {
    const backupsHome = path.join(process.env.USERPROFILE || process.env.HOME || '', 'Documents', 'FreeGSTBill Backups');
    try {
      if (!fs.existsSync(backupsHome)) fs.mkdirSync(backupsHome, { recursive: true });
      if (isWindows) spawn('explorer.exe', [backupsHome], { detached: true }).unref();
      else if (isMac) spawn('open', [backupsHome], { detached: true }).unref();
      else spawn('xdg-open', [backupsHome], { detached: true }).unref();
      res.json({ ok: true, path: backupsHome });
    } catch (e) { res.json({ ok: false, error: e.message }); }
  },

  async controlPanelLaunchScript(req, res) {
    const allowed = new Set(['update', 'restore', 'move', 'stop']);
    const action = String(req.body?.action || '');
    if (!allowed.has(action)) { res.status(400).json({ ok: false, error: 'Unknown action' }); return; }
    const script = pickScript(action);
    const result = await runControlScript(script);
    res.json(result);
  },

  healthCheck(req, res) {
    let errorsTail = '';
    try {
      if (fs.existsSync(ERRORS_LOG)) {
        const stat = fs.statSync(ERRORS_LOG);
        const fd = fs.openSync(ERRORS_LOG, 'r');
        const len = Math.min(stat.size, 4096);
        const buf = Buffer.alloc(len);
        fs.readSync(fd, buf, 0, len, Math.max(0, stat.size - len));
        fs.closeSync(fd);
        errorsTail = buf.toString('utf-8');
      }
    } catch { /* ignore */ }
    res.json({
      ok: true,
      version: pkg.version || 'unknown',
      uptimeSec: Math.round(process.uptime()),
      pid: process.pid,
      hasRecentErrors: !!errorsTail.trim(),
      errorsTail,
    });
  }
};
