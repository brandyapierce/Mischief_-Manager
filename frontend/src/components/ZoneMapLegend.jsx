export function ZoneMapLegend() {
  return (
    <div className="map-legend">
      <div className="legend-item">
        <span className="legend-dot green" />
        <span>Complete</span>
      </div>
      <div className="legend-item">
        <span className="legend-dot yellow" />
        <span>In Progress</span>
      </div>
      <div className="legend-item">
        <span className="legend-dot red" />
        <span>Needs Attention</span>
      </div>
    </div>
  );
}
