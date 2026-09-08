import { useState } from 'react';

export function ApprovalReviewPanel({ task, onApprove, onReject }) {
  const [reviewNotes, setReviewNotes] = useState('');

  if (!task) {
    return (
      <div className="approval-review-panel">
        <h3>Approval Review</h3>
        <p>No active review items.</p>
      </div>
    );
  }

  if (task.status !== 'pending') {
    return null;
  }


  return (
    <div className="approval-review-panel">
      <h3>Approval Review</h3>
      <div className="review-task-item">
        <div>
          <strong>{task.title}</strong>
          <p>{task.zone}</p>
        </div>
        <div className="approval-actions">
          <button className="approve-button" onClick={() => onApprove?.()}>
            Approve
          </button>
          <textarea
            className="approval-note-input"
            value={reviewNotes}
            onChange={(event) => setReviewNotes(event.target.value)}
            placeholder="Review note (required to reject)"
            rows="2"
          />
          <button className="reject-button" disabled={!reviewNotes.trim()} onClick={() => onReject?.(reviewNotes)}>
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
