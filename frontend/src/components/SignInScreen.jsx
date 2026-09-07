export function SignInScreen() {
  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h2>Sign In</h2>

        <label>
          Phone Number
          <input type="tel" placeholder="(555) 000-0000" />
        </label>

        <label>
          Role
          <select defaultValue="employee">
            <option value="employee">Employee</option>
            <option value="volunteer">Volunteer</option>
            <option value="trainee">Trainee</option>
            <option value="manager">Manager</option>
            <option value="director">Director</option>
          </select>
        </label>

        <button className="primary-button">Continue</button>
      </div>
    </div>
  );
}
