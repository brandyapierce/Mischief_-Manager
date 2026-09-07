export function TaskRow({ task, workflow, requiresInitials = false, onToggle, onInitialsChange }) {
  const isDone = task.state === 'complete';

  return (
    <div className="task-row">
      <div className="task-row-main">
        <input
          type="checkbox"
          checked={isDone}
          onChange={() => onToggle?.(task.id, workflow)}
        />
        <span>{task.title}</span>
      </div>

      {requiresInitials && (
        <div className="initials-input">
          <input
            type="text"
            value={task.initials || ''}
            maxLength={3}
            placeholder="Init"
            onChange={(event) => onInitialsChange?.(task.id, event.target.value.toUpperCase())}
          />
        </div>
      )}
    </div>
  );
}
