export function AnimalDetailPanel({ animal }) {
  return (
    <div className="animal-panel">
      <h3>{animal.name}</h3>
      <p>{animal.species}</p>

      <div className="animal-care-grid">
        <button className="care-button">Feed</button>
        <button className="care-button">Clean</button>
        <button className="care-button">Signs of Life</button>
        <button className="care-button">Secure</button>
        <button className="care-button">Dropping Bowls</button>
      </div>

      <div className="animal-status-list">
        <div><span>Feed</span><strong>{animal.care.feed}</strong></div>
        <div><span>Clean</span><strong>{animal.care.clean}</strong></div>
        <div><span>Health</span><strong>{animal.care.health}</strong></div>
        <div><span>Secure</span><strong>{animal.care.secure}</strong></div>
      </div>
    </div>
  );
}
