import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  Zap,
  MessageCircle,
  HelpCircle,
  Lock,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Bell,
  Wallet,
  CreditCard,
  BookOpen,
  Radio,
  Share2,
  SlidersHorizontal,
  Gift,
} from 'lucide-react';
import {
  getProfile,
  saveProfile,
  getTermsTemplates,
  getAllProfiles,
  saveBusinessProfile,
  deleteBusinessProfile,
  getInvoiceNumberSettings,
  saveInvoiceNumberSettings,
  getRegionMode,
  getEnabledModules,
  getStockAlertSettings,
} from '../store';
import {
  detectCountryFromBrowser,
  getCountriesForRegion,
  validateTaxId,
} from '../shared/utils';
import { initGoogleDrive, isConnected, disconnect } from '../features/settings/services/googleDrive';
import { toast } from '../shared/components/feedback/Toast';
import { confirmAction } from '../shared/components/feedback/ConfirmModal';
import {
  BusinessProfileData,
  InvoiceNumberSettings,
  PaymentAccount,
  StockAlertSettings,
  TermsTemplate,
  UpdateInfo,
  SwipeSettingsTabId,
} from '../features/settings/types';
import { DEFAULT_INV_SETTINGS } from '../features/settings/constants';
import {
  SwipeSettingsHeader,
  SwipeSettingsSidebar,
  SwipeSettingsFooter,
  FloatingWhatsAppFab,
  CompanyDetailsView,
  PaymentAccountsView,
  InvoiceNumberingView,
  SignaturesView,
  UserProfileView,
  UsersRolesView,
  PreferencesView,
  ThermalPrintView,
  BarcodeSettingsView,
  NotesTermsView,
  AutoRemindersView,
  WalletView,
  SwipeAiView,
  PaymentGatewayView,
  TallyIntegrationView,
  ApiWebhooksView,
  IntegrationsView,
  AdvancedFeaturesView,
  SocialLinksView,
  ReferralView,
  SupportView,
} from '../features/settings/components';
import { SupabasePage } from './SupabasePage';

export interface SettingsPageProps {
  onSaved?: (profile: BusinessProfileData) => void;
  activeSection?: string;
  onSectionChange?: (sectionId: string) => void;
  onBackToHome?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onSaved,
  activeSection: externalActiveSection,
  onSectionChange,
  onBackToHome,
}) => {
  const [profile, setProfile] = useState<BusinessProfileData>({
    businessName: '',
    brandName: '',
    companyName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: detectCountryFromBrowser(),
    gstin: '',
    pan: '',
    email: '',
    phone: '',
    bankName: '',
    accountNumber: '',
    ifsc: '',
    logo: '',
    logoHeight: 48,
    signature: '',
    upiId: '',
    googleClientId: '',
    googleDriveFolder: 'GST Billing Invoices',
  });

  const [currentTab, setCurrentTab] = useState<SwipeSettingsTabId>('company-details');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const savedProfileRef = useRef<string | null>(null);
  const [profileDirty, setProfileDirty] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [termsTemplates, setTermsTemplates] = useState<TermsTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<TermsTemplate | null>(null);
  const [driveConnected, setDriveConnected] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [businessProfiles, setBusinessProfiles] = useState<BusinessProfileData[]>([]);
  const [invNumSettings, setInvNumSettings] = useState<InvoiceNumberSettings>(DEFAULT_INV_SETTINGS);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [checkingUpdate, setCheckingUpdate] = useState<boolean>(false);
  const [regionMode, setRegionModeState] = useState<string>(getRegionMode());
  const [enabledModules, setEnabledModulesState] = useState<Record<string, boolean>>(getEnabledModules());
  const [stockAlerts, setStockAlerts] = useState<StockAlertSettings>({ enabled: true, threshold: 5 });

  const markProfileSaved = (p: BusinessProfileData) => {
    savedProfileRef.current = JSON.stringify(p);
    setProfileDirty(false);
  };

  useEffect(() => {
    if (savedProfileRef.current === null) return;
    setProfileDirty(JSON.stringify(profile) !== savedProfileRef.current);
  }, [profile]);

  // Synchronize external active section to internal Swipe tab
  useEffect(() => {
    if (externalActiveSection) {
      if (externalActiveSection === 'section-company') setCurrentTab('company-details');
      else if (externalActiveSection === 'section-profiles') setCurrentTab('users-roles');
      else if (externalActiveSection === 'section-terms') setCurrentTab('notes-terms');
      else if (externalActiveSection === 'section-print') setCurrentTab('thermal-print');
      else if (externalActiveSection === 'section-billing') setCurrentTab('billing');
      else if (
        externalActiveSection === 'section-modules' ||
        externalActiveSection === 'section-stock' ||
        externalActiveSection === 'section-region' ||
        externalActiveSection === 'section-updates'
      )
        setCurrentTab('preferences');
      else if (externalActiveSection === 'section-cloud') setCurrentTab('integrations');
      else if (externalActiveSection === 'section-supabase') setCurrentTab('supabase-cloud');
      else if (externalActiveSection === 'section-backups' || externalActiveSection === 'section-data')
        setCurrentTab('advanced-features');
    }
  }, [externalActiveSection]);

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      if (data) {
        setProfile(data);
        markProfileSaved(data);
      }
    } catch {
      /* ignore */
    }
  };

  const loadTemplates = async () => {
    try {
      const data = await getTermsTemplates();
      setTermsTemplates(data);
    } catch {
      /* ignore */
    }
  };

  const loadBusinessProfiles = async () => {
    try {
      const list = await getAllProfiles();
      setBusinessProfiles(list);
    } catch {
      /* ignore */
    }
  };

  const loadInvNumSettings = async () => {
    try {
      const s = await getInvoiceNumberSettings();
      if (s) setInvNumSettings(s);
    } catch {
      /* ignore */
    }
  };

  const loadStockAlerts = async () => {
    try {
      const s = await getStockAlertSettings();
      if (s) setStockAlerts(s);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    loadProfile();
    loadTemplates();
    loadBusinessProfiles();
    loadInvNumSettings();
    loadStockAlerts();
    setDriveConnected(isConnected());
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (field: 'logo' | 'signature', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    try {
      e.target.value = '';
    } catch {
      /* ignore */
    }
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== '') {
      toast(`This doesn't look like an image (type: ${file.type || 'unknown'}). Try a PNG or JPEG.`, 'warning', 6000);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast(`Image is ${(file.size / 1024 / 1024).toFixed(1)}MB — over the 5MB cap. Try compressing at tinypng.com.`, 'warning', 6000);
      return;
    }

    if (file.type === 'image/svg+xml' || /\.svg$/i.test(file.name)) {
      const reader = new FileReader();
      reader.onload = ev => {
        setProfile(prev => ({ ...prev, [field]: ev.target?.result as string }));
        toast(`${field === 'logo' ? 'Logo' : 'Signature'} uploaded — click Save & Update to keep it.`, 'success', 4000);
      };
      reader.onerror = () => toast('Could not read the SVG file.', 'error');
      reader.readAsDataURL(file);
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 1024;
      let { width, height } = img;
      if (!width || !height) {
        toast(`Image has zero dimensions — cannot use as logo.`, 'error');
        return;
      }
      if (width > MAX || height > MAX) {
        const ratio = MAX / Math.max(width, height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingQuality = 'high';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
      }
      const preservesAlpha = /png|webp|svg/i.test(file.type) && field !== 'logo';
      const dataUrl = canvas.toDataURL(preservesAlpha ? 'image/png' : 'image/jpeg', 0.92);
      setProfile(prev => ({ ...prev, [field]: dataUrl }));
      toast(`${field === 'logo' ? 'Logo' : 'Signature'} uploaded — click Save & Update to keep it.`, 'success', 4000);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      toast('Could not decode image.', 'error');
    };
    img.src = url;
  };

  const removeImage = (field: 'logo' | 'signature') => setProfile(prev => ({ ...prev, [field]: '' }));

  const handleSaveProfile = async (toSave: BusinessProfileData) => {
    try {
      setSaving(true);
      await saveProfile(toSave);
      markProfileSaved(toSave);
      if (onSaved) onSaved(toSave);
      toast('Company details saved successfully!', 'success');
    } catch {
      toast('Failed to save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAsProfile = async () => {
    if (!profile.businessName?.trim()) {
      toast('Please enter a Business Name first', 'warning');
      return;
    }
    try {
      const existing = businessProfiles.find(
        p => p.businessName?.trim().toLowerCase() === profile.businessName?.trim().toLowerCase()
      );
      const toSave = { ...profile, id: existing?.id || undefined };
      await saveBusinessProfile(toSave);
      toast(`Saved profile: ${profile.businessName}`, 'success');
      loadBusinessProfiles();
    } catch {
      toast('Failed to save profile', 'error');
    }
  };

  const handleLoadProfile = async (bp: BusinessProfileData) => {
    if (profile.businessName?.trim()) {
      const existing = businessProfiles.find(
        p => p.businessName?.trim().toLowerCase() === profile.businessName?.trim().toLowerCase()
      );
      await saveBusinessProfile({ ...profile, id: existing?.id || undefined });
    }
    const loaded = { ...bp };
    delete loaded.id;
    setProfile(loaded);
    await saveProfile(loaded);
    markProfileSaved(loaded);
    if (onSaved) onSaved(loaded);
    toast(`Switched to ${bp.businessName}`, 'success');
  };

  const handleDeleteProfile = async (id?: string) => {
    if (!id) return;
    if (
      !(await confirmAction({
        title: 'Delete this saved business profile?',
        message: 'Invoices already saved under this profile stay untouched.',
        confirmLabel: 'Delete profile',
        tone: 'danger',
      }))
    )
      return;
    await deleteBusinessProfile(id);
    toast('Profile deleted', 'success');
    loadBusinessProfiles();
  };

  const handleAddNewProfile = () => {
    const blank: BusinessProfileData = {
      businessName: '',
      brandName: '',
      companyName: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      country: detectCountryFromBrowser(),
      gstin: '',
      pan: '',
      email: '',
      phone: '',
      bankName: '',
      accountNumber: '',
      ifsc: '',
      swift: '',
      logo: '',
      logoHeight: 48,
      signature: '',
      upiId: '',
      googleClientId: '',
      googleDriveFolder: 'GST Billing Invoices',
      aato: '',
    };
    setProfile(blank);
    setCurrentTab('company-details');
    toast('New profile started. Fill in details and click Save & Update.', 'info');
  };

  const handleConnectDrive = async () => {
    if (!profile.googleClientId?.trim()) {
      toast('Enter your Google OAuth Client ID first', 'warning');
      return;
    }
    setConnecting(true);
    try {
      const result = await initGoogleDrive(profile.googleClientId) as any;
      if (result.success) {
        setDriveConnected(true);
        toast('Connected to Google Drive!', 'success');
      } else {
        toast('Failed: ' + (result.error || 'Unknown error'), 'error');
      }
    } catch (err: any) {
      toast('Connection failed: ' + err.message, 'error');
    }
    setConnecting(false);
  };

  const handleDisconnectDrive = () => {
    disconnect();
    setDriveConnected(false);
    toast('Disconnected from Google Drive', 'info');
  };

  // Render Central Content Area
  const renderTabContent = () => {
    switch (currentTab) {
      case 'company-details':
        return (
          <CompanyDetailsView
            profile={profile}
            setProfile={setProfile}
            onSave={handleSaveProfile}
            saving={saving}
            handleImageUpload={handleImageUpload}
            removeImage={removeImage}
            logoInputRef={logoInputRef}
          />
        );

      case 'banks':
        return (
          <PaymentAccountsView
            profile={profile}
            setProfile={setProfile}
            onSaveProfile={handleSaveProfile}
          />
        );

      case 'billing':
        return (
          <InvoiceNumberingView
            settings={invNumSettings}
            onSave={async s => {
              await saveInvoiceNumberSettings(s);
              setInvNumSettings(s);
            }}
          />
        );

      case 'signatures':
        return (
          <SignaturesView
            profile={profile}
            setProfile={setProfile}
            onSaveProfile={handleSaveProfile}
            handleImageUpload={handleImageUpload}
            removeImage={removeImage}
          />
        );

      case 'user-profile':
        return (
          <UserProfileView
            profile={profile}
            setProfile={setProfile}
            onSaveProfile={handleSaveProfile}
          />
        );

      case 'users-roles':
        return (
          <UsersRolesView
            businessProfiles={businessProfiles}
            currentBusinessName={profile.businessName}
            handleAddNewProfile={handleAddNewProfile}
            handleSaveAsProfile={handleSaveAsProfile}
            handleLoadProfile={handleLoadProfile}
            handleDeleteProfile={handleDeleteProfile}
          />
        );

      case 'preferences':
        return (
          <PreferencesView
            enabledModules={enabledModules}
            setEnabledModulesState={setEnabledModulesState}
            regionMode={regionMode}
            setRegionModeState={setRegionModeState}
            stockAlerts={stockAlerts}
            setStockAlerts={setStockAlerts}
            updateInfo={updateInfo}
            setUpdateInfo={setUpdateInfo}
            checkingUpdate={checkingUpdate}
            setCheckingUpdate={setCheckingUpdate}
          />
        );

      case 'thermal-print':
        return <ThermalPrintView />;

      case 'barcode-settings':
        return <BarcodeSettingsView />;

      case 'notes-terms':
        return (
          <NotesTermsView
            termsTemplates={termsTemplates}
            setTermsTemplates={setTermsTemplates}
          />
        );

      case 'auto-reminders':
        return <AutoRemindersView />;

      case 'wallet':
        return <WalletView />;

      case 'swipe-ai':
        return <SwipeAiView />;

      case 'payment-gateway':
        return <PaymentGatewayView />;

      case 'tally-integration':
        return <TallyIntegrationView />;

      case 'api-webhooks':
        return <ApiWebhooksView />;

      case 'integrations':
        return (
          <IntegrationsView
            googleClientId={profile.googleClientId}
            googleDriveFolder={profile.googleDriveFolder}
            onSaveCloudSync={async (clientId, folder) => {
              const updated = { ...profile, googleClientId: clientId, googleDriveFolder: folder };
              setProfile(updated);
              await handleSaveProfile(updated);
            }}
          />
        );

      case 'supabase-cloud':
        return <SupabasePage onBack={() => setCurrentTab('company-details')} />;

      case 'advanced-features':
        return (
          <AdvancedFeaturesView
            profile={profile}
            setProfile={setProfile}
            onSaved={onSaved}
            loadTemplates={loadTemplates}
            loadBusinessProfiles={loadBusinessProfiles}
          />
        );

      case 'social-links':
        return (
          <SocialLinksView
            initialWebsite={profile.website}
            onSave={async socials => {
              const updated = { ...profile, website: socials.website };
              setProfile(updated);
              await handleSaveProfile(updated);
            }}
          />
        );

      case 'referral':
        return <ReferralView />;

      case 'support':
      default:
        return <SupportView />;
    }
  };

  return (
    <div
      id="swipe-settings-page-wrapper"
      className="bg-[#F8F9FA] dark:bg-[#141414] h-full max-h-screen flex flex-col antialiased text-gray-800 dark:text-gray-200 w-full overflow-hidden"
    >
      {/* Top Global Header from code.html */}
      <SwipeSettingsHeader
        currentBusinessName={profile.brandName || profile.businessName || 'Vishal Enterprise'}
        currentBusinessLogo={profile.logo}
        currentProfile={profile}
        allProfiles={businessProfiles}
        profiles={businessProfiles.map(p => ({
          id: p.id,
          name: p.brandName || p.businessName || 'Unnamed Profile',
          businessName: p.brandName || p.businessName,
          tradeName: p.tradeName || p.legalName,
          logo: p.logo,
          gstin: p.gstin,
          phone: p.phone,
        }))}
        onSelectProfile={id => {
          const selected = businessProfiles.find(p => p.id === id);
          if (selected) handleLoadProfile(selected);
        }}
        onAddNewProfile={handleAddNewProfile}
        onLogoClick={() => {
          if (onBackToHome) onBackToHome();
        }}
        onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)}
      />

      {/* Main Layout Area: Fixed-Height Left Sidebar + Independently Scrollable Central Content */}
      <div className="flex-1 flex w-full mx-auto relative min-w-0 min-h-0 overflow-hidden">
        <SwipeSettingsSidebar
          activeTab={currentTab}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          onSelectTab={tabId => {
            setCurrentTab(tabId);
            setMobileSidebarOpen(false);
            if (onSectionChange) {
              if (tabId === 'company-details') onSectionChange('section-company');
              else if (tabId === 'users-roles') onSectionChange('section-profiles');
              else if (tabId === 'notes-terms') onSectionChange('section-terms');
              else if (tabId === 'thermal-print') onSectionChange('section-print');
              else if (tabId === 'preferences') onSectionChange('section-modules');
              else if (tabId === 'integrations') onSectionChange('section-cloud');
              else if (tabId === 'advanced-features') onSectionChange('section-backups');
            }
          }}
          onBackToHome={() => {
            if (onBackToHome) onBackToHome();
            else window.history.back();
          }}
        />

        {/* Central Content Area: dynamically scrolls independently */}
        <main
          id="swipe-settings-main-content"
          className="flex-1 bg-white dark:bg-[#141414] p-4 sm:p-8 lg:p-10 border-r border-gray-100 dark:border-gray-800 min-w-0 h-full overflow-y-auto flex flex-col justify-between"
        >
          <div className="flex-1 min-w-0">
            {/* Mobile Quick Settings Navigation Banner */}
            <div
              className="md:hidden flex items-center justify-between bg-blue-50/70 dark:bg-blue-950/40 px-3.5 py-2.5 mb-5 rounded-[var(--ant-border-radius-lg,8px)] border border-blue-100/80 dark:border-blue-900/60"
              style={{ borderRadius: 'var(--ant-border-radius-lg, 8px)' }}
            >
              <div className="flex items-center space-x-2 truncate pr-2">
                <SlidersHorizontal className="w-4 h-4 text-[#1E61EB] shrink-0" />
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate capitalize">
                  {currentTab.replace(/-/g, ' ')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="flex items-center space-x-1 px-2.5 py-1 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 rounded-[var(--ant-border-radius,6px)] text-xs font-semibold text-[#1E61EB] dark:text-blue-400 shadow-2xs hover:bg-blue-50 transition-colors shrink-0 cursor-pointer"
                style={{ borderRadius: 'var(--ant-border-radius, 6px)' }}
              >
                <span>Settings Menu</span>
              </button>
            </div>

            {renderTabContent()}
          </div>

          {/* Footer inside the scrollable main area so it scrolls with form content */}
          <SwipeSettingsFooter className="mt-10 -mx-4 -mb-4 sm:-mx-8 sm:-mb-8 lg:-mx-10 lg:-mb-10" />
        </main>
      </div>

      {/* Floating WhatsApp Widget from code.html */}
      <FloatingWhatsAppFab />
    </div>
  );
};

export default SettingsPage;
