import { deriveZoneStatus } from '../utils/zoneStatus';

export function ZoneMapView({ zones, selectedZoneId, onSelectZone }) {
  return (
    <div className="map-view">
      <h3>Sanctuary Map</h3>
      <div className="map-grid">
        {zones.map((zone) => {
          const status = deriveZoneStatus(zone);
          const isSelected = zone.id === selectedZoneId;

          return (
            <button
              key={zone.id}
              type="button"
              className={`map-zone ${status.zoneColor} ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectZone?.(zone.id)}
              title={`${zone.name}: ${status.statusLabel}; cleaning ${status.cleaningStatus}, bowl drop ${status.bowlDropStatus}`}
            >
              <span className="map-zone-label">{zone.name}</span>
              <span className="map-zone-status-pair">
                {status.cleaningStatus} / {status.bowlDropStatus}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
