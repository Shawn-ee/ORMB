import { approveMintRequest } from "../../../../../../../workers/mint-request-flow";
import { readJsonObject, jsonError, jsonOk, optionalString, requirePrivateStagingApi } from "../../../../../../lib/api/private-staging-api";
import { PrismaStagingRepository } from "../../../../../../lib/db/staging-repositories";

type RouteContext = {
  params: Promise<{ mintRequestId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    requirePrivateStagingApi();
    const body = await readJsonObject(request);
    const { prisma } = await import("../../../../../../lib/db/prisma");
    const { mintRequestId } = await context.params;
    const mintRequest = await approveMintRequest({
      mintRequestId,
      approvedBy: optionalString(body, "approvedBy") ?? "private-staging-admin",
      repository: new PrismaStagingRepository(prisma),
    });

    return jsonOk({ ok: true, mintRequest });
  } catch (error) {
    return jsonError(error);
  }
}
