import { jsonError, jsonOk, requirePrivateStagingApi } from "../../../../lib/api/private-staging-api";

export async function GET() {
  try {
    requirePrivateStagingApi();
    const { prisma } = await import("../../../../lib/db/prisma");
    const auditLogs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return jsonOk({ ok: true, auditLogs });
  } catch (error) {
    return jsonError(error);
  }
}
