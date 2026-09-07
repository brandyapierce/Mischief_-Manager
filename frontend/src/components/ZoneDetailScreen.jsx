import { useEffect, useState } from 'react';
import { deriveZoneStatus } from '../utils/zoneStatus';
import { TaskRow } from './TaskRow';

export function ZoneDetailScreen({ zone, onZoneChange, onOpenTaskModal }) {
  const [zoneData, setZoneData] = useState(zone);
  const workflowStatus = deriveZoneStatus(zoneData);

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
          <span className="badge">Signed in: {zoneData.signedInUsers.length}</span>
          <button type="button" className="secondary-button" onClick={() => onOpenTaskModal?.('cleaning')}>
            Log cleaning
          </button>
          <button type="button" className="primary-button" onClick={() => onOpenTaskModal?.('feeding_drop')}>
            Log drop
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
    </div>
  );
}
