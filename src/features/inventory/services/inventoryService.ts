import { getAllProducts, saveProduct as storeSaveProduct, deleteProduct as storeDeleteProduct, getProfile, getStockAlertSettings } from '../../../store';
import { Product, StockAlertSettings } from '../types';

export async function fetchProducts(): Promise<Product[]> {
  return await getAllProducts();
}

export async function saveProduct(product: Partial<Product>): Promise<void> {
  await storeSaveProduct(product);
}

export async function deleteProduct(id: string): Promise<void> {
  await storeDeleteProduct(id);
}

export async function fetchProfile(): Promise<any> {
  return await getProfile();
}

export async function fetchStockAlertSettings(): Promise<StockAlertSettings> {
  return await getStockAlertSettings();
}

export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

export async function importProductsFromCSV(fileText: string): Promise<number> {
  const lines = fileText.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return 0;

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
  let imported = 0;

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = (values[idx] || '').trim();
    });
    const name = row.name || row.product || row['product name'] || '';
    if (!name) continue;

    const sellingPrice = row.sellingprice || row.rate || row.price ? parseFloat(row.sellingprice || row.rate || row.price) || 0 : 0;
    const purchasePrice = row.purchaseprice || row.cost ? parseFloat(row.purchaseprice || row.cost) || 0 : 0;
    const itemType = (row.type || '').toLowerCase().includes('serv') ? 'service' : 'product';
    const taxType = (row.taxtype || '').toLowerCase().includes('incl') ? 'inclusive' : 'exclusive';

    await saveProduct({
      name,
      type: itemType,
      category: row.category || row.group || '',
      hsn: row.hsn || row['hsn code'] || row['sac'] || '',
      sellingPrice,
      purchasePrice,
      rate: sellingPrice,
      taxPercent: row.taxpercent || row['tax%'] || row['gst%'] || row['tax'] ? parseFloat(row.taxpercent || row['tax%'] || row['gst%'] || row['tax']) || 0 : 0,
      taxType,
      unit: row.unit || 'NOS',
      stock: row.stock || row.quantity ? parseFloat(row.stock || row.quantity) || 0 : 0,
      barcode: row.barcode || '',
      description: row.description || '',
    });
    imported++;
  }

  return imported;
}
