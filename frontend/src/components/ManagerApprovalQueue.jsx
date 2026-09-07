export function ManagerApprovalQueue({ trainees, onApprove, onReject }) {
  return (
    <div className="queue-panel">
      <h3>Approval Queue</h3>
      {trainees.length === 0 ? (
        <p>No pending trainee approvals.</p>
      ) : (
        trainees.map((item) => (
          <div key={item.id} className="approval-item">
            <div>
              <strong>{item.name}</strong>
              <p>{item.zone}</p>
            </div>
            <div className="approval-actions">
              <button className="approve-button" onClick={() => onApprove?.(item.id)}>
                Approve
              </button>
              <button className="reject-button" onClick={() => onReject?.(item.id)}>
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
