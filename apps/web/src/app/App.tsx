import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import {
  FileText,
  Search,
  Command,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { AppProviders } from '../platform/providers/AppProviders';
import { AppShell, Header as AppHeader, Sidebar as AppSidebar } from '../platform/layout';
import { BannerHost } from '@/app/layout/BannerHost';
import { useAppRouter } from '../platform/router/useAppRouter';
import { APP_ROUTES, ViewId } from '@/app/router';

import SetupWizard from '@/features/settings/components/SetupWizard';
import WelcomeGuide from '@/features/settings/components/WelcomeGuide';
import { FeedbackContainer } from '@/shared/components/feedback';


import {
  getAllProfiles,
  saveProfile,
  getAllBills,
  getAllProducts,
  getAllClients,
  getStockAlertSettings,
} from '@/store';
import { getUpcomingFilings } from '@/shared/utils';
import { getPrintSettings } from '@/features/invoices/utils/printSettings';

// Lightweight Suspense fallback shown while a lazy route chunk downloads
function ViewLoading() {
  return (
    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', width: '100%' }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        <span
          style={{
            display: 'inline-block',
            width: 14,
            height: 14,
            border: '2px solid var(--border-color, #e2e8f0)',
            borderTopColor: 'var(--primary, #3b82f6)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        Loading…
      </div>
    </div>
  );
}

function AppContent() {
  const router = useAppRouter();
  const {
    currentView,
    setCurrentView,
    editingBill,
    setEditingBill,
    handleNewInvoice,
    handleEditInvoice,
    handleDuplicateInvoice,
    handleConvertToInvoice,
    handleCloseInvoice,
    isModuleVisible,
  } = router;

  // First-run wizard state
  const [showWizard, setShowWizard] = useState(() => {
    try {
      return !getPrintSettings().onboardingComplete;
    } catch {
      return false;
    }
  });

  const [profile, setProfile] = useState<any>(null);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [serverDown, setServerDown] = useState(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const profileLoaded = useRef(false);
  const deferredPrompt = useRef<any>(null);
  const retryTimer = useRef<any>(null);

  // Dark mode synchronization
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('freegstbill_theme') === 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('freegstbill_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Update check notification state
  const [updateInfo, setUpdateInfo] = useState<any>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const updateBannerVisible = Boolean(
    updateInfo?.updateAvailable &&
      localStorage.getItem('freegstbill_dismissedUpdate') !== updateInfo.latest
  );

  // Sidebar collapsed & mobile open states
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('freegstbill_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('freegstbill_sidebar_collapsed', String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setMobileSidebarOpen((prev) => !prev);
    } else {
      toggleSidebarCollapse();
    }
  };

  // Active settings section for sidebar navigation
  const [activeSettingsSection, setActiveSettingsSection] = useState<string>('section-company');

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch('/api/check-update');
        const data = await res.json();
        if (!cancelled) setUpdateInfo(data);
      } catch {
        /* offline */
      }
    };
    const initial = setTimeout(check, 5000);
    const interval = setInterval(check, 6 * 60 * 60 * 1000);
    return () => {
      cancelled = true;
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, []);

  // Notifications Centre
  const [notifications, setNotifications] = useState<{
    overdue: any[];
    dueSoon: any[];
    lowStock: any[];
    filings: any[];
    autoFire: any;
  }>({ overdue: [], dueSoon: [], lowStock: [], filings: [], autoFire: null });
  const [showNotifs, setShowNotifs] = useState(false);

  const DISMISS_KEY = 'fgsb_dismissedNotifs';
  const [dismissed, setDismissed] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem(DISMISS_KEY) || '{}');
    } catch {
      return {};
    }
  });

  const notifSignatures = useMemo(
    () => ({
      overdue: notifications.overdue.map((b) => b.invoiceNumber || b.id).sort().join('|'),
      dueSoon: notifications.dueSoon.map((b) => b.invoiceNumber || b.id).sort().join('|'),
      lowStock: notifications.lowStock.map((p) => `${p.id || p.name}:${p.stock ?? ''}`).sort().join('|'),
      filings: notifications.filings.map((f) => f.label || f.id || String(f)).sort().join('|'),
      autoFire: notifications.autoFire?.count > 0 ? `autofire:${notifications.autoFire.count}` : '',
    }),
    [notifications]
  );

  const isLive = (key: keyof typeof notifSignatures) =>
    Boolean(notifSignatures[key] && dismissed[key] !== notifSignatures[key]);

  const notifTotal =
    (isLive('overdue') ? notifications.overdue.length : 0) +
    (isLive('dueSoon') ? notifications.dueSoon.length : 0) +
    (isLive('lowStock') ? notifications.lowStock.length : 0) +
    (isLive('filings') ? notifications.filings.length : 0) +
    (isLive('autoFire') ? 1 : 0);

  const dismissableCount = (['overdue', 'dueSoon', 'lowStock', 'filings', 'autoFire'] as const).filter(
    isLive
  ).length;

  const markAllNotifsRead = () => {
    const next = { ...dismissed, ...notifSignatures };
    setDismissed(next);
    try {
      localStorage.setItem(DISMISS_KEY, JSON.stringify(next));
    } catch {
      /* private browsing */
    }
  };

  useEffect(() => {
    let cancelled = false;
    const compute = async () => {
      try {
        const [bills, products, stockAlertCfg] = await Promise.all([
          getAllBills().catch(() => []),
          getAllProducts().catch(() => []),
          getStockAlertSettings().catch(() => ({ enabled: true, threshold: 5 })),
        ]);
        if (cancelled) return;
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 3);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        const overdue = bills.filter((b: any) => {
          const d = b.data?.details?.dueDate;
          return d && d < today && b.status !== 'paid';
        });
        const dueSoon = bills.filter((b: any) => {
          const d = b.data?.details?.dueDate;
          return d && d >= today && d <= tomorrowStr && b.status !== 'paid';
        });
        const stockThreshold = Number(stockAlertCfg?.threshold ?? 5);
        const lowStock =
          stockAlertCfg?.enabled === false
            ? []
            : products.filter((p: any) => (p.stock ?? 999) <= stockThreshold);
        const filings = getUpcomingFilings().filter((f: any) => f.daysAway <= 10);
        let autoFire = null;
        try {
          const r = await fetch('/api/meta/lastRecurringAutoFire');
          if (r.ok) {
            const j = await r.json();
            if (j.value && j.value.date === today && j.value.count > 0) autoFire = j.value;
          }
        } catch {
          /* ignore */
        }
        setNotifications({ overdue, dueSoon, lowStock, filings, autoFire });
      } catch {
        /* offline */
      }
    };
    compute();
    const interval = setInterval(compute, 10 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [currentView]);

  // Command palette & shortcuts
  const [showPalette, setShowPalette] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState('');
  const [paletteIdx, setPaletteIdx] = useState(0);
  const [searchCorpus, setSearchCorpus] = useState<{ bills: any[]; clients: any[]; products: any[] }>({
    bills: [],
    clients: [],
    products: [],
  });
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  useEffect(() => {
    Promise.all([
      getAllBills().catch(() => []),
      getAllClients().catch(() => []),
      getAllProducts().catch(() => []),
    ]).then(([bills, clients, products]) => {
      setSearchCorpus({
        bills: bills.slice(0, 100),
        clients: clients.slice(0, 200),
        products: products.slice(0, 200),
      });
    });
  }, [showPalette]);

  // Server health monitoring
  useEffect(() => {
    let cancelled = false;

    const checkServer = async () => {
      try {
        const res = await fetch('/api/profile', { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
          if (cancelled) return;
          setServerDown(false);
          setServerStatus('online');
          if (!profileLoaded.current) {
            profileLoaded.current = true;
            const p = await res.json();
            setProfile(p);
            if (!p.businessName && !localStorage.getItem('freegstbill_onboarded')) {
              setShowWelcome(true);
            }
          }
          // Stop retry polling while server is healthy
          if (retryTimer.current) {
            clearInterval(retryTimer.current);
            retryTimer.current = null;
          }
          return;
        }
        throw new Error('not ok');
      } catch {
        if (!cancelled) {
          setServerDown(true);
          setServerStatus('offline');
          // Start polling every 5s until server returns
          if (!retryTimer.current) {
            retryTimer.current = setInterval(checkServer, 5000);
          }
        }
      }
    };

    checkServer();

    return () => {
      cancelled = true;
      if (retryTimer.current) {
        clearInterval(retryTimer.current);
        retryTimer.current = null;
      }
    };
  }, []);

  // PWA install prompt handler
  useEffect(() => {
    const dismissedAt = localStorage.getItem('freegstbill_pwa_dismissed_at');
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) return;
    if (dismissedAt) {
      const days = (Date.now() - Number(dismissedAt)) / 86400000;
      if (days < 14) return;
    }

    const handler = (e: any) => {
      e.preventDefault();
      deferredPrompt.current = e;
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Load profiles
  useEffect(() => {
    if (serverStatus === 'online') {
      getAllProfiles().then(setAllProfiles).catch(() => {});
    }
  }, [serverStatus]);

  const handleSwitchProfile = async (bp: any) => {
    const loaded = { ...bp };
    delete loaded.id;
    await saveProfile(loaded);
    setProfile(loaded);
  };

  const handleInstallPWA = async () => {
    if (!deferredPrompt.current) return;
    deferredPrompt.current.prompt();
    const result = await deferredPrompt.current.userChoice;
    if (result.outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    deferredPrompt.current = null;
  };

  const dismissInstallBanner = () => {
    setShowInstallBanner(false);
    localStorage.setItem('freegstbill_pwa_dismissed_at', String(Date.now()));
  };

  const dismissUpdate = () => {
    if (updateInfo?.latest) {
      localStorage.setItem('freegstbill_dismissedUpdate', updateInfo.latest);
    }
    setShowUpdateModal(false);
  };

  // Nav items filtered by enabled modules
  const navItems = useMemo(() => {
    return APP_ROUTES.filter((r) => r.isNav && isModuleVisible(r.module)).map((r) => ({
      id: r.id,
      label: r.label,
      icon: r.icon,
      onClick: r.id === 'new' ? handleNewInvoice : undefined,
    }));
  }, [isModuleVisible, handleNewInvoice]);

  // Command palette actions
  const paletteActions = useMemo(() => {
    const acts: any[] = [
      { label: 'New Tax Invoice', hint: 'Ctrl+N', category: 'action', run: () => handleNewInvoice('tax-invoice') },
      { label: 'New Quotation / Estimate', hint: 'EST', category: 'action', run: () => handleNewInvoice('proforma') },
      { label: 'New Delivery Challan', hint: 'Challan', category: 'action', run: () => handleNewInvoice('delivery-challan') },
      { label: 'New Credit Note', hint: 'CN', category: 'action', run: () => handleNewInvoice('credit-note') },
    ];
    navItems.forEach((item) => {
      if (item.id === 'new') return;
      acts.push({
        label: `Go to ${item.label}`,
        hint: '',
        category: 'nav',
        run: item.onClick || (() => setCurrentView(item.id as ViewId)),
      });
    });
    acts.push({
      label: 'Open AI Business Assistant',
      hint: 'SwipeAI',
      category: 'action',
      run: () => {
        setActiveSettingsSection('section-swipe-ai');
        setCurrentView('settings');
      },
    });
    acts.push({ label: 'Go to Settings', hint: '', category: 'nav', run: () => setCurrentView('settings') });
    acts.push({
      label: '⚡ Supabase Cloud Database (PostgreSQL Hub)',
      hint: 'Connect, sync & schema inspector',
      category: 'nav',
      run: () => setCurrentView('supabase'),
    });
    acts.push({ label: 'Toggle dark mode', hint: '', category: 'action', run: () => setDarkMode((d) => !d) });
    acts.push({
      label: 'Show keyboard shortcuts',
      hint: 'Ctrl+/',
      category: 'help',
      run: () => setShowShortcutsHelp(true),
    });
    if (updateInfo?.updateAvailable) {
      acts.push({
        label: `View update — v${updateInfo.latest}`,
        hint: '',
        category: 'update',
        run: () => setShowUpdateModal(true),
      });
    }

    searchCorpus.bills.forEach((b) => {
      acts.push({
        label: `📄 ${b.invoiceNumber || 'INV-?'} — ${b.clientName || 'No client'}`,
        hint: b.invoiceDate ? new Date(b.invoiceDate).toLocaleDateString('en-IN') : '',
        category: 'invoice',
        run: () => handleEditInvoice(b),
      });
    });

    searchCorpus.clients.forEach((c) => {
      acts.push({
        label: `👤 ${c.name} — client${c.gstin ? ' · GSTIN: ' + c.gstin : ''}`,
        hint: c.phone || c.email || '',
        category: 'client',
        run: () => setCurrentView('clients'),
      });
    });

    searchCorpus.products.forEach((p) => {
      acts.push({
        label: `📦 ${p.name} — product${p.hsn ? ' · HSN: ' + p.hsn : ''}`,
        hint: (p.stock ?? 0) + ' in stock',
        category: 'product',
        run: () => setCurrentView('inventory'),
      });
    });

    const settingsJumps = [
      'Company profile',
      'Payment accounts',
      'Print & PDF Settings',
      'PDF Style Editor',
      'Business type presets',
      'Section labels',
      'Watermarks',
      'Multi-copy print',
      'Digital signature',
      'Company letterhead',
      'Modules',
      'Region preference',
      'Google Drive backup',
      'App updates',
    ];
    settingsJumps.forEach((s) => {
      acts.push({
        label: `⚙️ Settings → ${s}`,
        hint: '',
        category: 'settings',
        run: () => setCurrentView('settings'),
      });
    });

    return acts;
  }, [navItems, updateInfo, handleNewInvoice, handleEditInvoice, setCurrentView, searchCorpus]);

  const filteredPalette = paletteActions.filter(
    (a) => !paletteQuery.trim() || a.label.toLowerCase().includes(paletteQuery.toLowerCase())
  );

  // Global keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const tag = ((e.target as HTMLElement)?.tagName || '').toLowerCase();
      const editable =
        tag === 'input' || tag === 'textarea' || (e.target as HTMLElement)?.isContentEditable;
      if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        setShowPalette((p) => !p);
        setPaletteQuery('');
        setPaletteIdx(0);
      } else if (e.key === '/') {
        e.preventDefault();
        setShowShortcutsHelp((s) => !s);
      } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        if (currentView !== 'new') {
          handleToggleSidebar();
        }
      } else if ((e.key === 'n' || e.key === 'N') && !editable) {
        e.preventDefault();
        handleNewInvoice();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleNewInvoice, currentView]);

  // Accessibility mutation observer & global ESC listener
  useEffect(() => {
    const mirrorTitleToAria = (root: Document | HTMLElement = document) => {
      root.querySelectorAll('button.icon-btn[title]:not([aria-label])').forEach((btn) => {
        btn.setAttribute('aria-label', btn.getAttribute('title') || '');
      });
    };
    mirrorTitleToAria();
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.addedNodes.length) {
          for (const node of m.addedNodes) {
            if (node.nodeType === 1) {
              const el = node as HTMLElement;
              if (el.matches?.('button.icon-btn[title]:not([aria-label])')) {
                el.setAttribute('aria-label', el.getAttribute('title') || '');
              }
              mirrorTitleToAria(el);
            }
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const onEsc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const overlays = Array.from(document.querySelectorAll('.modal-overlay')) as HTMLElement[];
      const top = overlays[overlays.length - 1];
      if (!top) return;
      if (showPalette) return;
      top.click();
    };
    window.addEventListener('keydown', onEsc);
    return () => {
      observer.disconnect();
      window.removeEventListener('keydown', onEsc);
    };
  }, [showPalette]);

  // Palette arrow navigation
  useEffect(() => {
    if (!showPalette) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowPalette(false);
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setPaletteIdx((i) => Math.min(i + 1, filteredPalette.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setPaletteIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const action = filteredPalette[paletteIdx];
        if (action) {
          action.run();
          setShowPalette(false);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showPalette, paletteIdx, filteredPalette]);

  // Render welcome guide modal if onboarding is fresh
  if (showWelcome) {
    return (
      <>
        <WelcomeGuide
          onComplete={(p: any) => {
            if (p) setProfile(p);
            setShowWelcome(false);
          }}
        />
        <FeedbackContainer />
      </>
    );
  }

  const showResumeSetupPill = (() => {
    try {
      const ps = getPrintSettings();
      return !showWizard && ps.onboardingComplete === true && ps.onboardingSkipped === true;
    } catch {
      return false;
    }
  })();

  // Find active route component
  const activeRoute = APP_ROUTES.find((r) => r.id === currentView) || APP_ROUTES[0];
  const ActiveComponent = activeRoute.component;

  return (
    <AppShell
      serverDown={serverDown}
      bannerHost={
        currentView === 'new' ? null : (
          <>
            {showWizard && <SetupWizard onClose={() => setShowWizard(false)} />}
            <BannerHost
              showInstallBanner={showInstallBanner}
              onInstallPWA={handleInstallPWA}
              onDismissInstallBanner={dismissInstallBanner}
              showResumeSetupPill={showResumeSetupPill}
              onOpenWizard={() => setShowWizard(true)}
            />
          </>
        )
      }
      header={
        currentView === 'new' || currentView === 'settings' ? null : (
          <AppHeader
            profile={profile}
            allProfiles={allProfiles}
            onSwitchProfile={handleSwitchProfile}
            onOpenSettings={() => setCurrentView('settings')}
            currentView={currentView}
            onSelectView={(v) => setCurrentView(v as ViewId)}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode((d) => !d)}
            notifTotal={notifTotal}
            onToggleNotifs={() => setShowNotifs((s) => !s)}
            updateBannerVisible={updateBannerVisible}
            updateLatestVersion={updateInfo?.latest}
            onOpenUpdateModal={() => setShowUpdateModal(true)}
            serverStatus={serverStatus}
            onToggleSidebar={handleToggleSidebar}
            sidebarCollapsed={sidebarCollapsed}
            onOpenCommandPalette={() => {
              setShowPalette(true);
              setPaletteQuery('');
              setPaletteIdx(0);
            }}
            onNewInvoice={handleNewInvoice}
          />
        )
      }
      contentClassName={
        currentView === 'new'
          ? 'no-padding !p-0 overflow-y-auto'
          : currentView === 'settings'
          ? 'no-padding !p-0 overflow-hidden'
          : ''
      }
      sidebar={
        currentView === 'new' || currentView === 'settings' ? null : (
          <AppSidebar
            navItems={navItems}
            currentView={currentView}
            currentInvoiceType={editingBill?.data?.invoiceType || editingBill?._initialType}
            onSelectView={(v, type) => {
              if (v === 'new') {
                handleNewInvoice(type);
              } else {
                setCurrentView(v as ViewId);
              }
            }}
            collapsed={sidebarCollapsed}
            onToggleCollapse={toggleSidebarCollapse}
            mobileOpen={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
            onNewInvoice={(type) => handleNewInvoice(type)}
            onOpenSettingsTab={(tab) => {
              setActiveSettingsSection(tab);
              setCurrentView('settings');
            }}
          />
        )
      }
    >
      <Suspense fallback={<ViewLoading />}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={
              currentView === 'new'
                ? 'w-full min-h-full'
                : currentView === 'settings'
                ? 'w-full h-full overflow-hidden'
                : 'w-full h-full'
            }
          >
            {currentView === 'dashboard' && (
              <ActiveComponent
                onNew={handleNewInvoice}
                onEdit={handleEditInvoice}
                onDuplicate={handleDuplicateInvoice}
                onConvert={handleConvertToInvoice}
                onOpenProducts={() => setCurrentView('inventory')}
                activeProfile={profile}
              />
            )}
            {currentView === 'new' && (
              <ActiveComponent
                onBack={handleCloseInvoice}
                profile={profile}
                profileProp={profile}
                editingBill={editingBill}
              />
            )}
            {currentView === 'clients' && (
              <ActiveComponent
                onNew={handleNewInvoice}
                onEdit={handleEditInvoice}
                onDuplicate={handleDuplicateInvoice}
              />
            )}
            {currentView === 'recurring' && (
              <ActiveComponent onEdit={handleEditInvoice} />
            )}
            {currentView === 'settings' && (
              <ActiveComponent
                onSaved={(p: any) => setProfile(p)}
                activeSection={activeSettingsSection}
                onSectionChange={setActiveSettingsSection}
                onBackToHome={() => setCurrentView('dashboard')}
              />
            )}
            {currentView === 'supabase' && (
              <ActiveComponent onBack={() => setCurrentView('dashboard')} />
            )}
            {currentView !== 'dashboard' &&
              currentView !== 'new' &&
              currentView !== 'clients' &&
              currentView !== 'recurring' &&
              currentView !== 'settings' &&
              currentView !== 'supabase' && (
                <ActiveComponent
                  onNew={handleNewInvoice}
                  onEdit={handleEditInvoice}
                  setCurrentView={setCurrentView}
                  onOpenSettingsTab={(tab: string) => {
                    setActiveSettingsSection(tab);
                    setCurrentView('settings');
                  }}
                />
              )}
          </motion.div>
        </AnimatePresence>
      </Suspense>

      {/* Notifications Popover Modal */}
      <AnimatePresence>
        {showNotifs && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="modal-overlay"
            onClick={() => setShowNotifs(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 6 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="modal-content"
              style={{ maxWidth: '480px' }}
              onClick={(e) => e.stopPropagation()}
            >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem',
              }}
            >
              <h3 className="section-title" style={{ margin: 0 }}>
                Notifications
              </h3>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                {dismissableCount > 0 && (
                  <button
                    type="button"
                    className="btn"
                    onClick={markAllNotifsRead}
                    style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
                    title="Clear these notifications. They return if something new happens."
                  >
                    Mark all as read
                  </button>
                )}
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setShowNotifs(false)}
                  title="Close"
                >
                  <X size={18} />
                </button>
              </span>
            </div>
            {notifTotal === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem 0', margin: 0 }}>
                All clear ✨ — nothing needs your attention right now.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {isLive('autoFire') && (
                  <button
                    type="button"
                    className="notice notice-info"
                    onClick={() => {
                      setShowNotifs(false);
                      setCurrentView('dashboard');
                    }}
                    style={{ cursor: 'pointer', border: 'none', textAlign: 'left' }}
                  >
                    <span className="notice-icon">🔁</span>
                    <div style={{ flex: 1 }}>
                      <strong>
                        {notifications.autoFire.count} recurring invoice
                        {notifications.autoFire.count !== 1 ? 's' : ''} auto-generated today
                      </strong>
                      <div style={{ fontSize: '0.72rem', opacity: 0.85, marginTop: '0.2rem' }}>
                        Check the Dashboard for the new bills · review and download PDFs as needed
                      </div>
                    </div>
                  </button>
                )}
                {isLive('overdue') && (
                  <button
                    type="button"
                    className="notice notice-danger"
                    onClick={() => {
                      setShowNotifs(false);
                      setCurrentView('dashboard');
                    }}
                    style={{ cursor: 'pointer', border: 'none', textAlign: 'left' }}
                  >
                    <span className="notice-icon">⚠</span>
                    <div style={{ flex: 1 }}>
                      <strong>
                        {notifications.overdue.length} overdue invoice
                        {notifications.overdue.length !== 1 ? 's' : ''}
                      </strong>
                      <div style={{ fontSize: '0.72rem', opacity: 0.85, marginTop: '0.2rem' }}>
                        {notifications.overdue.slice(0, 3).map((b) => b.invoiceNumber).join(' · ')}
                        {notifications.overdue.length > 3
                          ? ` · +${notifications.overdue.length - 3} more`
                          : ''}
                      </div>
                    </div>
                  </button>
                )}
                {isLive('dueSoon') && (
                  <button
                    type="button"
                    className="notice notice-warn"
                    onClick={() => {
                      setShowNotifs(false);
                      setCurrentView('dashboard');
                    }}
                    style={{ cursor: 'pointer', border: 'none', textAlign: 'left' }}
                  >
                    <span className="notice-icon">⏰</span>
                    <div style={{ flex: 1 }}>
                      <strong>
                        {notifications.dueSoon.length} invoice
                        {notifications.dueSoon.length !== 1 ? 's' : ''} due in next 3 days
                      </strong>
                      <div style={{ fontSize: '0.72rem', opacity: 0.85, marginTop: '0.2rem' }}>
                        {notifications.dueSoon
                          .slice(0, 3)
                          .map((b) => `${b.invoiceNumber} (${b.clientName})`)
                          .join(' · ')}
                      </div>
                    </div>
                  </button>
                )}
                {isLive('filings') && (
                  <button
                    type="button"
                    className="notice notice-info"
                    onClick={() => {
                      setShowNotifs(false);
                      setCurrentView('filing');
                    }}
                    style={{ cursor: 'pointer', border: 'none', textAlign: 'left' }}
                  >
                    <span className="notice-icon">📋</span>
                    <div style={{ flex: 1 }}>
                      <strong>
                        {notifications.filings.length} GST filing
                        {notifications.filings.length !== 1 ? 's' : ''} due in next 10 days
                      </strong>
                      <div style={{ fontSize: '0.72rem', opacity: 0.85, marginTop: '0.2rem' }}>
                        {notifications.filings
                          .slice(0, 3)
                          .map((f) => `${f.label} (${f.daysAway === 0 ? 'today' : f.daysAway + 'd'})`)
                          .join(' · ')}
                      </div>
                    </div>
                  </button>
                )}
                {isLive('lowStock') && (
                  <button
                    type="button"
                    className="notice notice-note"
                    onClick={() => {
                      setShowNotifs(false);
                      setCurrentView('inventory');
                    }}
                    style={{ cursor: 'pointer', border: 'none', textAlign: 'left' }}
                  >
                    <span className="notice-icon">📦</span>
                    <div style={{ flex: 1 }}>
                      <strong>
                        {notifications.lowStock.length} product
                        {notifications.lowStock.length !== 1 ? 's' : ''} low on stock
                      </strong>
                      <div style={{ fontSize: '0.72rem', opacity: 0.85, marginTop: '0.2rem' }}>
                        {notifications.lowStock
                          .slice(0, 3)
                          .map((p) => `${p.name} (${p.stock} left)`)
                          .join(' · ')}
                      </div>
                    </div>
                  </button>
                )}
              </div>
            )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Command Palette Modal (Ctrl/Cmd+K) */}
      <AnimatePresence>
        {showPalette && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="modal-overlay"
            onClick={() => setShowPalette(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -6 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="modal-content"
              style={{ maxWidth: '520px', padding: 0, overflow: 'hidden' }}
              onClick={(e) => e.stopPropagation()}
            >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                borderBottom: '1px solid var(--border-color, #e2e8f0)',
              }}
            >
              <Search size={16} style={{ color: 'var(--text-muted)' }} />
              <input
                autoFocus
                type="text"
                placeholder="Type a command or page name…"
                value={paletteQuery}
                onChange={(e) => {
                  setPaletteQuery(e.target.value);
                  setPaletteIdx(0);
                }}
                className="form-input"
                style={{ border: 0, background: 'transparent', flex: 1, fontSize: '0.95rem' }}
              />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Esc</span>
            </div>
            <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
              {filteredPalette.length === 0 && (
                <p
                  style={{
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    padding: '1.25rem',
                    margin: 0,
                    fontSize: '0.85rem',
                  }}
                >
                  Nothing matches "{paletteQuery}".
                </p>
              )}
              {filteredPalette.map((a, i) => (
                <button
                  key={a.label}
                  type="button"
                  onClick={() => {
                    a.run();
                    setShowPalette(false);
                  }}
                  onMouseEnter={() => setPaletteIdx(i)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '0.6rem 1rem',
                    border: 0,
                    cursor: 'pointer',
                    background: i === paletteIdx ? 'var(--bg-tertiary, #f1f5f9)' : 'transparent',
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                    fontSize: '0.88rem',
                  }}
                >
                  <span>{a.label}</span>
                  {a.hint && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{a.hint}</span>}
                </button>
              ))}
            </div>
            <div
              style={{
                padding: '0.4rem 1rem',
                borderTop: '1px solid var(--border-color, #e2e8f0)',
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>
                <Command size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Ctrl+K to toggle · ↑↓ navigate · Enter run
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowPalette(false);
                  setShowShortcutsHelp(true);
                }}
                style={{
                  background: 'none',
                  border: 0,
                  color: 'var(--primary)',
                  cursor: 'pointer',
                  fontSize: '0.7rem',
                }}
              >
                All shortcuts (Ctrl+/)
              </button>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Help Modal */}
      <AnimatePresence>
        {showShortcutsHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="modal-overlay"
            onClick={() => setShowShortcutsHelp(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 6 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="modal-content"
              style={{ maxWidth: '480px' }}
              onClick={(e) => e.stopPropagation()}
            >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
              }}
            >
              <h3 className="section-title" style={{ margin: 0 }}>
                Keyboard Shortcuts
              </h3>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setShowShortcutsHelp(false)}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
            <table className="kv-list">
              <tbody>
                <tr>
                  <td>
                    <kbd>Ctrl</kbd>&nbsp;+&nbsp;<kbd>K</kbd>
                  </td>
                  <td>Open command palette (jump to any page)</td>
                </tr>
                <tr>
                  <td>
                    <kbd>Ctrl</kbd>&nbsp;+&nbsp;<kbd>N</kbd>
                  </td>
                  <td>New invoice</td>
                </tr>
                <tr>
                  <td>
                    <kbd>Ctrl</kbd>&nbsp;+&nbsp;<kbd>S</kbd>
                  </td>
                  <td>Save current invoice (when on the invoice form)</td>
                </tr>
                <tr>
                  <td>
                    <kbd>Ctrl</kbd>&nbsp;+&nbsp;<kbd>P</kbd>
                  </td>
                  <td>Download PDF (when on the invoice form)</td>
                </tr>
                <tr>
                  <td>
                    <kbd>Ctrl</kbd>&nbsp;+&nbsp;<kbd>/</kbd>
                  </td>
                  <td>Toggle this help</td>
                </tr>
                <tr>
                  <td>
                    <kbd>Esc</kbd>
                  </td>
                  <td>Close any open modal</td>
                </tr>
              </tbody>
            </table>
            <p
              style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                marginTop: '0.75rem',
                marginBottom: 0,
              }}
            >
              On macOS, use <kbd>⌘</kbd> instead of <kbd>Ctrl</kbd>.
            </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Available Modal */}
      <AnimatePresence>
        {showUpdateModal && updateInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="modal-overlay"
            onClick={() => setShowUpdateModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 6 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="modal-content"
              style={{ maxWidth: '640px' }}
              onClick={(e) => e.stopPropagation()}
            >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '0.5rem',
                marginBottom: '0.5rem',
              }}
            >
              <div>
                <h3 className="section-title" style={{ marginTop: 0, marginBottom: '0.25rem' }}>
                  Update available — v{updateInfo.latest}
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                  You're on v{updateInfo.current}
                  {updateInfo.releasePublishedAt &&
                    ` · released ${new Date(updateInfo.releasePublishedAt).toLocaleDateString()}`}
                </p>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setShowUpdateModal(false)}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="notice notice-info" style={{ marginBottom: '0.85rem' }}>
              <span className="notice-icon">🔒</span>
              <div>
                <strong>Your data is safe.</strong> Updates only refresh the app code and dependencies —
                your <code>data/</code> folder (invoices, clients, products, settings) and{' '}
                <code>Saved Invoices/</code> PDF archive are <strong>never touched</strong>. The updater
                pulls the latest source from GitHub and rebuilds, then restarts.
              </div>
            </div>

            <div
              className="surface-card"
              style={{
                maxHeight: '320px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                fontSize: '0.82rem',
                lineHeight: 1.55,
                marginBottom: '0.85rem',
              }}
            >
              {updateInfo.releaseNotes || (
                <span style={{ color: 'var(--text-muted)' }}>
                  No release notes available — see the full changelog at{' '}
                  the project release notes.
                  .
                </span>
              )}
            </div>

            <div className="notice notice-warn" style={{ marginBottom: '1rem' }}>
              <span className="notice-icon">💡</span>
              <div>
                <strong>Recommended:</strong> export a backup before updating, just in case.{' '}
                <button
                  type="button"
                  className="btn-link"
                  onClick={() => {
                    setShowUpdateModal(false);
                    setCurrentView('settings');
                  }}
                  style={{
                    background: 'none',
                    border: 0,
                    color: 'var(--primary)',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    font: 'inherit',
                    padding: 0,
                  }}
                >
                  Open Settings → Data Management
                </button>{' '}
                and click <em>Export Backup…</em>.
              </div>
            </div>

            <div className="flex gap-2 justify-end" style={{ flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-secondary" onClick={dismissUpdate}>
                Skip this version
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowUpdateModal(false)}
              >
                Remind me later
              </button>
              {updateInfo.releaseUrl && (
                <a
                  href={updateInfo.releaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ textDecoration: 'none' }}
                >
                  View on GitHub
                </a>
              )}
              <a
                href="freegstbill-update://run"
                className="btn btn-primary"
                style={{ textDecoration: 'none' }}
              >
                <FileText size={16} /> Update Now
              </a>
            </div>
            <p
              style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                marginTop: '0.6rem',
                marginBottom: 0,
              }}
            >
              <em>Update Now</em> launches <code>Update FreeGSTBill.bat</code> in a window. Wait for
              it to finish (~30 seconds), then refresh this page.
            </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <FeedbackContainer />
    </AppShell>
  );
}

export function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}

export default App;
