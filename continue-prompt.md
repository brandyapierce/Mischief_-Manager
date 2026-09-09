You are continuing development on the Mischief Manager sanctuary operations app.

Project context:
- Repository: /workspaces/Mischief_-Manager
- Branch: karpathy-llm-wiki-setup
- Tech stack: React + Vite + React Router
- Goal: build a sanctuary operations manager app for a real rescue/sanctuary workflow

Current state summary:
- The app is a working frontend prototype with route-based navigation.
- Core screens exist: dashboard, zone directory, zone detail pages, tasks, people, animals, settings, and daily manager overview.
- A zone detail page exists at /zones/:zoneId.
- Manager signoff and zone close/reopen lifecycle are implemented.
- Daily manager overview summarizes closed, ready, open, and watch-list zones.
- The app persists state locally with localStorage.
- The cleaning checklist and bowl-drop workflow are intentionally separate and must remain separate.
- Zone status is derived from true workflow state, not just a single combined label.
- This is a frontend proof of concept using localStorage, not a production backend application.

Implemented behavior to preserve:
- Cleaning and Feeding Drop are separate workflows. A zone can be cleaning-complete/green while Feeding Drop remains pending.
- Cleaning tasks can be checked as a draft and saved once with required checklist initials. Feeding Drop tasks require initials.
- N/A requires a reason and counts as satisfied without being labeled completed work.
- Zone sessions persist Start work and End work timestamps. Managers/directors can close/reopen zones with initials and notes.
- Trainee work creates approvals; rejection reopens the task. Daily Overview includes status counts, signoffs, issues, activity, sessions, approvals, and CSV export.
- Animal care is persisted, with health, feed, clean, secure groups and Signs of life first. Workday starts at 7:00 AM.

Zone-specific checklists:
- Garage cleaning is grouped into Enclosure A, Enclosure B, Fish tank, Abby, Parrot, Monkeys, Small bird cage, and Whole garage. Garage Feeding Drop includes Sloth A, Sloth B, Teddy, and Bubbles.
- Bird Building is one building-wide checklist with no Feeding Drop: Signs of life first, fill bird-seed bowls, fresh water, snake check, and Bird seed level.
- Bird seed values are Full, Half, Low, and Out. Low/Out require mix instructions and are urgent; Out remains incomplete until refilled. Recent activity shows the selected level.
- Back Porch cleaning is grouped into Chinchillas, Sugar Gliders, Isolation, Back Deck Owls, and general porch work. Isolation includes Refill food bowl. Feeding Drop includes Chinchilla bowls, Owl mice drop, and Isolation bowl.

Staff and permissions:
- Users and assignments persist through appStore. Managers/directors can add, edit, deactivate staff, and assign zones from Dashboard or People.
- Deactivated staff remain in history but cannot sign in. Everyone sees the staff-to-zone roster and People details.
- Staff/volunteers/trainees may help in any zone; assignments guide coverage but never block helpful work.
- Staff navigation is Dashboard, Zones, and read-only People. Overview, Tasks, Animals, and Settings are protected from direct URLs.
- QR sign-in opens `/signin` and currently uses a demo selector, not real authentication.

Important product rules to preserve:
- Cleaning and bowl-drop are distinct workflows. Never combine them into a single status check again.
- A zone can be green because cleaning is complete even if bowl-drop is still pending.
- Managers can record signoff initials and notes when closing or reopening a zone.
- The app is a prototype, not a production backend-integrated system yet.
- Latest pushed code includes startup-state hardening in commit `c6e349f`, normalizing incomplete saved localStorage records so older browser sessions do not crash the initial render.

Verified working state:
- Production build succeeds via: cd /workspaces/Mischief_-Manager/frontend && npm run build

Current files to review first:
- /workspaces/Mischief_-Manager/frontend/src/App.jsx
- /workspaces/Mischief_-Manager/frontend/src/utils/zoneStatus.js
- /workspaces/Mischief_-Manager/frontend/src/components/ZoneDetailScreen.jsx
- /workspaces/Mischief_-Manager/wiki/current-product-status.md
- /workspaces/Mischief_-Manager/wiki/_HOME.md

Key implementation files:
- `frontend/src/App.jsx`: state, routes, persistence, permissions, assignments, sessions, approvals, lifecycle, and task handlers.
- `frontend/src/data/appStore.js`: localStorage key `mischief-manager-state-v1`, defaults, migrations, persistence, and reset.
- `frontend/src/data/sampleDashboard.js` and `sampleAnimals.js`: zone/checklist and animal defaults.
- `frontend/src/components/ZoneDetailScreen.jsx`: grouping, cleaning drafts, initials, Feeding Drop, and signoff.
- `frontend/src/components/TaskFormModal.jsx`: seed levels, refill instructions, N/A, and Feeding Drop initials.
- `frontend/src/components/PeoplePanel.jsx`: roster, details, staff administration, and assignment controls.
- `frontend/src/components/ZoneAssignmentPanel.jsx`: Dashboard roster and manager assignment selector.
- `frontend/src/utils/zoneStatus.js`: independent cleaning/Feeding Drop derivation.
- `frontend/src/utils/permissions.js` and `workday.js`: capability and time rules.
- `frontend/vercel.json`: SPA fallback excluding `/assets` so hosted JavaScript/CSS load correctly.
- `wiki/deployment-runbook.md`: Vercel setup, redeploy instructions, and troubleshooting for Root Directory and Install Command errors.

Known limitations and next priorities:
1. Confirm the permanent Vercel deployment is serving commit `c6e349f` and verify the app in a real browser.
2. Replace localStorage with a real API/database and cross-device synchronization.
3. Replace demo sign-in and QR routing with secure authentication and server-enforced authorization.
4. Add audit history for staff edits, assignments, task corrections, approvals, and zone signoffs.
5. Add automated tests for independent workflows, roles, migrations, staff management, seed behavior, and persistence.
6. Replace remaining static `sampleUsers` reads with the persisted managed roster wherever live staff data is expected.
7. Finish mobile accessibility and verify QR/sign-in, modals, touch targets, and protected routes on a real phone.

Deployment troubleshooting:
- The Vercel project must use Root Directory `frontend`, Build Command `npm run build`, Output Directory `dist`, and Install Command `npm install`.
- If Root Directory is empty, use `cd frontend && npm install`, `cd frontend && npm run build`, and Output Directory `frontend/dist` instead.
- Never combine Root Directory `frontend` with `cd frontend` commands.
- Read `wiki/deployment-runbook.md` before diagnosing a hosted deployment failure.
- If HTML and `/assets/*.js` load but the page is white on multiple devices, capture the browser console runtime error; do not keep changing Vercel build settings blindly.

Do not lose the existing business logic or reset the app to a simpler mock. Keep all implemented workflow state and route-driven structure.

Start by reviewing the current app files and the wiki summary, then continue from the exact point we left off without re-deriving the earlier decisions.
