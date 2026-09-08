import { useEffect, useState } from 'react';
import { deriveZoneStatus } from '../utils/zoneStatus';
import { TaskRow } from './TaskRow';

const garageCleaningSections = [
  { title: 'Enclosure A', matches: (task) => task.title.startsWith('Enclosure A') },
  { title: 'Enclosure B', matches: (task) => task.title.startsWith('Enclosure B') },
  { title: 'Fish tank', matches: (task) => task.title.startsWith('Fish tank') },
  { title: 'Abby the toucan', matches: (task) => task.title.startsWith('Abby the toucan') },
  { title: 'Parrot', matches: (task) => task.title.startsWith('Parrot') },
  { title: 'Monkeys', matches: (task) => task.title.startsWith('Monkeys') },
  { title: 'Small bird cage', matches: (task) => task.title.startsWith('Small bird cage') },
  { title: 'Whole garage', matches: (task) => task.title.startsWith('Entire garage') },
];

const backPorchCleaningSections = [
  { title: 'Chinchillas', matches: (task) => task.title.startsWith('Chinchillas') },
  { title: 'Sugar Gliders', matches: (task) => task.title.startsWith('Sugar Gliders') },
  { title: 'Isolation', matches: (task) => task.title.startsWith('Isolation') },
  { title: 'Back Deck Owls', matches: (task) => task.title.startsWith('Back Deck Owls') },
  { title: 'Back Porch', matches: (task) => task.title.startsWith('Back Porch') },
];

function getCleaningSections(zone) {
  if (zone.name !== 'Garage' && zone.name !== 'Back Porch') {
    return [{ title: 'Cleaning', tasks: zone.cleaning }];
  }

  const sectionDefinitions = zone.name === 'Garage' ? garageCleaningSections : backPorchCleaningSections;
  const assignedTaskIds = new Set();
  const sections = sectionDefinitions.map((section) => {
    const tasks = zone.cleaning.filter((task) => {
      const matches = section.matches(task);
      if (matches) assignedTaskIds.add(task.id);
      return matches;
    });
    return { title: section.title, tasks };
  }).filter((section) => section.tasks.length > 0);
  const otherTasks = zone.cleaning.filter((task) => !assignedTaskIds.has(task.id));

  return otherTasks.length > 0
    ? [...sections, { title: 'Other cleaning', tasks: otherTasks }]
    : sections;
}

export function ZoneDetailScreen({ zone, recentTasks = [], onZoneChange, onOpenTaskModal, onCloseZone, canManage = false, activeUser, activeSession, onStartWork, onEndWork }) {
  const [zoneData, setZoneData] = useState(zone);
  const [showSignoffModal, setShowSignoffModal] = useState(false);
  const [hasUnsavedCleaningChanges, setHasUnsavedCleaningChanges] = useState(false);
  const [cleaningInitials, setCleaningInitials] = useState('');
  const [signoffInitials, setSignoffInitials] = useState(zone.signedBy || '');
  const [signoffNotes, setSignoffNotes] = useState(zone.signoffNotes || '');
  const workflowStatus = deriveZoneStatus(zoneData);
  const completionTotal = zoneData.cleaning.length + zoneData.feedingDrop.length;
  const completionDone = zoneData.cleaning.filter((task) => task.state === 'complete').length
    + zoneData.feedingDrop.filter((task) => task.state === 'complete').length;
  const completionPercent = completionTotal ? Math.round((completionDone / completionTotal) * 100) : 0;
  const zoneLifecycleState = zoneData.status === 'closed' ? 'Closed' : workflowStatus.cleaningStatus === 'complete' ? 'Ready for signoff' : 'Needs attention';
  const canCloseZone = workflowStatus.cleaningStatus === 'complete' && !hasUnsavedCleaningChanges;
  const canEditTasks = zoneData.status !== 'closed';
  const cleaningSections = getCleaningSections(zoneData);

  useEffect(() => {
    setZoneData(zone);
    setSignoffInitials(zone.signedBy || '');
    setSignoffNotes(zone.signoffNotes || '');
    setHasUnsavedCleaningChanges(false);
  }, [zone]);

  useEffect(() => {
    setZoneData(zone);
  }, [zone]);

  const applyZoneUpdate = (updater) => {
    setZoneData((current) => {
      const nextZone = updater(current);
      onZoneChange?.({ ...nextZone, lastActivityAt: new Date().toISOString() });
      return nextZone;
    });
  };

  const applyCleaningDraftUpdate = (updater) => {
    setZoneData((current) => updater(current));
    setHasUnsavedCleaningChanges(true);
  };

  const saveCleaningChecklist = () => {
    if (!hasUnsavedCleaningChanges || !cleaningInitials.trim()) return;
    const savedAt = new Date().toISOString();
    onZoneChange?.({
      ...zoneData,
      cleaning: zoneData.cleaning.map((task) => task.state === 'complete' || task.state === 'na'
        ? { ...task, initials: cleaningInitials.trim().toUpperCase(), completedAt: task.completedAt || savedAt }
        : task),
      cleaningInitials: cleaningInitials.trim().toUpperCase(),
      lastActivityAt: savedAt,
    });
    setHasUnsavedCleaningChanges(false);
  };

  const reopenTask = (taskId, workflow) => {
    const update = (current) => ({
      ...current,
      [workflow]: current[workflow].map((task) =>
        task.id === taskId
          ? { ...task, state: task.state === 'complete' ? 'incomplete' : 'complete' }
          : task
      ),
    });

    if (workflow === 'cleaning') {
      applyCleaningDraftUpdate(update);
    } else {
      applyZoneUpdate(update);
    }
  };

  const completeTask = (taskId, workflow) => {
    const task = zoneData[workflow]?.find((item) => item.id === taskId);
    if (workflow === 'cleaning' && task?.taskType !== 'bird_seed_level') {
      applyCleaningDraftUpdate((current) => ({
        ...current,
        cleaning: current.cleaning.map((item) => item.id === taskId ? { ...item, state: 'complete' } : item),
      }));
      return;
    }

    onOpenTaskModal?.(workflow === 'feedingDrop' ? 'feeding_drop' : 'cleaning', taskId);
  };

  const markTaskNA = (taskId, workflow) => {
    onOpenTaskModal?.(workflow === 'feedingDrop' ? 'feeding_drop' : 'cleaning', taskId, 'na');
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
          {activeSession ? (
            <button type="button" className="secondary-button" onClick={onEndWork}>
              End work
            </button>
          ) : (
              <button type="button" className="primary-button" onClick={onStartWork} disabled={!canEditTasks}>
              Start work{activeUser ? ` in ${zoneData.name}` : ''}
            </button>
          )}
            <button type="button" className="secondary-button" disabled={!canEditTasks} onClick={() => onOpenTaskModal?.('cleaning')}>
            Log cleaning
          </button>
            <button type="button" className="primary-button" disabled={!canEditTasks} onClick={() => onOpenTaskModal?.('feeding_drop')}>
            Log drop
          </button>
          <button
            type="button"
            className={zoneData.status === 'closed' ? 'secondary-button' : 'primary-button'}
            onClick={() => {
              if (canManage && (zoneData.status === 'closed' || canCloseZone)) {
                setShowSignoffModal(true);
              }
            }}
            disabled={!canManage || !(zoneData.status === 'closed' || canCloseZone)}
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

      {activeSession && (
        <div className="active-session-banner">
          <strong>{activeUser?.name} is working in this zone</strong>
          <small>Started {new Date(activeSession.startedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</small>
        </div>
      )}

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
        <div className="workflow-section-header">
          <div>
            <h3>Cleaning</h3>
            {hasUnsavedCleaningChanges && <small>Changes are ready to save.</small>}
          </div>
          <button
            type="button"
            className="primary-button"
            disabled={!hasUnsavedCleaningChanges || !canEditTasks || !cleaningInitials.trim()}
            onClick={saveCleaningChecklist}
          >
            Save cleaning checklist
          </button>
        </div>
        <label className="checklist-initials-field">
          Checklist initials
          <input
            type="text"
            value={cleaningInitials}
            maxLength={3}
            placeholder={zoneData.cleaningInitials || 'AR'}
            onChange={(event) => setCleaningInitials(event.target.value.toUpperCase())}
            disabled={!canEditTasks}
          />
        </label>
        <div className="cleaning-sections">
          {cleaningSections.map((section) => (
            <section key={section.title} className="cleaning-subsection">
              <h4>{section.title}</h4>
              {section.tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  workflow="cleaning"
                  disabled={!canEditTasks}
                  onToggle={reopenTask}
                  onComplete={completeTask}
                  onMarkNA={markTaskNA}
                />
              ))}
            </section>
          ))}
        </div>
      </section>

      {zoneData.feedingDrop.length > 0 && (
        <section className="workflow-block">
          <h3>Feeding Drop</h3>
          {zoneData.feedingDrop.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              workflow="feedingDrop"
              requiresInitials
              disabled={!canEditTasks}
              onToggle={reopenTask}
              onComplete={completeTask}
              onMarkNA={markTaskNA}
              onInitialsChange={updateInitials}
            />
          ))}
        </section>
      )}

      {recentTasks.length > 0 && (
        <section className="workflow-block">
          <h3>Recent zone activity</h3>
          {recentTasks.map((task) => (
            <div key={task.id} className="recent-task-item">
              <div>
                <strong>{task.title}</strong>
                <small>
                  {task.displayNote
                    || (task.seedLevel ? `Seed level: ${task.seedLevel === 'out' ? 'Out' : task.seedLevel.charAt(0).toUpperCase() + task.seedLevel.slice(1)}` : null)
                    || task.notes
                    || 'No notes'}
                </small>
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
