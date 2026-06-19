import { simulateRedemptionPayout } from "../../../../../../../workers/redemption-burn-flow";
import { jsonError, jsonOk, requirePrivateStagingApi } from "../../../../../../lib/api/private-staging-api";
import { PrismaStagingRepository } from "../../../../../../lib/db/staging-repositories";

type RouteContext = {
  params: Promise<{ redemptionId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    requirePrivateStagingApi();
    const { redemptionId } = await context.params;
    const { prisma } = await import("../../../../../../lib/db/prisma");
    const result = await simulateRedemptionPayout({
      redemptionId,
      repository: new PrismaStagingRepository(prisma),
    });

    return jsonOk({ ok: true, result });
  } catch (error) {
    return jsonError(error);
  }
}
