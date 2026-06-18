import { prisma } from "../src/lib/db/prisma.js";

const BASE_SEPOLIA_CHAIN_ID = 84532;

const companies = [
  {
    legalName: "Demo ImportCo Ltd",
    displayName: "Demo ImportCo",
    wallet: {
      address: "0x1000000000000000000000000000000000000001",
      label: "Demo ImportCo Base Sepolia Wallet",
    },
  },
  {
    legalName: "Demo SupplierCo Ltd",
    displayName: "Demo SupplierCo",
    wallet: {
      address: "0x2000000000000000000000000000000000000002",
      label: "Demo SupplierCo Base Sepolia Wallet",
    },
  },
];

for (const company of companies) {
  const record = await prisma.company.upsert({
    where: { legalName: company.legalName },
    create: {
      legalName: company.legalName,
      displayName: company.displayName,
      kybStatus: "APPROVED",
      wallets: {
        create: {
          chainId: BASE_SEPOLIA_CHAIN_ID,
          address: company.wallet.address.toLowerCase(),
          label: company.wallet.label,
          whitelistStatus: "WHITELISTED",
        },
      },
      auditLogs: {
        create: {
          actorType: "system",
          action: "demo.company.seeded",
          entityType: "Company",
          entityId: "seed",
          metadata: {
            source: "scripts/seed-demo.ts",
          },
        },
      },
    },
    update: {
      displayName: company.displayName,
      kybStatus: "APPROVED",
      wallets: {
        upsert: {
          where: {
            chainId_address: {
              chainId: BASE_SEPOLIA_CHAIN_ID,
              address: company.wallet.address.toLowerCase(),
            },
          },
          create: {
            chainId: BASE_SEPOLIA_CHAIN_ID,
            address: company.wallet.address.toLowerCase(),
            label: company.wallet.label,
            whitelistStatus: "WHITELISTED",
          },
          update: {
            label: company.wallet.label,
            whitelistStatus: "WHITELISTED",
            isActive: true,
          },
        },
      },
    },
  });

  console.log(`Seeded ${record.displayName}`);
}

await prisma.systemJobState.upsert({
  where: { name: "mock-usdt-deposit-listener" },
  create: {
    name: "mock-usdt-deposit-listener",
    status: "IDLE",
  },
  update: {
    status: "IDLE",
  },
});

await prisma.$disconnect();
