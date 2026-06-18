import { parseOrmbEnvironment, type EnvSource } from "../config/env";

export type PrivateStagingAuthResult =
  | { allowed: true; privateStaging: boolean }
  | { allowed: false; privateStaging: true; status: 401 | 503; reason: string };

export type HeaderReader = {
  get(name: string): string | null;
};

const BASIC_PREFIX = "Basic ";

export function authorizePrivateStagingRequest(headers: HeaderReader, env: EnvSource = process.env): PrivateStagingAuthResult {
  const config = parseOrmbEnvironment(env);

  if (config.mode !== "private-staging") {
    return { allowed: true, privateStaging: false };
  }

  if (config.stagingBasicAuthUsername === undefined || config.stagingBasicAuthPassword === undefined) {
    return {
      allowed: false,
      privateStaging: true,
      status: 503,
      reason: "Private staging Basic Auth is not configured.",
    };
  }

  const credentials = parseBasicAuth(headers.get("authorization"));
  if (credentials === undefined) {
    return { allowed: false, privateStaging: true, status: 401, reason: "Missing Basic Auth credentials." };
  }

  const usernameMatches = safeEqual(credentials.username, config.stagingBasicAuthUsername);
  const passwordMatches = safeEqual(credentials.password, config.stagingBasicAuthPassword);

  if (!usernameMatches || !passwordMatches) {
    return { allowed: false, privateStaging: true, status: 401, reason: "Invalid Basic Auth credentials." };
  }

  return { allowed: true, privateStaging: true };
}

function parseBasicAuth(value: string | null): { username: string; password: string } | undefined {
  if (value === null || !value.startsWith(BASIC_PREFIX)) {
    return undefined;
  }

  const decoded = decodeBase64(value.slice(BASIC_PREFIX.length));
  if (decoded === undefined) {
    return undefined;
  }

  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex < 0) {
    return undefined;
  }

  return {
    username: decoded.slice(0, separatorIndex),
    password: decoded.slice(separatorIndex + 1),
  };
}

function decodeBase64(value: string): string | undefined {
  try {
    if (typeof globalThis.atob === "function") {
      return globalThis.atob(value);
    }

    return Buffer.from(value, "base64").toString("utf8");
  } catch {
    return undefined;
  }
}

function safeEqual(left: string, right: string): boolean {
  let diff = left.length ^ right.length;
  const maxLength = Math.max(left.length, right.length);

  for (let index = 0; index < maxLength; index += 1) {
    diff |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }

  return diff === 0;
}
