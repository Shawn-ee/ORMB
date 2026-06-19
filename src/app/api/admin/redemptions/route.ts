import { createRedemptionRequest } from "../../../../../workers/redemption-burn-flow";
import {
  jsonError,
  jsonOk,
  optionalString,
  readJsonObject,
  requiredString,
  requirePrivateStagingApi,
} from "../../../../lib/api/private-staging-api";
import { loadRedemptionInputs, PrismaStagingRepository } from "../../../../lib/db/staging-repositories";

export async function POST(request: Request) {
  try {
    requirePrivateStagingApi();
    const body = await readJsonObject(request);
    const { prisma } = await import("../../../../lib/db/prisma");
    const companyId = requiredString(body, "companyId");
    const companyWalletId = requiredString(body, "companyWalletId");
    const { company, companyWallet } = await loadRedemptionInputs(prisma, companyId, companyWalletId);
    const result = await createRedemptionRequest({
      company,
      companyWallet,
      amount: requiredString(body, "amount"),
      requestedBy: optionalString(body, "requestedBy") ?? "private-staging-admin",
      repository: new PrismaStagingRepository(prisma),
    });

    return jsonOk({ ok: true, result }, result.created ? 201 : 200);
  } catch (error) {
    return jsonError(error);
  }
}
