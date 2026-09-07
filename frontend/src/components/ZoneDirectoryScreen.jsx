import { deriveZoneStatus } from '../utils/zoneStatus';

export function ZoneDirectoryScreen({ zones, selectedZoneId, onSelectZone }) {
  return (
    <div className="zone-directory-screen">
      <header className="dashboard-header">
        <h2>Zone Directory</h2>
      </header>

      <div className="zone-directory-grid">
        {zones.map((zone) => {
          const status = deriveZoneStatus(zone);
          const isSelected = zone.id === selectedZoneId;

          return (
            <article key={zone.id} className={`zone-directory-card ${isSelected ? 'selected' : ''}`}>
              <div className="dashboard-card-header">
                <h3>{zone.name}</h3>
                <span className={`status-pill status-${status.zoneColor}`}>
                  {status.zoneColor === 'green' ? 'Ready' : 'Open'}
                </span>
              </div>

              <div className="status-summary pair-summary">
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
                  <strong>{status.cleaningProgress}</strong>
                </div>
                <div>
                  <label>Bowls</label>
                  <strong>{status.bowlDropProgress}</strong>
                </div>
                <div>
                  <label>People</label>
                  <strong>{zone.signedInUsers.length}</strong>
                </div>
              </div>

              <div className="zone-directory-actions">
                <button type="button" className="primary-button" onClick={() => onSelectZone?.(zone.id)}>
                  Open zone
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
