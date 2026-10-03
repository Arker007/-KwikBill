# Documentation

Detailed reference for **Free GST Billing Software**. The main project [README](../README.md) is the
overview and feature list — everything below is the deep-dive material.

| Document | What's in it |
|---|---|
| **[USER_GUIDE.md](./USER_GUIDE.md)** | Plain-language handbook for end users. Quick Start, daily-use walkthroughs, region preference, modules, PDF customisation, Terms presets, TDS / TCS, GST returns, E-Way Bill, backup & restore, moving to a new computer, FAQ, troubleshooting. |
| **[COMPETITOR_GAPS.md](./COMPETITOR_GAPS.md)** | Gap analysis vs the top 5 open-source GST projects on GitHub (ERPNext, Akaunting, Invoice Ninja, Crater, InvoiceShelf) and the top 5 commercial Indian tools (Tally, Vyapar, Zoho Books, ClearTax, Marg). Includes the prioritised roadmap and Indian Income Tax e-filing format notes. |
| **[TAX_HELPER_PLAN.md](./TAX_HELPER_PLAN.md)** | Three-tier proposal for the v1.5.x **Income Tax Helper** feature — bank-statement CSV import, ITR Filing Summary PDF, optional ITR-4 JSON generation. Explains what's possible and what isn't given the IT Department portal's constraints. |
| **[LOCAL_SQL_MIGRATION_PLAN.md](./LOCAL_SQL_MIGRATION_PLAN.md)** | Architecture and implementation roadmap for migrating local flat-file JSON storage to an embedded local SQLite engine in WAL mode with zero-breakage repository adapters and 100% offline portability. |
| **[SUPABASE_INTEGRATION_PLAN.md](./SUPABASE_INTEGRATION_PLAN.md)** | Proposal for cloud backup and multi-device database synchronization using Supabase PostgreSQL. |

> Looking for the version history? [CHANGELOG.md](../CHANGELOG.md) at the project root.
> Looking for licence terms? [LICENSE](../LICENSE) at the project root.
> Looking for installation? [START HERE.txt](../START%20HERE.txt) at the project root.

If you spot something stale in here, [open an issue] — docs drift faster than code.
