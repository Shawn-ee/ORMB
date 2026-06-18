const statusRows = [
  ["Contracts", "Tooling ready"],
  ["Prisma", "Tooling ready"],
  ["Deposit listener", "Not implemented"],
  ["Confirmation worker", "Not implemented"],
  ["Mint engine", "Not implemented"],
  ["Redemption worker", "Not implemented"],
];

export default function StatusPage() {
  return (
    <main className="page">
      <section className="page-header">
        <div>
          <p className="eyebrow">System status</p>
          <h1>Infrastructure readiness</h1>
          <p className="lead">
            Placeholder status page for the testnet demo. Future branches will connect worker health, indexed block
            height, pending deposits, and reconciliation metrics.
          </p>
        </div>
        <span className="status-pill">Pre-demo buildout</span>
      </section>

      <table className="table">
        <thead>
          <tr>
            <th>Subsystem</th>
            <th>Current state</th>
          </tr>
        </thead>
        <tbody>
          {statusRows.map(([system, state]) => (
            <tr key={system}>
              <td>{system}</td>
              <td>{state}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
