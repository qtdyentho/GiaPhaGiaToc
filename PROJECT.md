# Project: GiaPhaGiaToc (Genealogy SaaS)

## Architecture
- **Frontend**: React 18, TypeScript, Vite 5, Tailwind CSS, Lucide React, Canvas/DOM Tree Rendering (`GenealogyCanvas.tsx`, `GenealogyTreeNode.tsx`).
- **Backend & BaaS**: Supabase PostgreSQL 15, Row Level Security (RLS) multi-tenancy, RPC Stored Procedures, Serverless Edge Webhooks (`api/webhook.ts`).
- **Services & Modules**:
  - `DataImportService.ts`: Multi-format Excel/CSV parsing, column mapping, topological BFS generation ordering, date normalization, batch Supabase commit, undo rollback.
  - `GenealogyService.ts`: Core member and relationship CRUD, hierarchy tree construction, family branches.
  - `KinshipService.ts`: Vietnamese kinship terminology calculation (Bác, Chú, Cô, Cậu, Dì, Anh/Chị/Em họ, Cháu, Chắt...).
  - `EventService.ts` & `MemorialService.ts`: Family events, death anniversaries, bi-directional Solar/Lunar calendar synchronizer.
  - `BillingService.ts` & `SubscriptionService.ts`: SaaS pricing tiers, VietQR NAPAS247 generation, HMAC webhook verification, quota gating.
  - `ReminderService.ts` & `BroadcastService.ts`: Scheduled event alerts, in-app notifications, emergency broadcast pub/sub.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | Excel Date Parsing Normalization | Convert parsed dates (DD/MM/YYYY) to PostgreSQL ISO `YYYY-MM-DD` for Supabase `date_of_birth` and `date_of_death_solar` | M1 | Survey Explorer 1 |
| F2 | Relationship Polarity Harmonization | Standardize relationship direction across `DataImportService.ts`, `GenealogyService.ts`, and `GenealogyCanvas.tsx` (`member_id` = child, `related_member_id` = parent for `PARENT`) | M1, M2 | Survey Explorer 1, 2 |
| F3 | Direct Lineage Fields Sync | Ensure `father_id`, `mother_id`, and `spouse_id` are correctly updated on `members` table rows during import and manual CRUD | M1, M2 | Survey Explorer 1, 2 |
| F4 | Duplicate Name Disambiguation | Disambiguate members with identical names across different generations using hierarchical path / generation index | M1 | Survey Explorer 1 |
| F5 | Flexible Ancestor Birth Year | Support pre-1000 AD birth years for ancient lineage ancestors without throwing validation error | M1 | Survey Explorer 1 |
| F6 | Excel Header Detection & Validation | Support dynamic header rows, banner rows, and return friendly, user-facing error messages on invalid formats | M1 | Survey Explorer 1, Original Request |
| F7 | Member Delete & Archive CRUD | Implement safe `deleteMember` / `archiveMember` in `GenealogyService.ts` with referential integrity and UI refresh | M2 | Survey Explorer 2, Original Request |
| F8 | Member Profile Edit Wiring | Connect "Sửa Thông Tin" button in `MemberProfilePage.tsx` to edit modal and verify immediate UI update | M2 | Survey Explorer 2 |
| F9 | Genealogy Tree Stability | Verify anti-cycle traversal, spouse deduplication, and zero regression in tree rendering after import & mutations | M2 | Survey Explorer 2, Original Request |
| F10 | Phases 7-9 Missing Features Audit | Complete comprehensive audit against `IMPLEMENTATION_PLAN.md` (Phases 7, 8, 9) and publish formal report | M3 | Survey Explorer 3, Original Request |
| F11 | E2E Test Suite & Test Infra | Comprehensive opaque-box test suite (Tiers 1-4) covering all features | E2E Track | Original Request, Methodology |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E2E | E2E Testing Track | Design E2E test infra, build Tiers 1-4 test suites, publish TEST_READY.md | none | IN_PROGRESS |
| M1 | Excel Data Import Fix (R1) | Fix DataImportService & DataImportWizardModal (F1, F2, F3, F4, F5, F6) | none | IN_PROGRESS |
| M2 | Robust Read/Write & Tree (R2) | Stabilize CRUD operations, delete/archive, profile edit, tree stability (F2, F3, F7, F8, F9) | M1 contract | IN_PROGRESS |
| M3 | Missing Features Audit (R3) | Authoritative written audit report for Phases 7, 8, 9 (F10) | none | IN_PROGRESS |
| M_FINAL | 100% E2E Pass & Adversarial Hardening | Verify 100% pass on Tiers 1-4, then Tier 5 white-box adversarial stress testing | E2E, M1, M2, M3 | PLANNED |

## Interface Contracts
### DataImportService ↔ GenealogyCanvas & KinshipService
- **Relationship Schema in DB**:
  - For parent-child: `member_id` is Child ID, `related_member_id` is Parent ID, `relationship_type = 'PARENT'`, OR consistently mapped so `GenealogyCanvas` and `KinshipService` traverse parent/child symmetrically.
  - Direct columns on `members`: `father_id` (UUID | null), `mother_id` (UUID | null), `spouse_id` (UUID | null), `generation` (integer >= 1).
- **Date formats**:
  - Supabase input: `YYYY-MM-DD` (ISO string) or `null`.
  - Display output: `DD/MM/YYYY`.

### GenealogyService ↔ MemberProfilePage & Tree Views
- **Member CRUD Methods**:
  - `addMember(clanId: string, memberData: Partial<Member>): Promise<Member>`
  - `updateMember(memberId: string, updates: Partial<Member>): Promise<Member>`
  - `deleteMember(memberId: string, clanId: string): Promise<boolean>` (with safe relationship cleanup/archive)
  - `getFamilyTree(clanId: string): Promise<FamilyTreeResponse>`

## Code Layout
- `src/services/DataImportService.ts`: Import engine, multi-sheet parser, topological sorting, date parser, batch save.
- `src/components/modals/DataImportWizardModal.tsx`: Wizard UI, 5-step workflow, column mapper, validation feedback.
- `src/services/GenealogyService.ts`: Core genealogy API & CRUD service.
- `src/services/KinshipService.ts`: Kinship terminology engine.
- `src/components/genealogy/GenealogyCanvas.tsx`: Genealogy canvas tree renderer.
- `src/components/genealogy/GenealogyTreeNode.tsx`: Tree node UI renderer.
- `src/pages/MemberProfilePage.tsx`: Member detail view and edit trigger.
- `tests/`: Automated unit, integration, and E2E test suites.
