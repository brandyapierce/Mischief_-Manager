# App Implementation Plan

This document translates the sanctuary requirements and schema into an MVP implementation plan for the Mischief Manager app.

## 1. MVP Goal

Build a working checklist-based management app focused on:
- employee and volunteer sign-in/out
- zone-based checklists
- urgent animal care tasks
- bird seed tracking
- bowl drop sign-off
- manager oversight and approval

## 2. Recommended Screens

### A. Front Sign-In Screen

Purpose:
- user signs in with phone number
- chooses whether they are employee, volunteer, trainee, or manager
- sees assigned work and zone access

Required actions:
- sign in at front QR code
- go to assigned zones
- see their daily work queue

### B. Zone Sign-In Screen

Purpose:
- user signs into a specific zone
- sees zone summary and current status
- chooses an animal or general area task flow

Required actions:
- scan or select zone QR code
- view current zone checklist
- open animal detail or zone general care tasks

### C. Animal Detail Screen

Purpose:
- view animal care tasks
- complete feed, clean, signs of life, and secure checklists
- add notes and initials where required

Required task groups:
- Feed
- Clean
- Signs of Life / Health
- Secure

### D. Dashboard Screen

Purpose:
- show all zones with colored status
- prioritize tasks by urgency
- show who is signed in and where

Color logic:
- green = checklist complete
- yellow = signed in and in progress
- red = incomplete / stale / no sign-in

### E. Manager Tasks Screen

Purpose:
- review overdue or incomplete work
- approve trainee tasks
- adjust assignments
- leave notes for volunteers and staff

## 3. Implementation Order

### Phase 1: Core Sign-In + Checklist Flow

1. User model and auth
2. Zone model
3. Checklist and task model
4. Zone sign-in / sign-out transitions
5. Task completion and notes

### Phase 2: Operational Requirements

1. Bird seed tracking
2. Empty state instructions and refill location
3. Bowl drop sign-off with initials
4. Overdue and stale zone logic
5. Daily workday logic and 7am rollover

### Phase 3: Manager Experience

1. Dashboard with zone color states
2. Urgent task prioritization
3. Employee/volunteer tracking by zone
4. Trainee approval flow
5. Audit notes and reasons for edits

## 4. Task Types to Implement First

Recommended first wave:
- Signs of Life / Health
- Fresh Water
- Feed
- Bird Seed Level
- Dropping Bowls
- Poop Scoop
- Bowl Collection
- Secure

These are the most operationally important and repeated across many zones.

## 5. Bird Seed Requirement Implementation

### Data fields
- `level`: full | half | low | empty
- `empty`: boolean
- `refillInstructions`: string
- `refillLocation`: string

### UI behavior
- Show a quick selector for level
- If level is empty, display the refill instructions card
- Add a visible refill CTA to the commissary or seed storage location
- Require a note if the bin is empty and not yet refilled

## 6. Dropping Bowls Requirement Implementation

Dropping Bowls is not part of the cleaning checklist. It is a separate operational task that can be completed independently from cleaning tasks, even hours later.

### Data fields
- `completedBy`
- `initials`
- `completedAt`
- `notes`
- `workflowGroup`: `feeding_drop`
- `isIndependentOfCleaning`: true

### UI behavior
- Provide a quick sign-off button in a separate feeding drop section
- Collect initials from the person who completed the task
- Store the initials with the completed task
- Add the task to the zone summary and daily completion record
- Allow a zone to be marked clean and complete without requiring bowl drop completion at the same moment

## 7. Dashboard Logic

Pseudo-logic:

```js
function getZoneStatus(zone, checklist, signIns) {
  if (checklist.isComplete && !checklist.hasUrgentOpenTasks) {
    return 'green';
  }

  if (signIns.some((person) => person.zoneId === zone.id)) {
    return 'yellow';
  }

  return 'red';
}
```

Rules:
- Urgent tasks should sort to the top
- A stale zone should shift toward red if no progress has occurred for too long
- Completed tasks still need manager visibility for approval if trainee-created

## 8. Implementation Risks and Constraints

- Some tasks are repeated across many zone types; generic task templates will reduce duplication.
- Bird seed and bowl tasks need special logic but should still follow the generic task model.
- Data entry must allow notes for N/A and incomplete tasks.
- Trainee statuses should be treated carefully to avoid false completion records.

## 9. MVP Acceptance Criteria

The MVP is considered complete when a user can:
- sign in at the front QR code
- sign in to a zone
- view the checklist for that zone
- complete a task with notes or initials
- see zone status update on the dashboard
- approve or reject trainee work as a manager
- track bird seed level and empty-state refill instructions

This plan is intentionally scoped to the sanctuary operational workflow and the first slice of the product: manager-facing zone and task tracking.
