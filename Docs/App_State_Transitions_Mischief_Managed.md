# App State Transitions

This document defines the exact state logic for the sanctuary app so that the cleaning workflow and the bowl-drop workflow remain independent while still being displayed in the same zone view.

## 1. Core State Objects

```js
const zoneState = {
  zoneId: 'garage',
  cleaningStatus: 'complete',
  bowlDropStatus: 'pending',
  signInUsers: ['user_123'],
  urgentTasks: ['Signs of Life'],
  lastUpdated: '2026-09-07T12:15:00Z'
};
```

## 2. Cleaning State

```js
const cleaningState = {
  workflow: 'cleaning',
  status: 'complete',
  tasks: [
    { id: 'clean_1', title: 'Clean enclosure', state: 'complete' },
    { id: 'clean_2', title: 'Remove old food', state: 'complete' },
    { id: 'clean_3', title: 'Clean water bowl', state: 'complete' }
  ]
};
```

Rules:
- cleaning tasks live in the cleaning workflow
- a zone can be considered clean even if bowl drops are still pending
- cleaning completion does not require bowl-drop completion

## 3. Bowl Drop State

```js
const bowlDropState = {
  workflow: 'feeding_drop',
  status: 'pending',
  requiresInitials: true,
  isIndependentOfCleaning: true,
  tasks: [
    { id: 'drop_1', title: 'Dropping Bowls', state: 'incomplete', initials: null }
  ]
};
```

Rules:
- bowl-drop tasks live in the feeding_drop workflow
- they require initials when completed
- they are independent from the cleaning workflow
- completion can happen later than the cleaning work

## 4. Zone View State Logic

```js
function deriveZoneState(zone) {
  const cleaningComplete = zone.cleaning.tasks.every(
    (task) => task.state === 'complete' || task.state === 'na'
  );

  const bowlDropComplete = zone.feedingDrop.tasks.every(
    (task) => task.state === 'complete'
  );

  return {
    cleaningStatus: cleaningComplete ? 'complete' : 'needs_attention',
    bowlDropStatus: bowlDropComplete ? 'complete' : 'pending',
    zoneStatus: cleaningComplete ? 'green' : 'yellow'
  };
}
```

Interpretation:
- The zone can be green because cleaning is complete.
- The bowl-drop status can still be pending.
- The app should show both clearly in the UI.

## 5. Dashboard Presentation

The dashboard should display separate indicators for each workflow.

Example:

- Cleaning: Complete
- Feeding Drop: Pending
- People in zone: 2
- Urgent tasks: 1

This avoids a false impression that bowl-drop work is part of cleaning.

## 6. Screen-Level State Model

### Screen: Zone Detail

State:
- currentZone
- cleaningChecklist
- feedingDropChecklist
- signedInUsers
- notes
- permissions

### Screen: Animal Detail

State:
- selectedAnimal
- animalCareTasks
- cleaningTasks
- bowlDropTask
- noteInput

The animal detail flow should keep the user choosing between care categories while preserving the clean-vs-drop distinction.

## 7. Transition Rules

### Cleaning transition

```js
if (userCompletesCleaningTask) {
  updateTaskState('cleaning', taskId, 'complete');
  recalculateCleaningStatus();
}
```

### Bowl drop transition

```js
if (userCompletesBowlDropTask) {
  updateTaskState('feeding_drop', taskId, 'complete');
  setInitials(user.initials);
  recalculateBowlDropStatus();
}
```

### Important behavior

Neither transition should automatically change the other workflow state.

## 8. Manager Visibility

The manager view should show both statuses separately:

- Cleaning progress
- Feed drop completion
- Urgency and overdue issues
- Trainee approval items

This keeps the manager from assuming that bowl drop completion is required before a clean zone is considered complete.

## 9. Acceptance Criteria for State Logic

The app meets this requirement when:
- cleaning can be complete with feeding drop still pending
- feeding drop can be completed later with different initials
- the zone view shows both statuses distinctly
- the dashboard does not flatten them into one checklist
- the user can complete one workflow without completing the other

This state model preserves the operational distinction the sanctuary needs and prevents accidental conflation in the app UX.
