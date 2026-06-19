import { NextResponse } from "next/server";

import { parseOrmbEnvironment } from "../config/env";

export function requirePrivateStagingApi() {
  const config = parseOrmbEnvironment(process.env);
  if (config.mode !== "private-staging") {
    throw new ApiError(403, "Private staging API is disabled unless ORMB_ENV_MODE=private-staging.");
  }

  if (config.readOnlyDemoMode) {
    throw new ApiError(403, "Private staging API is disabled in read-only demo mode.");
  }
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export function jsonOk(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export function jsonError(error: unknown) {
  if (error instanceof ApiError) {
    return jsonOk({ ok: false, error: error.message }, error.status);
  }

  return jsonOk({ ok: false, error: error instanceof Error ? error.message : "Unknown private staging API error." }, 500);
}

export async function readJsonObject(request: Request): Promise<Record<string, unknown>> {
  const body = (await request.json()) as unknown;
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    throw new ApiError(400, "Request body must be a JSON object.");
  }

  return body as Record<string, unknown>;
}

export function requiredString(body: Record<string, unknown>, name: string): string {
  const value = body[name];
  if (typeof value !== "string" || value.trim() === "") {
    throw new ApiError(400, `${name} is required.`);
  }

  return value.trim();
}

export function optionalString(body: Record<string, unknown>, name: string): string | undefined {
  const value = body[name];
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string" || value.trim() === "") {
    throw new ApiError(400, `${name} must be a non-empty string when provided.`);
  }

  return value.trim();
}

export function requiredNumber(body: Record<string, unknown>, name: string): number {
  const value = body[name];
  if (typeof value !== "number" || !Number.isSafeInteger(value)) {
    throw new ApiError(400, `${name} must be a safe integer.`);
  }

  return value;
}

export function requiredAddress(body: Record<string, unknown>, name: string): `0x${string}` {
  const value = requiredString(body, name);
  if (!/^0x[0-9a-fA-F]{40}$/.test(value)) {
    throw new ApiError(400, `${name} must be a 20-byte 0x address.`);
  }

  return value.toLowerCase() as `0x${string}`;
}

export function requiredTxHash(body: Record<string, unknown>, name: string): `0x${string}` {
  const value = requiredString(body, name);
  if (!/^0x[0-9a-fA-F]{64}$/.test(value)) {
    throw new ApiError(400, `${name} must be a 32-byte 0x hash.`);
  }

  return value.toLowerCase() as `0x${string}`;
}
