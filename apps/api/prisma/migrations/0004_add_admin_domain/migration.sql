-- Admin domain — Admin, AdminAuditLog, AdminInviteToken, Announcement.
-- Separate from User: admins are platform operators, not travelers/transporters.

-- Enums
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MODERATOR');
CREATE TYPE "AnnouncementAudience" AS ENUM ('ALL', 'TRAVELERS_ONLY', 'TRANSPORTERS_ONLY');

-- Admin
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'ADMIN',
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");
CREATE INDEX "Admin_email_idx" ON "Admin"("email");
CREATE INDEX "Admin_role_idx" ON "Admin"("role");
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AdminAuditLog
CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT,
    "adminLabel" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AdminAuditLog_adminId_idx" ON "AdminAuditLog"("adminId");
CREATE INDEX "AdminAuditLog_action_idx" ON "AdminAuditLog"("action");
CREATE INDEX "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt");
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_adminId_fkey"
    FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AdminInviteToken
CREATE TABLE "AdminInviteToken" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminInviteToken_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AdminInviteToken_token_key" ON "AdminInviteToken"("token");
CREATE INDEX "AdminInviteToken_token_idx" ON "AdminInviteToken"("token");
CREATE INDEX "AdminInviteToken_adminId_idx" ON "AdminInviteToken"("adminId");
ALTER TABLE "AdminInviteToken" ADD CONSTRAINT "AdminInviteToken_adminId_fkey"
    FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Announcement
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "audience" "AnnouncementAudience" NOT NULL DEFAULT 'ALL',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdByAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Announcement_audience_idx" ON "Announcement"("audience");
CREATE INDEX "Announcement_isPublished_createdAt_idx" ON "Announcement"("isPublished", "createdAt");
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_createdByAdminId_fkey"
    FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
