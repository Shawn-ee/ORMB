-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "CompanyKybStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "WalletWhitelistStatus" AS ENUM ('PENDING', 'WHITELISTED', 'REJECTED', 'REMOVED');

-- CreateEnum
CREATE TYPE "DepositStatus" AS ENUM ('DETECTED', 'CONFIRMING', 'CONFIRMED', 'REJECTED', 'MINT_REQUESTED');

-- CreateEnum
CREATE TYPE "MintRequestStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'MINTING', 'MINTED', 'FAILED');

-- CreateEnum
CREATE TYPE "MintStatus" AS ENUM ('PENDING', 'SUBMITTED', 'CONFIRMED', 'FAILED');

-- CreateEnum
CREATE TYPE "RedemptionStatus" AS ENUM ('REQUESTED', 'BURN_PENDING', 'BURN_VERIFIED', 'PAYOUT_SIMULATED', 'COMPLETED', 'REJECTED', 'FAILED');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('IDLE', 'RUNNING', 'FAILED');

-- CreateEnum
CREATE TYPE "RiskSeverity" AS ENUM ('INFO', 'LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "RiskEventStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED');

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "kybStatus" "CompanyKybStatus" NOT NULL DEFAULT 'PENDING',
    "status" "CompanyStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyWallet" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "whitelistStatus" "WalletWhitelistStatus" NOT NULL DEFAULT 'PENDING',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deposit" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "companyWalletId" TEXT,
    "chainId" INTEGER NOT NULL,
    "txHash" TEXT NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "blockHash" TEXT,
    "fromAddress" TEXT NOT NULL,
    "toAddress" TEXT NOT NULL,
    "tokenAddress" TEXT NOT NULL,
    "amount" DECIMAL(38,6) NOT NULL,
    "confirmations" INTEGER NOT NULL DEFAULT 0,
    "status" "DepositStatus" NOT NULL DEFAULT 'DETECTED',
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deposit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FxQuote" (
    "id" TEXT NOT NULL,
    "depositId" TEXT NOT NULL,
    "fromAsset" TEXT NOT NULL DEFAULT 'USDT',
    "toAsset" TEXT NOT NULL DEFAULT 'ORMB',
    "rate" DECIMAL(18,8) NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'fixed-demo-rate',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FxQuote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MintRequest" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "companyWalletId" TEXT NOT NULL,
    "depositId" TEXT NOT NULL,
    "fxQuoteId" TEXT NOT NULL,
    "status" "MintRequestStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "usdtAmount" DECIMAL(38,6) NOT NULL,
    "ormbAmount" DECIMAL(38,6) NOT NULL,
    "requestedBy" TEXT NOT NULL DEFAULT 'system',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MintRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mint" (
    "id" TEXT NOT NULL,
    "mintRequestId" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "txHash" TEXT,
    "toAddress" TEXT NOT NULL,
    "amount" DECIMAL(38,6) NOT NULL,
    "status" "MintStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Redemption" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "companyWalletId" TEXT NOT NULL,
    "amount" DECIMAL(38,6) NOT NULL,
    "status" "RedemptionStatus" NOT NULL DEFAULT 'REQUESTED',
    "burnChainId" INTEGER,
    "burnTxHash" TEXT,
    "burnLogIndex" INTEGER,
    "requestedBy" TEXT NOT NULL DEFAULT 'company',
    "approvedBy" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "burnVerifiedAt" TIMESTAMP(3),
    "payoutSimulatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Redemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "actorType" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemJobState" (
    "name" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'IDLE',
    "latestBlockNumber" BIGINT,
    "cursor" JSONB,
    "lastRunAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemJobState_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "RiskEvent" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "severity" "RiskSeverity" NOT NULL DEFAULT 'INFO',
    "status" "RiskEventStatus" NOT NULL DEFAULT 'OPEN',
    "code" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiskEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_legalName_key" ON "Company"("legalName");

-- CreateIndex
CREATE INDEX "CompanyWallet_companyId_idx" ON "CompanyWallet"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyWallet_chainId_address_key" ON "CompanyWallet"("chainId", "address");

-- CreateIndex
CREATE INDEX "Deposit_companyId_idx" ON "Deposit"("companyId");

-- CreateIndex
CREATE INDEX "Deposit_status_idx" ON "Deposit"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Deposit_chainId_txHash_logIndex_key" ON "Deposit"("chainId", "txHash", "logIndex");

-- CreateIndex
CREATE UNIQUE INDEX "FxQuote_depositId_key" ON "FxQuote"("depositId");

-- CreateIndex
CREATE UNIQUE INDEX "MintRequest_depositId_key" ON "MintRequest"("depositId");

-- CreateIndex
CREATE UNIQUE INDEX "MintRequest_fxQuoteId_key" ON "MintRequest"("fxQuoteId");

-- CreateIndex
CREATE INDEX "MintRequest_companyId_idx" ON "MintRequest"("companyId");

-- CreateIndex
CREATE INDEX "MintRequest_status_idx" ON "MintRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Mint_mintRequestId_key" ON "Mint"("mintRequestId");

-- CreateIndex
CREATE INDEX "Mint_status_idx" ON "Mint"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Mint_chainId_txHash_key" ON "Mint"("chainId", "txHash");

-- CreateIndex
CREATE INDEX "Redemption_companyId_idx" ON "Redemption"("companyId");

-- CreateIndex
CREATE INDEX "Redemption_status_idx" ON "Redemption"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Redemption_burnChainId_burnTxHash_burnLogIndex_key" ON "Redemption"("burnChainId", "burnTxHash", "burnLogIndex");

-- CreateIndex
CREATE INDEX "AuditLog_companyId_idx" ON "AuditLog"("companyId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "RiskEvent_companyId_idx" ON "RiskEvent"("companyId");

-- CreateIndex
CREATE INDEX "RiskEvent_status_idx" ON "RiskEvent"("status");

-- CreateIndex
CREATE INDEX "RiskEvent_entityType_entityId_idx" ON "RiskEvent"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "CompanyWallet" ADD CONSTRAINT "CompanyWallet_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_companyWalletId_fkey" FOREIGN KEY ("companyWalletId") REFERENCES "CompanyWallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FxQuote" ADD CONSTRAINT "FxQuote_depositId_fkey" FOREIGN KEY ("depositId") REFERENCES "Deposit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MintRequest" ADD CONSTRAINT "MintRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MintRequest" ADD CONSTRAINT "MintRequest_companyWalletId_fkey" FOREIGN KEY ("companyWalletId") REFERENCES "CompanyWallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MintRequest" ADD CONSTRAINT "MintRequest_depositId_fkey" FOREIGN KEY ("depositId") REFERENCES "Deposit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MintRequest" ADD CONSTRAINT "MintRequest_fxQuoteId_fkey" FOREIGN KEY ("fxQuoteId") REFERENCES "FxQuote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mint" ADD CONSTRAINT "Mint_mintRequestId_fkey" FOREIGN KEY ("mintRequestId") REFERENCES "MintRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Redemption" ADD CONSTRAINT "Redemption_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Redemption" ADD CONSTRAINT "Redemption_companyWalletId_fkey" FOREIGN KEY ("companyWalletId") REFERENCES "CompanyWallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskEvent" ADD CONSTRAINT "RiskEvent_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
