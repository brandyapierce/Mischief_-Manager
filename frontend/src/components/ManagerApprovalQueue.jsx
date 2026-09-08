import { useState } from 'react';

export function ManagerApprovalQueue({ trainees, onApprove, onReject }) {
  const [reviewNotes, setReviewNotes] = useState({});
  const pendingItems = trainees.filter((item) => item.status === 'pending');

  return (
    <div className="queue-panel">
      <h3>Approval Queue</h3>
      {pendingItems.length === 0 ? (
        <p>No pending trainee approvals.</p>
      ) : (
        pendingItems.map((item) => (
          <div key={item.id} className="approval-item">
            <div>
              <strong>{item.title || 'Trainee task'}</strong>
              <p>{item.name} · {item.zone}</p>
              {item.notes && <small>{item.notes}</small>}
            </div>
            <div>
              <textarea
                className="approval-note-input"
                value={reviewNotes[item.id] || ''}
                onChange={(event) => setReviewNotes((current) => ({ ...current, [item.id]: event.target.value }))}
                placeholder="Review note (required to reject)"
                rows="2"
              />
              <div className="approval-actions">
                <button className="approve-button" onClick={() => onApprove?.(item.id, reviewNotes[item.id] || '')}>
                  Approve
                </button>
                <button
                  className="reject-button"
                  disabled={!reviewNotes[item.id]?.trim()}
                  onClick={() => onReject?.(item.id, reviewNotes[item.id])}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
