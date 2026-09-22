/**
 * Compatibility re-export. `SectionHead` moved to `common/` (it is used
 * app-wide, not only on the dashboard). Import it from `@/components/common`
 * going forward; this shim keeps existing `@/components/dashboard/SectionHead`
 * imports working during the migration.
 */
export { SectionHead } from "@/components/common";
