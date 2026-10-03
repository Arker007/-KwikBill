# 06 — Design System & Styles Refactor Plan

## 1. Current Styling Audit (`src/index.css`)

The current stylesheet is a 1,000+ line monolithic file containing:
- Root CSS variables with partial theme support
- High-specificity class overrides (`[data-theme="dark"] .form-input`)
- Hardcoded hex color codes scattered across component styles
- Inconsistent spacing and radius units (`4px`, `6px`, `8px`, `10px`, `12px`, `0.75rem`)
- Unstandardized print media queries interacting awkwardly with screen styles

### Major Anti-Patterns Detected:
1. **Duplicate Button Declarations**: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-sm`, `.btn-outline`, `.btn-danger` defined with competing padding and border styles in multiple sections.
2. **Inline Hex Codes**: Extensive inline styles inside JSX files (`style={{ color: '#1e40af', background: '#f8fafc' }}`).
3. **Competing Dark Theme Inversions**: Dark mode overrides use aggressive color inversions that cause contrast failure on badges and tables.

---

## 2. Target Design Token Architecture (`src/styles/`)

```
src/styles/
├── tokens.css            # Base primitives (colors, typography scales, spacing, radii, shadows)
├── themes.css            # Semantic token mapping for Light and Dark modes
├── reset.css             # Modern CSS reset and baseline typography
├── utilities.css         # Helper utilities (layout, typography, elevation)
├── print.css             # High-fidelity print styles (A4, A5, 80mm/58mm thermal rolls)
└── index.css             # Entry point importing all style layers in order
```

---

## 3. Design Tokens Specification (`src/styles/tokens.css`)

### 3.1 Color Palette
```css
:root {
  /* Brand Primitives (Blue Slate) */
  --color-brand-50:  #eff6ff;
  --color-brand-100: #dbeafe;
  --color-brand-500: #3b82f6;
  --color-brand-600: #2563eb;
  --color-brand-700: #1d4ed8;
  --color-brand-800: #1e40af;
  --color-brand-900: #1e3a8a;

  /* Neutral Surface Primitives */
  --color-slate-50:  #f8fafc;
  --color-slate-100: #f1f5f9;
  --color-slate-200: #e2e8f0;
  --color-slate-300: #cbd5e1;
  --color-slate-400: #94a3b8;
  --color-slate-500: #64748b;
  --color-slate-600: #475569;
  --color-slate-700: #334155;
  --color-slate-800: #1e293b;
  --color-slate-900: #0f172a;

  /* Semantic Feedback */
  --color-emerald-500: #10b981;
  --color-amber-500:   #f59e0b;
  --color-rose-500:    #f43f5e;
}
```

### 3.2 Spacing & Radii Scale (Mathematical 4px Grid)
```css
:root {
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem;  /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem;    /* 16px */
  --space-6: 1.5rem;  /* 24px */
  --space-8: 2rem;    /* 32px */

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
}
```

---

## 4. Shared UI Component Primitives (`src/shared/components/`)

Create strict, typed UI primitives in `src/shared/components/`:

1. **`Button` (`src/shared/components/ui/Button.tsx`)**:
   - Variants: `primary`, `secondary`, `outline`, `danger`, `ghost`
   - Sizes: `sm` (32px), `md` (40px), `lg` (48px)
   - Supports: `loading` spinner state, `icon` slot, full-width `block` prop.

2. **`Input` & `Select` (`src/shared/components/ui/Input.tsx`, `Select.tsx`)**:
   - Standardized error state styling (`hasError` prop), helper text slot, prefix/suffix icons.

3. **`Modal` (`src/shared/components/ui/Modal.tsx`)**:
   - Accessible backdrop overlay, focus trapping, header with close action, scrollable body, action footer.

4. **`Card` (`src/shared/components/ui/Card.tsx`)**:
   - Unified background surface, consistent border-radius (8px), padding scale.

5. **`Badge` (`src/shared/components/ui/Badge.tsx`)**:
   - Semantic tags for invoice statuses: `paid` (green), `unpaid` (red), `partial` (amber), `overdue` (rose).

6. **`Table` (`src/shared/components/ui/Table.tsx`)**:
   - Standardized table header, hover rows, compact cell padding, empty states.

---

## 5. Print Media Optimization (`src/styles/print.css`)

The current printing mechanism suffers from unexpected page overflows, hidden table borders, and page-break splits mid-row.

### Print Rules:
- Enforce strict page break rules:
  ```css
  @media print {
    .invoice-table tr {
      page-break-inside: avoid;
    }
    .invoice-totals-card {
      page-break-inside: avoid;
    }
    .no-print {
      display: none !important;
    }
  }
  ```
- Support dedicated print dimensions:
  - Standard A4 Portrait: `210mm × 297mm`
  - Compact A5 Landscape: `210mm × 148mm`
  - Thermal POS: `80mm` continuous and `58mm` continuous
