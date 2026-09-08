import { useState } from 'react';

export function PeoplePanel({ users = [], zones = [], assignmentMap = {}, zoneSessions = [], tasks = [], canManage = false, onToggleAssignment, onAddUser, onUpdateUser, onDeactivateUser }) {
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id);
  const [isAdding, setIsAdding] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [form, setForm] = useState({ name: '', role: 'employee', initials: '', phone: '' });
  const selectedUser = users.find((user) => user.id === selectedUserId) || users[0];
  const selectedSession = zoneSessions.find((session) => session.userId === selectedUser?.id && !session.endedAt);
  const assignedZones = Object.entries(assignmentMap[selectedUser?.id] || {})
    .filter(([, assigned]) => assigned)
    .map(([zone]) => zone);
  const latestTask = tasks.find((task) => task.completedBy === selectedUser?.id);

  const openAddForm = () => {
    setEditingUserId(null);
    setForm({ name: '', role: 'employee', initials: '', phone: '' });
    setIsAdding(true);
  };

  const openEditForm = () => {
    setForm({
      name: selectedUser.name,
      role: selectedUser.role.toLowerCase(),
      initials: selectedUser.initials || '',
      phone: selectedUser.phone || '',
    });
    setEditingUserId(selectedUser.id);
    setIsAdding(true);
  };

  const saveUser = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.initials.trim()) return;
    const user = {
      id: editingUserId || `user-${Date.now()}`,
      name: form.name.trim(),
      role: form.role,
      initials: form.initials.trim().toUpperCase(),
      phone: form.phone.trim(),
      status: selectedUser?.status === 'inactive' && editingUserId ? 'active' : 'active',
      zoneAccess: [],
      assignedZones: [],
    };
    if (editingUserId) onUpdateUser?.(user);
    else onAddUser?.(user);
    setSelectedUserId(user.id);
    setIsAdding(false);
  };

  return (
    <div className="people-panel">
      <div className="panel-header-row">
        <div>
          <h3>People & Coverage</h3>
          <p className="panel-subtext">Select a person to view their current work.</p>
        </div>
        {canManage && <button type="button" className="primary-button" onClick={openAddForm}>Add staff</button>}
      </div>

      <div className="people-list">
        {users.map((user) => {
          const userZones = Object.entries(assignmentMap[user.id] || {})
            .filter(([, assigned]) => assigned)
            .map(([zone]) => zone);
          const working = zoneSessions.some((session) => session.userId === user.id && !session.endedAt);

          return (
            <button
              key={user.id}
              type="button"
              className={`person-row person-row-button ${user.id === selectedUser?.id ? 'selected' : ''}`}
              onClick={() => setSelectedUserId(user.id)}
            >
              <span className="person-row-content">
                <strong>{user.name}</strong>
                <small>{user.role} · {userZones.length ? userZones.join(', ') : 'No assigned zones'}</small>
              </span>
              <span className={`coverage-pill ${working ? 'active' : 'empty'}`}>
                {working ? 'Working' : 'Available'}
              </span>
            </button>
          );
        })}
      </div>

      {selectedUser && (
        <section className="person-detail-panel">
          <h4>{selectedUser.name}</h4>
          <div className="person-detail-grid">
            <div><label>Role</label><strong>{selectedUser.role}</strong></div>
            <div><label>Current location</label><strong>{selectedSession?.zoneName || 'Not in a zone'}</strong></div>
            <div><label>Work status</label><strong>{selectedSession ? 'Working' : latestTask ? `Last completed: ${latestTask.title}` : 'No work recorded'}</strong></div>
            <div><label>Assigned zones</label><strong>{assignedZones.length ? assignedZones.join(', ') : 'No assigned zones'}</strong></div>
          </div>
          {canManage && (
            <div className="person-zone-controls">
              <label>Zone assignments</label>
              <div className="assignment-zones">
                {zones.map((zone) => {
                  const isAssigned = assignedZones.includes(zone);
                  return (
                    <button
                      key={zone}
                      type="button"
                      className={isAssigned ? 'mini-button assigned' : 'mini-button'}
                      onClick={() => onToggleAssignment?.(selectedUser.id, zone)}
                    >
                      {zone}: {isAssigned ? 'Assigned' : 'Assign'}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {selectedSession && <small>Started {new Date(selectedSession.startedAt).toLocaleString()}</small>}
          {canManage && (
            <div className="person-admin-actions">
              <button type="button" className="secondary-button" onClick={openEditForm}>Edit staff</button>
              {selectedUser.status !== 'inactive' && (
                <button type="button" className="reject-button" onClick={() => onDeactivateUser?.(selectedUser.id)}>
                  Deactivate staff
                </button>
              )}
            </div>
          )}
        </section>
      )}

      {isAdding && (
        <form className="person-edit-form" onSubmit={saveUser}>
          <h4>{editingUserId ? 'Edit staff member' : 'Add staff member'}</h4>
          <label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
          <label>Role<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}><option value="employee">Employee</option><option value="volunteer">Volunteer</option><option value="trainee">Trainee</option></select></label>
          <label>Initials<input value={form.initials} maxLength={3} onChange={(event) => setForm({ ...form, initials: event.target.value.toUpperCase() })} required /></label>
          <label>Phone<input type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
          <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setIsAdding(false)}>Cancel</button><button type="submit" className="primary-button">Save staff</button></div>
        </form>
      )}
    </div>
  );
}
