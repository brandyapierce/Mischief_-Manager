export function TasksPanel({ tasks, selectedZoneName, onOpenTaskModal }) {
  return (
    <div className="tasks-panel">
      <div className="panel-header-row">
        <h3>Tasks</h3>
        <button type="button" className="primary-button" onClick={() => onOpenTaskModal?.('feeding_drop')}>
          Log task
        </button>
      </div>

      <p className="panel-subtext">Current focus: {selectedZoneName}</p>

      {tasks.map((task) => (
        <div key={task.id} className="task-panel-row">
          <div>
            <span>{task.title}</span>
            {task.notes && <small>{task.notes}</small>}
          </div>
          <strong>{task.priority}</strong>
        </div>
      ))}
    </div>
  );
}
