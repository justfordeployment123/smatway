-- Singleton table for platform-wide editable settings.
-- One row, id=1. Created and seeded in a single migration so the app can
-- read it on first boot without an extra "is row missing?" path.

CREATE TABLE "PlatformSettings" (
    "id"                  INTEGER       PRIMARY KEY DEFAULT 1,
    "commissionRate"      DECIMAL(5,4)  NOT NULL DEFAULT 0.1000,
    "autoPayoutEnabled"   BOOLEAN       NOT NULL DEFAULT false,
    "updatedAt"           TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedByAdminId"    TEXT
);

-- Seed the singleton row. ON CONFLICT keeps the migration idempotent for
-- environments where it might be re-run.
INSERT INTO "PlatformSettings" ("id", "commissionRate", "autoPayoutEnabled")
VALUES (1, 0.1000, false)
ON CONFLICT ("id") DO NOTHING;
