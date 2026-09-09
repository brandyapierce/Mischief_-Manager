export function SettingsPanel({ onReset }) {
  return (
    <div className="settings-panel">
      <div className="panel-header-row">
        <div>
          <h2>Settings</h2>
          <p className="panel-subtext">Demo workspace controls</p>
        </div>
      </div>

      <div className="settings-row">
        <div>
          <strong>Reset demo data</strong>
          <small>Restore sample zones, tasks, animals, and roles on this device.</small>
        </div>
        <button type="button" className="secondary-button" onClick={onReset}>
          Reset
        </button>
      </div>
    </div>
  );
}