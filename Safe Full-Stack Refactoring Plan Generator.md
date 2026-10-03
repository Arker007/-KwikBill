You are a senior software architect performing a production-grade refactoring assessment of an EXISTING full-stack project.

Your task is NOT to refactor the code yet.

Your task is to inspect the complete existing repository and create a detailed, executable, low-risk refactoring plan split across multiple documentation files and 30+ implementation phases.

The final target architecture should follow this general structure where appropriate:

project/
├── public/
├── src/
│   ├── app/
│   ├── pages/
│   ├── features/
│   ├── shared/
│   ├── services/
│   ├── store/
│   ├── styles/
│   ├── assets/
│   ├── config/
│   ├── lib/
│   ├── tests/
│   └── main.tsx
├── backend/ or server/
├── docs/
├── scripts/
├── .env.example
├── package.json
├── README.md
└── AGENTS.md

Do NOT blindly force this structure. Adapt it to the framework, backend technology, existing conventions, and actual requirements of the repository.

# PRIMARY GOAL

Create a safe migration plan that improves:

- maintainability
- naming clarity
- feature isolation
- component reuse
- design-system consistency
- frontend architecture
- backend architecture
- API organization
- data access
- type safety
- validation
- state management
- performance
- error handling
- security
- testing
- developer experience
- build reliability
- deployment safety

The application must remain functional throughout the migration.

# CRITICAL SAFETY RULES

1. Inspect before recommending.
2. Do not assume files exist.
3. Do not invent architecture.
4. Do not modify code during this task.
5. Do not delete files during planning.
6. Do not perform large rewrites.
7. Prefer move → update imports → verify → continue.
8. Preserve existing behavior unless an existing bug is explicitly identified.
9. Separate structural refactoring from behavioral changes.
10. Avoid simultaneously changing file location, implementation logic, API contracts, and styling.
11. Do not change frontend and backend contracts in the same uncontrolled step.
12. Maintain backward compatibility during API migrations when practical.
13. Every migration phase must be independently testable.
14. Every phase must include verification and rollback guidance.
15. Detect circular dependencies before restructuring.
16. Detect shared modules that are actually feature-specific.
17. Detect duplicated components before creating new shared components.
18. Detect duplicated utilities, hooks, types, schemas, API clients, constants, and styles.
19. Preserve Git history where practical by moving files instead of recreating them.
20. Never rewrite working code merely to match a preferred pattern.

# STEP 1 — REPOSITORY AUDIT

First inspect:

- complete directory tree
- package.json files
- frontend entry points
- backend entry points
- routing
- layouts
- providers
- components
- pages
- features/modules
- hooks
- stores
- API clients
- backend routes/controllers
- services
- repositories/data layer
- models/entities
- schemas
- validators
- database configuration
- authentication
- authorization
- middleware
- environment configuration
- static assets
- CSS/styles/theme system
- tests
- build configuration
- lint configuration
- TypeScript configuration
- deployment configuration

Do not rely only on filenames.

Inspect imports and module responsibilities where necessary.

# STEP 2 — CLASSIFY EVERY IMPORTANT MODULE

Classify modules into:

APP
Application bootstrap, routing, providers, global layouts.

PAGE
Route-level composition.

FEATURE
Domain/business-specific functionality.

SHARED UI
Reusable presentational components.

SHARED LOGIC
Reusable hooks, utilities, types, validators.

SERVICE
External/API/storage communication.

LIBRARY WRAPPER
Third-party framework/library integrations.

GLOBAL STATE
Truly application-wide state.

FEATURE STATE
State owned by one feature.

BACKEND ROUTE
HTTP endpoint definitions.

CONTROLLER
Transport/request handling.

SERVICE
Business logic.

REPOSITORY
Database/data access.

DOMAIN
Core entities/business rules.

SCHEMA
Validation/data contracts.

INFRASTRUCTURE
Database, logging, cache, external providers.

CONFIG
Environment and runtime configuration.

# STEP 3 — IDENTIFY ARCHITECTURE PROBLEMS

Find and document:

- oversized folders
- oversized files
- vague filenames
- duplicate components
- duplicate utilities
- duplicate hooks
- duplicate API logic
- duplicate types
- duplicate styles
- hardcoded values
- direct API calls from UI
- business logic inside UI components
- database logic inside controllers
- feature-specific code inside shared/
- shared code importing features
- circular dependencies
- deep relative imports
- barrel-file problems
- inconsistent error handling
- inconsistent async handling
- inconsistent validation
- inconsistent state ownership
- prop drilling
- global state that should be local
- local state that should be feature/global
- API contract duplication
- inconsistent response structures
- inconsistent naming
- unused files
- dead code
- stale dependencies
- unsafe environment handling
- security problems
- missing tests
- weak typing
- any source of refactoring risk

# DOCUMENTATION OUTPUT

Create:

docs/refactor/

00-refactor-overview.md
01-current-architecture-audit.md
02-target-architecture.md
03-dependency-analysis.md
04-file-migration-map.md
05-frontend-refactor-plan.md
06-design-system-refactor.md
07-state-management-plan.md
08-api-refactor-plan.md
09-backend-refactor-plan.md
10-data-layer-plan.md
11-auth-security-plan.md
12-testing-strategy.md
13-performance-plan.md
14-cleanup-plan.md
15-migration-phases.md
16-verification-checklist.md
17-rollback-strategy.md
18-final-target-tree.md
19-refactor-progress.md
20-decisions-log.md

Do not put the entire plan into one huge document.

Keep each document focused.

# 00-refactor-overview.md

Include:

- current architectural style
- major problems
- target architectural style
- migration strategy
- highest-risk areas
- estimated architectural complexity: Low / Medium / High
- areas that should NOT be changed initially
- recommended execution order

# 01-current-architecture-audit.md

Document current repository structure.

For every important folder explain:

Current responsibility:
Actual responsibility:
Problems:
Recommended destination:
Priority:
Risk:

Use actual repository paths.

# 02-target-architecture.md

Define the recommended final architecture.

For frontend prefer:

src/
├── app/
├── pages/
├── features/
├── shared/
├── services/
├── store/
├── styles/
├── assets/
├── config/
└── lib/

For each directory define:

- allowed responsibilities
- forbidden responsibilities
- allowed dependencies
- ownership rules
- examples

Define dependency direction such as:

app
↓
pages
↓
features
↓
shared

Shared modules must not depend on feature modules.

Adapt this dependency model when technically necessary.

# 03-dependency-analysis.md

Document:

- module dependency graph
- circular dependencies
- cross-feature dependencies
- problematic shared dependencies
- third-party dependencies
- modules with high coupling
- modules with high fan-in
- modules with high fan-out

Identify dependencies that must be fixed BEFORE moving files.

# 04-file-migration-map.md

Create a table:

Current Path
→ Target Path
Reason
Dependencies affected
Imports affected
Risk
Phase

Example:

src/components/ProductCard.tsx
→ src/features/products/components/ProductCard/ProductCard.tsx

Do this for all meaningful files that require restructuring.

Do NOT list files that do not need moving.

# FRONTEND PLAN

05-frontend-refactor-plan.md

Cover:

- app bootstrap
- routes
- layouts
- pages
- feature boundaries
- components
- hooks
- utilities
- types
- constants
- forms
- state
- API usage
- error states
- loading states
- accessibility
- responsive behavior

Define:

Page → Feature → Shared UI

responsibility boundaries.

# DESIGN SYSTEM

06-design-system-refactor.md

Audit:

- colors
- typography
- spacing
- radii
- shadows
- breakpoints
- z-index
- buttons
- inputs
- cards
- modals
- tables
- badges
- navigation
- feedback states

Find:

- duplicate styles
- inline styles
- hardcoded colors
- inconsistent spacing
- repeated component variants

Create one source of truth.

Prefer:

styles/
├── index.css
├── reset.css
├── tokens.css
├── themes.css
└── utilities.css

Do not create multiple competing implementations of the same component.

# STATE MANAGEMENT

07-state-management-plan.md

Classify each important state as:

Component local
Page local
Feature state
Server state
Global application state
URL state
Persistent storage state

Identify inappropriate global state.

Recommend ownership and migration order.

# API PLAN

08-api-refactor-plan.md

Audit:

- API client
- endpoints
- request functions
- response handling
- interceptors
- authentication
- errors
- retry behavior
- serialization
- API types
- validation

Define preferred separation:

UI
↓
feature service
↓
API client
↓
HTTP endpoint

Frontend components should not contain raw HTTP logic.

Document existing API contracts before changing them.

For each endpoint record:

Method
Path
Frontend consumer
Backend handler
Request type
Response type
Validation
Auth requirement
Error contract
Migration risk

# BACKEND PLAN

09-backend-refactor-plan.md

Adapt to existing backend technology.

Prefer separation similar to:

server/
├── app/
├── modules/
├── shared/
├── infrastructure/
├── config/
└── tests/

Feature/module example:

modules/
└── products/
    ├── product.routes
    ├── product.controller
    ├── product.service
    ├── product.repository
    ├── product.schema
    ├── product.types
    └── product.mapper

Do not force this exact naming if the current backend framework has stronger conventions.

Separate:

route
→ controller
→ service
→ repository
→ database

Controllers should not contain database queries.

Repositories should not contain HTTP logic.

Business services should not depend on UI/frontend concepts.

# DATA LAYER

10-data-layer-plan.md

Audit:

- database client
- schema
- models
- repositories
- migrations
- queries
- transactions
- indexes
- caching
- serialization

Document potentially dangerous database changes separately.

Do NOT combine schema migration and large application refactoring unless required.

# SECURITY

11-auth-security-plan.md

Inspect:

- authentication
- authorization
- sessions/tokens
- password handling
- middleware
- validation
- sanitization
- secrets
- CORS
- rate limiting
- access control
- file uploads
- API exposure
- sensitive logging

Separate architectural recommendations from security-critical changes.

# TESTING

12-testing-strategy.md

Define tests required BEFORE risky refactors.

Cover:

- unit tests
- component tests
- API tests
- integration tests
- database tests
- authentication tests
- regression tests
- smoke tests
- end-to-end tests

Identify critical flows that require baseline regression tests before migration.

# PERFORMANCE

13-performance-plan.md

Audit:

Frontend:
- bundle size
- duplicate dependencies
- unnecessary renders
- large components
- code splitting
- lazy loading
- asset loading
- API waterfalls

Backend:
- slow endpoints
- duplicate queries
- N+1 queries
- unnecessary transformations
- caching opportunities
- blocking operations

Do not perform premature optimization.

# CLEANUP

14-cleanup-plan.md

Only after architecture stabilizes identify:

- dead files
- unused exports
- obsolete components
- deprecated utilities
- duplicate types
- duplicate constants
- old styles
- unused dependencies
- stale configuration

Deletion belongs near the END of the migration.

# PHASED MIGRATION

15-migration-phases.md

Create at least 35 phases.

Prefer approximately 40–45 phases if the repository is large.

Use the safest dependency order.

Recommended baseline:

PHASE 01 — Repository baseline
PHASE 02 — Build/test baseline
PHASE 03 — Dependency inventory
PHASE 04 — Architecture mapping
PHASE 05 — Circular dependency detection
PHASE 06 — Naming conventions
PHASE 07 — Path aliases
PHASE 08 — Configuration normalization
PHASE 09 — Environment normalization
PHASE 10 — Shared type foundations
PHASE 11 — Shared constants
PHASE 12 — Shared utilities
PHASE 13 — Shared hooks
PHASE 14 — Design tokens
PHASE 15 — Base UI primitives
PHASE 16 — Shared feedback components
PHASE 17 — Shared navigation components
PHASE 18 — App providers
PHASE 19 — Layout architecture
PHASE 20 — Router architecture
PHASE 21 — Page boundaries
PHASE 22 — First low-risk feature extraction
PHASE 23 — Remaining feature extraction
PHASE 24 — Feature component ownership
PHASE 25 — Feature hooks
PHASE 26 — Feature types
PHASE 27 — Feature validation
PHASE 28 — Feature state
PHASE 29 — Global state cleanup
PHASE 30 — Frontend API client normalization
PHASE 31 — Frontend service layer
PHASE 32 — API contract documentation
PHASE 33 — Backend configuration
PHASE 34 — Backend shared infrastructure
PHASE 35 — Backend routing separation
PHASE 36 — Controller separation
PHASE 37 — Service/business logic separation
PHASE 38 — Repository/data access separation
PHASE 39 — Validation/schema normalization
PHASE 40 — Authentication/authorization cleanup
PHASE 41 — Error handling normalization
PHASE 42 — Logging/observability
PHASE 43 — Integration tests
PHASE 44 — Performance pass
PHASE 45 — Dead-code cleanup
PHASE 46 — Dependency cleanup
PHASE 47 — Documentation update
PHASE 48 — Full regression verification
PHASE 49 — Production/build verification
PHASE 50 — Final architecture audit

Adapt these phases to the actual repository.

Merge phases only if genuinely unnecessary.

Add phases where repository-specific risks require them.

# EACH PHASE MUST CONTAIN

For every phase write:

## Phase XX — Name

### Goal
One clear outcome.

### Why now
Why this phase must happen at this point.

### Scope
Exactly what is included.

### Files affected
Actual current files/folders.

### Files created
Expected new files.

### Files moved
Current → destination.

### Files modified
List likely files.

### Dependencies
Earlier phases required.

### Actions
Numbered implementation steps.

### Import updates
Imports that must change.

### Behavioral constraints
What behavior must remain unchanged.

### Verification
Commands/tests/manual checks.

### Success criteria
Exact conditions required before continuing.

### Risks
Possible regressions.

### Rollback
How to reverse this phase safely.

### Do not do
Changes explicitly forbidden in this phase.

# PHASE SIZE

Each phase should be small enough that:

- one developer or AI agent can implement it independently
- changes can be reviewed easily
- failures can be isolated
- rollback is straightforward
- context requirements stay small

Prefer 5–20 related files per phase.

If a phase touches too many unrelated modules, split it.

# SAFE ORDER

Use this general dependency order:

Baseline
↓
Tests
↓
Dependency analysis
↓
Naming/config
↓
Shared foundations
↓
Design system
↓
App infrastructure
↓
Frontend pages
↓
Frontend features
↓
State
↓
Frontend API layer
↓
API contracts
↓
Backend structure
↓
Controllers
↓
Services
↓
Repositories
↓
Database
↓
Auth/security
↓
Cross-stack integration
↓
Performance
↓
Cleanup
↓
Final verification

Never start by moving the entire repository.

# MIGRATION PRINCIPLE

For structural moves use:

1. Inspect source.
2. Identify consumers.
3. Create target folder if required.
4. Move file without changing behavior.
5. Update imports.
6. Build.
7. Type-check.
8. Run related tests.
9. Verify application behavior.
10. Commit/checkpoint.
11. Continue.

Do NOT simultaneously redesign the implementation unless that phase explicitly requires it.

# IMPORT RULES

Target clear imports such as:

@/app/*
@/pages/*
@/features/*
@/shared/*
@/services/*
@/config/*
@/lib/*

Avoid excessive:

../../../..

But introduce aliases only after confirming framework/build/test tooling support.

# FEATURE RULES

A feature owns:

- feature-specific components
- feature hooks
- feature services
- feature state
- feature types
- feature validation
- feature utilities

Example:

features/products/
├── components/
├── hooks/
├── services/
├── store/
├── types/
├── schemas/
├── utils/
└── index.ts

Do not place domain-specific code in shared/.

# SHARED RULE

Move something to shared/ only when:

- it has no business-domain dependency
- it is genuinely reusable
- at least two unrelated modules can reasonably consume it

Do not create abstractions based only on visual similarity.

# BACKEND DEPENDENCY RULE

Prefer:

routes
↓
controllers
↓
services
↓
repositories
↓
database

Avoid:

route → database
controller → database
repository → HTTP
database → business feature

# API CONTRACT SAFETY

Before modifying API endpoints:

1. locate every frontend consumer
2. locate backend handler
3. document current request
4. document current response
5. document errors
6. document authorization
7. create/update contract type
8. migrate backend
9. migrate frontend
10. test both together

Avoid breaking API changes unless justified.

# DATABASE SAFETY

Database/schema changes must have their own phase.

For each migration document:

- old schema
- new schema
- compatibility
- migration command
- data transformation
- rollback method
- possible data loss
- backup requirement

Never casually rename/drop columns while restructuring code.

# 16-verification-checklist.md

Create reusable verification gates:

Architecture
□ dependency direction valid
□ no new circular imports
□ ownership boundaries valid

Frontend
□ routes work
□ layouts work
□ forms work
□ loading states work
□ errors work
□ responsive UI unchanged
□ accessibility not degraded

API
□ requests unchanged where required
□ responses valid
□ errors handled
□ auth preserved

Backend
□ routes resolve
□ controllers work
□ services work
□ repositories work

Database
□ queries valid
□ migrations safe
□ data preserved

Quality
□ build passes
□ typecheck passes
□ lint passes
□ tests pass
□ no new console errors

# 17-rollback-strategy.md

Define:

- per-phase rollback
- Git checkpoint strategy
- API rollback
- database rollback
- deployment rollback
- feature-flag opportunities

Do not rely on one final rollback after all phases.

# 18-final-target-tree.md

Show the COMPLETE recommended final project tree based on the actual repository.

Include concise descriptions beside important directories.

Do not include speculative empty folders.

# 19-refactor-progress.md

Create a tracker:

| Phase | Area | Status | Risk | Dependencies | Verification |
|------|------|------|------|------|------|

Status values:

NOT STARTED
IN PROGRESS
BLOCKED
COMPLETE
VERIFIED

Initially mark all implementation phases NOT STARTED.

# 20-decisions-log.md

Record architectural decisions using:

## ADR-001 — Decision

Context:
Decision:
Reason:
Alternatives:
Tradeoffs:
Affected areas:

Use this to prevent later AI agents from reversing previous decisions.

# PRIORITIZATION

Mark issues:

P0 — security/data-loss/build-breaking
P1 — architecture blocker
P2 — maintainability
P3 — cleanup/optimization

Also classify migration risk:

LOW
MEDIUM
HIGH
CRITICAL

# OUTPUT STYLE

Be precise.

Use real repository paths.

Avoid generic software-engineering explanations.

Do not repeat the same recommendation across multiple documents.

Keep implementation phases sufficiently detailed for another AI agent to execute without re-analyzing the whole project.

Use tables where they reduce repetition.

Keep each phase focused.

# IMPORTANT CONTEXT-EFFICIENCY RULE

Future implementation agents should only need:

1. AGENTS.md
2. 00-refactor-overview.md
3. 20-decisions-log.md
4. the specific phase they are implementing
5. files directly involved in that phase

Design the documentation so the entire repository does not need to be reread for every phase.

# FINAL RESPONSE

After creating all plan documents, respond only with:

1. architecture assessment
2. number of problems found
3. number of migration phases
4. highest-risk areas
5. documentation files created
6. recommended first implementation phase

Do not start implementing the refactor.