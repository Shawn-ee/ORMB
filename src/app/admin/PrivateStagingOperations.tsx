"use client";

import { FormEvent, useState } from "react";

type ApiResult = {
  label: string;
  ok: boolean;
  status: number;
  body: unknown;
};

type SubmitConfig = {
  label: string;
  path: string;
  body: Record<string, unknown>;
};

const initialBurnTxHash = "0x0000000000000000000000000000000000000000000000000000000000000000";
const initialAddress = "0x0000000000000000000000000000000000000000";

export function PrivateStagingOperations() {
  const [manualDeposit, setManualDeposit] = useState({
    companyId: "demo-company-harbor",
    companyWalletId: "demo-wallet-harbor",
    manualReference: "owner-staging-deposit-001",
    amount: "100",
    fixedFxRate: "1",
    confirmedBy: "private-staging-admin",
  });
  const [mintApproval, setMintApproval] = useState({ mintRequestId: "", approvedBy: "private-staging-admin" });
  const [redemption, setRedemption] = useState({
    companyId: "demo-company-harbor",
    companyWalletId: "demo-wallet-harbor",
    amount: "25",
    requestedBy: "private-staging-admin",
  });
  const [redemptionApproval, setRedemptionApproval] = useState({ redemptionId: "", approvedBy: "private-staging-admin" });
  const [burnEvidence, setBurnEvidence] = useState({
    redemptionId: "",
    chainId: "84532",
    txHash: initialBurnTxHash,
    logIndex: "0",
    fromAddress: initialAddress,
    amount: "25",
  });
  const [payout, setPayout] = useState({ redemptionId: "" });
  const [result, setResult] = useState<ApiResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitMutation(event: FormEvent<HTMLFormElement>, config: SubmitConfig) {
    event.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch(config.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config.body),
      });
      const body = (await response.json()) as unknown;
      setResult({ label: config.label, ok: response.ok, status: response.status, body });
    } catch (error) {
      setResult({
        label: config.label,
        ok: false,
        status: 0,
        body: error instanceof Error ? error.message : "Unknown request failure",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function loadReadModel(label: string, path: string) {
    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch(path, { method: "GET", cache: "no-store" });
      const body = (await response.json()) as unknown;
      setResult({ label, ok: response.ok, status: response.status, body });
    } catch (error) {
      setResult({
        label,
        ok: false,
        status: 0,
        body: error instanceof Error ? error.message : "Unknown request failure",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="section private-staging-panel" aria-labelledby="private-staging-operations">
      <div className="section-heading">
        <div>
          <h2 id="private-staging-operations">Private Staging Operations</h2>
          <p className="muted">
            Owner-only controls for simulated deposits, database approvals, burn evidence checks, and reconciliation.
          </p>
        </div>
        <span className="status-pill warning">Base Sepolia staging only</span>
      </div>

      <div className="staging-warning">
        These controls do not deploy contracts, grant roles, submit mint transactions, execute burns, move real funds, or
        perform real payouts.
      </div>

      <div className="staging-actions">
        <form
          className="operation-card"
          onSubmit={(event) =>
            submitMutation(event, {
              label: "Manual deposit",
              path: "/api/admin/manual-deposits",
              body: manualDeposit,
            })
          }
        >
          <h3>Manual Simulated Deposit</h3>
          <label>
            <span>Company ID</span>
            <input value={manualDeposit.companyId} onChange={(event) => setManualDeposit({ ...manualDeposit, companyId: event.target.value })} />
          </label>
          <label>
            <span>Wallet ID</span>
            <input value={manualDeposit.companyWalletId} onChange={(event) => setManualDeposit({ ...manualDeposit, companyWalletId: event.target.value })} />
          </label>
          <label>
            <span>Manual reference</span>
            <input value={manualDeposit.manualReference} onChange={(event) => setManualDeposit({ ...manualDeposit, manualReference: event.target.value })} />
          </label>
          <div className="form-row">
            <label>
              <span>Amount</span>
              <input value={manualDeposit.amount} onChange={(event) => setManualDeposit({ ...manualDeposit, amount: event.target.value })} />
            </label>
            <label>
              <span>FX rate</span>
              <input value={manualDeposit.fixedFxRate} onChange={(event) => setManualDeposit({ ...manualDeposit, fixedFxRate: event.target.value })} />
            </label>
          </div>
          <label>
            <span>Confirmed by</span>
            <input value={manualDeposit.confirmedBy} onChange={(event) => setManualDeposit({ ...manualDeposit, confirmedBy: event.target.value })} />
          </label>
          <button type="submit" disabled={isSubmitting}>
            Record simulated deposit
          </button>
        </form>

        <form
          className="operation-card"
          onSubmit={(event) =>
            submitMutation(event, {
              label: "Mint approval",
              path: `/api/admin/mint-requests/${encodeURIComponent(mintApproval.mintRequestId)}/approve`,
              body: { approvedBy: mintApproval.approvedBy },
            })
          }
        >
          <h3>Mint Request Approval</h3>
          <label>
            <span>Mint request ID</span>
            <input value={mintApproval.mintRequestId} onChange={(event) => setMintApproval({ ...mintApproval, mintRequestId: event.target.value })} />
          </label>
          <label>
            <span>Approved by</span>
            <input value={mintApproval.approvedBy} onChange={(event) => setMintApproval({ ...mintApproval, approvedBy: event.target.value })} />
          </label>
          <button type="submit" disabled={isSubmitting || mintApproval.mintRequestId.trim() === ""}>
            Approve mint request
          </button>
        </form>

        <form
          className="operation-card"
          onSubmit={(event) =>
            submitMutation(event, {
              label: "Redemption request",
              path: "/api/admin/redemptions",
              body: redemption,
            })
          }
        >
          <h3>Redemption Request</h3>
          <label>
            <span>Company ID</span>
            <input value={redemption.companyId} onChange={(event) => setRedemption({ ...redemption, companyId: event.target.value })} />
          </label>
          <label>
            <span>Wallet ID</span>
            <input value={redemption.companyWalletId} onChange={(event) => setRedemption({ ...redemption, companyWalletId: event.target.value })} />
          </label>
          <label>
            <span>Amount</span>
            <input value={redemption.amount} onChange={(event) => setRedemption({ ...redemption, amount: event.target.value })} />
          </label>
          <label>
            <span>Requested by</span>
            <input value={redemption.requestedBy} onChange={(event) => setRedemption({ ...redemption, requestedBy: event.target.value })} />
          </label>
          <button type="submit" disabled={isSubmitting}>
            Create redemption
          </button>
        </form>

        <form
          className="operation-card"
          onSubmit={(event) =>
            submitMutation(event, {
              label: "Redemption approval",
              path: `/api/admin/redemptions/${encodeURIComponent(redemptionApproval.redemptionId)}/approve`,
              body: { approvedBy: redemptionApproval.approvedBy },
            })
          }
        >
          <h3>Redemption Approval</h3>
          <label>
            <span>Redemption ID</span>
            <input value={redemptionApproval.redemptionId} onChange={(event) => setRedemptionApproval({ ...redemptionApproval, redemptionId: event.target.value })} />
          </label>
          <label>
            <span>Approved by</span>
            <input value={redemptionApproval.approvedBy} onChange={(event) => setRedemptionApproval({ ...redemptionApproval, approvedBy: event.target.value })} />
          </label>
          <button type="submit" disabled={isSubmitting || redemptionApproval.redemptionId.trim() === ""}>
            Approve redemption
          </button>
        </form>

        <form
          className="operation-card wide"
          onSubmit={(event) =>
            submitMutation(event, {
              label: "Burn evidence",
              path: `/api/admin/redemptions/${encodeURIComponent(burnEvidence.redemptionId)}/burn-evidence`,
              body: {
                chainId: Number(burnEvidence.chainId),
                txHash: burnEvidence.txHash,
                logIndex: Number(burnEvidence.logIndex),
                fromAddress: burnEvidence.fromAddress,
                amount: burnEvidence.amount,
              },
            })
          }
        >
          <h3>Burn Evidence Verification</h3>
          <div className="form-row">
            <label>
              <span>Redemption ID</span>
              <input value={burnEvidence.redemptionId} onChange={(event) => setBurnEvidence({ ...burnEvidence, redemptionId: event.target.value })} />
            </label>
            <label>
              <span>Chain ID</span>
              <input inputMode="numeric" value={burnEvidence.chainId} onChange={(event) => setBurnEvidence({ ...burnEvidence, chainId: event.target.value })} />
            </label>
            <label>
              <span>Log index</span>
              <input inputMode="numeric" value={burnEvidence.logIndex} onChange={(event) => setBurnEvidence({ ...burnEvidence, logIndex: event.target.value })} />
            </label>
          </div>
          <label>
            <span>Transaction hash</span>
            <input className="mono" value={burnEvidence.txHash} onChange={(event) => setBurnEvidence({ ...burnEvidence, txHash: event.target.value })} />
          </label>
          <div className="form-row">
            <label>
              <span>From address</span>
              <input className="mono" value={burnEvidence.fromAddress} onChange={(event) => setBurnEvidence({ ...burnEvidence, fromAddress: event.target.value })} />
            </label>
            <label>
              <span>Amount</span>
              <input value={burnEvidence.amount} onChange={(event) => setBurnEvidence({ ...burnEvidence, amount: event.target.value })} />
            </label>
          </div>
          <button type="submit" disabled={isSubmitting || burnEvidence.redemptionId.trim() === ""}>
            Verify burn evidence
          </button>
        </form>

        <form
          className="operation-card"
          onSubmit={(event) =>
            submitMutation(event, {
              label: "Simulated payout",
              path: `/api/admin/redemptions/${encodeURIComponent(payout.redemptionId)}/payout-simulated`,
              body: {},
            })
          }
        >
          <h3>Simulated Payout Completion</h3>
          <label>
            <span>Redemption ID</span>
            <input value={payout.redemptionId} onChange={(event) => setPayout({ redemptionId: event.target.value })} />
          </label>
          <button type="submit" disabled={isSubmitting || payout.redemptionId.trim() === ""}>
            Mark payout simulated
          </button>
        </form>

        <div className="operation-card">
          <h3>Read Models</h3>
          <div className="button-stack">
            <button type="button" disabled={isSubmitting} onClick={() => loadReadModel("Reconciliation", "/api/admin/reconciliation")}>
              Load reconciliation
            </button>
            <button type="button" disabled={isSubmitting} onClick={() => loadReadModel("Audit logs", "/api/admin/audit-logs")}>
              Load audit logs
            </button>
          </div>
        </div>
      </div>

      {result === null ? null : (
        <div className={`api-result ${result.ok ? "success" : "failure"}`} aria-live="polite">
          <div>
            <strong>{result.label}</strong>
            <span>
              {result.ok ? "Request completed" : "Request blocked"} · HTTP {result.status}
            </span>
          </div>
          <pre>{safeStringify(result.body)}</pre>
        </div>
      )}
    </section>
  );
}

function safeStringify(value: unknown): string {
  return JSON.stringify(value, null, 2).replace(/(privateKey|password|secret|DATABASE_URL|RPC_URL)"?\s*:\s*"[^"]+"/gi, "$1: [redacted]");
}
