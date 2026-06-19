import { config } from "dotenv";

import {
  formatPrivateStagingPreflightReport,
  runPrivateStagingPreflight,
} from "../src/lib/config/private-staging-preflight.js";

const envFile = readEnvFileArg(process.argv.slice(2));
if (envFile !== undefined) {
  config({ path: envFile, quiet: true });
} else {
  config({ quiet: true });
}

const report = runPrivateStagingPreflight(process.env);
console.log(formatPrivateStagingPreflightReport(report));

if (!report.ok) {
  process.exitCode = 1;
}

function readEnvFileArg(argv: string[]): string | undefined {
  const index = argv.indexOf("--env-file");
  if (index === -1) {
    return undefined;
  }

  const value = argv[index + 1];
  if (value === undefined || value.startsWith("--")) {
    throw new Error("Expected --env-file <path>.");
  }

  return value;
}
