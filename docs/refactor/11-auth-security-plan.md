# 11 — Authentication & Security Plan

## 1. Security Context & Threat Model

The application is architected as a **Local-First, Self-Hosted Financial Tool**.
- Primary deployment target: Local developer/business desktop environment or private container running on `localhost` or isolated network.
- Secondary deployment target: Cloud-hosted demo or multi-user preview container.

Because financial records, GSTIN credentials, bank account numbers, and customer PII are processed, security boundaries must be strictly defended.

---

## 2. Identified Vulnerabilities & Risk Assessment

### 2.1 Path Traversal in File Operations (CRITICAL)
- **Current Issue**: Several endpoints in `server.js` accept IDs directly from URL parameters or request bodies to build file paths:
  ```javascript
  const filePath = path.join(BILLS_DIR, `${req.params.id}.json`);
  ```
- **Vulnerability**: If `req.params.id` contains `../../etc/passwd` or encoded `..%2F`, an attacker could read or overwrite arbitrary system files.
- **Remediation**:
  - Implement a mandatory path sanitization utility:
    ```javascript
    export function sanitizeFilename(filename) {
      if (!filename || typeof filename !== 'string') throw new ValidationError('Invalid filename');
      const clean = path.basename(filename).replace(/[^a-zA-Z0-9_\-\.]/g, '');
      if (!clean || clean.startsWith('.')) throw new ValidationError('Suspicious filename detected');
      return clean;
    }
    ```

### 2.2 Unrestricted Shell Script Execution via Control Panel (HIGH)
- **Current Issue**: In `server.js:933`, endpoint `POST /api/control-panel/launch-script` executes shell commands based on user input.
- **Remediation**:
  - Whitelist allowable commands strictly to an enumerated array:
    ```javascript
    const ALLOWED_SCRIPTS = new Set(['backup.bat', 'verify-release.mjs', 'restart.bat']);
    if (!ALLOWED_SCRIPTS.has(req.body.script)) {
      return res.status(403).json({ error: 'Command execution forbidden' });
    }
    ```

### 2.3 Cross-Site Scripting (XSS) in Invoice Notes & Templates (MEDIUM)
- **Current Issue**: Invoices allow custom HTML/rich-text in Terms & Conditions, Notes, and Bank details, which are rendered into `InvoicePreview.jsx` and converted to PDF via `html2canvas`.
- **Mitigation**:
  - Continue enforcing `DOMPurify.sanitize()` prior to rendering any unescaped HTML.
  - Enforce strict Content Security Policy (CSP) headers in Express middleware.

### 2.4 CORS Wildcard Restrictions (MEDIUM)
- **Current Issue**: Development setups sometimes set `Access-Control-Allow-Origin: *`.
- **Remediation**:
  - Restrict CORS origins strictly to localhost, configured container domains, and explicit reverse-proxy hostnames.

---

## 3. Authentication & Multi-User Roadmap

While the application is currently single-tenant local-first:
- Introduce an optional **PIN / Master Password Lock** in `server/shared/middleware/auth.js` for users deploying on shared office LANs.
- When enabled, requests require an `Authorization: Bearer <session_token>` header.
- Passwords must be hashed using `scrypt` or `bcrypt` with salt, stored in `data/auth.json`.
