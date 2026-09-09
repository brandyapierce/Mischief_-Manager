export function EmployeeLocationPanel({ users }) {
  return (
    <div className="employee-panel">
      <h3>People Locations</h3>
      {users.map((user) => (
        <div key={user.id} className="employee-row">
          <div>
            <strong>{user.name}</strong>
            <p>{user.role}</p>
          </div>
          <span>{user.zoneAccess[0]}</span>
        </div>
      ))}
    </div>
  );
}
