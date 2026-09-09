import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const roleNames = {
  employee: 'Alex Rivera',
  volunteer: 'Jamie Cole',
  trainee: 'Taylor Brooks',
  manager: 'Morgan Tate',
  director: 'Riley Morgan',
};

const roleIds = {
  employee: 'u1',
  volunteer: 'u2',
  trainee: 'demo-trainee',
  manager: 'u3',
  director: 'demo-director',
};

export function SignInScreen({ user, users = [], onSignIn, showQr = true }) {
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [role, setRole] = useState(user.role.toLowerCase());
  const [selectedUserId, setSelectedUserId] = useState(user.id);

  const handleSubmit = (event) => {
    event.preventDefault();
    const selectedUser = users.find((item) => item.id === selectedUserId);
    if (selectedUser) {
      onSignIn?.({ ...selectedUser, phoneNumber });
      return;
    }

    onSignIn?.({
      id: roleIds[role],
      name: roleNames[role],
      role: role.charAt(0).toUpperCase() + role.slice(1),
      phoneNumber,
    });
  };

  return (
    <form className="auth-screen" onSubmit={handleSubmit}>
      <div className="auth-card">
        <h2>Sign In</h2>

        <label>
          Staff member
          <select value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)}>
            {users.filter((item) => item.status !== 'inactive').map((item) => (
              <option key={item.id} value={item.id}>{item.name} · {item.role}</option>
            ))}
            <option value="demo-director">Riley Morgan · Director</option>
            <option value="demo-trainee">Taylor Brooks · Trainee</option>
          </select>
        </label>

        <label>
          Phone Number
          <input
            type="tel"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            placeholder="(555) 000-0000"
          />
        </label>

        <label>
          Role
          <select value={role} onChange={(event) => setRole(event.target.value)}>
            <option value="employee">Employee</option>
            <option value="volunteer">Volunteer</option>
            <option value="trainee">Trainee</option>
            <option value="manager">Manager</option>
            <option value="director">Director</option>
          </select>
        </label>

        <button type="submit" className="primary-button">Continue as {roleNames[role]}</button>

        {showQr && (
          <div className="staff-qr-panel">
            <QRCodeSVG value={`${window.location.origin}/signin`} size={144} includeMargin />
            <div>
              <strong>Staff sign-in QR</strong>
              <small>Scan this code from a phone to open staff sign-in.</small>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
