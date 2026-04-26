-- Track whether a payout release was fired automatically (by PlatformSettings.autoPayoutEnabled
-- on arrival confirmation) or manually (by an admin clicking Release in /admin/payouts).
-- Set on the first attemptRelease() against a row; nullable so legacy/PENDING rows
-- without an attempt yet stay null.

CREATE TYPE "PayoutTrigger" AS ENUM ('AUTO', 'MANUAL');

ALTER TABLE "Payout" ADD COLUMN "releaseTrigger" "PayoutTrigger";
