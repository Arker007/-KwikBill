# 18 — Final Target Project Tree

This document outlines the complete, clean directory and file tree of the application following the completion of all 45 refactoring phases.

```
Free-GST-Billing-Software/
├── .env.example                  # Canonical environment variables
├── .gitignore                    # Standard git ignore list
├── index.html                    # Application entry HTML with SEO metadata & fonts
├── metadata.json                 # AI Studio container metadata & permissions
├── package.json                  # Dependencies, scripts, and package manifests
├── README.md                     # Project documentation and quick-start guide
├── tsconfig.json                 # TypeScript compiler configuration & path aliases
├── vite.config.js                # Vite build configuration, PWA plugin, manual chunks
├── data/                         # Local-first JSON flat-file storage engine
│   ├── backups/                  # Daily rotating system backups (YYYY-MM-DD)
│   ├── bills/                    # Tax invoices ([id].json)
│   ├── clients/                  # Client records ([id].json)
│   ├── expenses/                 # Expense records ([id].json)
│   ├── products/                 # Inventory catalog ([id].json)
│   ├── profiles/                 # Multi-business branch profiles ([id].json)
│   ├── purchases/                # Vendor purchase invoices ([id].json)
│   ├── receipts/                 # Payment receipts ([id].json)
│   ├── recurring/                # Recurring invoice templates ([id].json)
│   ├── templates/                # Terms & conditions templates ([id].json)
│   ├── trash/                    # Soft-deleted bills awaiting restore or purge
│   ├── meta.json                 # Sequential invoice counters & system timestamps
│   ├── profile.json              # Primary business profile details
│   └── settings.json             # App preferences & print format settings
├── public/                       # Static web assets
│   ├── favicon.svg               # Web favicon
│   ├── icons/                    # PWA application icons & maskable manifests
│   └── tesseract/                # Local offline WebAssembly OCR workers & language data
│       ├── core/                 # Tesseract WASM binaries
│       ├── lang/                 # English traineddata models
│       └── worker.min.js         # Web worker thread handler
├── scripts/                      # Build automation & verification tooling
│   ├── bundle-tesseract-assets.mjs # Pre-bundles OCR assets to public/
│   ├── discount-modes-test.mjs   # Automated discount regression suite (9 tests)
│   ├── generate-icons.mjs        # PWA icon generator
│   └── tax-test.mjs              # Statutory GST calculation regression suite (70 tests)
├── tests/                        # Automated testing harness
│   ├── helpers/                  # Shared test-only infrastructure
│   │   └── isolatedDataDir.mjs   # Disposable JSON data directory lifecycle
│   ├── e2e/                      # HTTP smoke and financial audit suites
│   ├── contract/                 # API contract verification
│   ├── security/                 # Path traversal and sanitization tests
│   └── migration/                # Historical storage compatibility tests
├── server/                       # Modular Layered Express Backend
│   ├── index.js                  # Entry point, port resolution, graceful shutdown
│   ├── app.js                    # Express app factory & middleware pipeline
│   ├── config/                   # Backend configuration
│   │   ├── env.js                # Environment variables parser
│   │   └── paths.js              # Canonical filesystem paths
│   ├── shared/                   # Cross-cutting backend infrastructure
│   │   ├── errors/               # Custom AppError classes
│   │   ├── middleware/           # CORS, error handler, request logger
│   │   └── utils/                # Atomic file writes, path sanitizers
│   ├── infrastructure/           # Low-level persistence & scheduled workers
│   │   ├── storage/              # Generic JSON file repository
│   │   ├── backup/               # Snapshot creation and 30-day rotation
│   │   └── cron/                 # Background recurring invoice processor
│   └── modules/                  # Domain backend modules
│       ├── backups/              # Backup & restore endpoints
│       ├── bills/                # Invoices CRUD & status updates
│       ├── clients/              # Client directory CRUD
│       ├── expenses/             # Expense vouchers CRUD
│       ├── meta/                 # Atomic sequential counters
│       ├── products/             # Inventory catalog CRUD
│       ├── profiles/             # Multi-business profiles CRUD
│       ├── purchases/            # Purchase bills CRUD
│       ├── receipts/             # Payment receipts CRUD
│       ├── recurring/            # Recurring templates CRUD
│       ├── system/               # Diagnostics, version, health
│       └── trash/                # Soft-deleted bill recovery
└── src/                          # Modular Feature-Sliced React Frontend
    ├── main.tsx                  # React DOM bootstrap & PWA service worker registration
    ├── app/                      # Application orchestrators & shell
    │   ├── App.tsx               # Root component assembling layout and router
    │   ├── layout/               # Global shell layouts
    │   │   ├── index.ts          # Barrel export for layout components
    │   │   ├── AppShell.tsx      # High-level responsive container grid (Header + Body)
    │   │   ├── AppHeader.tsx     # Top application header (branding, profile, quick search, actions)
    │   │   ├── AppSidebar.tsx    # Left navigation rail with primary CTA & collapsible states
    │   │   ├── SettingsSidebar.tsx# Left settings navigation rail (swapped in place of main sidebar)
    │   │   ├── TopNavBar.tsx     # Legacy sidebar / navigation wrapper
    │   │   ├── NavigationTabs.tsx# View tab strip with keyboard hotkey badges
    │   │   ├── navConfig.ts      # Navigation groups, sub-items and category schema
    │   │   ├── NavFlyout.tsx     # Collapsed rail hover popup menus for sub-items
    │   │   └── BannerHost.tsx    # PWA update and offline alert banners
    │   ├── providers/            # React context providers
    │   │   ├── AppProviders.tsx  # Master composition wrapper
    │   │   ├── ThemeProvider.tsx # Light/Dark theme state
    │   │   ├── ProfileProvider.tsx # Active business profile context
    │   │   ├── CurrencyProvider.tsx# Active display currency & symbols
    │   │   └── NotificationProvider.tsx # Due bills & stock warnings
    │   └── router/               # Lightweight view routing
    │       ├── index.ts          # Router barrel exports
    │       ├── routes.ts         # Route table with lazy page components
    │       └── useAppRouter.ts   # URL query (?view=...) and hotkey synchronizer
    ├── pages/                    # Thin route composition views
    │   ├── DashboardPage.tsx     # Sales register and financial KPI summary
    │   ├── InvoiceEditorPage.tsx # Master invoice creation & editing workspace
    │   ├── QuotationsPage.tsx    # Quotations & estimates list with pixel-perfect styling
    │   ├── ClientsPage.tsx       # Client directory and ledger
    │   ├── InventoryPage.tsx     # Products catalog and low-stock monitor
    │   ├── ExpensesPage.tsx      # Expense voucher tracker
    │   ├── PurchasesPage.tsx     # Vendor purchase bills & ITC
    │   ├── RecurringPage.tsx     # Repeating invoice contract manager
    │   ├── ReceiptsPage.tsx      # Payment receipt voucher generator
    │   ├── ReportsPage.tsx       # Sales and tax analytical reports
    │   ├── GSTReturnsPage.tsx    # GSTR-1, GSTR-3B, GSTR-2B reconciliation
    │   ├── IncomeTaxPage.tsx     # AY 2025-26 income tax calculator
    │   ├── SettingsPage.tsx      # Profile, numbering series, and backup settings
    │   ├── ControlPanelPage.tsx  # Server diagnostics and administrative controls
    │   └── UserGuidePage.tsx     # Offline user documentation manual
    ├── features/                 # Encapsulated business domains
    │   ├── clients/              # Client management
    │   │   ├── utils/            # Client domain utilities
    │   │   │   ├── clientCredit.ts # Client credit calculation & dual-entry application
    │   │   │   ├── avatarColors.ts # Deterministic pastel avatar color pair generator
    │   │   │   └── index.ts      # Client utils barrel export
    │   │   └── index.ts          # Clients feature barrel export
    │   ├── expenses/             # Expense tracking
    │   ├── gst-returns/          # Statutory return tables & portal JSON export
    │   │   ├── types.ts          # Domain types for GSTR-1/3B/2B, TDS/TCS, reconciliation
    │   │   ├── components/       # Return tables & step guides
    │   │   │   ├── GSTR1Tab.tsx      # Table 4A/7/9B/12/13 and grand summary
    │   │   │   ├── GSTR3BTab.tsx     # Table 3.1/3.2/4/6 and net tax payable
    │   │   │   ├── GSTR2BTab.tsx     # 4-way GSTR-2B purchase reconciliation
    │   │   │   ├── TdsTcsTab.tsx     # TDS receivable & TCS collected reports
    │   │   │   └── FilingGuideTab.tsx# Step-by-step interactive filing checklist
    │   │   ├── services/         # Portal export generators
    │   │   │   └── gstExportService.ts # GSTR-1/3B JSON & CSV download utilities
    │   │   ├── utils/            # Calculation routines
    │   │   │   └── gstCalculations.ts # Tax splits, interstate rules, reconciliation logic
    │   │   └── index.ts          # Barrel export
    │   ├── income-tax/           # Income tax slab & deduction calculators
    │   │   ├── types.ts          # Domain types for regimes, deductions, bank imports, ITR-4
    │   │   ├── components/       # Calculator tabs & cards
    │   │   │   ├── RegimeCalculatorTab.tsx # Side-by-side Old/New regime comparison cards
    │   │   │   ├── TaxCalculatorCard.tsx   # Reusable tax calculation card surface
    │   │   │   ├── PresumptiveTab.tsx      # Section 44AD / 44ADA / 44AE presumptive taxation
    │   │   │   ├── AdvanceTaxTab.tsx       # 4-quarter schedule & Section 234B/C interest
    │   │   │   ├── BankImportTab.tsx       # 7 Indian bank CSV parser & auto-categorizer
    │   │   │   ├── SummaryTab.tsx          # Financial health KPI cards & ITR-4 PDF export
    │   │   │   └── index.ts          # Components barrel export
    │   │   ├── utils/            # Income tax statutory computation engine
    │   │   │   ├── itrCalculation.ts # Tax slabs, 87A rebate, capital gains, 234A/B/C, 44AD/ADA/AE
    │   │   │   └── index.ts      # Income tax utils barrel export
    │   │   └── index.ts          # Income tax feature barrel export
    │   ├── inventory/            # Inventory products & HSN code catalog
    │   │   ├── types/            # Domain types (Product, ProductFormData, StockAlertSettings)
    │   │   │   └── index.ts
    │   │   ├── components/       # Reusable AntD v5 product components
    │   │   │   ├── ProductAvatar.tsx       # 2-letter monogram avatar with dynamic color hash
    │   │   │   ├── ProductsHeader.tsx      # Tabbed header with active underline & counts
    │   │   │   ├── ProductsToolbar.tsx     # Search, category dropdown, filter, and action buttons
    │   │   │   ├── ProductRow.tsx          # High-density item row with dual prices & chips
    │   │   │   ├── ProductActionMenu.tsx   # 3-dot context menu (Edit, Duplicate, Adjust, Delete)
    │   │   │   ├── ProductsTable.tsx       # AntD-styled table with column sort triggers
    │   │   │   ├── ProductsPagination.tsx  # Page indicator and navigation controls
    │   │   │   ├── CategoryManagerView.tsx # Categories & Groups manager view
    │   │   │   ├── ProductModal.tsx        # Add/edit product & service dialog
    │   │   │   └── index.ts
    │   │   ├── services/         # Inventory service & CSV parsing
    │   │   │   └── inventoryService.ts
    │   │   ├── hooks/            # Inventory data hook
    │   │   │   └── useInventory.ts
    │   │   ├── data/             # Master catalogs & reference data
    │   │   │   ├── hsnRates.ts   # Curated HSN / SAC goods and services lookup
    │   │   │   └── index.ts      # Inventory data barrel export
    │   │   └── index.ts          # Inventory feature barrel export
    │   ├── invoices/             # Core invoicing domain
    │   │   ├── components/       # Invoice item tables, totals cards, print modal
    │   │   │   ├── Dashboard/        # Modular dashboard & sales register components
    │   │   │   │   ├── types.ts      # Dashboard bills, stats, and column picker contracts
    │   │   │   │   ├── MetricCards.tsx # Invoiced totals, taxes collected, and outstanding cards
    │   │   │   │   ├── RegisterFilters.tsx # Search, FY, type, status, and column picker bar
    │   │   │   │   ├── BillsRegisterTable.tsx # Multi-select invoice register table with bulk/row actions
    │   │   │   │   ├── PaymentModal.tsx # Payment recording modal with credit notices & payment ledger
    │   │   │   │   ├── EditPaymentModal.tsx # Payment entry editing modal with receipt synchronization
    │   │   │   │   ├── ReceiptModal.tsx # Printable A5 payment receipt voucher view
    │   │   │   │   ├── RemindAllModal.tsx # Overdue batch reminder composer with WhatsApp messaging
    │   │   │   │   └── index.ts      # Barrel export
    │   │   │   ├── BillOCR/      # Bill OCR camera/upload modal
    │   │   │   │   └── BillOCRModal.tsx # Client-side Tesseract WebAssembly OCR modal
    │   │   │   ├── InvoiceEditor/ # Modular invoice creation & editing controls
    │   │   │   │   ├── InvoiceEditorHeader.tsx # Auto-save and control toolbar with Settings trigger
    │   │   │   │   ├── InvoiceItemsTable.tsx # Line items dynamic data forms
    │   │   │   │   ├── InvoiceTotalsSection.tsx # Financial profile, invoice type chips, and settings triggers
    │   │   │   │   ├── PaymentTermsSection.tsx # Terms presets, template loaders, and private notes
    │   │   │   │   ├── TwoColumnDetailsSection.tsx # Notes, terms, e-waybill, attachments, totals, bank, and signature layout
    │   │   │   │   ├── RichEditor.tsx # Content-editable formatting wrapper
    │   │   │   │   └── DocumentSettingsDrawer/ # Slide-over invoice customization modal drawer
    │   │   │   │       ├── DocumentSettingsDrawer.tsx # Drawer container with search, tabs, save/cancel
    │   │   │   │       ├── QuickActionsHeader.tsx # 4 quick action cards (Templates, Custom fields, Prefixes, Terms)
    │   │   │   │       ├── DisplaySettingsTab.tsx # 2-column general & statutory compliance toggle grid
    │   │   │   │       ├── LayoutFontsTab.tsx # Paper/print formats, POS thermal setup, design presets
    │   │   │   │       ├── ExportSettingsTab.tsx # Titles, currencies, exchange rates, recurring schedules
    │   │   │   │       ├── BrandingSettingsTab.tsx # Accent color harmonies, watermarks, payment accounts
    │   │   │   │       ├── CustomFieldsTab.tsx # Custom metadata blocks (PO #, Vehicle #, E-Way Bill)
    │   │   │   │       ├── NotesTermsTab.tsx # Terms templates, remarks, and internal notes
    │   │   │   │       ├── LabelsTemplatesTab.tsx # Custom column labels & WhatsApp message templates
    │   │   │   │       └── index.ts # Barrel export
    │   │   │   ├── InvoicePreview/ # Invoice document rendering layouts
    │   │   │   │   ├── InvoicePreview.tsx # Core full sheet rendering layouts
    │   │   │   │   └── ThermalReceipt.tsx # Core thermal billing layout
    │   │   │   └── Print/        # Print settings & live preview modals
    │   │   │       ├── LiveDocumentPreviewModal.tsx # Ant Design live document preview modal
    │   │   │       ├── PrintSettings.tsx # App-wide print defaults editor & live preview
    │   │   │       ├── PrintPreviewModal.tsx # Invoice print/download preview modal
    │   │   │       └── index.ts      # Print components barrel export
    │   │   ├── hooks/            # useInvoiceForm, useBillsQuery
    │   │   │   └── useInvoiceForm.ts # State machine, drafts, and persistence orchestrator
    │   │   ├── services/         # pdfService, invoiceApiService
    │   │   │   └── pdfService.ts # Centralized PDF rendering service (html2canvas, jsPDF)
    │   │   ├── types/            # InvoiceDocument, LineItem, Discount types
    │   │   ├── templates/        # Pluggable modular invoice template designs
    │   │   │   ├── types.ts      # InvoiceHeaderProps & InvoiceTemplateProps contracts
    │   │   │   ├── ExactInvoiceLayout.tsx # High-precision industrial quotation/invoice layout
    │   │   │   ├── ClassicTemplate.tsx # Default template rendering ExactInvoiceLayout
    │   │   │   ├── ModernTemplate.tsx # Unified Modern header & complete contemporary layout
    │   │   │   ├── MinimalTemplate.tsx # Unified Minimal header & complete minimalist layout
    │   │   │   ├── EvergreenTemplate.tsx # Industrial template rendering ExactInvoiceLayout
    │   │   │   ├── components/       # Shared template structural components
    │   │   │   │   ├── SharedParties.tsx # Bill to, Ship to, and Place of Supply
    │   │   │   │   ├── SharedItemsTable.tsx # Statutory GST items table
    │   │   │   │   ├── SharedTotals.tsx # Words, UPI QR, discounts, taxes, and total due
    │   │   │   │   ├── SharedFooter.tsx # Bank details, terms, notes, and authorized signature
    │   │   │   │   ├── SharedNotices.tsx # Reverse charge & composition notices
    │   │   │   │   ├── SharedExtraSections.tsx # Multi-page annexures and custom sections
    │   │   │   │   └── SharedWatermark.tsx # Proforma estimate watermark
    │   │   │   └── index.ts      # Template registry & barrel export
    │   │   └── utils/            # Invoices domain utilities
    │   │       ├── taxCalculation.ts # Pure statutory tax calculation engine
    │   │       ├── printSettings.ts # Print settings defaults & builders
    │   │       └── index.ts      # Invoices utils barrel export
    │   ├── purchases/            # Vendor bills
    │   │   ├── components/       # PurchaseModal form
    │   │   ├── hooks/            # usePurchases hook
    │   │   ├── services/         # purchaseService & PDF generator
    │   │   ├── types/            # Purchase domain types
    │   │   └── index.ts          # Purchases barrel export
    │   ├── receipts/             # Payment receipts
    │   │   ├── components/       # ReceiptModal & ReceiptPrintTemplate
    │   │   ├── hooks/            # useReceipts hook
    │   │   ├── services/         # receiptService (payment linking & voucher generation)
    │   │   ├── types/            # Receipt domain types
    │   │   └── index.ts          # Receipts barrel export
    │   ├── recurring/            # Recurring templates
    │   │   ├── components/       # RecurringModal form
    │   │   ├── hooks/            # useRecurring hook
    │   │   ├── services/         # recurringService & auto-invoice generator
    │   │   ├── types/            # Recurring domain types
    │   │   └── index.ts          # Recurring barrel export
    │   ├── reports/              # Financial summaries & receivables analysis
    │   │   ├── types.ts          # Domain types for P&L, aging buckets, analytics
    │   │   ├── components/       # Financial report tabs & tables
    │   │   │   ├── ProfitAndLossTab.tsx       # Period-filtered P&L statement & margin metrics
    │   │   │   ├── SalesReportTable.tsx       # Monthly sales & expense breakdown table
    │   │   │   ├── AgingReportTab.tsx         # Receivables aging buckets & overdue badges
    │   │   │   ├── ClientAnalyticsTab.tsx     # Top clients & worst payers rankings
    │   │   │   ├── ProductPerformanceTab.tsx  # Top revenue & high-volume SKU performance
    │   │   │   └── index.ts                   # Components barrel export
    │   │   └── index.ts          # Reports feature barrel export
    │   └── settings/             # System preferences & Google Drive sync
    │       ├── types.ts          # Domain models for profile, accounts, numbering, backups
    │       ├── constants.ts      # Jump nav sections, terms templates, default settings
    │       ├── components/       # Modular settings tabs
    │       │   ├── SwipeSettingsHeader.tsx   # Top global header with company selector, search pill, and quick tools
    │       │   ├── SwipeSettingsSidebar.tsx  # Left navigation sidebar with 5 categorized setting groups
    │       │   ├── CompanyDetailsView.tsx    # Exact Swipe company details form, logo card, custom fields & address grids
    │       │   ├── AddressCard.tsx           # Billing (pink) and Shipping (lavender) address cards with action tools
    │       │   ├── AddressModal.tsx          # Modal dialog to add or edit billing/shipping address locations
    │       │   ├── PaymentAccountsView.tsx   # Payment accounts and banks configuration view
    │       │   ├── InvoiceNumberingView.tsx  # Invoice sequence format, prefixes, and counter configuration view
    │       │   ├── SignaturesView.tsx        # Authorized digital signatory and logo print calibration view
    │       │   ├── UserProfileView.tsx       # Personal user profile, contact info, security & active login sessions
    │       │   ├── UsersRolesView.tsx        # Multi-user team members, roles, permissions & business workspaces
    │       │   ├── PreferencesView.tsx       # App modules toggles, internationalization, stock alerts & update checks
    │       │   ├── ThermalPrintView.tsx      # POS thermal receipt printer width, fonts, barcode scan & auto-cut setup
    │       │   ├── BarcodeSettingsView.tsx   # Barcode generation standard (EAN-13/Code-128) & hardware scanner tests
    │       │   ├── NotesTermsView.tsx        # Preset terms, payment conditions, and declarative template manager
    │       │   ├── AutoRemindersView.tsx     # Automated overdue invoice WhatsApp/SMS payment reminder schedules
    │       │   ├── WalletView.tsx            # Prepaid messaging credits wallet, pricing tiers & billing history
    │       │   ├── SwipeAiView.tsx           # AI assistant capabilities, HSN suggestions & natural language command bar
    │       │   ├── PaymentGatewayView.tsx    # Razorpay, Cashfree, and NPCI dynamic UPI instant QR configuration
    │       │   ├── TallyIntegrationView.tsx  # Tally Prime XML vouchers, ledger mapping & automated sync engine
    │       │   ├── ApiWebhooksView.tsx       # REST API endpoints, webhook subscriptions & live event payload tester
    │       │   ├── IntegrationsView.tsx      # Google Drive automated cloud sync & custom SMTP email servers
    │       │   ├── AdvancedFeaturesView.tsx  # Local-first full JSON backup export, import wizard, daily snapshots & trash
    │       │   ├── SocialLinksView.tsx       # Public social channels & invoice footer brand link bar
    │       │   ├── ReferralView.tsx          # Referral rewards program, invite links & credit earnings ledger
    │       │   ├── SupportView.tsx           # WhatsApp helpdesk, GST compliance desk & system diagnostics
    │       │   ├── FloatingWhatsAppFab.tsx   # Floating WhatsApp support button
    │       │   ├── SwipeSettingsFooter.tsx   # Security assurance and copyright global footer
    │       │   ├── ProfileSettingsTab.tsx    # Company details, payment accounts, logo/signature
    │       │   ├── BusinessProfilesTab.tsx   # Multi-business profile switcher & manager
    │       │   ├── TermsTemplatesTab.tsx     # Terms and conditions templates library
    │       │   ├── PrintConfigTab.tsx        # Print layout settings & thermal configuration
    │       │   ├── ModuleTogglesTab.tsx      # Feature modules, region mode, stock alerts, updates
    │       │   ├── CloudSyncTab.tsx          # Google Drive OAuth integration & folder setup
    │       │   ├── DataBackupTab.tsx         # Daily snapshots, trash bin, and selective JSON import/export
    │       │   ├── NumberingSettingsTab.tsx  # Brand prefixes, numbering format, and live preview
    │       │   ├── SetupWizard.tsx           # Multi-step first-run business preset configurator
    │       │   ├── WelcomeGuide.tsx          # Multi-step business profile builder & walkthrough
    │       │   └── index.ts                  # Settings components barrel export
    │       └── index.ts          # Settings feature barrel export
    │   └── supabase/             # Supabase cloud synchronization & PostgreSQL integration
    │       ├── types/            # TypeScript interfaces for config & sync status
    │       ├── constants/        # Canonical 235-line SQL DDL schema script
    │       ├── hooks/            # useSupabaseSync state manager
    │       ├── components/       # ConfigCard, SchemaInspector, MigrationControl, SyncSettings, AuditTable
    │       └── index.ts          # Feature barrel export
    ├── shared/                   # Universal domain-agnostic building blocks
    │   ├── components/           # Design system primitives
    │   │   ├── feedback/         # Comprehensive Ant Design UI/UX Feedback System
    │   │   │   ├── Alert.tsx         # Persistent, non-blocking inline information with actions & closable
    │   │   │   ├── AlertBanner.tsx   # AntD-styled warning/danger/info feedback banner facade
    │   │   │   ├── Notification.tsx  # Upper-right global system-initiated notification service (notify)
    │   │   │   ├── Popconfirm.tsx    # Lightweight floating contextual confirmation panel with pointer arrow
    │   │   │   ├── Popover.tsx       # Contextual card with rich content, actions & placement options
    │   │   │   ├── Progress.tsx      # Linear ProgressBar, ProgressCircle & LongOperationModal with cancellation
    │   │   │   ├── FormField.tsx     # Input validation wrapper keeping error text visible until corrected
    │   │   │   ├── FailureDialog.tsx # Persistent actionable failure dialog with reason, error log & retry
    │   │   │   ├── Toast.tsx         # Top-center lightweight auto-dismissing message (~3s)
    │   │   │   ├── ConfirmModal.tsx  # Centered blocking confirmation and prompt modal dialogs
    │   │   │   ├── FeedbackContainer.tsx # Unified container mounting Toast, Notification, Confirm & FailureDialog
    │   │   │   ├── HelpButton.tsx    # Contextual help trigger button
    │   │   │   ├── UnassignedBanner.tsx # Unassigned invoice warnings
    │   │   │   └── index.ts          # Feedback system barrel export
    │   │   ├── layout/           # PageHeader, Container
    │   │   ├── ui/               # Button, Input, Select, Badge, Card, Table, SegmentedTabs
    │   │   │   ├── Button.tsx    # Accessible polymorphic button with loading & variants
    │   │   │   ├── Input.tsx     # Floating label text input with error handling
    │   │   │   ├── Select.tsx    # Standardized select dropdown with option mapping
    │   │   │   ├── Badge.tsx     # Status pill and payment status indicators
    │   │   │   ├── StatusBadge.tsx # AntD v5 status badge with dot indicators
    │   │   │   ├── Card.tsx      # Composable card surfaces
    │   │   │   ├── StatCard.tsx  # Metric card with AntD v5 elevation & variant tints
    │   │   │   ├── SegmentedTabs.tsx # AntD v5 segmented control with badge counts & dots
    │   │   │   ├── Breadcrumb.tsx # Hierarchy breadcrumb with auto-collapsing for deep structures
    │   │   │   ├── Steps.tsx     # Sequential workflow stages (Horizontal & Vertical)
    │   │   │   ├── Menu.tsx      # Top & Side navigation menu with expandable submenus
    │   │   │   ├── Tabs.tsx      # In-place function switching (Basic, Card, Pill, Vertical)
    │   │   │   ├── Pagination.tsx # Navigable page controls (Basic, Mini, Simple)
    │   │   │   ├── Table.tsx     # Semantic tabular grid with EmptyState
    │   │   │   └── index.ts      # Shared UI barrel export
    │   │   └── index.ts          # Shared components hub export
    │   ├── constants/            # System-wide static definitions
    │   │   ├── indianStates.ts   # States/UTs, GST state codes, UTGST definitions
    │   │   ├── currencies.ts     # Global country & currency configurations (COUNTRIES)
    │   │   ├── taxRates.ts       # Statutory GST tax rates, TDS/TCS thresholds
    │   │   └── index.ts          # Universal barrel re-export for constants
    │   ├── hooks/                # Generic domain-agnostic UI hooks
    │   │   ├── useDebounce.ts    # Debounced values and callbacks
    │   │   ├── useLocalStorage.ts # Safe localStorage with cross-tab/intra-window sync
    │   │   ├── useHotkeys.ts     # Keyboard shortcuts with form input safety
    │   │   ├── useMediaQuery.ts  # Viewport media query listener
    │   │   └── index.ts          # Barrel re-export for shared hooks
    │   ├── types/                # Global foundational types
    │   │   ├── common.ts         # Address, StateCode, Discount types, ApiResponse
    │   │   ├── currency.ts       # CurrencyCode, CurrencyInfo, RegionMode
    │   │   ├── tax.ts            # TaxRate, GSTBucket, PlaceOfSupply, TaxBreakdown
    │   │   └── index.ts          # Barrel export for shared types
    │   └── utils/                # Formatters, dateUtils, validators, share
    │       ├── formatters.ts     # Number-to-words, INR/currency formatters, exchange rates
    │       ├── dateUtils.ts      # GST portal date formatters, financial year & filing calculators
    │       ├── validators.ts     # GSTIN, PAN, IFSC, UPI, and tax ID statutory validators
    │       └── index.ts          # Barrel re-export for shared utilities
    ├── services/                 # Central application-wide services
    │   └── api/                  # Base HTTP client with timeout and typed errors
    └── styles/                   # Modular design token stylesheet
        ├── index.css             # Style entry point importing all layers
        ├── tokens.css            # Ant Design v5 color palettes, typography, spacing, and radius tokens
        ├── tokens.ts             # TypeScript definitions for Ant Design tokens & CSS variables
        ├── themes.css            # Light and Dark theme semantic variables mapped to Ant Design
        ├── reset.css             # Modern CSS reset & baseline typography
        ├── utilities.css         # Utility classes
        └── print.css             # High-fidelity print rules for A4 and Thermal POS
├── server/                       # Modular backend architecture
│   ├── config/                   # Paths and server configuration
│   │   ├── paths.js              # Canonical directory & data file constants
│   │   └── index.js              # Config barrel export
│   ├── infrastructure/           # Storage, cron, and external IO
│   │   ├── db/                   # Legacy opt-in SQLite compatibility engine
│   │   │   ├── schema.sql        # Normalized relational schema (15 tables, 12 indexes)
│   │   │   └── sqlite.js         # Native node:sqlite DatabaseSync singleton & transaction engine
│   │   ├── storage/              # JSON-first repository layer with legacy adapters
│   │   │   ├── CollectionRepository.js # Delegating collection repository with dual-write shadow mode
│   │   │   ├── SqliteCollectionRepository.js # Native SQLite storage adapter (100% ICollectionRepository contract)
│   │   │   ├── JsonCollectionRepository.js   # Canonical JSON flat-file storage engine
│   │   │   ├── SingleFileRepository.js # Singleton document repository
│   │   │   └── index.js          # Storage barrel export
│   │   └── cron/                 # Background schedulers & cron tasks
│   │       ├── recurringEngine.js # Recurring invoice auto-fire background engine
│   │       └── index.js          # Cron barrel export
│   ├── modules/                  # Domain business modules
│   │   ├── bills/                # Invoices & bills module (routes, controller, service, repo)
│   │   ├── clients/              # Client records module (routes, controller, service, repo)
│   │   ├── products/             # Inventory products module (routes, controller, service, repo)
│   │   ├── expenses/             # Business expenses module (routes, controller, service, repo)
│   │   ├── purchases/            # Purchase bills module (routes, controller, service, repo)
│   │   ├── receipts/             # Payment receipts module (routes, controller, service, repo)
│   │   ├── recurring/            # Recurring templates module (routes, controller, service, repo)
│   │   ├── profiles/             # Multi-business profiles & primary profile module (routes, controller, service, repo)
│   │   ├── templates/            # Terms & conditions templates module (routes, controller, service, repo)
│   │   ├── meta/                 # Metadata & atomic counters module (routes, controller, service, repo)
│   │   └── supabase/             # Supabase cloud database module
│   │       ├── supabase.controller.js   # HTTP request mapping & validation
│   │       ├── supabase.service.js      # Configuration & sync orchestration service
│   │       ├── supabase.routes.js       # Express routes mounted on /api/supabase
│   │       ├── supabaseConnection.js    # Latency ping & table schema inspector
│   │       ├── supabaseSync.service.js  # Batch upsert (chunking: 50), paged fetch, pre-sync snapshots
│   │       ├── supabaseTransformers.js  # Bidirectional transformations for 8 statutory collections
│   │       └── index.js                 # Module barrel re-exports
│   └── shared/                   # Common backend middleware, errors, and utils
│       ├── errors/               # Custom application error classes (AppError)
│       ├── middleware/           # Express error handler, request logger
│       └── utils/                # Atomic FS, path sanitization
├── scripts/                      # Automated test harnesses & migration tooling
│   ├── tax-test.mjs              # 70-test statutory GST/ITR compliance test harness
│   ├── discount-modes-test.mjs   # 9-test discount calculation matrix verification
│   ├── validate-json-data.mjs    # Phase A pre-migration data validation & snapshot audit
│   ├── init-sqlite-db.mjs        # Phase B / Phase 2 SQLite initialization & verification harness
│   ├── migrate-json-to-sql.mjs   # Phase C / Phase 3 JSON-to-SQLite single-transaction ETL engine
│   ├── verify-migration-parity.mjs # Phase 4 migration parity & verification suite (20 gates)
│   └── test-sqlite-repository.mjs  # Phase 5 repository adapter & shadow dual-write test harness
└── server.js                     # Thin HTTP server bootstrap & reverse-proxy router
```
// In src/shared/components/ui/
+ SideModal.tsx
