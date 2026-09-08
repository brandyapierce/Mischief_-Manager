---
title: "Mischief Manager - Current Product Status"
source_file: "README.md"
generated_at: "2026-09-08"
status: "handoff"
---

# Current Product Status

This page is the handoff record for the current development state of the Mischief Manager prototype. Use it to resume work without re-deriving decisions or architecture.

## Current state of the app

The frontend prototype is a React + Vite application that models the sanctuary operations workflow for managers and staff.

### Implemented flows

- Dashboard with zone overview cards
- Zone directory screen
- Per-zone detail routes under `/zones/:zoneId`
- Route-based navigation between dashboard, overview, people, tasks, animals, and settings
- Cleaning checklist tracking
- Bowl-drop tracking kept separate from cleaning tasks
- Manager approval queue
- Demo role-aware access gates for manager/director operations
- Zone close / reopen lifecycle with signoff initials and notes
- Daily manager overview summarizing closed, ready, open, and watch-list zones
- localStorage persistence for the demo app state
- Persistence is isolated behind `frontend/src/data/appStore.js` so a future API can replace localStorage without changing screen components.
- Employee zone sessions now support persisted `Start work` and `End work` actions with start/end timestamps.
- Checklist completion now targets one task at a time and records the completing user, timestamp, notes, and trainee approval status.
- Bird Building includes a seed-level task with Full, Half, Low, and Out states; Low and Out show refill location/instructions, and Out remains incomplete until refilled.
- Trainee completions now create pending approval records; managers can approve or reject with notes, and rejected work reopens the specific checklist task.
- Dashboard zone colors now use sign-in and activity age: green for closed/clean cleaning, yellow for recent work, and red for not-started or stale work. Bowl-drop status remains independent.
- End-to-end PoC path is build-validated: employee start work, one-task completion, bowl-drop initials, refresh persistence, trainee submission, and manager approval/rejection wiring.
- Animals now has all-property care profiles including Betsy, two Betongs, two additional sloths, Abby, a parrot, monkeys, and small birds, with prioritized interactive Feed, Clean, Health, and Secure checklists.
- Animal care checklist changes persist across refreshes and add a timestamped activity entry with the active user to the Tasks view.
- Zone and animal tasks support N/A with a required reason; N/A counts as satisfied for progress without being mislabeled as completed work.
- The app now derives a sanctuary workday at 7:00 AM, attributes overnight activity to the prior workday, and displays public-hours status for Wednesday through Sunday, 11:00 AM to 4:00 PM.
- Settings includes a local demo reset so phone testing can restart the sample workflow without manually clearing browser storage.
- Preview configuration binds Vite to all interfaces and includes a Vercel SPA rewrite for direct route access.
- Garage now has individually checkable tasks for Enclosures A and B, Betsy, the Betongs, sloths, fish tank, Abby, parrot, monkeys, small birds, sweeping, and water-jug refills.
- Garage cleaning tasks are grouped visually by enclosure, animal, and whole-garage work; ordinary cleaning tasks can be checked as a draft and saved once with required checklist initials.
- Back Porch now has separate Chinchilla, Sugar Glider, Isolation, Back Deck Owl, and general porch cleaning sections, plus separate feeding-drop signoffs for Chinchilla bowls, Owl mice, and Isolation bowl.
- Bird Building is treated as one building-wide checklist with Signs of life first, feeding bowls, fresh water, snake check, and bird seed level tracking; it has no Feeding Drop section.
- Bird seed levels are Full, Half, Low, or Out. Low and Out require saved mix instructions, set the activity priority to urgent, and Out remains incomplete until refilled.
- Recent zone activity displays saved seed levels directly and uses the neutral empty-note label "No notes".
- Staff assignments are stored per user. Managers and directors can select staff and assign zones from the Dashboard or People tab; all staff can see the shared coverage roster.
- The People tab supports selecting staff to view current location, active work status, latest recorded work, and assigned zones.
- Managers and directors can add, edit, and deactivate staff. Deactivated staff remain in historical records but are removed from sign-in choices.
- Staff access is limited to Dashboard, Zones, and read-only People. Management-only Overview, Tasks, Animals, and Settings routes are protected from direct URL access.
- The Dashboard includes a QR code that opens `/signin` for phone-based staff sign-in. The sign-in route uses the persisted staff roster and returns to the Dashboard after sign-in.
- Vercel SPA routing excludes `/assets` from the fallback rewrite so hosted JavaScript and CSS load correctly on phones.

### Core product rule that must be preserved

Cleaning and bowl-drop are intentionally separate workflows. A zone can be considered cleaned and still have a bowl-drop task pending. The app should not collapse those into one combined status again.

## Key app architecture

### Frontend entry points

- `frontend/src/App.jsx` contains the core app state, route configuration, task logging, and zone lifecycle logic.
- `frontend/src/data/appStore.js` owns demo state defaults, localStorage validation, and state serialization.
- `frontend/src/main.jsx` mounts the app with `BrowserRouter`.
- `frontend/src/utils/zoneStatus.js` decides zone color and workflow status.

### Important workflow decisions already made

- Zone status is derived from actual checklist state, not just labels.
- Bowl-drop is handled as a separate action from cleaning.
- Manager signoff is a recorded event with initials and notes.
- Demo sign-in switches the active role and persists it with the existing local state.
- Employees, volunteers, and trainees can log work but cannot approve, assign, or close zones.
- Employees, volunteers, and trainees can work in any zone they encounter; assignments guide coverage and reporting but do not block helpful work.
- Management approval is reserved for trainee submissions; employee and volunteer work does not require approval.
- Bowl-drop notes are optional; bowl-drop initials remain required for signoff.
- A zone is marked closed only after the workflow is in a valid lifecycle state.
- Managers and directors can manage the staff roster, assignments, and management-only navigation; staff cannot add, edit, or deactivate staff.
- Cleaning checklist changes are saved as one checklist action with required initials; special tasks that require extra information, such as bird seed levels or N/A reasons, use focused forms.

## Verified working state

The app was verified with a production build:

```bash
cd /workspaces/Mischief_-Manager/frontend && npm run build
```

Result: successful production build with Vite.

## Current branch and repo status

- Branch: `karpathy-llm-wiki-setup`
- Repository: `brandyapierce/Mischief_-Manager`
- Latest pushed commit: updated by the current handoff commit after today’s prototype work

## What is intentionally not complete yet

The prototype is not a full backend-integrated production app yet. The remaining gaps are:

1. Real persistent database/API layer and cross-device synchronization; current state is localStorage/demo state.
2. Production authentication and server-enforced role-based access control; current sign-in is a demo selector.
3. QR codes should eventually encode a secure sign-in session or location identifier rather than only opening `/signin`.
4. Permanent hosted deployment; temporary Vercel deployments expire unless claimed or deployed to an account.
5. Final production polish, accessibility improvements, automated tests, and audit history.

## Recommended next work order

If the team resumes from this point, the best next steps are:

1. Deploy the frontend to a permanent Vercel project for management demonstrations.
2. Replace localStorage with a real API/database and synchronize staff devices.
3. Replace demo sign-in and QR routing with real authentication and secure role enforcement.
4. Add audit history for staff edits, task corrections, approvals, assignments, and zone signoffs.
5. Add automated workflow tests and finish mobile/accessibility polish.

## Summary for the next session

The project is in a coherent frontend prototype state. The route-based app, zone workflows, signoff lifecycle, and summary dashboard are all in place and the build is passing. The next session should continue from the operational product layer rather than rebuilding fundamentals.
