export function ZoneAssignmentPanel({ user, users = [], zones, assignmentMap = {}, canManage = false, selectedUserId, onSelectUser, onToggleAssign }) {
  const staffUsers = users.filter((person) => !['manager', 'director'].includes(person.role.toLowerCase()));
  const selectedAssignments = assignmentMap[selectedUserId] ?? {};

  return (
    <div className="assignment-panel">
      <h3>Assigned Work</h3>
      <p className="panel-subtext">Everyone can see the current zone coverage.</p>

      <div className="assignment-roster">
        {staffUsers.map((person) => {
          const assignedZones = zones.filter((zone) => assignmentMap[person.id]?.[zone]);
          return (
            <div key={person.id} className="assignment-roster-row">
              <div>
                <strong>{person.name}</strong>
                <small>{person.role}</small>
              </div>
              <span>{assignedZones.length ? assignedZones.join(', ') : 'No zones assigned'}</span>
            </div>
          );
        })}
      </div>

      <div className="assignment-user-row">
        {canManage ? (
          <label>
            Staff member
            <select value={selectedUserId} onChange={(event) => onSelectUser?.(event.target.value)}>
              {staffUsers.map((person) => (
                <option key={person.id} value={person.id}>{person.name} · {person.role}</option>
              ))}
            </select>
          </label>
        ) : (
          <>
            <strong>{user.name}</strong>
            <span>{user.role}</span>
          </>
        )}
      </div>

      <div className="assignment-zones">
        {zones.map((zone) => {
          const isAssigned = Boolean(selectedAssignments[zone]);

          return (
            <div key={zone} className="assignment-zone-item">
              <span>{zone}</span>
              <button
                type="button"
                className={isAssigned ? 'mini-button assigned' : 'mini-button'}
                onClick={() => onToggleAssign?.(zone)}
                disabled={!canManage}
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
