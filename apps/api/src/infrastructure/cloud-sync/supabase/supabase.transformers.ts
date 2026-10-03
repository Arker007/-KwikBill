/**
 * Data transformation routines between local flat-file JSON / SQLite models and
 * Supabase PostgreSQL relational schemas.
 */

export interface Transformer<TLocal = any, TRemote = any> {
  toRemote(local: TLocal): TRemote | null;
  toLocal(remote: TRemote): TLocal | null;
}

export const SupabaseTransformers: Record<string, Transformer> = {
  // 1. Business Profiles
  business_profiles: {
    toRemote(local: any): any {
      if (!local) return null;
      const bName = String(local.businessName || local.name || 'My Business');
      return {
        id: String(local.id || 'primary'),
        business_name: bName,
        name: bName,
        brand_name: local.brandName || null,
        gstin: local.gstin || null,
        pan: local.pan || null,
        email: local.email || null,
        phone: local.phone || null,
        address: local.address || null,
        state: local.state || local.stateName || null,
        state_code: local.stateCode || local.state || null,
        state_name: local.stateName || local.state || null,
        pincode: local.pincode || null,
        bank_details: local.bankDetails || local.bank || {},
        signature_url: local.signatureUrl || null,
        logo_url: local.logoUrl || local.logo || null,
        lut_number: local.lutNumber || null,
        settings: local.settings || {},
        raw_payload: local,
        updated_at: new Date().toISOString()
      };
    },
    toLocal(remote: any): any {
      if (!remote) return null;
      if (remote.raw_payload && typeof remote.raw_payload === 'object' && remote.raw_payload.businessName) {
        return remote.raw_payload;
      }
      return {
        id: remote.id,
        businessName: remote.business_name || remote.name || 'My Business',
        name: remote.business_name || remote.name || 'My Business',
        gstin: remote.gstin || '',
        pan: remote.pan || '',
        email: remote.email || '',
        phone: remote.phone || '',
        address: remote.address || '',
        state: remote.state || remote.state_name || '',
        stateCode: remote.state_code || '',
        stateName: remote.state_name || remote.state || '',
        pincode: remote.pincode || '',
        bankDetails: remote.bank_details || {},
        signatureUrl: remote.signature_url || '',
        logoUrl: remote.logo_url || '',
        settings: remote.settings || {},
        updatedAt: remote.updated_at
      };
    }
  },

  // 2. Clients
  clients: {
    toRemote(local: any): any {
      if (!local || !local.id) return null;
      return {
        id: String(local.id),
        name: String(local.name || 'Unnamed Client'),
        trade_name: local.tradeName || local.trade_name || null,
        gstin: local.gstin || null,
        pan: local.pan || null,
        email: local.email || null,
        phone: local.phone || null,
        billing_address: local.billingAddress || local.address || null,
        shipping_address: local.shippingAddress || null,
        address: local.billingAddress || local.address || null,
        state: local.state || null,
        state_code: local.stateCode || local.state || null,
        pincode: local.pincode || null,
        credit_limit: Number(local.creditLimit || 0),
        credit_balance: Number(local.creditBalance || 0),
        outstanding_balance: Number(local.outstandingBalance || local.openingBalance || 0),
        opening_balance: Number(local.openingBalance || local.outstandingBalance || 0),
        notes: local.notes || null,
        custom_fields: local.customFields || {},
        raw_payload: local,
        updated_at: new Date().toISOString()
      };
    },
    toLocal(remote: any): any {
      if (!remote) return null;
      if (remote.raw_payload && typeof remote.raw_payload === 'object' && remote.raw_payload.name) {
        return remote.raw_payload;
      }
      return {
        id: remote.id,
        name: remote.name,
        tradeName: remote.trade_name || '',
        gstin: remote.gstin || '',
        pan: remote.pan || '',
        email: remote.email || '',
        phone: remote.phone || '',
        billingAddress: remote.billing_address || remote.address || '',
        shippingAddress: remote.shipping_address || '',
        address: remote.billing_address || remote.address || '',
        state: remote.state || '',
        stateCode: remote.state_code || '',
        pincode: remote.pincode || '',
        creditLimit: Number(remote.credit_limit || 0),
        outstandingBalance: Number(remote.outstanding_balance || remote.opening_balance || 0),
        openingBalance: Number(remote.opening_balance || remote.outstanding_balance || 0),
        notes: remote.notes || '',
        updatedAt: remote.updated_at
      };
    }
  },

  // 3. Products & Services
  products: {
    toRemote(local: any): any {
      if (!local || !local.id) return null;
      const sPrice = Number(local.sellingPrice || local.price || local.rate || 0);
      const stock = Number(local.stock || local.stockQuantity || local.currentStock || 0);
      const lowStock = Number(local.lowStockThreshold || local.lowStockAlert || 5);
      return {
        id: String(local.id),
        name: String(local.name || 'Unnamed Product'),
        sku: local.sku || null,
        hsn_code: local.hsn || local.hsnSac || local.hsnCode || null,
        hsn_sac: local.hsn || local.hsnSac || local.hsnCode || null,
        hsn: local.hsn || local.hsnSac || local.hsnCode || null,
        item_type: local.type || local.itemType || 'product',
        unit: local.unit || 'NOS',
        selling_price: sPrice,
        purchase_price: Number(local.purchasePrice || 0),
        rate: sPrice,
        tax_rate: Number(local.gst || local.taxRate || 18),
        cess_rate: Number(local.cess || local.cessRate || 0),
        current_stock: stock,
        stock_quantity: stock,
        low_stock_alert: lowStock,
        low_stock_threshold: lowStock,
        description: local.description || null,
        category: local.category || null,
        barcode: local.barcode || null,
        raw_payload: local,
        updated_at: new Date().toISOString()
      };
    },
    toLocal(remote: any): any {
      if (!remote) return null;
      if (remote.raw_payload && typeof remote.raw_payload === 'object' && remote.raw_payload.name) {
        const payload = remote.raw_payload;
        return {
          ...payload,
          sellingPrice: payload.sellingPrice ?? payload.price ?? payload.rate ?? Number(remote.selling_price || remote.rate || 0),
          price: payload.price ?? payload.sellingPrice ?? payload.rate ?? Number(remote.selling_price || remote.rate || 0),
          gst: payload.gst ?? payload.taxRate ?? Number(remote.tax_rate || 18),
          taxRate: payload.taxRate ?? payload.gst ?? Number(remote.tax_rate || 18),
        };
      }
      return {
        id: remote.id,
        name: remote.name,
        itemType: remote.item_type || 'product',
        type: remote.item_type || 'product',
        hsn: remote.hsn_code || remote.hsn_sac || remote.hsn || '',
        hsnSac: remote.hsn_sac || remote.hsn_code || '',
        sku: remote.sku || '',
        unit: remote.unit || 'NOS',
        sellingPrice: Number(remote.selling_price || remote.rate || 0),
        price: Number(remote.selling_price || remote.rate || 0),
        purchasePrice: Number(remote.purchase_price || 0),
        gst: Number(remote.tax_rate || 18),
        taxRate: Number(remote.tax_rate || 18),
        cess: Number(remote.cess_rate || 0),
        stock: Number(remote.stock_quantity || remote.current_stock || 0),
        stockQuantity: Number(remote.stock_quantity || remote.current_stock || 0),
        lowStockThreshold: Number(remote.low_stock_threshold || remote.low_stock_alert || 5),
        updatedAt: remote.updated_at
      };
    }
  },

  // 4. Bills / Invoices
  bills: {
    toRemote(local: any): any {
      if (!local || !local.id) return null;
      const gTotal = Number(local.totalAmount || local.grandTotal || local.total || local.data?.total || 0);
      const pAmount = Number(local.paidAmount || local.amountPaid || 0);
      const cId = local.clientId || local.data?.client?.id || null;

      return {
        id: String(local.id),
        invoice_number: String(local.invoiceNumber || local.data?.details?.invoiceNumber || local.id),
        invoice_type: local.invoiceType || local.data?.invoiceType || 'tax-invoice',
        doc_type: local.invoiceType || local.data?.invoiceType || 'tax_invoice',
        invoice_date: local.invoiceDate || local.data?.details?.invoiceDate || new Date().toISOString().slice(0, 10),
        due_date: local.data?.details?.dueDate || local.dueDate || null,
        client_id: (typeof cId === 'string' && cId.trim() !== '') ? cId.trim() : null,
        client_name: String(local.clientName || local.data?.client?.name || 'Cash Customer'),
        client_gstin: local.clientGstin || local.data?.client?.gstin || null,
        place_of_supply: local.placeOfSupply || local.data?.details?.placeOfSupply || null,
        is_interstate: Boolean(local.isInterstate || local.data?.isInterstate),
        is_reverse_charge: Boolean(local.isReverseCharge || local.data?.isReverseCharge),
        tax_mode: local.taxMode || 'exclusive',
        items: local.data?.items || local.items || [],
        subtotal: Number(local.subtotal || local.data?.subtotal || 0),
        discount_amount: Number(local.discountAmount || local.data?.discountAmount || 0),
        taxable_amount: Number(local.taxableAmount || local.data?.taxableAmount || 0),
        cgst_total: Number(local.cgst || local.cgstTotal || local.data?.cgst || 0),
        sgst_total: Number(local.sgst || local.sgstTotal || local.data?.sgst || 0),
        igst_total: Number(local.igst || local.igstTotal || local.data?.igst || 0),
        utgst_total: Number(local.utgst || local.utgstTotal || local.data?.utgst || 0),
        cess_total: Number(local.cess || local.cessTotal || local.data?.cess || 0),
        tcs_amount: Number(local.tcsAmount || local.data?.tcsAmount || 0),
        tds_amount: Number(local.tdsAmount || local.data?.tdsAmount || 0),
        round_off: Number(local.roundOff || local.data?.roundOff || 0),
        grand_total: gTotal,
        total_amount: gTotal,
        payment_status: local.status || local.paymentStatus || 'unpaid',
        status: local.status || local.paymentStatus || 'unpaid',
        paid_amount: pAmount,
        amount_paid: pAmount,
        balance_due: Number(local.balanceDue || Math.max(0, gTotal - pAmount)),
        notes: local.data?.notes || local.notes || null,
        terms: local.data?.terms || local.terms || null,
        raw_payload: local,
        updated_at: new Date().toISOString()
      };
    },
    toLocal(remote: any): any {
      if (!remote) return null;
      if (remote.raw_payload && typeof remote.raw_payload === 'object' && remote.raw_payload.id) {
        return remote.raw_payload;
      }
      return {
        id: remote.id,
        invoiceNumber: remote.invoice_number,
        clientName: remote.client_name,
        invoiceDate: remote.invoice_date,
        invoiceType: remote.invoice_type || remote.doc_type || 'tax-invoice',
        totalAmount: Number(remote.grand_total || remote.total_amount || 0),
        totalTaxAmount:
          Number(remote.cgst_total || 0) +
          Number(remote.sgst_total || 0) +
          Number(remote.igst_total || 0) +
          Number(remote.utgst_total || 0) +
          Number(remote.cess_total || 0),
        status: remote.status || remote.payment_status || 'unpaid',
        paidAmount: Number(remote.paid_amount || remote.amount_paid || 0),
        balanceDue: Number(remote.balance_due || 0),
        data: {
          client: { name: remote.client_name, gstin: remote.client_gstin || '' },
          details: {
            invoiceNumber: remote.invoice_number,
            invoiceDate: remote.invoice_date,
            dueDate: remote.due_date || '',
            placeOfSupply: remote.place_of_supply || ''
          },
          items: remote.items || [],
          subtotal: Number(remote.subtotal || 0),
          discountAmount: Number(remote.discount_amount || 0),
          notes: remote.notes || '',
          terms: remote.terms || ''
        },
        updatedAt: remote.updated_at
      };
    }
  },

  // 5. Expenses
  expenses: {
    toRemote(local: any): any {
      if (!local || !local.id) return null;
      const tAmount = Number(local.totalAmount || local.total || local.amount || 0);
      const vName = local.vendor || local.vendorName || local.payee || null;
      return {
        id: String(local.id),
        expense_number: local.expenseNumber || local.number || null,
        expense_date: local.date || local.expenseDate || new Date().toISOString().slice(0, 10),
        date: local.date || local.expenseDate || new Date().toISOString().slice(0, 10),
        category: String(local.category || 'General'),
        vendor: vName,
        vendor_name: vName,
        payee: vName,
        vendor_gstin: local.vendorGstin || null,
        tax_mode: local.taxMode || 'exempt',
        taxable_amount: Number(local.taxableAmount || local.amount || 0),
        tax_amount: Number(local.taxAmount || 0),
        total_amount: tAmount,
        amount: tAmount,
        payment_mode: local.paymentMode || local.paymentMethod || 'cash',
        payment_method: local.paymentMode || local.paymentMethod || 'cash',
        is_itc_eligible: Boolean(local.isItcEligible !== false),
        receipt_url: local.receiptUrl || null,
        notes: local.notes || null,
        raw_payload: local,
        updated_at: new Date().toISOString()
      };
    },
    toLocal(remote: any): any {
      if (!remote) return null;
      if (remote.raw_payload && typeof remote.raw_payload === 'object' && remote.raw_payload.category) {
        return remote.raw_payload;
      }
      return {
        id: remote.id,
        expenseNumber: remote.expense_number || '',
        date: remote.date || remote.expense_date,
        category: remote.category,
        vendor: remote.vendor || remote.vendor_name || remote.payee || '',
        vendorGstin: remote.vendor_gstin || '',
        taxableAmount: Number(remote.taxable_amount || 0),
        amount: Number(remote.total_amount || remote.amount || 0),
        taxAmount: Number(remote.tax_amount || 0),
        totalAmount: Number(remote.total_amount || remote.amount || 0),
        total: Number(remote.total_amount || remote.amount || 0),
        paymentMode: remote.payment_mode || remote.payment_method || 'cash',
        receiptUrl: remote.receipt_url || '',
        notes: remote.notes || '',
        updatedAt: remote.updated_at
      };
    }
  },

  // 6. Purchases
  purchases: {
    toRemote(local: any): any {
      if (!local || !local.id) return null;
      return {
        id: String(local.id),
        bill_number: String(local.billNumber || local.invoiceNumber || local.id),
        date: local.date || new Date().toISOString().slice(0, 10),
        supplier_name: String(local.supplierName || local.vendorName || local.vendor || 'Supplier'),
        supplier_gstin: local.supplierGstin || local.vendorGstin || null,
        items: local.items || [],
        total_amount: Number(local.totalAmount || local.total || 0),
        tax_amount: Number(local.taxAmount || 0),
        itc_eligibility: local.itcEligibility || 'eligible',
        raw_payload: local,
        updated_at: new Date().toISOString()
      };
    },
    toLocal(remote: any): any {
      if (!remote) return null;
      if (remote.raw_payload && typeof remote.raw_payload === 'object' && remote.raw_payload.billNumber) {
        return remote.raw_payload;
      }
      return {
        id: remote.id,
        billNumber: remote.bill_number,
        date: remote.date,
        supplierName: remote.supplier_name,
        supplierGstin: remote.supplier_gstin || '',
        items: remote.items || [],
        totalAmount: Number(remote.total_amount || 0),
        taxAmount: Number(remote.tax_amount || 0),
        itcEligibility: remote.itc_eligibility || 'eligible',
        updatedAt: remote.updated_at
      };
    }
  },

  // 7. Receipts
  receipts: {
    toRemote(local: any): any {
      if (!local || !local.id) return null;
      const bId = local.billId || null;
      const cId = local.clientId || null;
      return {
        id: String(local.id),
        receipt_number: String(local.receiptNumber || local.number || local.id),
        date: local.date || new Date().toISOString().slice(0, 10),
        bill_id: (typeof bId === 'string' && bId.trim() !== '') ? bId.trim() : null,
        client_id: (typeof cId === 'string' && cId.trim() !== '') ? cId.trim() : null,
        amount: Number(local.amount || 0),
        payment_mode: local.paymentMode || 'bank_transfer',
        transaction_ref: local.transactionRef || local.reference || null,
        notes: local.notes || null,
        raw_payload: local,
        updated_at: new Date().toISOString()
      };
    },
    toLocal(remote: any): any {
      if (!remote) return null;
      if (remote.raw_payload && typeof remote.raw_payload === 'object' && remote.raw_payload.receiptNumber) {
        return remote.raw_payload;
      }
      return {
        id: remote.id,
        receiptNumber: remote.receipt_number,
        date: remote.date,
        billId: remote.bill_id || null,
        clientId: remote.client_id || null,
        amount: Number(remote.amount || 0),
        paymentMode: remote.payment_mode || 'bank_transfer',
        transactionRef: remote.transaction_ref || '',
        notes: remote.notes || '',
        updatedAt: remote.updated_at
      };
    }
  },

  // 8. Recurring Invoices
  recurring: {
    toRemote(local: any): any {
      if (!local || !local.id) return null;
      return {
        id: String(local.id),
        client_name: String(local.clientName || 'Client'),
        frequency: local.frequency || 'monthly',
        next_run_date: local.nextRunDate || new Date().toISOString().slice(0, 10),
        status: local.status || 'active',
        template_payload: local.templatePayload || local.payload || local,
        raw_payload: local,
        updated_at: new Date().toISOString()
      };
    },
    toLocal(remote: any): any {
      if (!remote) return null;
      if (remote.raw_payload && typeof remote.raw_payload === 'object' && remote.raw_payload.id) {
        return remote.raw_payload;
      }
      return {
        id: remote.id,
        clientName: remote.client_name,
        frequency: remote.frequency,
        nextRunDate: remote.next_run_date,
        status: remote.status,
        templatePayload: remote.template_payload || {},
        updatedAt: remote.updated_at
      };
    }
  }
};
