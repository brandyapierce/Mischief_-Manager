import { useState } from 'react';

export function TaskFormModal({ taskType, zoneName, taskTitle, task, action = 'complete', onClose, onSave }) {
  const [notes, setNotes] = useState('');
  const [initials, setInitials] = useState('');
  const [seedLevel, setSeedLevel] = useState(task?.seedLevel || '');
  const [refillInstructions, setRefillInstructions] = useState(task?.refillInstructions || '');
  const [showRefillInstructions, setShowRefillInstructions] = useState(Boolean(task?.refillInstructions));
  const [naReason, setNAReason] = useState('');
  const isFeedingDrop = taskType === 'feeding_drop';
  const isBirdSeed = task?.taskType === 'bird_seed_level';
  const isNA = action === 'na';

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3>{isNA ? `Mark not applicable · ${zoneName}` : isFeedingDrop ? `Dropping Bowls · ${zoneName}` : `Cleaning Task · ${zoneName}`}</h3>
        {taskTitle && <p className="panel-subtext">Completing: {taskTitle}</p>}

        {isNA ? (
          <label>
            Reason <span className="required-label">(required)</span>
            <textarea
              value={naReason}
              onChange={(event) => setNAReason(event.target.value)}
              placeholder="Why does this task not apply today?"
              required
            />
          </label>
        ) : isBirdSeed && (
          <label>
            Current seed level
            <select value={seedLevel} onChange={(event) => setSeedLevel(event.target.value)} required>
              <option value="">Select a level</option>
              <option value="full">Full</option>
              <option value="half">Half</option>
              <option value="low">Low</option>
              <option value="out">Out</option>
            </select>
          </label>
        )}

        {isBirdSeed && (seedLevel === 'low' || seedLevel === 'out') && (
          <div className="refill-instructions" role="status">
            <strong>{seedLevel === 'out' ? 'Seed is out' : 'Low seed level'}</strong>
            <span>Go to {task.refillLocation}.</span>
            <button type="button" className="secondary-button" onClick={() => setShowRefillInstructions(true)}>
              Add mix instructions
            </button>
            {showRefillInstructions && (
              <label>
                Mix instructions
                <textarea
                  value={refillInstructions}
                  onChange={(event) => setRefillInstructions(event.target.value)}
                  placeholder="Write instructions for making the new bird seed mix"
                  required
                />
              </label>
            )}
          </div>
        )}

        {!isNA && <label>
          Notes <span className="optional-label">(optional)</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Add care notes or completion notes"
          />
        </label>}

        {!isNA && isFeedingDrop && (
          <label>
            Initials <span className="required-label">(required)</span>
            <input
              type="text"
              value={initials}
              maxLength={3}
              onChange={(event) => setInitials(event.target.value.toUpperCase())}
              placeholder="AR"
              required
            />
          </label>
        )}

        <div className="modal-actions">
          <button className="secondary-button" onClick={onClose}>Cancel</button>
          <button
            className="primary-button"
            onClick={() => {
              if (isNA && !naReason.trim()) {
                return;
              }

              if (!isNA && isFeedingDrop && !initials.trim()) {
                return;
              }

              if (!isNA && isBirdSeed && !seedLevel) {
                return;
              }

              if (isBirdSeed && (seedLevel === 'low' || seedLevel === 'out') && !refillInstructions.trim()) {
                return;
              }

              onSave({ notes, initials, seedLevel, naReason, refillInstructions });
            }}
            disabled={isNA ? !naReason.trim() : (isFeedingDrop && !initials.trim()) || (isBirdSeed && (!seedLevel || ((seedLevel === 'low' || seedLevel === 'out') && !refillInstructions.trim())))}
          >
            {isNA ? 'Mark N/A' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
