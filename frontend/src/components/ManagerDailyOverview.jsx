import { deriveZoneStatus } from '../utils/zoneStatus';

export function ManagerDailyOverview({ zones }) {
  const stats = zones.reduce(
    (accumulator, zone) => {
      const status = deriveZoneStatus(zone);

      if (zone.status === 'closed') {
        accumulator.closed += 1;
      } else if (status.cleaningStatus === 'complete') {
        accumulator.ready += 1;
      } else {
        accumulator.open += 1;
      }

      if (zone.urgentTasks > 0 || status.needsAttention) {
        accumulator.watch += 1;
      }

      return accumulator;
    },
    { closed: 0, ready: 0, open: 0, watch: 0 }
  );

  const signoffEntries = zones
    .filter((zone) => zone.signedBy || zone.signoffNotes || zone.status === 'closed')
    .map((zone) => ({
      ...zone,
      statusSummary: deriveZoneStatus(zone),
    }));

  return (
    <div className="manager-overview-panel">
      <header className="dashboard-header">
        <h2>Daily Manager Overview</h2>
      </header>

      <div className="manager-summary-grid">
        <div className="manager-summary-card">
          <label>Closed</label>
          <strong>{stats.closed}</strong>
        </div>
        <div className="manager-summary-card">
          <label>Ready</label>
          <strong>{stats.ready}</strong>
        </div>
        <div className="manager-summary-card">
          <label>Open</label>
          <strong>{stats.open}</strong>
        </div>
        <div className="manager-summary-card">
          <label>Watch list</label>
          <strong>{stats.watch}</strong>
        </div>
      </div>

      <section className="workflow-block">
        <h3>Zone signouts</h3>
        {signoffEntries.length === 0 ? (
          <p>No signoff records yet.</p>
        ) : (
          signoffEntries.map((zone) => (
            <div key={zone.id} className="recent-task-item">
              <div>
                <strong>{zone.name}</strong>
                <small>
                  {zone.signedBy ? `Signed by ${zone.signedBy}` : 'No initials recorded'}
                  {zone.signoffNotes ? ` · ${zone.signoffNotes}` : ''}
                </small>
              </div>
              <span className={`mini-status ${zone.status === 'closed' ? 'success' : 'warning'}`}>
                {zone.status === 'closed' ? 'Closed' : zone.statusSummary.cleaningStatus}
              </span>
            </div>
          ))
        )}
      </section>

      <section className="workflow-block">
        <h3>Open issues</h3>
        {zones.filter((zone) => zone.urgentTasks > 0 || deriveZoneStatus(zone).needsAttention).length === 0 ? (
          <p>No immediate issues flagged.</p>
        ) : (
          zones
            .filter((zone) => zone.urgentTasks > 0 || deriveZoneStatus(zone).needsAttention)
            .map((zone) => (
              <div key={zone.id} className="recent-task-item">
                <div>
                  <strong>{zone.name}</strong>
                  <small>
                    {zone.urgentTasks > 0 ? `${zone.urgentTasks} urgent task(s)` : 'Needs attention'}
                  </small>
                </div>
                <span className="mini-status pending">Action</span>
              </div>
            ))
        )}
      </section>
    </div>
  );
}
