import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { ViewId, VALID_VIEWS, VIEW_MODULE_MAP } from '@/app/router/routes';
import { getEnabledModules } from '@/store';
import { isModuleEnabled } from '@/shared/utils';

export interface UseAppRouterReturn {
  currentView: ViewId;
  setCurrentView: (view: ViewId) => void;
  editingBill: any;
  setEditingBill: React.Dispatch<React.SetStateAction<any>>;
  handleNewInvoice: (initialType?: string) => void;
  handleEditInvoice: (bill: any) => void;
  handleDuplicateInvoice: (bill: any) => void;
  handleConvertToInvoice: (bill: any) => void;
  handleCloseInvoice: () => void;
  enabledModules: Record<string, boolean>;
  isModuleVisible: (moduleId?: string) => boolean;
}

export function useAppRouter(): UseAppRouterReturn {
  const [currentView, setCurrentView] = useState<ViewId>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const v = params.get('view') as ViewId;
      if (v && VALID_VIEWS.includes(v)) {
        window.history.replaceState({}, '', window.location.pathname);
        return v;
      }
    } catch {
      /* sandboxed history API fallback */
    }
    const saved = sessionStorage.getItem('gst_currentView') as ViewId;
    return saved && VALID_VIEWS.includes(saved) ? saved : 'dashboard';
  });

  const [editingBill, setEditingBill] = useState<any>(() => {
    try {
      const saved = sessionStorage.getItem('gst_editingBill');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    sessionStorage.setItem('gst_currentView', currentView);
  }, [currentView]);

  useEffect(() => {
    if (editingBill) {
      sessionStorage.setItem('gst_editingBill', JSON.stringify(editingBill));
    } else {
      sessionStorage.removeItem('gst_editingBill');
    }
  }, [editingBill]);

  const handleNewInvoice = useCallback((initialType?: string) => {
    sessionStorage.removeItem('gst_invoiceDraft');
    if (initialType) {
      setEditingBill({ _initialType: initialType });
    } else {
      setEditingBill(null);
    }
    setCurrentView('new');
  }, []);

  const handleEditInvoice = useCallback((bill: any) => {
    sessionStorage.removeItem('gst_invoiceDraft');
    setEditingBill(bill);
    setCurrentView('new');
  }, []);

  const handleDuplicateInvoice = useCallback((bill: any) => {
    sessionStorage.removeItem('gst_invoiceDraft');
    const clone = JSON.parse(JSON.stringify(bill));
    clone._isDuplicate = true;
    setEditingBill(clone);
    setCurrentView('new');
  }, []);

  const handleConvertToInvoice = useCallback((bill: any) => {
    sessionStorage.removeItem('gst_invoiceDraft');
    const clone = JSON.parse(JSON.stringify(bill));
    clone._isDuplicate = true;
    clone._convertToType = 'tax-invoice';
    setEditingBill(clone);
    setCurrentView('new');
  }, []);

  const handleCloseInvoice = useCallback(() => {
    setEditingBill(null);
    setCurrentView('dashboard');
  }, []);

  const enabledModules = getEnabledModules();
  const isModuleVisible = useCallback(
    (moduleId?: string) => {
      if (!moduleId) return true;
      return isModuleEnabled(moduleId, enabledModules);
    },
    [enabledModules]
  );

  useEffect(() => {
    const moduleForView = VIEW_MODULE_MAP[currentView];
    if (moduleForView && !isModuleEnabled(moduleForView, enabledModules)) {
      setCurrentView('dashboard');
    }
  }, [currentView, enabledModules]);

  return {
    currentView,
    setCurrentView,
    editingBill,
    setEditingBill,
    handleNewInvoice,
    handleEditInvoice,
    handleDuplicateInvoice,
    handleConvertToInvoice,
    handleCloseInvoice,
    enabledModules,
    isModuleVisible,
  };
}

export default useAppRouter;
