import { useState } from 'react';

const careGroups = [
  { id: 'health', label: 'Signs of Life / Health' },
  { id: 'feed', label: 'Feed' },
  { id: 'clean', label: 'Clean' },
  { id: 'secure', label: 'Secure' },
];

export function AnimalDetailPanel({ animals = [], animal, activeUser, onAnimalChange }) {
  const availableAnimals = animals.length ? animals : [animal];
  const [selectedAnimalId, setSelectedAnimalId] = useState(availableAnimals[0]?.id);
  const [naTaskId, setNATaskId] = useState(null);
  const [naReason, setNAReason] = useState('');
  const selectedAnimal = availableAnimals.find((item) => item.id === selectedAnimalId) || availableAnimals[0];
  const tasks = selectedAnimal?.careTasks || [];
  const orderedTasks = [...tasks].sort((left, right) => (
    Number(right.group === 'health') - Number(left.group === 'health')
  ));

  const selectAnimal = (animalId) => {
    const nextAnimal = availableAnimals.find((item) => item.id === animalId);
    setSelectedAnimalId(animalId);
  };

  const toggleTask = (taskId) => {
    const completedAt = new Date().toISOString();
    const nextTasks = tasks.map((task) => task.id === taskId
      ? {
          ...task,
          state: task.state === 'complete' ? 'incomplete' : 'complete',
          updatedBy: activeUser?.id,
          updatedByName: activeUser?.name,
          updatedAt: completedAt,
        }
      : task
    );
    const nextCare = { ...selectedAnimal.care };
    careGroups.forEach((group) => {
      const groupTasks = nextTasks.filter((task) => task.group === group.id);
      if (groupTasks.length) {
        nextCare[group.id === 'health' ? 'health' : group.id] = groupTasks.every((task) => task.state === 'complete') ? 'complete' : 'incomplete';
      }
    });
    onAnimalChange?.(
      { ...selectedAnimal, care: nextCare, careTasks: nextTasks, lastUpdatedAt: completedAt },
      nextTasks.find((task) => task.id === taskId),
    );
  };

  const markTaskNA = (taskId) => {
    if (!naReason.trim()) return;
    const updatedAt = new Date().toISOString();
    const nextTasks = tasks.map((task) => task.id === taskId
      ? { ...task, state: 'na', naReason, updatedBy: activeUser?.id, updatedByName: activeUser?.name, updatedAt }
      : task
    );
    const nextCare = { ...selectedAnimal.care };
    careGroups.forEach((group) => {
      const groupTasks = nextTasks.filter((task) => task.group === group.id);
      if (groupTasks.length) {
        nextCare[group.id] = groupTasks.every((task) => task.state === 'complete' || task.state === 'na') ? 'complete' : 'incomplete';
      }
    });
    onAnimalChange?.({ ...selectedAnimal, care: nextCare, careTasks: nextTasks, lastUpdatedAt: updatedAt }, nextTasks.find((task) => task.id === taskId));
    setNATaskId(null);
    setNAReason('');
  };

  if (!selectedAnimal) {
    return <div className="animal-panel"><p>No animals available.</p></div>;
  }

  return (
    <div className="animal-panel">
      <div className="panel-header-row">
        <div>
          <h2>Animal Care</h2>
          <p className="panel-subtext">All property animal care profiles</p>
        </div>
        <span className={`status-pill status-${selectedAnimal.priority === 'urgent' ? 'red' : 'yellow'}`}>
          {selectedAnimal.priority === 'urgent' ? 'Priority' : 'Routine'}
        </span>
      </div>

      <div className="animal-selector" role="list" aria-label="Animals">
        {availableAnimals.map((item) => (
          <button
            key={item.id}
            type="button"
            className={item.id === selectedAnimal.id ? 'animal-selector-button selected' : 'animal-selector-button'}
            onClick={() => selectAnimal(item.id)}
          >
            <strong>{item.name}</strong>
            <span>{item.species}</span>
          </button>
        ))}
      </div>

      <h3>{selectedAnimal.name}</h3>
      <p>{selectedAnimal.species} · {selectedAnimal.zone}</p>

      <div className="animal-care-grid">
        {careGroups.map((group) => {
          const groupTasks = tasks.filter((task) => task.group === group.id);
          const complete = groupTasks.length > 0 && groupTasks.every((task) => task.state === 'complete' || task.state === 'na');
          return <span key={group.id} className={`care-status ${complete ? 'complete' : 'needs-attention'}`}><strong>{group.label}</strong><small>{complete ? 'Complete' : 'Needs attention'}</small></span>;
        })}
        <button className="care-button">Dropping Bowls</button>
      </div>

      <div className="animal-checklist">
        <h3>Today's care checklist</h3>
        {careGroups.map((group) => (
          <section key={group.id} className="animal-task-group">
            <h4>{group.label}</h4>
            {orderedTasks.filter((task) => task.group === group.id).map((task) => (
              <label key={task.id} className="animal-task-row">
                <input type="checkbox" checked={task.state === 'complete'} onChange={() => toggleTask(task.id)} />
                <span>{task.title}</span>
                <small>ⓘ</small>
                {task.state !== 'complete' && task.state !== 'na' && <button type="button" className="mini-button" onClick={() => setNATaskId(task.id)}>N/A</button>}
              </label>
            ))}
            {tasks.filter((task) => task.id === naTaskId).map((task) => (
              <div key={`${task.id}-reason`} className="na-reason-editor">
                <textarea value={naReason} onChange={(event) => setNAReason(event.target.value)} placeholder={`Why does ${task.title} not apply today?`} />
                <button type="button" className="primary-button" disabled={!naReason.trim()} onClick={() => markTaskNA(task.id)}>Save N/A</button>
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
