---
title: "PoC Vision Questions and Answers"
source_file: "Docs/Vision_Document_Mischief_Managed.md"
generated_at: "2026-09-07"
status: "working-requirements"
---

# PoC Vision Questions and Answers

This page records the product questions asked during PoC planning and the answers provided by the project owner. It is the working requirements record for the manager and employee animal-care experience.

## PoC Outcome

### 1. What exact decision should a manager be able to make from the dashboard?

Managers should be able to edit and assign tasks, monitor progress, communicate, locate volunteers and employees, and access or edit checklists. They should be able to leave generally available notes for specific areas, cages, or the sanctuary as a whole, as well as private notes for specific people.

### 2. What is the single most important success metric?

- Percentage of tasks completed and by whom
- Percentage of tasks that did not reach red status

### 3. Should the PoC support one real sanctuary location or a fictional/demo dataset?

The PoC will support one real sanctuary location: Animal Ed.Ventures in Coates, North Carolina. Demo or fictional data may be used during early development and testing until real data is available.

### 4. What must be demonstrated during the first pilot?

A volunteer or employee must be able to:

1. Sign in at the front QR code.
2. Be shown where to go.
3. Sign in at an area QR code.
4. See buttons for all animals available in that area and a general area-needs button.
5. Select an animal or the general area.
6. Open the care options: Feed, Clean, Signs of Life/Health, and Secure.
7. Complete the appropriate submenus and options.

The manager experience must include People, Tasks, and Animals views:

- **People:** Where people are, what they have completed, and what remains.
- **Animals:** Animal statuses and details for selected animals.
- **Tasks:** Management of completed and outstanding tasks, with LLM assistance for ideation.
- **Communication:** Manager notes or alerts exchanged with workers.

### 5. Who are the first users?

The first two users are a manager and an employee. They will test the workflows, communication, and centralized database behavior.

### 6. What roles exist initially?

Initial roles:

- Manager
- Employee

Future roles:

- Director
- Volunteer
- Trainee

The future roles should be modeled as extensions of the initial role system.

### 7. Who can view zones and how does access work?

Managers can access all zones and must clear an employee for each zone. If an employee is not cleared for a zone or has no tasks there, they should be directed to the manager for support, training, access approval, or task assignment.

### 8. Who can edit assignments?

Managers.

### 9. Who can create or modify animal tasks?

Managers.

## Roles, Trainees, and Approval

### 10. What can volunteers see?

Volunteers can see their assigned work and the zones being worked on.

### 11. What requires trainee approval?

Every checklist item completed by a trainee requires approval.

### 12. Who approves trainee work?

Any management employee.

### 13. What happens when trainee work is rejected?

Management unchecks the items that are not approved. The zone color is corrected accordingly. The trainee can try again, or another staff member can complete the checklist. Every task includes a place for the completing person’s initials.

### 14. When is approval required?

Only after the work is considered complete. Trainee work remains visible before approval but does not count as fully approved completion.

## Check-In and Identity

### 15. How do people authenticate?

Phone number authentication.

### 16. What does the front QR code do?

Scanning the front QR code signs the person in so management knows they are present.

### 17. What does an area QR code do?

Scanning an area QR code automatically checks the person into that zone.

### 18. Can one person work in multiple zones?

Yes.

### 19. Can multiple people work in the same zone?

Yes.

### 20. What happens when someone forgets to sign out?

People are automatically signed out at the end of each business day. Completing a zone checklist signs the employee or volunteer out of that zone. Trainees are signed out of a zone after management approves their checklist.

### 21. Can managers correct check-in and check-out records?

Yes.

### 22. What location data is recorded?

The scanned zone is always logged. If precise location data is available, it should also be shown.

## Task and Animal Care Rules

### 23. What task states are required?

The required states are:

- Complete
- Incomplete
- Incomplete with a note explaining why
- N/A with a required note

The system may also support blocked and in-progress states where useful.

### 24. Is N/A allowed for every task?

Yes. A note is required when a task is marked N/A.

### 25. Is a note required for N/A?

Yes.

### 26. Is a note required for incomplete work?

Yes.

### 27. Which tasks are urgent?

Signs of life/health, food, and water are urgent.

### 28. Can task priority change during a shift?

Yes.

### 29. What are tasks assigned to?

Primarily to animals, and secondarily to zones.

### 30. What does Secure mean?

The enclosure is closed and locked properly, and the animal has clear access to food and water.

### 31. What format should Signs of Life/Health use?

Structured observations rather than only free text.

### 32. What should feeding instructions include?

For this PoC, feeding instructions should explain:

- Where feeding bowls should be placed
- How to remove old bowls and food
- Quantities

### 33. Are medication records included in the PoC?

No. Medication records are outside the first slice.

### 34. Do checklists vary?

Checklists are mostly the same but vary slightly by animal.

### 35. Can completed tasks be edited later?

Only management can edit completed tasks.

### 36. Does editing require an audit reason?

Yes. Management must provide an audit reason when editing a completed task.

## Manager Dashboard

### 37. What does the manager see after signing in?

A color-coded zone status board showing what has been done, with the ability to switch between a list and a map. The manager can see each signed-in employee and their current zone.

### 38. What is the default dashboard view?

The default should show the zone status board and urgent task list.

### 39. What do the colors mean?

- **Green:** The area has been signed into and the checklist is complete.
- **Yellow:** Someone has signed into the area and work is in progress.
- **Red:** The checklist is incomplete and nobody has signed into the area yet.

### 40. What determines zone color?

A combination of check-in state, checklist completion, and elapsed time is helpful. Checklist completion is the most important factor.

### 41. How quickly does a zone transition toward red?

The default transition time is 45 minutes. Management can edit the timer or turn it off.

### 42. What defines the operating day?

This remains to be defined. The system needs sanctuary operating hours and timezone rules for determining when a new day begins.

### 43. What information should the main dashboard show?

The main screen should show:

- Current assignments
- Current progress
- Notes

Additional dashboard menus should provide:

- Overdue tasks
- Health concerns
- Notes
- Other operational details

### 44. What does the manager notification symbol represent?

It indicates that the manager has left a note for employees or volunteers to read. Notes may target a specific animal, zone, employee, volunteer, or the sanctuary generally.

### 45. What appears when clicking a person?

The person view should show:

- Current location
- Contact button
- A place to leave a note
- Timeline of activity

### 46. Is realtime communication required?

For the PoC, manager notes and alerts are sufficient. Walkie-talkies remain available for realtime communication.

## Data and Operations

### 47. Who creates operational data?

Management creates animals, habitats, zones, users, and checklists.

### 48. How are checklists configured?

Managers configure checklists through the app rather than editing only seeded data.

### 49. Are animal names unique?

Yes.

### 50. Can animals move between habitats?

No.

### 51. Can animals have multiple caretakers?

Yes.

### 52. What information must be retained?

Indefinitely:

- Animal names
- Species
- Locations
- Care information
- Cleaning information
- Food and food-preparation information
- Sanctuary information

For up to one year:

- People information

For three to five years:

- General accounting information

### 53. How long are task events and audit records retained?

Indefinitely.

### 54. Who can access staff location history?

Location is considered non-sensitive while people are checked into the premises. Management may access it.

### 55. What happens during connectivity loss?

The app should show a message explaining that connectivity is lost and that work will continue when connectivity returns. When the connection returns, a Continue button should appear. The checklist should return with previously completed items still checked.

### 56. Is full offline support required?

No. Full offline support is not required for the PoC, though preserving local checklist progress during a brief connection interruption is desirable.

### 57. What devices are used?

- Employees and volunteers: smartphones
- Director/management: smartphone and tablet

### 58. Is camera access available?

Yes. Devices can use their cameras to scan QR codes.

## Canonical Areas

The PoC will use 19 areas. Recommended normalized names are:

1. Bird Building
2. Nocturnal Building
3. Pigeons
4. Chickens
5. Reptile Barn
6. Garage
7. Back Porch
8. Back Deck
9. Pasture
10. Front Yard
11. Middle Area (Porcupines, Pigs)
12. House Animals
13. Foxes/Raccoons/Koi/Coati/Owls
14. Vultures
15. Anteater
16. Ostriches
17. Barn Cats
18. Commissary
19. Binturong/Lemur Barn

## Remaining Decisions

Before implementation, define:

- Sanctuary timezone and opening/closing hours
- Phone authentication method, including SMS verification or another factor
- Required structured health observations
- Exact Feed, Clean, and Secure fields
- Whether the general area button uses the same four care categories
- Public-note versus private-note behavior
- Whether employees can reply to manager notes
- QR code format and physical placement
- Whether the first map view uses a 2D image or SketchUp-derived model

## Source

This page is based on:

- `Docs/Vision_Document_Mischief_Managed.md`
- PoC planning questions and answers recorded on 2026-09-07
