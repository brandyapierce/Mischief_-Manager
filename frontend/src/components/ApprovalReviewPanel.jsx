export function ApprovalReviewPanel({ task, onApprove, onReject }) {
  if (!task) {
    return (
      <div className="approval-review-panel">
        <h3>Approval Review</h3>
        <p>No active review items.</p>
      </div>
    );
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
          <button className="reject-button" onClick={() => onReject?.()}>
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
