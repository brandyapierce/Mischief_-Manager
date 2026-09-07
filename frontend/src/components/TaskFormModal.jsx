import { useState } from 'react';

export function TaskFormModal({ taskType, zoneName, onClose, onSave }) {
  const [notes, setNotes] = useState('');
  const [initials, setInitials] = useState('');

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3>{taskType === 'feeding_drop' ? `Dropping Bowls · ${zoneName}` : `Cleaning Task · ${zoneName}`}</h3>

        <label>
          Notes
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Add care notes or completion notes"
          />
        </label>

        {taskType === 'feeding_drop' && (
          <label>
            Initials
            <input
              type="text"
              value={initials}
              maxLength={3}
              onChange={(event) => setInitials(event.target.value.toUpperCase())}
              placeholder="AR"
            />
          </label>
        )}

        <div className="modal-actions">
          <button className="secondary-button" onClick={onClose}>Cancel</button>
          <button
            className="primary-button"
            onClick={() => onSave({ notes, initials })}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
