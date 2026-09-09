import { useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const demoOnlyUsers = [
  { id: 'demo-director', name: 'Riley Morgan', role: 'Director' },
  { id: 'demo-trainee', name: 'Taylor Brooks', role: 'Trainee' },
];

export function SignInScreen({ user, users = [], onSignIn, showQr = true }) {
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [selectedUserId, setSelectedUserId] = useState(user.id);
  const selectableUsers = useMemo(
    () => [...users.filter((item) => item.status !== 'inactive'), ...demoOnlyUsers],
    [users]
  );
  const selectedUser = selectableUsers.find((item) => item.id === selectedUserId) ?? selectableUsers[0];

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!selectedUser) {
      return;
    }

    onSignIn?.({ ...selectedUser, phoneNumber });
  };

  return (
    <form className="auth-screen" onSubmit={handleSubmit}>
      <div className="auth-card">
        <h2>Sign In</h2>

        <label>
          Staff member
          <select value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)}>
            {selectableUsers.map((item) => (
              <option key={item.id} value={item.id}>{item.name} · {item.role}</option>
            ))}
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

        <button type="submit" className="primary-button">Continue as {selectedUser?.name}</button>

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
