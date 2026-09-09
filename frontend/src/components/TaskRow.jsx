export function TaskRow({ task, workflow, requiresInitials = false, disabled = false, onToggle, onComplete, onMarkNA, onInitialsChange }) {
  const isDone = task.state === 'complete';

  return (
    <div className="task-row">
      <div className="task-row-main">
        <input
          type="checkbox"
          checked={isDone}
          disabled={disabled}
          onChange={() => {
            if (isDone) {
              onToggle?.(task.id, workflow);
            } else {
              onComplete?.(task.id, workflow);
            }
          }}
        />
        <span>{task.title}{task.state === 'na' && <small className="task-exception">N/A: {task.naReason}</small>}</span>
      </div>

      {!isDone && task.state !== 'na' && (
        <button type="button" className="mini-button" disabled={disabled} onClick={() => onMarkNA?.(task.id, workflow)}>
          N/A
        </button>
      )}

      {task.taskType === 'bird_seed_level' && (
        <button
          type="button"
          className="secondary-button"
          disabled={disabled}
          onClick={() => onComplete?.(task.id, workflow)}
        >
          Update level
        </button>
      )}

      {requiresInitials && (
        <div className="initials-input">
          <input
            type="text"
            value={task.initials || ''}
            maxLength={3}
            placeholder="Init"
            disabled={disabled}
            onChange={(event) => onInitialsChange?.(task.id, event.target.value.toUpperCase())}
          />
        </div>
      )}
    </div>
  );
}
