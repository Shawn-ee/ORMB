const flowSteps = [
  ["1", "Enterprise onboarding", "Admin reviews Harbor Components and confirms KYB and wallet whitelist status."],
  ["2", "Deposit instructions", "Company sees a mock deposit address and sends MockUSDT from a known source wallet."],
  ["3", "Deposit detection", "Worker core indexes the MockUSDT transfer and ignores unknown or duplicate events."],
  ["4", "Confirmations", "Confirmation worker tracks the testnet block threshold before mint eligibility."],
  ["5", "Risk checks", "Risk engine validates KYB, wallet ownership, whitelist state, duplicate status, and mint limits."],
  ["6", "Fixed FX quote", "Mint flow records a fixed demo FX quote and calculates ORMB with 6 decimals."],
  ["7", "Manual approval", "Admin dashboard shows pending mint requests for manual review."],
  ["8", "ORMB mint", "Approved requests submit through a testable gateway interface; no live gateway runs in CI."],
  ["9", "Enterprise transfer", "Company dashboard shows whitelisted counterparty transfer activity."],
  ["10", "Redemption request", "Company requests redemption from a whitelisted wallet."],
  ["11", "Burn verification", "Redemption worker verifies burn chain, source wallet, amount, and duplicate event key."],
  ["12", "Audit review", "Admin dashboard reviews risk events, reconciliation, and lifecycle audit activity."],
];

const artifacts = [
  ["Contracts", "ORMBToken and MockUSDT tests cover roles, whitelist transfers, pause, mint, and burn behavior."],
  ["Workers", "Deposit listener, confirmation worker, risk engine, mint flow, and redemption burn flow are unit-tested."],
  ["Dashboards", "Admin and company pages present static demo data without mutation handlers or real payment actions."],
  ["Safety", "Docs and app banner state testnet-only, mock-asset, no-real-funds boundaries."],
];

const checkpoints = [
  "No real USDT, RMB, customer funds, mainnet keys, or production credentials.",
  "No live contract gateway, payout rail, database mutation, or deployment is executed by the page.",
  "All displayed companies, wallets, amounts, and events are representative demo data.",
];

export default function DemoPage() {
  return (
    <main className="page demo-page">
      <section className="page-header">
        <div>
          <p className="eyebrow">Demo flow</p>
          <h1>End-to-end stablecoin operations walkthrough</h1>
          <p className="lead">
            Follow the ORMB testnet lifecycle from enterprise onboarding through mock deposit detection, mint approval,
            transfer activity, redemption burn verification, reconciliation, and audit review.
          </p>
        </div>
        <span className="status-pill">Static walkthrough</span>
      </section>

      <section className="flow-grid" aria-label="Demo lifecycle steps">
        {flowSteps.map(([number, title, detail]) => (
          <article className="flow-step" key={number}>
            <span className="flow-number">{number}</span>
            <div>
              <h2>{title}</h2>
              <p>{detail}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="section dashboard-grid">
        <div>
          <div className="section-heading">
            <h2>Implementation Map</h2>
            <span className="status-pill">Validated</span>
          </div>
          <table className="table dense-table">
            <thead>
              <tr>
                <th>Area</th>
                <th>Current coverage</th>
              </tr>
            </thead>
            <tbody>
              {artifacts.map(([area, coverage]) => (
                <tr key={area}>
                  <td>{area}</td>
                  <td>{coverage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <div className="section-heading">
            <h2>Safety Checkpoints</h2>
            <span className="status-pill neutral">Required</span>
          </div>
          <ul className="event-list">
            {checkpoints.map((checkpoint, index) => (
              <li key={checkpoint}>
                <span className="severity low">{index + 1}</span>
                <span>{checkpoint}</span>
                <span className="mono muted">demo</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
