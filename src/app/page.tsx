const lifecycle = [
  "Whitelisted enterprise onboarding",
  "Mock USDT deposit detection",
  "Confirmation handling",
  "Fixed FX quote and mint request",
  "Manual approval and ORMB mint",
  "Enterprise transfer and redemption",
];

export default function HomePage() {
  return (
    <main className="page">
      <section className="page-header">
        <div>
          <p className="eyebrow">Demo control plane</p>
          <h1>Whitelisted stablecoin issuance and settlement workflow</h1>
          <p className="lead">
            ORMB is a portfolio demo for testnet payment infrastructure. This shell reserves the surfaces for
            onboarding, deposit monitoring, mint approvals, transfers, redemptions, reconciliation, and audit logs.
          </p>
        </div>
        <span className="status-pill">Framework ready</span>
      </section>

      <section className="grid three" aria-label="Demo areas">
        <div className="card">
          <h2>Admin operations</h2>
          <p className="muted">Review companies, approve lifecycle requests, and inspect audit trails.</p>
        </div>
        <div className="card">
          <h2>Company workspace</h2>
          <p className="muted">Track deposits, ORMB status, transfers, and redemption requests.</p>
        </div>
        <div className="card">
          <h2>System health</h2>
          <p className="muted">Expose worker status, chain indexing assumptions, and reconciliation readiness.</p>
        </div>
      </section>

      <section className="section grid two">
        <div className="card">
          <h2>Planned lifecycle</h2>
          <ul className="list">
            {lifecycle.map((item) => (
              <li key={item}>
                <span>{item}</span>
                <span className="muted">Planned</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h2>Current implementation boundary</h2>
          <p className="muted">
            This branch adds only the Next.js application shell. Business data, contract calls, workers, and dashboards
            are intentionally deferred to focused roadmap branches.
          </p>
        </div>
      </section>
    </main>
  );
}
