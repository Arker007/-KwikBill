// scripts/migrate-json-to-sql.mjs
// Phase C / Phase 3: Data Migration Script (ETL)
// Migrates flat-file JSON collections from ./data/ into embedded SQLite (./data/accounting.db).
// Executes all operations inside a single ACID transaction (BEGIN IMMEDIATE / COMMIT).
//
// Usage:
//   node scripts/migrate-json-to-sql.mjs
//   node scripts/migrate-json-to-sql.mjs --dry-run
//   node scripts/migrate-json-to-sql.mjs --force

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getDb,
  initDb,
  closeDb,
  executeTransaction,
  getTableCounts,
} from '../server/infrastructure/db/sqlite.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

// CLI options
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isForce = args.includes('--force');

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

function toPaisa(rupees) {
  if (rupees === null || rupees === undefined || isNaN(Number(rupees))) {
    return 0;
  }
  return Math.round(Number(rupees) * 100);
}

function safeReadJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    if (!raw.trim()) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[WARN] Skipping unreadable JSON ${filePath}: ${err.message}`);
    return null;
  }
}

function getFinancialYear(dateStr) {
  try {
    const d = dateStr ? new Date(dateStr) : new Date();
    const year = isNaN(d.getFullYear()) ? new Date().getFullYear() : d.getFullYear();
    const month = isNaN(d.getMonth()) ? new Date().getMonth() : d.getMonth(); // 0-indexed
    if (month >= 3) {
      // April (3) onwards
      const nextYr = String(year + 1).slice(-2);
      return `${year}-${nextYr}`;
    } else {
      const prevYr = year - 1;
      const curYr = String(year).slice(-2);
      return `${prevYr}-${curYr}`;
    }
  } catch {
    return '2026-27';
  }
}

export function runMigration() {
  console.log(`${colors.bold}${colors.cyan}=================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  Free GST Billing Software — JSON to SQLite Migration (Plan C)   ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}=================================================================${colors.reset}\n`);

  if (isDryRun) {
    console.log(`${colors.yellow}[NOTICE] Running in DRY-RUN mode. No changes will be committed.${colors.reset}\n`);
  }

  // Ensure DB and schema are initialized
  initDb();
  const db = getDb();

  const migrationStats = {
    profiles: 0,
    clients: 0,
    products: 0,
    bills: 0,
    billItems: 0,
    receipts: 0,
    receiptAllocations: 0,
    expenses: 0,
    purchases: 0,
    purchaseItems: 0,
    recurring: 0,
    templates: 0,
    metaCounters: 0,
    appSettings: 0,
    financials: {
      totalBilledPaisa: 0,
      totalTaxPaisa: 0,
    },
  };

  const executeEtl = (txDb) => {
    // If force mode is active, clean existing data
    if (isForce) {
      console.log(`${colors.yellow}Cleaning existing SQLite tables (--force mode)...${colors.reset}`);
      const clearOrder = [
        'bill_items',
        'receipt_allocations',
        'receipts',
        'bills',
        'purchase_items',
        'purchases',
        'expenses',
        'products',
        'clients',
        'profiles',
        'recurring_templates',
        'terms_templates',
        'meta_counters',
        'app_settings',
      ];
      for (const tbl of clearOrder) {
        txDb.prepare(`DELETE FROM ${tbl};`).run();
      }
    }

    const now = Date.now();

    // -------------------------------------------------------------------------
    // 1. PROFILES
    // -------------------------------------------------------------------------
    const knownProfileIds = new Set();
    const profilesDir = path.join(DATA_DIR, 'profiles');
    const profileJsonPath = path.join(DATA_DIR, 'profile.json');

    const insertProfileStmt = txDb.prepare(`
      INSERT OR REPLACE INTO profiles (
        id, is_default, company_name, trade_name, gstin, pan, state_code, state_name,
        address_line1, address_line2, city, pincode, phone, email,
        bank_details_json, upi_id, signature_data_url, logo_data_url, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `);

    // First check individual files in data/profiles/
    if (fs.existsSync(profilesDir)) {
      for (const file of fs.readdirSync(profilesDir)) {
        if (!file.endsWith('.json')) continue;
        const pData = safeReadJson(path.join(profilesDir, file));
        if (!pData) continue;
        const pId = String(pData.id || path.basename(file, '.json'));
        insertProfileStmt.run(
          pId,
          pData.isDefault ? 1 : 0,
          pData.companyName || pData.businessName || 'My Business',
          pData.tradeName || null,
          pData.gstin || null,
          pData.pan || null,
          pData.stateCode || pData.state || '27',
          pData.stateName || pData.state || 'Maharashtra',
          pData.addressLine1 || pData.address || null,
          pData.addressLine2 || null,
          pData.city || null,
          pData.pincode || pData.pin || null,
          pData.phone || null,
          pData.email || null,
          pData.bankDetails ? JSON.stringify(pData.bankDetails) : null,
          pData.upiId || null,
          pData.signature || null,
          pData.logo || null,
          pData.createdAt ? new Date(pData.createdAt).getTime() : now,
          pData.updatedAt ? new Date(pData.updatedAt).getTime() : now
        );
        knownProfileIds.add(pId);
        migrationStats.profiles++;
      }
    }

    // Check data/profile.json (legacy primary profile)
    if (fs.existsSync(profileJsonPath)) {
      const pData = safeReadJson(profileJsonPath);
      if (pData) {
        const pId = 'profile_default';
        if (!knownProfileIds.has(pId)) {
          insertProfileStmt.run(
            pId,
            1, // is_default
            pData.companyName || pData.businessName || 'My Business',
            pData.tradeName || null,
            pData.gstin || null,
            pData.pan || null,
            pData.stateCode || pData.state || '27',
            pData.stateName || pData.state || 'Maharashtra',
            pData.addressLine1 || pData.address || null,
            pData.addressLine2 || null,
            pData.city || null,
            pData.pincode || pData.pin || null,
            pData.phone || null,
            pData.email || null,
            pData.bankDetails ? JSON.stringify(pData.bankDetails) : null,
            pData.upiId || null,
            pData.signature || null,
            pData.logo || null,
            now,
            now
          );
          knownProfileIds.add(pId);
          migrationStats.profiles++;
        }
      }
    }

    // Ensure fallback profile exists if nothing is in profiles
    const defaultProfileId = 'profile_default';
    if (!knownProfileIds.has(defaultProfileId)) {
      insertProfileStmt.run(
        defaultProfileId,
        1,
        'My Business',
        null,
        null,
        null,
        '27',
        'Maharashtra',
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        now,
        now
      );
      knownProfileIds.add(defaultProfileId);
      migrationStats.profiles++;
    }

    // -------------------------------------------------------------------------
    // 2. CLIENTS
    // -------------------------------------------------------------------------
    const knownClientIds = new Set();
    const clientsDir = path.join(DATA_DIR, 'clients');
    const insertClientStmt = txDb.prepare(`
      INSERT OR REPLACE INTO clients (
        id, profile_id, name, trade_name, gstin, pan, state_code, state_name,
        billing_address_json, shipping_address_json, is_sez,
        credit_limit_paisa, opening_balance_paisa, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `);

    if (fs.existsSync(clientsDir)) {
      for (const file of fs.readdirSync(clientsDir)) {
        if (!file.endsWith('.json')) continue;
        const cData = safeReadJson(path.join(clientsDir, file));
        if (!cData) continue;
        const cId = String(cData.id || cData._id || path.basename(file, '.json'));
        const clientProfileId = cData.profileId && knownProfileIds.has(cData.profileId)
          ? cData.profileId
          : defaultProfileId;

        insertClientStmt.run(
          cId,
          clientProfileId,
          cData.name || cData.clientName || 'Unnamed Client',
          cData.tradeName || null,
          cData.gstin || null,
          cData.pan || null,
          cData.stateCode || cData.state || '27',
          cData.stateName || cData.state || 'Maharashtra',
          cData.billingAddress ? JSON.stringify(cData.billingAddress) : (cData.address ? JSON.stringify({ address: cData.address }) : null),
          cData.shippingAddress ? JSON.stringify(cData.shippingAddress) : null,
          cData.isSEZ || cData.is_sez ? 1 : 0,
          toPaisa(cData.creditLimit),
          toPaisa(cData.openingBalance),
          cData.notes || null,
          cData.createdAt ? new Date(cData.createdAt).getTime() : now,
          cData.updatedAt ? new Date(cData.updatedAt).getTime() : now
        );
        knownClientIds.add(cId);
        migrationStats.clients++;
      }
    }

    // Fallback walk-in client
    const walkinClientId = 'client_walkin';
    if (!knownClientIds.has(walkinClientId)) {
      insertClientStmt.run(
        walkinClientId,
        defaultProfileId,
        'Walk-in Customer / Cash Sale',
        null,
        null,
        null,
        '27',
        'Maharashtra',
        null,
        null,
        0,
        0,
        0,
        'Default walk-in client for counter sales',
        now,
        now
      );
      knownClientIds.add(walkinClientId);
      migrationStats.clients++;
    }

    // -------------------------------------------------------------------------
    // 3. PRODUCTS
    // -------------------------------------------------------------------------
    const knownProductIds = new Set();
    const productsDir = path.join(DATA_DIR, 'products');
    const insertProductStmt = txDb.prepare(`
      INSERT OR REPLACE INTO products (
        id, profile_id, item_type, name, sku, hsn_sac, unit,
        purchase_price_paisa, selling_price_paisa, gst_rate_percent, cess_percent,
        stock_quantity, min_stock_alert, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `);

    if (fs.existsSync(productsDir)) {
      for (const file of fs.readdirSync(productsDir)) {
        if (!file.endsWith('.json')) continue;
        const prData = safeReadJson(path.join(productsDir, file));
        if (!prData) continue;
        const prId = String(prData.id || prData._id || path.basename(file, '.json'));
        const prProfileId = prData.profileId && knownProfileIds.has(prData.profileId)
          ? prData.profileId
          : defaultProfileId;

        insertProductStmt.run(
          prId,
          prProfileId,
          prData.itemType || prData.type || 'goods',
          prData.name || prData.title || 'Unnamed Product',
          prData.sku || null,
          prData.hsn_sac || prData.hsn || prData.sac || '',
          prData.unit || 'PCS',
          toPaisa(prData.purchasePrice ?? prData.costPrice ?? 0),
          toPaisa(prData.sellingPrice ?? prData.price ?? prData.rate ?? 0),
          Number(prData.gstRate ?? prData.taxRate ?? 18.0),
          Number(prData.cessPercent ?? prData.cess ?? 0.0),
          Number(prData.stockQuantity ?? prData.stock ?? 0.0),
          Number(prData.minStockAlert ?? prData.minAlert ?? 0.0),
          prData.createdAt ? new Date(prData.createdAt).getTime() : now,
          prData.updatedAt ? new Date(prData.updatedAt).getTime() : now
        );
        knownProductIds.add(prId);
        migrationStats.products++;
      }
    }

    // -------------------------------------------------------------------------
    // 4. BILLS & BILL ITEMS
    // -------------------------------------------------------------------------
    const billsDir = path.join(DATA_DIR, 'bills');
    const insertBillStmt = txDb.prepare(`
      INSERT OR REPLACE INTO bills (
        id, profile_id, client_id, invoice_number, invoice_type, date, due_date,
        financial_year, place_of_supply, is_interstate, is_reverse_charge,
        discount_mode, tax_inclusive,
        taxable_amount_paisa, cgst_amount_paisa, sgst_amount_paisa, igst_amount_paisa,
        utgst_amount_paisa, cess_amount_paisa, total_tax_paisa,
        tcs_amount_paisa, tds_amount_paisa, round_off_paisa, grand_total_paisa, balance_due_paisa,
        status, eway_bill_no, irn, qr_code_text, notes, terms, print_settings_json,
        is_deleted, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?
      );
    `);

    const insertBillItemStmt = txDb.prepare(`
      INSERT OR REPLACE INTO bill_items (
        id, bill_id, product_id, item_order, name, description, hsn_sac,
        quantity, unit, unit_price_paisa, discount_type, discount_base, discount_value,
        gst_rate_percent, cess_percent, taxable_amount_paisa,
        cgst_amount_paisa, sgst_amount_paisa, igst_amount_paisa, utgst_amount_paisa, cess_amount_paisa,
        total_tax_paisa, line_total_paisa
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?
      );
    `);

    const insertReceiptStmt = txDb.prepare(`
      INSERT OR REPLACE INTO receipts (
        id, profile_id, client_id, receipt_number, date, amount_paisa,
        payment_mode, reference_number, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `);

    const insertAllocationStmt = txDb.prepare(`
      INSERT OR REPLACE INTO receipt_allocations (
        id, receipt_id, bill_id, allocated_amount_paisa
      ) VALUES (?, ?, ?, ?);
    `);

    if (fs.existsSync(billsDir)) {
      for (const file of fs.readdirSync(billsDir)) {
        if (!file.endsWith('.json')) continue;
        const bData = safeReadJson(path.join(billsDir, file));
        if (!bData) continue;

        const bId = String(bData.id || path.basename(file, '.json'));
        const invNum = bData.invoiceNumber || bData.data?.details?.invoiceNumber || bId;
        const invDate = bData.invoiceDate || bData.data?.details?.invoiceDate || '2026-09-23';
        const dueDate = bData.dueDate || bData.data?.details?.dueDate || null;
        const fy = getFinancialYear(invDate);

        // Resolve Profile ID
        let profileId = defaultProfileId;
        if (bData.profileId && knownProfileIds.has(bData.profileId)) {
          profileId = bData.profileId;
        }

        // Resolve Client ID (or auto-create client for this bill if missing)
        let clientId = bData.clientId || bData.data?.client?.id;
        if (!clientId || !knownClientIds.has(clientId)) {
          const clientName = bData.clientName || bData.data?.client?.name || bData.data?.client?.clientName;
          if (clientName && clientName.trim()) {
            clientId = `client_from_bill_${bId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
            if (!knownClientIds.has(clientId)) {
              insertClientStmt.run(
                clientId,
                profileId,
                clientName,
                null,
                bData.data?.client?.gstin || null,
                bData.data?.client?.pan || null,
                bData.data?.client?.stateCode || bData.data?.client?.state || '27',
                bData.data?.client?.state || 'Maharashtra',
                bData.data?.client ? JSON.stringify(bData.data.client) : null,
                null,
                bData.data?.client?.isSEZ ? 1 : 0,
                0,
                0,
                `Auto-created from invoice ${invNum}`,
                now,
                now
              );
              knownClientIds.add(clientId);
              migrationStats.clients++;
            }
          } else {
            clientId = walkinClientId;
          }
        }

        // Financial extraction
        const taxablePaisa = toPaisa(bData.data?.totals?.taxableAmount ?? bData.taxableAmount ?? 0);
        const cgstPaisa = toPaisa(bData.data?.totals?.cgstAmount ?? bData.cgstAmount ?? 0);
        const sgstPaisa = toPaisa(bData.data?.totals?.sgstAmount ?? bData.sgstAmount ?? 0);
        const igstPaisa = toPaisa(bData.data?.totals?.igstAmount ?? bData.igstAmount ?? 0);
        const utgstPaisa = toPaisa(bData.data?.totals?.utgstAmount ?? bData.utgstAmount ?? 0);
        const cessPaisa = toPaisa(bData.data?.totals?.cessAmount ?? bData.cessAmount ?? 0);
        const totalTaxPaisa = toPaisa(bData.data?.totals?.totalTaxAmount ?? bData.totalTaxAmount ?? (cgstPaisa + sgstPaisa + igstPaisa + utgstPaisa + cessPaisa) / 100);
        const tcsPaisa = toPaisa(bData.data?.totals?.tcsAmount ?? bData.tcsAmount ?? 0);
        const tdsPaisa = toPaisa(bData.data?.totals?.tdsAmount ?? bData.tdsAmount ?? 0);
        const roundOffPaisa = toPaisa(bData.data?.totals?.roundOff ?? bData.roundOff ?? 0);
        const grandTotalPaisa = toPaisa(bData.data?.totals?.total ?? bData.totalAmount ?? 0);
        const paidPaisa = toPaisa(bData.paidAmount ?? 0);
        const balancePaisa = Math.max(0, grandTotalPaisa - paidPaisa);

        migrationStats.financials.totalBilledPaisa += grandTotalPaisa;
        migrationStats.financials.totalTaxPaisa += totalTaxPaisa;

        insertBillStmt.run(
          bId,
          profileId,
          clientId,
          invNum,
          bData.invoiceType || 'tax_invoice',
          invDate,
          dueDate,
          fy,
          bData.data?.details?.placeOfSupply || '',
          bData.data?.taxSummary?.isInterstate ? 1 : 0,
          bData.data?.taxSummary?.isRCM ? 1 : 0,
          bData.data?.settings?.discountMode || 'fixed_net',
          bData.data?.settings?.taxInclusive ? 1 : 0,
          taxablePaisa,
          cgstPaisa,
          sgstPaisa,
          igstPaisa,
          utgstPaisa,
          cessPaisa,
          totalTaxPaisa,
          tcsPaisa,
          tdsPaisa,
          roundOffPaisa,
          grandTotalPaisa,
          balancePaisa,
          bData.status || 'unpaid',
          bData.ewayBillNo || bData.data?.details?.ewayBillNo || null,
          bData.irn || bData.data?.details?.irn || null,
          bData.qrCodeText || null,
          bData.data?.details?.notes || bData.notes || null,
          bData.data?.details?.terms || bData.terms || null,
          bData.data?.settings ? JSON.stringify(bData.data.settings) : null,
          bData.isDeleted ? 1 : 0,
          bData.createdAt ? new Date(bData.createdAt).getTime() : now,
          bData.updatedAt ? new Date(bData.updatedAt).getTime() : now
        );
        migrationStats.bills++;

        // Migrate line items
        const rawItems = Array.isArray(bData.items)
          ? bData.items
          : (Array.isArray(bData.data?.items) ? bData.data.items : []);

        rawItems.forEach((itm, idx) => {
          const itmId = String(itm.id || `${bId}_item_${idx + 1}`);
          const prodId = itm.productId && knownProductIds.has(itm.productId) ? itm.productId : null;
          const lineTaxablePaisa = toPaisa(itm.taxableAmount ?? (itm.quantity * itm.rate));
          const lineCgstPaisa = toPaisa(itm.cgstAmount ?? 0);
          const lineSgstPaisa = toPaisa(itm.sgstAmount ?? 0);
          const lineIgstPaisa = toPaisa(itm.igstAmount ?? 0);
          const lineUtgstPaisa = toPaisa(itm.utgstAmount ?? 0);
          const lineCessPaisa = toPaisa(itm.cessAmount ?? 0);
          const lineTotalTaxPaisa = lineCgstPaisa + lineSgstPaisa + lineIgstPaisa + lineUtgstPaisa + lineCessPaisa;
          const lineTotalPaisa = toPaisa(itm.total ?? (lineTaxablePaisa + lineTotalTaxPaisa) / 100);

          insertBillItemStmt.run(
            itmId,
            bId,
            prodId,
            idx + 1,
            itm.name || itm.description || `Item #${idx + 1}`,
            itm.description || null,
            itm.hsn_sac || itm.hsn || '',
            Number(itm.quantity ?? 1),
            itm.unit || 'PCS',
            toPaisa(itm.rate ?? itm.price ?? 0),
            itm.discountType || 'fixed',
            itm.discountBase || 'net',
            Number(itm.discount ?? 0),
            Number(itm.taxRate ?? itm.gstRate ?? 18.0),
            Number(itm.cessRate ?? itm.cess ?? 0.0),
            lineTaxablePaisa,
            lineCgstPaisa,
            lineSgstPaisa,
            lineIgstPaisa,
            lineUtgstPaisa,
            lineCessPaisa,
            lineTotalTaxPaisa,
            lineTotalPaisa
          );
          migrationStats.billItems++;
        });

        // Migrate embedded payments into receipts & allocations
        if (Array.isArray(bData.payments) && bData.payments.length > 0) {
          bData.payments.forEach((pmt, pIdx) => {
            const rId = String(pmt.id || `receipt_${bId.replace(/[^a-zA-Z0-9_-]/g, '_')}_${pIdx + 1}`);
            const pmtAmountPaisa = toPaisa(pmt.amount);
            if (pmtAmountPaisa > 0) {
              insertReceiptStmt.run(
                rId,
                profileId,
                clientId,
                pmt.receiptNumber || `RCP-${invNum}-${pIdx + 1}`,
                pmt.date || invDate,
                pmtAmountPaisa,
                pmt.mode || 'bank',
                pmt.reference || null,
                pmt.notes || `Payment for invoice ${invNum}`,
                now,
                now
              );
              migrationStats.receipts++;

              insertAllocationStmt.run(
                `alloc_${rId}_${bId.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
                rId,
                bId,
                pmtAmountPaisa
              );
              migrationStats.receiptAllocations++;
            }
          });
        }
      }
    }

    // -------------------------------------------------------------------------
    // 5. SEPARATE RECEIPTS COLLECTION
    // -------------------------------------------------------------------------
    const receiptsDir = path.join(DATA_DIR, 'receipts');
    if (fs.existsSync(receiptsDir)) {
      for (const file of fs.readdirSync(receiptsDir)) {
        if (!file.endsWith('.json')) continue;
        const rData = safeReadJson(path.join(receiptsDir, file));
        if (!rData) continue;
        const rId = String(rData.id || path.basename(file, '.json'));
        const rProfileId = rData.profileId && knownProfileIds.has(rData.profileId)
          ? rData.profileId
          : defaultProfileId;
        const rClientId = rData.clientId && knownClientIds.has(rData.clientId)
          ? rData.clientId
          : walkinClientId;

        insertReceiptStmt.run(
          rId,
          rProfileId,
          rClientId,
          rData.receiptNumber || rId,
          rData.date || new Date().toISOString().split('T')[0],
          toPaisa(rData.amount),
          rData.paymentMode || rData.mode || 'bank',
          rData.referenceNumber || rData.reference || null,
          rData.notes || null,
          rData.createdAt ? new Date(rData.createdAt).getTime() : now,
          rData.updatedAt ? new Date(rData.updatedAt).getTime() : now
        );
        migrationStats.receipts++;

        // Allocations if present
        if (Array.isArray(rData.allocations)) {
          rData.allocations.forEach((al, aIdx) => {
            if (al.billId) {
              insertAllocationStmt.run(
                String(al.id || `alloc_${rId}_${aIdx + 1}`),
                rId,
                al.billId,
                toPaisa(al.amount)
              );
              migrationStats.receiptAllocations++;
            }
          });
        }
      }
    }

    // -------------------------------------------------------------------------
    // 6. EXPENSES
    // -------------------------------------------------------------------------
    const expensesDir = path.join(DATA_DIR, 'expenses');
    const insertExpenseStmt = txDb.prepare(`
      INSERT OR REPLACE INTO expenses (
        id, profile_id, category, vendor_name, vendor_gstin, date, financial_year,
        amount_paisa, gst_rate_percent, itc_eligible, itc_igst_paisa, itc_cgst_paisa, itc_sgst_paisa,
        receipt_url, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `);

    if (fs.existsSync(expensesDir)) {
      for (const file of fs.readdirSync(expensesDir)) {
        if (!file.endsWith('.json')) continue;
        const expData = safeReadJson(path.join(expensesDir, file));
        if (!expData) continue;
        const expId = String(expData.id || path.basename(file, '.json'));
        const expProfileId = expData.profileId && knownProfileIds.has(expData.profileId)
          ? expData.profileId
          : defaultProfileId;
        const expDate = expData.date || new Date().toISOString().split('T')[0];

        insertExpenseStmt.run(
          expId,
          expProfileId,
          expData.category || 'General',
          expData.vendorName || expData.vendor || null,
          expData.vendorGstin || null,
          expDate,
          getFinancialYear(expDate),
          toPaisa(expData.amount),
          Number(expData.gstRate ?? 0),
          expData.itcEligible !== false ? 1 : 0,
          toPaisa(expData.itcIgst ?? 0),
          toPaisa(expData.itcCgst ?? 0),
          toPaisa(expData.itcSgst ?? 0),
          expData.receiptUrl || null,
          expData.notes || null,
          expData.createdAt ? new Date(expData.createdAt).getTime() : now,
          expData.updatedAt ? new Date(expData.updatedAt).getTime() : now
        );
        migrationStats.expenses++;
      }
    }

    // -------------------------------------------------------------------------
    // 7. PURCHASES & PURCHASE ITEMS
    // -------------------------------------------------------------------------
    const purchasesDir = path.join(DATA_DIR, 'purchases');
    const insertPurchaseStmt = txDb.prepare(`
      INSERT OR REPLACE INTO purchases (
        id, profile_id, supplier_name, supplier_gstin, bill_number, date, financial_year,
        subtotal_paisa, tax_total_paisa, grand_total_paisa, itc_eligible, notes,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `);

    const insertPurchaseItemStmt = txDb.prepare(`
      INSERT OR REPLACE INTO purchase_items (
        id, purchase_id, name, hsn_sac, quantity, unit, unit_price_paisa,
        gst_rate_percent, taxable_amount_paisa, tax_amount_paisa, line_total_paisa
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `);

    if (fs.existsSync(purchasesDir)) {
      for (const file of fs.readdirSync(purchasesDir)) {
        if (!file.endsWith('.json')) continue;
        const puData = safeReadJson(path.join(purchasesDir, file));
        if (!puData) continue;
        const puId = String(puData.id || path.basename(file, '.json'));
        const puProfileId = puData.profileId && knownProfileIds.has(puData.profileId)
          ? puData.profileId
          : defaultProfileId;
        const puDate = puData.date || new Date().toISOString().split('T')[0];

        insertPurchaseStmt.run(
          puId,
          puProfileId,
          puData.supplierName || puData.supplier || 'Vendor',
          puData.supplierGstin || null,
          puData.billNumber || puData.invoiceNumber || puId,
          puDate,
          getFinancialYear(puDate),
          toPaisa(puData.subtotal),
          toPaisa(puData.taxTotal),
          toPaisa(puData.grandTotal ?? puData.total),
          puData.itcEligible !== false ? 1 : 0,
          puData.notes || null,
          puData.createdAt ? new Date(puData.createdAt).getTime() : now,
          puData.updatedAt ? new Date(puData.updatedAt).getTime() : now
        );
        migrationStats.purchases++;

        if (Array.isArray(puData.items)) {
          puData.items.forEach((pItm, piIdx) => {
            insertPurchaseItemStmt.run(
              String(pItm.id || `${puId}_item_${piIdx + 1}`),
              puId,
              pItm.name || `Item #${piIdx + 1}`,
              pItm.hsn_sac || pItm.hsn || '',
              Number(pItm.quantity ?? 1),
              pItm.unit || 'PCS',
              toPaisa(pItm.unitPrice ?? pItm.rate ?? 0),
              Number(pItm.gstRate ?? 18),
              toPaisa(pItm.taxableAmount ?? 0),
              toPaisa(pItm.taxAmount ?? 0),
              toPaisa(pItm.lineTotal ?? 0)
            );
            migrationStats.purchaseItems++;
          });
        }
      }
    }

    // -------------------------------------------------------------------------
    // 8. RECURRING INVOICES
    // -------------------------------------------------------------------------
    const recurringDir = path.join(DATA_DIR, 'recurring');
    const insertRecurringStmt = txDb.prepare(`
      INSERT OR REPLACE INTO recurring_templates (
        id, profile_id, client_id, frequency, next_issue_date, auto_generate,
        template_json, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `);

    if (fs.existsSync(recurringDir)) {
      for (const file of fs.readdirSync(recurringDir)) {
        if (!file.endsWith('.json')) continue;
        const recData = safeReadJson(path.join(recurringDir, file));
        if (!recData) continue;
        const recId = String(recData.id || path.basename(file, '.json'));
        const recProfileId = recData.profileId && knownProfileIds.has(recData.profileId)
          ? recData.profileId
          : defaultProfileId;
        const recClientId = recData.clientId && knownClientIds.has(recData.clientId)
          ? recData.clientId
          : walkinClientId;

        insertRecurringStmt.run(
          recId,
          recProfileId,
          recClientId,
          recData.frequency || 'monthly',
          recData.nextIssueDate || recData.nextDate || new Date().toISOString().split('T')[0],
          recData.autoGenerate ? 1 : 0,
          JSON.stringify(recData.template || recData),
          recData.isActive !== false ? 1 : 0,
          recData.createdAt ? new Date(recData.createdAt).getTime() : now,
          recData.updatedAt ? new Date(recData.updatedAt).getTime() : now
        );
        migrationStats.recurring++;
      }
    }

    // -------------------------------------------------------------------------
    // 9. TEMPLATES
    // -------------------------------------------------------------------------
    const templatesDir = path.join(DATA_DIR, 'templates');
    const insertTemplateStmt = txDb.prepare(`
      INSERT OR REPLACE INTO terms_templates (
        id, title, content, is_default, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?);
    `);

    if (fs.existsSync(templatesDir)) {
      for (const file of fs.readdirSync(templatesDir)) {
        if (!file.endsWith('.json')) continue;
        const tData = safeReadJson(path.join(templatesDir, file));
        if (!tData) continue;
        const tId = String(tData.id || path.basename(file, '.json'));

        insertTemplateStmt.run(
          tId,
          tData.title || tData.name || 'Untitled Template',
          tData.content || tData.terms || '',
          tData.isDefault ? 1 : 0,
          tData.createdAt ? new Date(tData.createdAt).getTime() : now,
          tData.updatedAt ? new Date(tData.updatedAt).getTime() : now
        );
        migrationStats.templates++;
      }
    }

    // -------------------------------------------------------------------------
    // 10. META COUNTERS & APP SETTINGS
    // -------------------------------------------------------------------------
    const metaPath = path.join(DATA_DIR, 'meta.json');
    const insertMetaCounterStmt = txDb.prepare(`
      INSERT OR REPLACE INTO meta_counters (prefix, financial_year, last_sequence, updated_at)
      VALUES (?, ?, ?, ?);
    `);

    const insertSettingStmt = txDb.prepare(`
      INSERT OR REPLACE INTO app_settings (key, value_json, updated_at)
      VALUES (?, ?, ?);
    `);

    if (fs.existsSync(metaPath)) {
      const metaData = safeReadJson(metaPath);
      if (metaData) {
        const curFy = getFinancialYear();
        for (const [k, v] of Object.entries(metaData)) {
          if (k.startsWith('counter_')) {
            const prefix = k.replace('counter_', '');
            insertMetaCounterStmt.run(prefix, curFy, Number(v) || 0, now);
            migrationStats.metaCounters++;
          } else {
            insertSettingStmt.run(k, JSON.stringify(v), now);
            migrationStats.appSettings++;
          }
        }
      }
    }
  };

  // Execute inside ACID transaction
  db.exec('PRAGMA foreign_keys = OFF;');
  try {
    if (isDryRun) {
      db.exec('BEGIN IMMEDIATE;');
      try {
        executeEtl(db);
        console.log(`${colors.yellow}[DRY-RUN] Execution completed cleanly. Rolling back changes...${colors.reset}`);
      } finally {
        db.exec('ROLLBACK;');
      }
    } else {
      executeTransaction((txDb) => {
        executeEtl(txDb);
      });
    }
  } finally {
    db.exec('PRAGMA foreign_keys = ON;');
  }

  const fkCheck = db.prepare('PRAGMA foreign_key_check;').all();
  if (fkCheck.length > 0) {
    throw new Error(`Foreign key integrity check failed after migration with ${fkCheck.length} violations`);
  }

  // Final Output
  console.log(`${colors.bold}Migration Summary:${colors.reset}`);
  console.log('-----------------------------------------------------------------');
  console.log(`  • Profiles Registered    : ${colors.bold}${migrationStats.profiles}${colors.reset}`);
  console.log(`  • Clients Migrated       : ${colors.bold}${migrationStats.clients}${colors.reset}`);
  console.log(`  • Products Migrated      : ${colors.bold}${migrationStats.products}${colors.reset}`);
  console.log(`  • Invoices (Bills)       : ${colors.bold}${migrationStats.bills}${colors.reset}`);
  console.log(`  • Invoice Line Items     : ${colors.bold}${migrationStats.billItems}${colors.reset}`);
  console.log(`  • Receipts & Allocations : ${colors.bold}${migrationStats.receipts}${colors.reset} receipts, ${colors.bold}${migrationStats.receiptAllocations}${colors.reset} allocations`);
  console.log(`  • Expenses Migrated      : ${colors.bold}${migrationStats.expenses}${colors.reset}`);
  console.log(`  • Purchases & Items      : ${colors.bold}${migrationStats.purchases}${colors.reset} purchases, ${colors.bold}${migrationStats.purchaseItems}${colors.reset} items`);
  console.log(`  • Recurring Templates    : ${colors.bold}${migrationStats.recurring}${colors.reset}`);
  console.log(`  • Terms Templates        : ${colors.bold}${migrationStats.templates}${colors.reset}`);
  console.log(`  • Numbering Counters     : ${colors.bold}${migrationStats.metaCounters}${colors.reset}`);
  console.log(`  • App Settings           : ${colors.bold}${migrationStats.appSettings}${colors.reset}`);
  console.log('-----------------------------------------------------------------');

  // Verify Table Counts in SQLite
  const tableCounts = getTableCounts();
  console.log(`\n${colors.bold}SQLite Target Database Status (${path.basename(db.filename || 'accounting.db')}):${colors.reset}`);
  for (const [tbl, count] of Object.entries(tableCounts)) {
    console.log(`  • ${tbl.padEnd(22)} : ${count} rows`);
  }

  console.log(`\n${colors.bold}${colors.green}=================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.green}  ✓ PLAN C (PHASE 3) ETL INGESTION COMPLETE & COMMITTED          ${colors.reset}`);
  console.log(`${colors.bold}${colors.green}=================================================================${colors.reset}\n`);

  closeDb();
  return migrationStats;
}

// CLI Execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    runMigration();
    process.exit(0);
  } catch (err) {
    console.error(`${colors.red}[FATAL] Migration failed:${colors.reset}`, err);
    closeDb();
    process.exit(1);
  }
}
