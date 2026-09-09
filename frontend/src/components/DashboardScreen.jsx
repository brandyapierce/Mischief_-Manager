import { DashboardCard } from './DashboardCard';

export function DashboardScreen({ zones, selectedZoneId, onSelectZone }) {
  return (
    <div className="dashboard-screen">
      <header className="dashboard-header">
        <h2>Sanctuary Dashboard</h2>
      </header>

      <div className="dashboard-grid">
        {zones.map((zone) => (
          <DashboardCard
            key={zone.id}
            zone={zone}
            isSelected={zone.id === selectedZoneId}
            onSelect={onSelectZone}
          />
        ))}
      </div>
    </div>
  );
}
