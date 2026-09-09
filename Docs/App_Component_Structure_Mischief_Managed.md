# App Component Structure

This document defines the UI component structure for the sanctuary app based on the requirement that cleaning and bowl-drop tasks are independent workflows.

## 1. Top-Level App Shell

```tsx
<AppShell>
  <Header />
  <MainLayout>
    <Sidebar />
    <ContentArea>
      <Router />
    </ContentArea>
  </MainLayout>
</AppShell>
```

### Responsibilities
- global auth and session state
- top navigation for dashboard, people, animals, tasks, and settings
- shared notifications and alerts
- timezone and current workday logic

## 2. Authentication and Session Components

### `SignInScreen`
- phone number login
- role selection
- shift and sanctuary hour reminders

### `AuthenticatedHomeScreen`
- current user details
- assigned zones
- dashboard summary
- quick access to current work

## 3. Dashboard Components

### `DashboardScreen`
Displays zone cards and urgent tasks.

### `ZoneStatusCard`
Displays:
- zone name
- cleaning status
- feeding drop status
- number of signed-in users
- urgent tasks count

Example props:

```tsx
<ZoneStatusCard
  zoneName="Garage"
  cleaningStatus="complete"
  bowlDropStatus="pending"
  signedInUsers={2}
  urgentTasks={1}
/>
```

### `UrgentTaskList`
Shows high-priority tasks sorted by urgency.

### `StaffPresencePanel`
Shows who is in which zone and their completion pattern.

## 4. Zone Detail Components

### `ZoneDetailScreen`
Contains the primary zone workflow.

### `ZoneHeader`
- zone name
- zone status badges
- check-in controls
- notes or exception banners

### `ZoneChecklistSection`
Handles the cleaning workflow.

Props:
- `workflowType="cleaning"`
- `tasks`
- `onTaskChange`

### `FeedingDropSection`
Handles the separate bowl-drop workflow.

Props:
- `workflowType="feeding_drop"`
- `tasks`
- `onTaskComplete`
- `requiresInitials`

### `AnimalListPanel`
Displays animals or habitats in the zone.

### `AnimalDetailModal`
Shows:
- feed options
- clean options
- signs of life / health options
- secure controls
- bowl-drop actions if applicable

## 5. Task Components

### `TaskRow`
Reusable row for each task item.

Props:
- `title`
- `state`
- `notes`
- `completedBy`
- `initials`
- `requiresInitials`

### `TaskStateSelector`
Status choices:
- complete
- incomplete
- n/a
- in progress

### `InitialsInput`
Small input for required initials on bowl-drop tasks.

## 6. Manager Components

### `ManagerDashboardScreen`
Shows all outstanding operational work.

### `ApprovalQueue`
Displays trainee-generated work awaiting approval.

### `AuditEditPanel`
Used when management edits a completed task and must add a reason.

### `ZoneAssignmentPanel`
Supports assigning staff to zones and updating access.

## 7. Shared Data Helpers

### `deriveZoneStatus(zone)`
Returns derived zone state from cleaning and bowl-drop workflow states.

```ts
function deriveZoneStatus(zone) {
  const cleaningComplete = zone.cleaning.every((task) => task.state === 'complete' || task.state === 'na');
  const bowlDropComplete = zone.feedingDrop.every((task) => task.state === 'complete');

  return {
    cleaningStatus: cleaningComplete ? 'complete' : 'needs_attention',
    bowlDropStatus: bowlDropComplete ? 'complete' : 'pending',
    zoneColor: cleaningComplete ? 'green' : 'yellow'
  };
}
```

## 8. UI Rules

- Cleaning checklist and feeding drop section should be separate visual blocks.
- Bowl-drop completion should never be embedded inside the cleaning checklist UI.
- Zone status can be green even when bowl drop remains pending.
- Manager dashboard should show both statuses independently.
- Bowl-drop actions should allow initials entry without requiring the cleaning workflow to be reopened.

## 9. Example Layout

```tsx
<ZoneDetailScreen>
  <ZoneHeader />

  <Section>
    <SectionTitle>Cleaning</SectionTitle>
    <ZoneChecklistSection workflowType="cleaning" />
  </Section>

  <Section>
    <SectionTitle>Feeding Drop</SectionTitle>
    <FeedingDropSection workflowType="feeding_drop" requiresInitials />
  </Section>

  <AnimalListPanel />
</ZoneDetailScreen>
```

This keeps each workflow conceptually and visually distinct while still belonging to the same zone experience.
