const readinessMetrics = [
  { label: "CI status", value: "Passing", detail: "GitHub Actions validates test:ci" },
  { label: "Worker cores", value: "5", detail: "Unit-tested deterministic modules" },
  { label: "Open audit notes", value: "1", detail: "Dependency audit documented" },
  { label: "Live integrations", value: "0", detail: "No real keys or services configured" },
];

const subsystemRows = [
  ["Contracts", "Ready", "Hardhat tests cover mint, burn, whitelist, pause, and MockUSDT faucet behavior."],
  ["Prisma schema", "Ready", "Domain schema validates for demo lifecycle records and audit logs."],
  ["Deposit listener", "Core ready", "Processes supplied MockUSDT logs idempotently."],
  ["Confirmation worker", "Core ready", "Applies configured testnet confirmation threshold."],
  ["Risk engine", "Core ready", "Checks KYB, wallets, duplicate status, and mint limits."],
  ["Mint flow", "Core ready", "Creates pending requests and gates submission behind manual approval."],
  ["Redemption flow", "Core ready", "Verifies burn chain, source wallet, amount, and duplicate event key."],
  ["Dashboards", "Static demo", "Admin, company, and demo flow pages use representative static data."],
];

const controls = [
  ["Secrets", "No secrets committed; `.env.example` uses placeholders only."],
  ["Mainnet", "No mainnet deployment path is enabled for agent work."],
  ["Funds", "No real USDT, RMB, customer funds, payouts, or redemption value."],
  ["Actions", "Static pages do not execute lifecycle mutations or contract calls."],
  ["Audit", "Every branch writes an agent report with validation results."],
];

const watchItems = [
  ["Dependency audit", "Documented npm audit findings remain unresolved until a dependency-hardening branch."],
  ["Browser verification", "Playwright route and navigation checks are expected before demo release approval."],
  ["Live adapters", "Prisma adapters, RPC indexers, and contract gateways are deferred."],
];

export default function StatusPage() {
  return (
    <main className="page status-page">
      <section className="page-header">
        <div>
          <p className="eyebrow">System status</p>
          <h1>Monitoring and security readiness</h1>
          <p className="lead">
            Review static demo readiness for CI, worker cores, dashboards, security controls, known audit findings, and
            remaining integration boundaries.
          </p>
        </div>
        <span className="status-pill">Static status</span>
      </section>

      <section className="metric-strip" aria-label="Readiness metrics">
        {readinessMetrics.map((metric) => (
          <div className="metric-tile" key={metric.label}>
            <span className="metric-label">{metric.label}</span>
            <strong>{metric.value}</strong>
            <span>{metric.detail}</span>
          </div>
        ))}
      </section>

      <section className="section dashboard-grid">
        <div>
          <div className="section-heading">
            <h2>Subsystem Readiness</h2>
            <span className="status-pill">CI covered</span>
          </div>
          <table className="table dense-table">
            <thead>
              <tr>
                <th>Subsystem</th>
                <th>State</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {subsystemRows.map(([system, state, notes]) => (
                <tr key={system}>
                  <td>{system}</td>
                  <td>{state}</td>
                  <td>{notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <div className="section-heading">
            <h2>Security Controls</h2>
            <span className="status-pill neutral">Demo boundary</span>
          </div>
          <ul className="event-list">
            {controls.map(([control, detail]) => (
              <li key={control}>
                <span className="severity low">{control}</span>
                <span>{detail}</span>
                <span className="mono muted">active</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section dashboard-grid">
        <div>
          <div className="section-heading">
            <h2>Known Watch Items</h2>
            <span className="status-pill warning">Tracked</span>
          </div>
          <table className="table dense-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {watchItems.map(([item, status]) => (
                <tr key={item}>
                  <td>{item}</td>
                  <td>{status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <div className="section-heading">
            <h2>Release Gate</h2>
            <span className="status-pill neutral">Not ready</span>
          </div>
          <div className="instruction-panel">
            <span>Before `dev` can move to `main`, audit branches must review security assumptions and demo behavior.</span>
            <strong>Release approval required</strong>
            <span>No agent may merge `dev` into `main` before the release checklist passes.</span>
          </div>
        </div>
      </section>
    </main>
  );
}
