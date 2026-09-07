import { useEffect, useState } from 'react';
import { deriveZoneStatus } from '../utils/zoneStatus';
import { TaskRow } from './TaskRow';

export function ZoneDetailScreen({ zone, recentTasks = [], onZoneChange, onOpenTaskModal, onCloseZone }) {
  const [zoneData, setZoneData] = useState(zone);
  const [showSignoffModal, setShowSignoffModal] = useState(false);
  const [signoffInitials, setSignoffInitials] = useState(zone.signedBy || '');
  const [signoffNotes, setSignoffNotes] = useState(zone.signoffNotes || '');
  const workflowStatus = deriveZoneStatus(zoneData);
  const completionTotal = zoneData.cleaning.length + zoneData.feedingDrop.length;
  const completionDone = zoneData.cleaning.filter((task) => task.state === 'complete').length
    + zoneData.feedingDrop.filter((task) => task.state === 'complete').length;
  const completionPercent = completionTotal ? Math.round((completionDone / completionTotal) * 100) : 0;
  const zoneLifecycleState = zoneData.status === 'closed' ? 'Closed' : workflowStatus.cleaningStatus === 'complete' ? 'Ready for signoff' : 'Needs attention';
  const canCloseZone = workflowStatus.cleaningStatus === 'complete';

  useEffect(() => {
    setZoneData(zone);
    setSignoffInitials(zone.signedBy || '');
    setSignoffNotes(zone.signoffNotes || '');
  }, [zone]);

  useEffect(() => {
    setZoneData(zone);
  }, [zone]);

  const applyZoneUpdate = (updater) => {
    setZoneData((current) => {
      const nextZone = updater(current);
      onZoneChange?.(nextZone);
      return nextZone;
    });
  };

  const toggleTask = (taskId, workflow) => {
    applyZoneUpdate((current) => ({
      ...current,
      [workflow]: current[workflow].map((task) =>
        task.id === taskId
          ? { ...task, state: task.state === 'complete' ? 'incomplete' : 'complete' }
          : task
      ),
    }));
  };

  const updateInitials = (taskId, initials) => {
    applyZoneUpdate((current) => ({
      ...current,
      feedingDrop: current.feedingDrop.map((task) =>
        task.id === taskId ? { ...task, initials } : task
      ),
    }));
  };

  return (
    <div className="zone-detail-screen">
      <header className="zone-header">
        <h2>{zoneData.name}</h2>
        <div className="zone-badges">
          <span className="badge">{zoneLifecycleState}</span>
          <span className="badge">Signed in: {zoneData.signedInUsers.length}</span>
          <button type="button" className="secondary-button" onClick={() => onOpenTaskModal?.('cleaning')}>
            Log cleaning
          </button>
          <button type="button" className="primary-button" onClick={() => onOpenTaskModal?.('feeding_drop')}>
            Log drop
          </button>
          <button
            type="button"
            className={zoneData.status === 'closed' ? 'secondary-button' : 'primary-button'}
            onClick={() => {
              if (zoneData.status === 'closed' || canCloseZone) {
                setShowSignoffModal(true);
              }
            }}
            disabled={!(zoneData.status === 'closed' || canCloseZone)}
          >
            {zoneData.status === 'closed' ? 'Reopen zone' : 'Close zone'}
          </button>
        </div>
      </header>

      <div className="status-summary">
        <span className={`mini-status ${workflowStatus.cleaningStatus === 'complete' ? 'success' : 'warning'}`}>
          Cleaning: {workflowStatus.cleaningStatus} ({workflowStatus.cleaningProgress})
        </span>
        <span className={`mini-status ${workflowStatus.bowlDropStatus === 'complete' ? 'success' : 'pending'}`}>
          Bowl drop: {workflowStatus.bowlDropStatus} ({workflowStatus.bowlDropProgress})
        </span>
      </div>

      <section className="workflow-block summary-block">
        <h3>Workflow Summary</h3>
        <div className="detail-summary-grid">
          <div>
            <label>Cleaning checklist</label>
            <strong>{workflowStatus.cleaningProgress}</strong>
          </div>
          <div>
            <label>Bowl drop checklist</label>
            <strong>{workflowStatus.bowlDropProgress}</strong>
          </div>
          <div>
            <label>Completion rate</label>
            <strong>{completionPercent}%</strong>
          </div>
          <div>
            <label>Current focus</label>
            <strong>{workflowStatus.needsAttention ? 'Needs attention' : 'Ready to close'}</strong>
          </div>
        </div>
      </section>

      <section className="workflow-block">
        <h3>Cleaning</h3>
        {zoneData.cleaning.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            workflow="cleaning"
            onToggle={toggleTask}
          />
        ))}
      </section>

      <section className="workflow-block">
        <h3>Feeding Drop</h3>
        {zoneData.feedingDrop.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            workflow="feedingDrop"
            requiresInitials
            onToggle={toggleTask}
            onInitialsChange={updateInitials}
          />
        ))}
      </section>

      {recentTasks.length > 0 && (
        <section className="workflow-block">
          <h3>Recent zone activity</h3>
          {recentTasks.map((task) => (
            <div key={task.id} className="recent-task-item">
              <div>
                <strong>{task.title}</strong>
                <small>{task.notes || 'No notes added yet.'}</small>
              </div>
              <span className={`mini-status ${task.priority === 'urgent' ? 'pending' : 'success'}`}>
                {task.priority}
              </span>
            </div>
          ))}
        </section>
      )}

      {(zoneData.signedBy || zoneData.signoffNotes) && (
        <section className="workflow-block">
          <h3>Zone signoff</h3>
          <div className="recent-task-item">
            <div>
              <strong>{zoneData.signedBy || 'Manager'}</strong>
              <small>{zoneData.signoffNotes || 'Signed off without notes.'}</small>
            </div>
            <span className="mini-status success">
              {zoneData.status === 'closed' ? 'Closed' : 'Open'}
            </span>
          </div>
        </section>
      )}

      {showSignoffModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>{zoneData.status === 'closed' ? 'Reopen zone' : 'Close zone'}</h3>

            <label>
              Initials
              <input
                type="text"
                value={signoffInitials}
                maxLength={3}
                onChange={(event) => setSignoffInitials(event.target.value.toUpperCase())}
                placeholder="MT"
              />
            </label>

            <label>
              Notes
              <textarea
                value={signoffNotes}
                onChange={(event) => setSignoffNotes(event.target.value)}
                placeholder="Add signoff notes or closeout details"
              />
            </label>

            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => setShowSignoffModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  onCloseZone?.({ initials: signoffInitials || 'MT', notes: signoffNotes || 'Closed by manager.' });
                  setShowSignoffModal(false);
                }}
              >
                Save signoff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
