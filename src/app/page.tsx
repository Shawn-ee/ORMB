const lifecycle = [
  ["Whitelisted enterprise onboarding", "Dashboarded"],
  ["Mock USDT deposit detection", "Worker core"],
  ["Confirmation handling", "Worker core"],
  ["Fixed FX quote and mint request", "Worker core"],
  ["Manual approval and ORMB mint", "Demo-gated"],
  ["Enterprise transfer and redemption", "Dashboarded"],
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
        <span className="status-pill">Demo surfaces ready</span>
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
            {lifecycle.map(([item, state]) => (
              <li key={item}>
                <span>{item}</span>
                <span className="muted">{state}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h2>Current implementation boundary</h2>
          <p className="muted">
            Current surfaces use deterministic demo data and testable worker cores. Live API wiring, production
            persistence adapters, and real payment actions remain out of scope.
          </p>
        </div>
      </section>
    </main>
  );
}
