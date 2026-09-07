export function deriveZoneStatus(zone) {
  const cleaningTasks = zone.cleaning ?? [];
  const bowlDropTasks = zone.feedingDrop ?? [];

  const cleaningComplete = cleaningTasks.every(
    (task) => task.state === 'complete' || task.state === 'na'
  );

  const bowlDropComplete = bowlDropTasks.every(
    (task) => task.state === 'complete'
  );

  const cleaningDoneCount = cleaningTasks.filter(
    (task) => task.state === 'complete' || task.state === 'na'
  ).length;

  const bowlDropDoneCount = bowlDropTasks.filter(
    (task) => task.state === 'complete'
  ).length;

  const lifecycleStatus = zone.status === 'closed' ? 'closed' : cleaningComplete ? 'ready' : 'open';

  const zoneColor = (() => {
    if (zone.status === 'closed') return 'green';
    if (cleaningComplete && bowlDropComplete) return 'green';
    if (cleaningComplete && !bowlDropComplete) return 'green';
    if (!cleaningComplete && bowlDropComplete) return 'yellow';
    return 'yellow';
  })();

  return {
    cleaningStatus: cleaningComplete ? 'complete' : 'needs_attention',
    bowlDropStatus: bowlDropComplete ? 'complete' : 'pending',
    zoneStatus: lifecycleStatus,
    zoneColor,
    needsAttention: !cleaningComplete || !bowlDropComplete,
    cleaningProgress: `${cleaningDoneCount}/${cleaningTasks.length || 0}`,
    bowlDropProgress: `${bowlDropDoneCount}/${bowlDropTasks.length || 0}`,
  };
}
