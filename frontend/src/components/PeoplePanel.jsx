export function PeoplePanel({ users }) {
  return (
    <div className="people-panel">
      <h3>People & Coverage</h3>
      {users.map((user) => (
        <div key={user.id} className="person-row">
          <div>
            <strong>{user.name}</strong>
            <p>{user.role}</p>
            <small>{user.assignedZones?.join(', ') || 'No assigned zones'}</small>
          </div>
          <div className="person-meta">
            <span className="person-badge">{user.initials}</span>
            <span className={`coverage-pill ${user.assignedZones?.length ? 'active' : 'empty'}`}>
              {user.assignedZones?.length ? 'On duty' : 'Unassigned'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
