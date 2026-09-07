import { deriveZoneStatus } from '../utils/zoneStatus';

export function ZoneStatusCard({ zone }) {
  const status = deriveZoneStatus(zone);

  return (
    <div className="zone-card">
      <h3>{zone.name}</h3>
      <div className="zone-status-row">
        <span className={`status-pill status-${status.zoneColor}`}>
          {status.zoneColor}
        </span>
      </div>
      <p>Cleaning: {status.cleaningStatus}</p>
      <p>Feeding Drop: {status.bowlDropStatus}</p>
      <p>Signed in: {zone.signedInUsers.length}</p>
    </div>
  );
}
