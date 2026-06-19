import { PrivateStagingOperations } from "./PrivateStagingOperations";

const metrics = [
  { label: "Active companies", value: "3", detail: "2 approved, 1 pending KYB" },
  { label: "Mint approvals", value: "2", detail: "Manual review required" },
  { label: "Redemptions", value: "1", detail: "Burn verification pending" },
  { label: "Open risk events", value: "4", detail: "1 high severity" },
];

const operatorStates = [
  {
    label: "Operator queue",
    value: "Manual review active",
    detail: "Mint approvals, whitelist exceptions, and redemptions do not progress without admin review.",
  },
  {
    label: "Stop-state visibility",
    value: "Paused paths shown",
    detail: "Unknown wallets, high-severity risk events, duplicate burns, and unresolved reconciliation gaps stay blocked.",
  },
  {
    label: "Demo boundary",
    value: "Non-production",
    detail: "Read-only pilot surface using mock assets; no customer funds, mainnet activity, or live payment processing.",
  },
];

const reviewRails = [
  {
    title: "Risk case triage",
    status: "Operator review",
    summary: "Unknown wallets, high-severity failures, and limit exceptions remain blocked until reviewed.",
    checks: ["OPEN risk events: 4", "High severity: 1", "Mint progression: paused for unknown wallet"],
  },
  {
    title: "Ledger reconciliation",
    status: "Invariant pass",
    summary: "Confirmed mock deposits, mint requests, verified burns, and displayed supply reconcile for demo data.",
    checks: ["Duplicate mint requests: 0", "Duplicate burn events: skipped", "Unresolved exceptions: 0"],
  },
  {
    title: "Audit coverage",
    status: "Demo-only logs",
    summary: "Privileged lifecycle transitions require safe audit metadata with no secrets or real customer data.",
    checks: ["Manual approvals logged", "Risk failures logged", "Retention policy documented"],
  },
];

const onboardingQueue = [
  {
    company: "Harbor Components Ltd.",
    kyb: "Approved",
    wallet: "0x1000...0001",
    status: "Ready",
  },
  {
    company: "Northstar Logistics",
    kyb: "Pending",
    wallet: "0x2000...0002",
    status: "KYB review",
  },
  {
    company: "Pioneer Imports",
    kyb: "Approved",
    wallet: "0x3000...0003",
    status: "Wallet review",
  },
];

const mintQueue = [
  {
    id: "MR-1042",
    company: "Harbor Components Ltd.",
    deposit: "500.00 MockUSDT",
    fx: "7.20000000",
    amount: "3,600.00 ORMB",
    status: "Pending approval",
  },
  {
    id: "MR-1043",
    company: "Pioneer Imports",
    deposit: "250.50 MockUSDT",
    fx: "7.20000000",
    amount: "1,803.60 ORMB",
    status: "Risk cleared",
  },
];

const redemptionQueue = [
  {
    id: "RD-2017",
    company: "Harbor Components Ltd.",
    amount: "900.00 ORMB",
    wallet: "0x1000...0001",
    status: "Burn pending",
  },
  {
    id: "RD-2018",
    company: "Pioneer Imports",
    amount: "360.00 ORMB",
    wallet: "0x3000...0003",
    status: "Requested",
  },
];

const riskEvents = [
  ["High", "Unknown source wallet", "deposit_812"],
  ["Medium", "Daily mint limit near threshold", "company_1"],
  ["Medium", "Deposit not confirmed", "deposit_814"],
  ["Low", "Whitelist review pending", "wallet_3"],
];

const auditLog = [
  ["09:42", "risk.mint_eligibility.passed", "deposit_811"],
  ["09:43", "mint_request.created", "MR-1042"],
  ["09:48", "redemption.approved", "RD-2017"],
  ["09:51", "redemption.burn_duplicate_skipped", "RD-2016"],
];

const stagingReconciliation = [
  ["Manual deposits", "750.50 simulated USDT", "Owner-confirmed staging records only"],
  ["Minted ORMB", "5,403.60 ORMB", "Submitted testnet mints after approval"],
  ["Verified burns", "900.00 ORMB", "Base Sepolia burn evidence matched"],
  ["Expected supply", "4,503.60 ORMB", "Matches displayed on-chain supply"],
  ["Simulated reserve", "750.50 simulated USDT", "No real funds or payout claim"],
  ["Mismatch warnings", "0 open", "Stop operator confidence if nonzero"],
];

export default function AdminPage() {
  return (
    <main className="page admin-page">
      <section className="page-header">
        <div>
          <p className="eyebrow">Admin dashboard</p>
          <h1>Operations control panel</h1>
          <p className="lead">
            Review enterprise onboarding, wallet eligibility, mint approvals, redemption burn status, risk events,
            reconciliation, and audit activity for the ORMB testnet demo. This page is a read-only operator view.
          </p>
        </div>
        <span className="status-pill">Read-only demo data</span>
      </section>

      <section className="metric-strip" aria-label="Admin metrics">
        {metrics.map((metric) => (
          <div className="metric-tile" key={metric.label}>
            <span className="metric-label">{metric.label}</span>
            <strong>{metric.value}</strong>
            <span>{metric.detail}</span>
          </div>
        ))}
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>Operator Readiness</h2>
          <span className="status-pill warning">No live controls</span>
        </div>
        <div className="status-grid" aria-label="Admin operator readiness">
          {operatorStates.map((state) => (
            <article className="status-card" key={state.label}>
              <span className="metric-label">{state.label}</span>
              <strong>{state.value}</strong>
              <p>{state.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>Enterprise Review Rails</h2>
          <span className="status-pill neutral">Read-only controls</span>
        </div>
        <div className="review-grid">
          {reviewRails.map((rail) => (
            <article className="review-card" key={rail.title}>
              <div className="review-card-header">
                <h3>{rail.title}</h3>
                <span className="status-pill">{rail.status}</span>
              </div>
              <p>{rail.summary}</p>
              <ul>
                {rail.checks.map((check) => (
                  <li key={check}>{check}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section dashboard-grid">
        <div>
          <div className="section-heading">
            <h2>Onboarding</h2>
            <span className="status-pill neutral">KYB and wallets</span>
          </div>
          <table className="table dense-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>KYB</th>
                <th>Wallet</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {onboardingQueue.map((item) => (
                <tr key={item.company}>
                  <td>{item.company}</td>
                  <td>{item.kyb}</td>
                  <td className="mono">{item.wallet}</td>
                  <td>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <div className="section-heading">
            <h2>Risk Events</h2>
            <span className="status-pill warning">1 high</span>
          </div>
          <ul className="event-list">
            {riskEvents.map(([severity, event, entity]) => (
              <li key={`${event}-${entity}`}>
                <span className={`severity ${severity.toLowerCase()}`}>{severity}</span>
                <span>{event}</span>
                <span className="mono muted">{entity}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section dashboard-grid">
        <div>
          <div className="section-heading">
            <h2>Mint Approvals</h2>
            <span className="status-pill">Manual gate only</span>
          </div>
          <table className="table dense-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Company</th>
                <th>Deposit</th>
                <th>FX</th>
                <th>ORMB</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {mintQueue.map((item) => (
                <tr key={item.id}>
                  <td className="mono">{item.id}</td>
                  <td>{item.company}</td>
                  <td>{item.deposit}</td>
                  <td>{item.fx}</td>
                  <td>{item.amount}</td>
                  <td>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <div className="section-heading">
            <h2>Redemptions</h2>
            <span className="status-pill warning">Burn stop-state</span>
          </div>
          <table className="table dense-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Company</th>
                <th>Amount</th>
                <th>Wallet</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {redemptionQueue.map((item) => (
                <tr key={item.id}>
                  <td className="mono">{item.id}</td>
                  <td>{item.company}</td>
                  <td>{item.amount}</td>
                  <td className="mono">{item.wallet}</td>
                  <td>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section dashboard-grid">
        <div>
          <div className="section-heading">
            <h2>Reconciliation</h2>
            <span className="status-pill">Demo balanced</span>
          </div>
          <div className="reconciliation">
            <div>
              <span>Confirmed deposits</span>
              <strong>750.50 MockUSDT</strong>
            </div>
            <div>
              <span>Mint requests</span>
              <strong>5,403.60 ORMB</strong>
            </div>
            <div>
              <span>Verified burns</span>
              <strong>900.00 ORMB</strong>
            </div>
            <div>
              <span>Exceptions</span>
              <strong>0 unresolved</strong>
            </div>
          </div>
        </div>

        <div>
          <div className="section-heading">
            <h2>Audit Log</h2>
            <span className="status-pill neutral">Latest events</span>
          </div>
          <ul className="audit-list">
            {auditLog.map(([time, action, entity]) => (
              <li key={`${time}-${action}-${entity}`}>
                <span className="mono">{time}</span>
                <span>{action}</span>
                <span className="mono muted">{entity}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>Private Staging Reconciliation</h2>
          <span className="status-pill neutral">Simulated reserve only</span>
        </div>
        <div className="reconciliation" aria-label="Private staging reconciliation">
          {stagingReconciliation.map(([label, value, detail]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              <span>{detail}</span>
            </div>
          ))}
        </div>
      </section>

      <PrivateStagingOperations />
    </main>
  );
}
