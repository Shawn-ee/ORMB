-- Add manual simulated deposit fields for private staging.
-- These fields support owner-confirmed staging records only and do not represent real funds.
ALTER TABLE "Deposit"
ADD COLUMN "source" TEXT NOT NULL DEFAULT 'CHAIN',
ADD COLUMN "manualReference" TEXT,
ADD COLUMN "manualConfirmedBy" TEXT,
ADD COLUMN "manualConfirmedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Deposit_manualReference_key" ON "Deposit"("manualReference");
