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
              title={`${zone.name}: cleaning ${status.cleaningStatus}, bowl drop ${status.bowlDropStatus}`}
            >
              <span>{zone.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
