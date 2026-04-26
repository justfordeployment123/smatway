-- BugReport: user-submitted bug reports & suggestions, shared by travelers and
-- transporters. Image attachments stored as S3 key arrays (resolved to
-- presigned URLs at read time). Single admin reply per report.

CREATE TYPE "BugReportKind" AS ENUM ('BUG', 'SUGGESTION');
CREATE TYPE "BugReportStatus" AS ENUM ('OPEN', 'REPLIED', 'CLOSED');

CREATE TABLE "BugReport" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "kind" "BugReportKind" NOT NULL,
  "subject" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "imageKeys" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "status" "BugReportStatus" NOT NULL DEFAULT 'OPEN',
  "adminReply" TEXT,
  "repliedAt" TIMESTAMP(3),
  "repliedByAdminId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "BugReport_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BugReport_userId_idx" ON "BugReport"("userId");
CREATE INDEX "BugReport_status_idx" ON "BugReport"("status");
CREATE INDEX "BugReport_createdAt_idx" ON "BugReport"("createdAt");

ALTER TABLE "BugReport"
  ADD CONSTRAINT "BugReport_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
