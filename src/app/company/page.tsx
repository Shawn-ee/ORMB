const companyMetrics = [
  { label: "Displayed ORMB", value: "4,503.60", detail: "Mock testnet balance after verified burn" },
  { label: "Confirmed deposits", value: "750.50", detail: "MockUSDT detected and confirmed" },
  { label: "Pending mint", value: "3,600.00", detail: "Awaiting admin approval" },
  { label: "Pending redemption", value: "900.00", detail: "Burn verification required" },
];

const participantStates = [
  {
    label: "Asset boundary",
    value: "Mock-only balances",
    detail: "Values are testnet demo records only; no real USDT, RMB, CNH, customer deposits, or obligations are shown.",
  },
  {
    label: "Movement boundary",
    value: "No self-service transfers",
    detail: "Participant users can inspect lifecycle state but cannot move funds, mint, burn, redeem, or approve requests here.",
  },
  {
    label: "Escalation path",
    value: "Operator review required",
    detail: "Unexpected wallet, deposit, risk, or redemption states pause the pilot and move to the admin operator queue.",
  },
];

const pilotGuidance = [
  {
    title: "Participant boundary",
    status: "Read-only demo",
    summary: "Harbor Components can review lifecycle state, but this page does not submit deposits or move funds.",
    checks: ["MockUSDT only", "No real RMB/CNH", "No customer obligations"],
  },
  {
    title: "Operator handoff",
    status: "Manual review",
    summary: "Mint approvals, risk exceptions, and redemption burn checks remain admin-reviewed demo events with no participant controls.",
    checks: ["Mint request pending", "Burn verification pending", "Risk review handled by operator"],
  },
  {
    title: "Support path",
    status: "Escalate safely",
    summary: "Unexpected wallet, deposit, or redemption states pause the demo and move to operator review.",
    checks: ["Unknown wallet blocks mint", "Duplicate burn skipped", "Incident runbook available"],
  },
];

const depositTimeline = [
  ["Detected", "MockUSDT transfer indexed", "09:37"],
  ["Confirmed", "12 testnet confirmations reached", "09:42"],
  ["Risk cleared", "Wallet and KYB checks passed", "09:42"],
  ["Mint request", "Fixed FX quote created", "09:43"],
];

const wallets = [
  ["Operating wallet", "0x1000...0001", "Whitelisted", "Active"],
  ["Treasury wallet", "0x4000...0004", "Whitelisted", "Active"],
];

const transfers = [
  {
    id: "TR-3001",
    counterparty: "Pioneer Imports",
    direction: "Sent",
    amount: "720.00 ORMB",
    status: "Recorded demo settlement",
  },
  {
    id: "TR-3002",
    counterparty: "Northstar Logistics",
    direction: "Received",
    amount: "360.00 ORMB",
    status: "Recorded demo settlement",
  },
];

const redemptions = [
  {
    id: "RD-2017",
    amount: "900.00 ORMB",
    wallet: "0x1000...0001",
    status: "Burn pending",
  },
  {
    id: "RD-2014",
    amount: "450.00 ORMB",
    wallet: "0x1000...0001",
    status: "Completed",
  },
];

const activity = [
  ["09:42", "Deposit confirmed", "deposit_811"],
  ["09:43", "Mint request created", "MR-1042"],
  ["09:48", "Redemption approved", "RD-2017"],
  ["09:51", "Duplicate burn skipped", "RD-2016"],
];

export default function CompanyPage() {
  return (
    <main className="page company-page">
      <section className="page-header">
        <div>
          <p className="eyebrow">Company dashboard</p>
          <h1>Harbor Components workspace</h1>
          <p className="lead">
            Track mock deposit confirmations, displayed ORMB balances, whitelisted wallets, recorded settlement events,
            redemption requests, and lifecycle activity for the ORMB testnet demo. This workspace is read-only.
          </p>
        </div>
        <span className="status-pill">Mock assets only</span>
      </section>

      <section className="metric-strip" aria-label="Company metrics">
        {companyMetrics.map((metric) => (
          <div className="metric-tile" key={metric.label}>
            <span className="metric-label">{metric.label}</span>
            <strong>{metric.value}</strong>
            <span>{metric.detail}</span>
          </div>
        ))}
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>Participant Readiness</h2>
          <span className="status-pill warning">No fund movement</span>
        </div>
        <div className="status-grid" aria-label="Company participant readiness">
          {participantStates.map((state) => (
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
          <h2>Pilot Participation</h2>
          <span className="status-pill neutral">No self-service actions</span>
        </div>
        <div className="review-grid">
          {pilotGuidance.map((item) => (
            <article className="review-card" key={item.title}>
              <div className="review-card-header">
                <h3>{item.title}</h3>
                <span className="status-pill">{item.status}</span>
              </div>
              <p>{item.summary}</p>
              <ul>
                {item.checks.map((check) => (
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
            <h2>Deposit Lifecycle</h2>
            <span className="status-pill">Confirmed</span>
          </div>
          <ol className="timeline-list">
            {depositTimeline.map(([stage, detail, time]) => (
              <li key={stage}>
                <span className="timeline-dot" aria-hidden="true" />
                <div>
                  <strong>{stage}</strong>
                  <span>{detail}</span>
                </div>
                <span className="mono muted">{time}</span>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <div className="section-heading">
            <h2>Deposit Instructions</h2>
            <span className="status-pill neutral">Mock address</span>
          </div>
          <div className="instruction-panel">
            <span>MockUSDT deposit address</span>
            <strong className="mono">0xA000...D011</strong>
            <span>
              Source wallet must be whitelisted before detection can create a mint request. Do not send real assets to
              demo addresses.
            </span>
          </div>
        </div>
      </section>

      <section className="section dashboard-grid">
        <div>
          <div className="section-heading">
            <h2>Whitelisted Wallets</h2>
            <span className="status-pill">2 active</span>
          </div>
          <table className="table dense-table">
            <thead>
              <tr>
                <th>Wallet</th>
                <th>Address</th>
                <th>Whitelist</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {wallets.map(([label, address, whitelist, status]) => (
                <tr key={address}>
                  <td>{label}</td>
                  <td className="mono">{address}</td>
                  <td>{whitelist}</td>
                  <td>{status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <div className="section-heading">
            <h2>Activity</h2>
            <span className="status-pill neutral">Latest</span>
          </div>
          <ul className="audit-list">
            {activity.map(([time, event, entity]) => (
              <li key={`${time}-${event}-${entity}`}>
                <span className="mono">{time}</span>
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
            <h2>Settlement Records</h2>
            <span className="status-pill neutral">Read-only history</span>
          </div>
          <table className="table dense-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Counterparty</th>
                <th>Direction</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((transfer) => (
                <tr key={transfer.id}>
                  <td className="mono">{transfer.id}</td>
                  <td>{transfer.counterparty}</td>
                  <td>{transfer.direction}</td>
                  <td>{transfer.amount}</td>
                  <td>{transfer.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <div className="section-heading">
            <h2>Redemptions</h2>
            <span className="status-pill warning">1 pending</span>
          </div>
          <table className="table dense-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Amount</th>
                <th>Wallet</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {redemptions.map((redemption) => (
                <tr key={redemption.id}>
                  <td className="mono">{redemption.id}</td>
                  <td>{redemption.amount}</td>
                  <td className="mono">{redemption.wallet}</td>
                  <td>{redemption.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
