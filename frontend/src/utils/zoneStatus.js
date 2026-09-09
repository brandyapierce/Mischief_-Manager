const DEFAULT_STALE_THRESHOLD_MINUTES = 480;

export function deriveZoneStatus(zone, now = new Date()) {
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

  const signedInCount = zone.signedInUsers?.length ?? 0;
  const lastActivityAt = zone.lastActivityAt ? new Date(zone.lastActivityAt) : null;
  const staleThresholdMinutes = zone.staleWarningThresholdMinutes ?? DEFAULT_STALE_THRESHOLD_MINUTES;
  const minutesSinceActivity = lastActivityAt
    ? Math.max(0, (now.getTime() - lastActivityAt.getTime()) / 60000)
    : null;
  const isStale = !cleaningComplete && minutesSinceActivity !== null && minutesSinceActivity >= staleThresholdMinutes;
  const isActive = signedInCount > 0 && !isStale;
  const lifecycleStatus = zone.status === 'closed' ? 'closed' : cleaningComplete ? 'ready' : 'open';

  const zoneColor = (() => {
    if (zone.status === 'closed' || cleaningComplete) return 'green';
    if (isActive) return 'yellow';
    return 'red';
  })();

  const activityStatus = zoneColor === 'green'
    ? 'complete'
    : isStale
      ? 'stale'
      : isActive
        ? 'in_progress'
        : 'not_started';

  return {
    cleaningStatus: cleaningComplete ? 'complete' : 'needs_attention',
    bowlDropStatus: bowlDropComplete ? 'complete' : 'pending',
    zoneStatus: lifecycleStatus,
    zoneColor,
    activityStatus,
    statusLabel: zoneColor === 'green'
      ? 'Ready'
      : isStale
        ? 'Stale'
        : isActive
          ? 'In progress'
          : 'Not started',
    isStale,
    signedInCount,
    minutesSinceActivity,
    needsAttention: !cleaningComplete || !bowlDropComplete,
    cleaningProgress: `${cleaningDoneCount}/${cleaningTasks.length || 0}`,
    bowlDropProgress: `${bowlDropDoneCount}/${bowlDropTasks.length || 0}`,
  };
}
