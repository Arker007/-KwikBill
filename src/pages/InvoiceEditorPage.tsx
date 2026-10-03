import React, { useState, useEffect } from 'react';
import { useInvoiceForm } from '@/features/invoices/hooks/useInvoiceForm';
import { InvoiceEditorHeader } from '@/features/invoices/components/InvoiceEditor/InvoiceEditorHeader';
import { ClientSelectSection } from '@/features/invoices/components/ClientSelectSection';
import { InvoiceItemsTable } from '@/features/invoices/components/InvoiceEditor/InvoiceItemsTable';
import { TwoColumnDetailsSection } from '@/features/invoices/components/InvoiceEditor/TwoColumnDetailsSection';
import { DocumentSettingsDrawer } from '@/features/invoices/components/InvoiceEditor/DocumentSettingsDrawer';

import InvoicePreview from '@/features/invoices/components/InvoicePreview/InvoicePreview';
import { LiveDocumentPreviewModal, PrintPreviewModal } from '@/features/invoices/components/Print';
import { ClientModal } from '@/features/clients/components/ClientModal';
import { ProductModal } from '@/features/inventory/components/ProductModal';
import { BillOCRModal } from '@/features/invoices/components/BillOCR/BillOCRModal';
import { getRegionMode } from '@/store';

import { getPrintSettings } from '@/features/invoices/utils/printSettings';
import { downloadInvoicePDF, printInvoicePDF, createInvoicePDFBlob } from '@/features/invoices/services/pdfService';
import { openWhatsAppShare } from '@/shared/utils/share';
import { toast } from '@/shared/components/feedback/Toast';
import {
  getPaperSize,
  formatCurrency,
  getCountryConfig,
  getStatesForCountry,
  getCountriesForRegion,
  filterUnitsByMode,
} from '@/shared/utils';

interface InvoiceEditorPageProps {
  onBack: () => void;
  profileProp?: any;
  editingBill?: any;
}

export default function InvoiceEditorPage({ onBack, profileProp, editingBill }: InvoiceEditorPageProps) {
  const form = useInvoiceForm({ onBack, profileProp, editingBill });

  const {
    // States
    allProfiles,
    activeProfile,
    setActiveProfile,
    profile,
    invoiceType,
    setInvoiceType,
    handleTypeChange,
    client,
    setClient,
    details,
    setDetails,
    items,
    setItems,
    allBillsForCredit,
    creditToApply,
    setCreditToApply,
    units,
    setUnits,
    taxInclusive,
    setTaxInclusive,
    saving,
    setSaving,
    termsTemplates,
    setTermsTemplates,
    selectedTermsId,
    setSelectedTermsId,
    customTerms,
    setCustomTerms,
    customNotes,
    setCustomNotes,
    internalNote,
    setInternalNote,
    extraSections,
    setExtraSections,
    savedClients,
    setSavedClients,
    showClientSuggestions,
    setShowClientSuggestions,
    clientPickerIdx,
    setClientPickerIdx,
    selectedClientId,
    setSelectedClientId,
    showClientModal,
    setShowClientModal,
    modalClient,
    setModalClient,
    isEditingClient,
    setIsEditingClient,
    showProductModal,
    setShowProductModal,
    modalProduct,
    isEditingProduct,
    openAddProductModal,
    handleProductModalSave,
    products,
    productSearch,
    setProductSearch,
    invoiceOptions,
    setInvoiceOptions,
    toggleOption,
    showOptions,
    setShowOptions,
    showPrintPreview,
    setShowPrintPreview,
    previewZoom,
    setPreviewZoom,
    previewCollapsed,
    setPreviewCollapsed,
    previewNatural,
    autoSaveStatus,
    leaveModal,
    setLeaveModal,

    // Computed / Memoized
    totals,
    clientCredit,
    filteredClients,
    getProductSuggestions,
    countryTaxRates,
    taxLabel,

    // Functions
    handleFitToWidth,
    validateForSave,
    saveInvoiceToDB,
    handleBack,
    leaveActions,
    addProductItem,
    addItem,
    removeItem,
    handleItemChange,
    selectProduct,
    handleAddCustomUnit,
    handleRemoveCustomUnit,
    handleTermsSelect,
    selectSavedClient,
    openAddClientModal,
    openEditClientModal,
    handleClientModalSave,
    uploadToGoogleDrive,
    buildPDF,
    clampNonNeg,
    isMeaningfulInvoice,

    // Refs
    previewPaneRef,
    printRef,
    clientNameRef,
    clientSuggestionsRef,
  } = form;

  const [showAiOcr, setShowAiOcr] = useState(false);
  const [supplyType, setSupplyType] = useState('Regular');

  // Shared print-via-iframe helper
  const printViaIframe = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    let cleaned = false;
    const cleanup = () => {
      if (!cleaned) {
        cleaned = true;
        URL.revokeObjectURL(url);
      }
    };
    const timer = setTimeout(cleanup, 90_000);
    try {
      let frame = document.getElementById('fgsb-print-frame') as HTMLIFrameElement | null;
      if (!frame) {
        frame = document.createElement('iframe');
        frame.id = 'fgsb-print-frame';
        frame.style.position = 'fixed';
        frame.style.right = '0';
        frame.style.bottom = '0';
        frame.style.width = '0';
        frame.style.height = '0';
        frame.style.border = '0';
        document.body.appendChild(frame);
      }
      frame.onload = () => {
        try {
          frame?.contentWindow?.focus();
          frame?.contentWindow?.print();
        } catch (e) {
          // If browser restricts accessing contentWindow.print on a cross-origin PDF viewer frame (such as in AI Studio),
          // gracefully fallback to opening the PDF blob directly in a new tab for native printing.
          try {
            window.open(url, '_blank');
          } catch (err) {
            console.warn('Direct print window fallback failed:', err);
          }
        }
      };
      frame.src = url;
    } catch (err) {
      console.warn('Direct print initialization failed:', err);
      cleanup();
      clearTimeout(timer);
    }
  };

  const isThermalPaper = () => getPaperSize(invoiceOptions.paperSize, invoiceOptions).kind === 'thermal';

  const withPreviewOnScreen = async <T,>(fn: () => Promise<T>): Promise<T> => {
    return await fn();
  };

  const executePrint = async () => {
    setSaving(true);
    try {
      const invoiceData = {
        profile,
        client,
        details,
        items,
        totals,
        invoiceType,
        customTerms,
        customNotes,
        extraSections,
        options: invoiceOptions,
      };
      await printInvoicePDF({ invoiceData, printSettings: getPrintSettings() });
    } catch (err) {
      console.error('Print failed', err);
      toast('Print failed — try Download PDF instead', 'error');
    } finally {
      setSaving(false);
    }
  };

  const directPrint = async () => {
    const problem = validateForSave();
    if (problem) {
      toast(problem, 'warning');
      return;
    }
    if (isThermalPaper()) {
      setShowPrintPreview(true);
      return;
    }
    await executePrint();
  };

  const generatePDF = async () => {
    const problem = validateForSave();
    if (problem) {
      toast(problem, 'warning');
      return;
    }
    try {
      setSaving(true);
      const invoiceData = {
        profile,
        client,
        details,
        items,
        totals,
        invoiceType,
        customTerms,
        customNotes,
        extraSections,
        options: invoiceOptions,
      };
      const fileName = `${invoiceType === 'credit-note' ? 'CN' : 'INV'}_${(details.invoiceNumber || '001').replace(/\//g, '-')}.pdf`;
      await downloadInvoicePDF({ invoiceData, fileName, printSettings: getPrintSettings() });

      const prevPrinted = Number(editingBill?.printedCount) || 0;
      const printedPatch = {
        printedCount: prevPrinted + 1,
        lastPrintedAt: new Date().toISOString(),
      };
      await saveInvoiceToDB(false, printedPatch);

      const pdfBlob = await createInvoicePDFBlob({ invoiceData, printSettings: getPrintSettings() });
      const invoiceDate = details.invoiceDate ? new Date(details.invoiceDate) : new Date();
      const monthName = invoiceDate.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
      const clientName = client?.name || 'General';
      const params = new URLSearchParams({ name: fileName, client: clientName, month: monthName });
      fetch(`/api/save-pdf?${params}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/pdf' },
        body: pdfBlob,
      }).catch(() => {});

      toast(`Invoice downloaded & saved to Saved Invoices/${clientName}/`, 'success');
      uploadToGoogleDrive(pdfBlob, fileName);
    } catch (err) {
      console.error(err);
      toast('Failed to generate PDF.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const shareWhatsApp = () => {
    const cur = invoiceOptions.currency || 'INR';
    const total = formatCurrency(Number(totals.total) || 0, cur);
    const subtotal = formatCurrency(Number(totals.subtotal) || 0, cur);
    const dateStr = details.invoiceDate
      ? new Date(details.invoiceDate).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : '';
    const businessName = profile?.businessName || '';
    const lines = [
      `*Invoice: ${details.invoiceNumber || 'New'}*`,
      `Date: ${dateStr}`,
      `Client: ${client?.name || ''}`,
      `Subtotal: ${subtotal}`,
      `*Total: ${total}*`,
    ];
    if (businessName) lines.push('', `— ${businessName}`);
    openWhatsAppShare(client?.phone, lines.join('\n'));
  };

  const exportEWayBill = () => {
    toast('E-Way Bill export is supported for registered businesses with GSTIN.', 'info');
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      await saveInvoiceToDB(true, { status: 'Draft' });
      toast('Saved as Draft', 'success');
    } catch (err) {
      console.error(err);
      toast('Failed to save draft', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndPrint = async () => {
    try {
      setSaving(true);
      await saveInvoiceToDB(true);
      setShowPrintPreview(true);
    } catch (err) {
      console.error(err);
      toast('Failed to save invoice', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveStandard = async () => {
    const problem = validateForSave();
    if (problem) {
      toast(problem, 'warning');
      return;
    }
    try {
      setSaving(true);
      await saveInvoiceToDB(true);
      toast('Invoice saved successfully!', 'success');
    } catch (err) {
      console.error(err);
      toast('Failed to save invoice', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleOcrExtracted = (data: any) => {
    if (data.items && data.items.length > 0) {
      const newItems = data.items.map((it: any, idx: number) => ({
        id: (Date.now() + idx).toString(),
        name: it.name || '',
        hsn: it.hsn || '',
        quantity: it.quantity || 1,
        rate: it.rate || 0,
        unit: 'Nos',
        taxPercent: it.taxPercent || 18,
        discount: 0,
        discountType: 'percent',
      }));
      setItems(newItems);
    }

    if (data.supplierName && !client?.name) {
      setClient((prev: any) => ({
        ...prev,
        name: data.supplierName,
        gstin: data.supplierGstin || prev?.gstin || '',
      }));
    }

    if (data.invoiceNumber) {
      setDetails((prev: any) => ({ ...prev, invoiceNumber: data.invoiceNumber }));
    }

    if (data.date) {
      setDetails((prev: any) => ({ ...prev, invoiceDate: data.date }));
    }

    setShowAiOcr(false);
    toast('Line items extracted with AI successfully!', 'success');
  };

  const handleOpenCustomHeaders = () => {
    const el = document.getElementById('custom-headers-tags-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && leaveModal) {
        e.preventDefault();
        setLeaveModal(false);
        return;
      }
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      if (e.key === 's' || e.key === 'S') {
        if (!isMeaningfulInvoice()) return;
        e.preventDefault();
        saveInvoiceToDB(true)
          .then(() => toast('Invoice saved', 'success'))
          .catch(() => toast('Save failed', 'error'));
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setTimeout(() => generatePDF(), 0);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        addItem();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMeaningfulInvoice, leaveModal, saveInvoiceToDB, addItem, generatePDF]);

  return (
    <div className="bg-[#f8fafc] dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs antialiased font-sans pb-24 min-h-full w-full" id="invoice-editor-page-wrapper">
      {/* Main Header & Sub-header Controls */}
      <InvoiceEditorHeader
        handleBack={handleBack}
        autoSaveStatus={autoSaveStatus}
        saving={saving}
        setSaving={setSaving}
        isMeaningfulInvoice={isMeaningfulInvoice}
        saveInvoiceToDB={saveInvoiceToDB}
        directPrint={directPrint}
        generatePDF={generatePDF}
        shareWhatsApp={shareWhatsApp}
        exportEWayBill={exportEWayBill}
        previewCollapsed={previewCollapsed}
        setPreviewCollapsed={setPreviewCollapsed}
        client={client}
        clientNameRef={clientNameRef}
        addItem={addItem}
        validateForSave={validateForSave}
        invoiceType={invoiceType}
        onTypeChange={(type) => {
          setInvoiceType(type);
          handleTypeChange(type);
        }}
        isThermalPaper={isThermalPaper}
        onOpenSettings={() => setShowOptions(true)}
        onOpenCustomHeaders={handleOpenCustomHeaders}
        details={details}
        setDetails={setDetails}
        editingBill={editingBill}
        profile={profile}
        allProfiles={allProfiles}
        onSwitchProfile={setActiveProfile}
        supplyType={supplyType}
        onSupplyTypeChange={setSupplyType}
      />

      {/* Main Form Container */}
      <main className="max-w-[1720px] mx-auto px-6 py-4 space-y-4">
        {/* Section 1: Customer and Details + Custom Headers */}
        <ClientSelectSection
          editingBill={editingBill}
          client={client}
          setClient={setClient}
          savedClients={savedClients}
          filteredClients={filteredClients}
          showClientSuggestions={showClientSuggestions}
          setShowClientSuggestions={setShowClientSuggestions}
          clientPickerIdx={clientPickerIdx}
          setClientPickerIdx={setClientPickerIdx}
          selectedClientId={selectedClientId}
          setSelectedClientId={setSelectedClientId}
          selectSavedClient={selectSavedClient}
          openAddClientModal={openAddClientModal}
          openEditClientModal={openEditClientModal}
          clientCredit={clientCredit}
          creditToApply={creditToApply}
          setCreditToApply={setCreditToApply}
          totals={totals}
          invoiceOptions={invoiceOptions}
          setInvoiceOptions={setInvoiceOptions}
          clientNameRef={clientNameRef}
          clientSuggestionsRef={clientSuggestionsRef}
          profile={profile}
          getCountriesForRegion={getCountriesForRegion}
          getRegionMode={getRegionMode}
          getCountryConfig={getCountryConfig}
          getStatesForCountry={getStatesForCountry}
          formatCurrency={formatCurrency}
          details={details}
          setDetails={setDetails}
          invoiceType={invoiceType}
        />

        {/* Section 2: Products & Services Section */}
        <InvoiceItemsTable
          items={items}
          invoiceOptions={invoiceOptions}
          setInvoiceOptions={setInvoiceOptions}
          taxInclusive={taxInclusive}
          setTaxInclusive={setTaxInclusive}
          units={units}
          countryTaxRates={countryTaxRates}
          filterUnitsByMode={filterUnitsByMode}
          profile={profile}
          getProductSuggestions={getProductSuggestions}
          handleItemChange={handleItemChange}
          selectProduct={selectProduct}
          setProductSearch={setProductSearch}
          handleAddCustomUnit={handleAddCustomUnit}
          handleRemoveCustomUnit={handleRemoveCustomUnit}
          removeItem={removeItem}
          clampNonNeg={clampNonNeg}
          addItem={addItem}
          addProductItem={addProductItem}
          formatCurrency={formatCurrency}
          onOpenAddProductModal={openAddProductModal}
          onOpenAiOcr={() => setShowAiOcr(true)}
          onOpenSettings={() => setShowOptions(true)}
          onSaveDraft={handleSaveDraft}
          onSavePrint={handleSaveAndPrint}
          onSave={handleSaveStandard}
          products={products}
          invoiceType={invoiceType}
        />

        {/* Section 3: Two Column Details Section (Notes, Terms, E-way, Attachments, Totals, Bank, Signature) + Bottom Action Bar + Footer */}
        <TwoColumnDetailsSection
          totals={totals}
          invoiceOptions={invoiceOptions}
          setInvoiceOptions={setInvoiceOptions}
          customNotes={customNotes}
          setCustomNotes={setCustomNotes}
          customTerms={customTerms}
          setCustomTerms={setCustomTerms}
          termsTemplates={termsTemplates}
          selectedTermsId={selectedTermsId}
          setSelectedTermsId={setSelectedTermsId}
          handleTermsSelect={handleTermsSelect}
          profile={profile}
          formatCurrency={formatCurrency}
          onOpenSettings={() => setShowOptions(true)}
          onSaveDraft={handleSaveDraft}
          onSavePrint={handleSaveAndPrint}
          onSave={handleSaveStandard}
          shareWhatsApp={shareWhatsApp}
          exportEWayBill={exportEWayBill}
          clampNonNeg={clampNonNeg}
        />
      </main>

      {/* Hidden container for printRef generation */}
      <div
        ref={previewPaneRef}
        style={{ position: 'absolute', left: '-99999px', top: 0, width: '794px', pointerEvents: 'none', opacity: 0 }}
      >
        <InvoicePreview
          ref={printRef}
          profile={profile}
          client={client}
          details={details}
          items={items}
          totals={totals}
          invoiceType={invoiceType}
          customTerms={customTerms}
          customNotes={customNotes}
          extraSections={extraSections}
          options={invoiceOptions}
        />
      </div>

      {/* Live Document Preview Modal (Ant Design components only) */}
      <LiveDocumentPreviewModal
        isOpen={!previewCollapsed}
        onClose={() => setPreviewCollapsed(true)}
        onPrint={directPrint}
        onDownloadPdf={generatePDF}
        profile={profile}
        client={client}
        details={details}
        items={items}
        totals={totals}
        invoiceType={invoiceType}
        customTerms={customTerms}
        customNotes={customNotes}
        extraSections={extraSections}
        invoiceOptions={invoiceOptions}
      />

      {/* Bill OCR AI Modal */}
      {showAiOcr && (
        <BillOCRModal onClose={() => setShowAiOcr(false)} onExtracted={handleOcrExtracted} />
      )}

      {/* Print Preview Modal */}
      <PrintPreviewModal
        isOpen={showPrintPreview}
        onClose={() => setShowPrintPreview(false)}
        onPrint={executePrint}
        onDownloadPdf={generatePDF}
        profile={profile}
        client={client}
        details={details}
        items={items}
        totals={totals}
        invoiceType={invoiceType}
        customTerms={customTerms}
        customNotes={customNotes}
        extraSections={extraSections}
        invoiceOptions={invoiceOptions}
      />

      {/* Client Modal */}
      <ClientModal
        show={showClientModal}
        onClose={() => setShowClientModal(false)}
        onSave={handleClientModalSave}
        client={modalClient}
        isEditing={isEditingClient}
        defaultCountry={profile?.country}
      />

      {/* Product Modal */}
      <ProductModal
        show={showProductModal}
        onClose={() => setShowProductModal(false)}
        onSave={handleProductModalSave}
        editingId={isEditingProduct && modalProduct?.id ? modalProduct.id : null}
        product={modalProduct}
        units={units}
        categories={Array.from(new Set((products || []).map((p: any) => p.category).filter(Boolean)))}
      />

      {/* Document Settings Drawer */}
      <DocumentSettingsDrawer
        isOpen={showOptions}
        onClose={() => setShowOptions(false)}
        invoiceOptions={invoiceOptions}
        setInvoiceOptions={setInvoiceOptions}
        toggleOption={toggleOption}
        profile={profile}
      />

      {/* Unsaved Changes Confirmation Modal */}
      {leaveModal && (
        <div className="modal-overlay" onClick={leaveActions.cancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <h3 style={{ marginTop: 0 }}>Unsaved changes</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              This invoice has changes that haven&apos;t been saved yet. What do you want to do?
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={leaveActions.cancel}>
                Keep editing
              </button>
              <button
                className="btn btn-secondary"
                style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                onClick={leaveActions.discardAndExit}
              >
                Discard &amp; leave
              </button>
              <button className="btn btn-primary" onClick={leaveActions.saveAndExit}>
                Save &amp; leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
