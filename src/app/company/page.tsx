const companyItems = [
  ["Deposit instructions", "Pending implementation"],
  ["Wallet status", "Pending implementation"],
  ["ORMB balance", "Pending implementation"],
  ["Transfer history", "Pending implementation"],
  ["Redemption requests", "Pending implementation"],
];

export default function CompanyPage() {
  return (
    <main className="page">
      <section className="page-header">
        <div>
          <p className="eyebrow">Company dashboard</p>
          <h1>Enterprise settlement workspace</h1>
          <p className="lead">
            Placeholder surface for a whitelisted enterprise to inspect mock deposits, ORMB activity, transfer status,
            and simulated redemption requests.
          </p>
        </div>
        <span className="status-pill">Mock assets only</span>
      </section>

      <section className="grid two">
        {companyItems.map(([title, status]) => (
          <div className="card" key={title}>
            <h2>{title}</h2>
            <p className="muted">{status}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
