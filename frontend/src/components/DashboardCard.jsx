import { deriveZoneStatus } from '../utils/zoneStatus';

export function DashboardCard({ zone, isSelected, onSelect }) {
  const status = deriveZoneStatus(zone);

  return (
    <button
      type="button"
      className={`dashboard-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(zone.id)}
    >
      <div className="dashboard-card-header">
        <h3>{zone.name}</h3>
        <span className={`status-pill status-${status.zoneColor}`}>{status.zoneColor}</span>
      </div>

      <div className="status-summary">
        <span className={`mini-status ${status.cleaningStatus === 'complete' ? 'success' : 'warning'}`}>
          Cleaning: {status.cleaningStatus}
        </span>
        <span className={`mini-status ${status.bowlDropStatus === 'complete' ? 'success' : 'pending'}`}>
          Bowl drop: {status.bowlDropStatus}
        </span>
      </div>

      <div className="dashboard-metrics">
        <div>
          <label>Cleaning</label>
          <strong>{status.cleaningStatus}</strong>
        </div>
        <div>
          <label>Feed Drop</label>
          <strong>{status.bowlDropStatus}</strong>
        </div>
        <div>
          <label>People</label>
          <strong>{zone.signedInUsers.length}</strong>
        </div>
      </div>

      {zone.urgentTasks > 0 && (
        <div className="urgent-banner">{zone.urgentTasks} urgent task(s)</div>
      )}
    </button>
  );
}
