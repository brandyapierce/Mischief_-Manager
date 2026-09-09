import { deriveZoneStatus } from '../utils/zoneStatus';

function downloadReport(rows) {
  const csv = rows.map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `mischief-manager-daily-report-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function ManagerDailyOverview({ zones, tasks = [], zoneSessions = [], approvals = [] }) {
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

  const activityRows = tasks.filter((task) => task.completedByName || task.completedBy).map((task) => [
    task.completedAt ? new Date(task.completedAt).toLocaleString() : '',
    task.zone || '',
    task.title || '',
    task.state || '',
    task.completedByName || task.completedBy || '',
    task.notes || task.displayNote || '',
  ]);

  const handleDownloadReport = () => downloadReport([
    ['Mischief Manager Daily Report', new Date().toLocaleDateString()],
    [],
    ['Zone', 'Cleaning', 'Bowl drop', 'Lifecycle', 'Signed in', 'Urgent tasks'],
    ...zones.map((zone) => {
      const status = deriveZoneStatus(zone);
      return [zone.name, status.cleaningStatus, status.bowlDropStatus, status.zoneStatus, status.signedInCount, zone.urgentTasks ?? 0];
    }),
    [],
    ['Completed at', 'Zone', 'Task', 'State', 'Completed by', 'Notes'],
    ...activityRows,
    [],
    ['Active session started', 'Zone', 'User'],
    ...zoneSessions.filter((session) => !session.endedAt).map((session) => [session.startedAt, session.zoneName, session.userName]),
    [],
    ['Approval', 'Zone', 'Submitted by', 'Status', 'Review notes'],
    ...approvals.map((approval) => [approval.title, approval.zone, approval.name, approval.status, approval.reviewNotes || '']),
  ]);

  return (
    <div className="manager-overview-panel">
      <header className="dashboard-header">
        <h2>Daily Manager Overview</h2>
        <button type="button" className="secondary-button" onClick={handleDownloadReport}>
          Download report
        </button>
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
        <h3>Recent work activity</h3>
        {activityRows.length === 0 ? (
          <p>No completed work recorded yet.</p>
        ) : (
          activityRows.slice(0, 8).map(([, zone, title, , completedBy, notes], index) => (
            <div key={`${zone}-${title}-${index}`} className="recent-task-item">
              <div>
                <strong>{title}</strong>
                <small>{zone} · {completedBy}{notes ? ` · ${notes}` : ''}</small>
              </div>
              <span className="mini-status success">Recorded</span>
            </div>
          ))
        )}
      </section>

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
