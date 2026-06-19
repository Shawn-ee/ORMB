import { verifyRedemptionBurn } from "../../../../../../../workers/redemption-burn-flow";
import { validateBaseSepoliaBurnEvidence } from "../../../../../../lib/staging/base-sepolia-burn-gateway";
import {
  jsonError,
  jsonOk,
  readJsonObject,
  requiredAddress,
  requiredNumber,
  requiredString,
  requiredTxHash,
  requirePrivateStagingApi,
} from "../../../../../../lib/api/private-staging-api";
import { loadRedemptionWallet, PrismaStagingRepository } from "../../../../../../lib/db/staging-repositories";

type RouteContext = {
  params: Promise<{ redemptionId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    requirePrivateStagingApi();
    const body = await readJsonObject(request);
    const { redemptionId } = await context.params;
    const { prisma } = await import("../../../../../../lib/db/prisma");
    const repository = new PrismaStagingRepository(prisma);
    const redemption = await repository.getRedemption(redemptionId);

    if (redemption === null) {
      return jsonOk({ ok: false, error: "Redemption not found." }, 404);
    }

    const expectedWallet = await loadRedemptionWallet(prisma, redemption.companyWalletId);
    const burnEvent = validateBaseSepoliaBurnEvidence({
      burnEvent: {
        chainId: requiredNumber(body, "chainId"),
        txHash: requiredTxHash(body, "txHash"),
        logIndex: requiredNumber(body, "logIndex"),
        fromAddress: requiredAddress(body, "fromAddress"),
        amount: requiredString(body, "amount"),
      },
      expectedWallet,
      expectedAmount: redemption.amount,
    });
    const result = await verifyRedemptionBurn({
      redemptionId,
      burnEvent,
      expectedWallet,
      repository,
    });

    return jsonOk({ ok: true, result });
  } catch (error) {
    return jsonError(error);
  }
}
