# App UI Flow Design

This document defines the screen-by-screen interaction model for the sanctuary app, with the important distinction that cleaning and dropping bowls are separate workflows.

## 1. Core User Journey

### A. Front sign-in

User opens the app and sees:
- sign-in with phone number
- role selection for manager, employee, volunteer, trainee, or director
- quick reminder of sanctuary open hours and shift timing

On sign-in:
- the app records the user as present
- the app loads their assigned zones and work queue
- the app surfaces urgent tasks first

### B. Zone selection

Once signed in, the user sees:
- a map or list of sanctuary zones
- zone cards with a color status
- a prompt to sign into a zone before starting work

Zone status colors:
- green: checklist complete
- yellow: someone signed in and work in progress
- red: incomplete or stale and no active work

### C. Zone detail screen

When a user signs into a zone, they see:
- zone name
- current checklist summary
- active people in the zone
- urgent needs highlighted at the top
- general area tasks and animal-specific tasks

## 2. Cleaning Workflow

Cleaning is a dedicated checklist workflow. It is independent from bowl drops.

### Cleaning checklist example

For a given animal or zone, the cleaning section includes tasks such as:
- clean enclosure surface
- clean feeding device
- clean drinking device
- remove old food or waste
- clean habitat or cage components
- final inspection / signs of life check

### Behavior

When the user completes the cleaning checklist:
- that cleaning workflow can be marked complete
- the zone can be considered clean
- the app can show the zone as green for the cleaning status
- the app does not require bowl-drop completion at the same moment

Important: cleaning status and bowl-drop status are separate indicators.

## 3. Bowl Drop Workflow

Dropping bowls is a separate operational item that sits outside the cleaning checklist.

### Bowl drop placement in the app

On the zone detail screen, the user sees a separate section titled:
- Feeding Drop
- Bowl Delivery
- Dropping Bowls

This section contains tasks like:
- drop bowls for animals in this zone
- sign off that food was delivered
- enter initials of the person who completed the drop

### Bowl drop logic

A user can:
- complete the cleaning checklist and close the zone for cleaning
- later complete the bowl-drop task with initials
- see bowl-drop completion as a separate task state in the same zone

This means clean status and bowl-drop status can have different completion times.

## 4. Animal Care Flow

The app should offer a care selection flow after zone sign-in.

### Options shown to the user

- Feed
- Clean
- Signs of Life / Health
- Secure
- Dropping Bowls

### Flow example

1. User signs into the zone.
2. User taps an animal or area.
3. User sees care actions.
4. User chooses a workflow.
5. User completes tasks and records notes.
6. The system updates the zone and dashboard state.

### Important distinction

The app should not combine:
- cleaning tasks
- dropping bowls tasks

They are separate operational modules but both can live inside the same zone experience.

## 5. Task Completion Model

### Cleaning task fields

- task id
- zone id
- title
- category: cleaning
- state: complete | incomplete | n/a
- notes
- completed by
- completed at

### Bowl drop task fields

- task id
- zone id
- workflowGroup: feeding_drop
- isIndependentOfCleaning: true
- title: Dropping Bowls
- initials
- completed by
- completed at
- notes

### Status rule

```js
const isCleaningComplete = zone.cleaningChecklist.every(task => task.state === 'complete' || task.state === 'na');
const isBowlDropComplete = zone.feedingDropChecklist.every(task => task.state === 'complete');

const zoneCleaningStatus = isCleaningComplete ? 'clean' : 'needs_attention';
const zoneBowlStatus = isBowlDropComplete ? 'dropped' : 'pending';
```

This keeps the two workflows decoupled while still allowing both to exist in the same zone view.

## 6. Dashboard Behavior

The manager dashboard should display both:
- cleaning readiness
- feeding drop completion

### Example dashboard cards

For each zone:
- Cleaning: complete / in progress / pending
- Feeding Drop: complete / pending
- People signed in: list
- Urgent tasks: red priority list

This prevents a zone from appearing incomplete only because bowl drops have not happened, when the cleaning work itself is already complete.

## 7. Manager View

The manager should be able to see:
- who is signed in
- which zones are clean
- which feeding drops are pending
- which tasks require approval
- which tasks are stale or overdue

The manager can also override or edit completed tasks, with an audit reason when required.

## 8. Proposed UI Layout

### Zone detail screen layout

Top row:
- zone name
- green / yellow / red status
- current signed-in users

Main content:
- Cleaning checklist
- Feeding drop section
- Animal list
- Notes / flags

Bottom actions:
- sign out
- add note
- report issue
- assign another user

## 9. Acceptance Criteria for UI

The app is considered correct when:
- cleaning tasks and bowl-drop tasks are separate controls
- a zone can be clean while bowl drops remain pending
- a bowl drop requires initials
- the dashboard shows both states independently
- employees can complete either workflow without blocking the other

This is the model the app should follow for the initial PoC and the first operational pilot.
