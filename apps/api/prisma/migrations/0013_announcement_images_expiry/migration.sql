-- Announcement attachments + auto-expiry. imageKeys stores S3 object keys
-- (resolved to presigned URLs at read). expiresAt drives the auto-removal
-- behavior — public list filters and lazily deletes anything past it.

ALTER TABLE "Announcement"
  ADD COLUMN "imageKeys" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "expiresAt" TIMESTAMP(3);

CREATE INDEX "Announcement_expiresAt_idx" ON "Announcement"("expiresAt");
