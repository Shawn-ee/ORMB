const queues = [
  ["Companies", "Placeholder"],
  ["Wallet whitelist", "Placeholder"],
  ["Mint requests", "Placeholder"],
  ["Redemptions", "Placeholder"],
  ["Audit logs", "Placeholder"],
];

export default function AdminPage() {
  return (
    <main className="page">
      <section className="page-header">
        <div>
          <p className="eyebrow">Admin dashboard</p>
          <h1>Operational review workspace</h1>
          <p className="lead">
            Placeholder surface for enterprise onboarding, manual mint approvals, redemption review, reconciliation,
            and audit visibility.
          </p>
        </div>
        <span className="status-pill">No live actions</span>
      </section>

      <table className="table">
        <thead>
          <tr>
            <th>Queue</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {queues.map(([queue, status]) => (
            <tr key={queue}>
              <td>{queue}</td>
              <td>{status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
