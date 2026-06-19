import { config } from "dotenv";

import {
  formatLiveMintBurnDryRunReport,
  runLiveMintBurnDryRun,
} from "../src/lib/config/live-mint-burn-dry-run.js";

const envFile = readEnvFileArg(process.argv.slice(2));
config(envFile === undefined ? { quiet: true } : { path: envFile, quiet: true });

const report = runLiveMintBurnDryRun(process.env);
console.log(formatLiveMintBurnDryRunReport(report));

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
