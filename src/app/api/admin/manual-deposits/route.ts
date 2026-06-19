import { confirmManualDepositAndCreateMintRequest } from "../../../../../workers/manual-deposit-flow";
import { PrismaStagingRepository } from "../../../../lib/db/staging-repositories";
import {
  jsonError,
  jsonOk,
  optionalString,
  readJsonObject,
  requiredString,
  requirePrivateStagingApi,
} from "../../../../lib/api/private-staging-api";

export async function POST(request: Request) {
  try {
    requirePrivateStagingApi();
    const body = await readJsonObject(request);
    const { prisma } = await import("../../../../lib/db/prisma");
    const repository = new PrismaStagingRepository(prisma);
    const result = await confirmManualDepositAndCreateMintRequest({
      companyId: requiredString(body, "companyId"),
      companyWalletId: requiredString(body, "companyWalletId"),
      manualReference: requiredString(body, "manualReference"),
      amount: requiredString(body, "amount"),
      confirmedBy: optionalString(body, "confirmedBy") ?? "private-staging-admin",
      fixedFxRate: optionalString(body, "fixedFxRate") ?? "1",
      autoMintLimitUsdt: optionalString(body, "autoMintLimitUsdt"),
      dailyMintLimitUsdt: optionalString(body, "dailyMintLimitUsdt"),
      repository,
    });

    return jsonOk({ ok: true, result }, result.duplicate ? 200 : 201);
  } catch (error) {
    return jsonError(error);
  }
}
