import { approveRedemptionRequest } from "../../../../../../../workers/redemption-burn-flow";
import { jsonError, jsonOk, optionalString, readJsonObject, requirePrivateStagingApi } from "../../../../../../lib/api/private-staging-api";
import { PrismaStagingRepository } from "../../../../../../lib/db/staging-repositories";

type RouteContext = {
  params: Promise<{ redemptionId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    requirePrivateStagingApi();
    const body = await readJsonObject(request);
    const { prisma } = await import("../../../../../../lib/db/prisma");
    const { redemptionId } = await context.params;
    const redemption = await approveRedemptionRequest({
      redemptionId,
      approvedBy: optionalString(body, "approvedBy") ?? "private-staging-admin",
      repository: new PrismaStagingRepository(prisma),
    });

    return jsonOk({ ok: true, redemption });
  } catch (error) {
    return jsonError(error);
  }
}
