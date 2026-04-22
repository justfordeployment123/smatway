-- AlterTable
ALTER TABLE "Transport" ADD COLUMN "maxReachDateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Transport_maxReachDateTime_idx" ON "Transport"("maxReachDateTime");
