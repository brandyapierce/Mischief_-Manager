export function ZoneAssignmentPanel({ user, zones, assignmentMap = {}, onToggleAssign }) {
  return (
    <div className="assignment-panel">
      <h3>Assigned Work</h3>
      <div className="assignment-user-row">
        <strong>{user.name}</strong>
        <span>{user.role}</span>
      </div>

      <div className="assignment-zones">
        {zones.map((zone) => {
          const isAssigned = Boolean(assignmentMap[zone]);

          return (
            <div key={zone} className="assignment-zone-item">
              <span>{zone}</span>
              <button
                type="button"
                className={isAssigned ? 'mini-button assigned' : 'mini-button'}
                onClick={() => onToggleAssign?.(zone)}
              >
                {isAssigned ? 'Assigned' : 'Assign'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
