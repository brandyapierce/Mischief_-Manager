# App Data Model and Operational Schema

This document translates the sanctuary requirements into a concrete product data model for the Mischief Manager app. It defines the core entities, task types, and rules needed for the initial PoC.

## 1. Core Entities

### User

Represents an employee, volunteer, manager, trainee, or director.

```json
{
  "id": "usr_123",
  "name": "Alex Rivera",
  "role": "employee",
  "phone": "+1-555-0100",
  "status": "active",
  "manager_id": "usr_001",
  "zone_access": ["Garage", "Bird Building"],
  "initials": "AR"
}
```

Required fields:
- `id`
- `name`
- `role`
- `phone`
- `status`
- `zone_access`
- `initials`

Role values:
- `manager`
- `employee`
- `volunteer`
- `trainee`
- `director`

### Zone

Represents a physical area or operational section of the sanctuary.

```json
{
  "id": "zone_garage",
  "name": "Garage",
  "status": "active",
  "assigned_to": "usr_123",
  "last_checked": "2026-09-07T08:15:00Z",
  "approval_needed": false,
  "stale_warning_threshold_minutes": 480,
  "qr_code": "garage-qr-01",
  "checklist_ids": ["chk_garage_am_001"]
}
```

Required fields:
- `id`
- `name`
- `status`
- `last_checked`
- `qr_code`
- `checklist_ids`

### Animal

Represents a single animal, habitat, or enclosure unit.

```json
{
  "id": "animal_mave",
  "name": "Mave",
  "species": "Binturong",
  "zone_id": "zone_garage",
  "status": "active",
  "care_profile": {
    "food": "yes",
    "clean": "yes",
    "signs_of_life": "yes",
    "secure": "yes"
  }
}
```

Required fields:
- `id`
- `name`
- `species`
- `zone_id`
- `status`

### Checklist

Represents the daily operational checklist for a zone or animal.

```json
{
  "id": "chk_bird_building_am_001",
  "zone_id": "zone_bird_building",
  "title": "Bird Building Morning Checklist",
  "created_by": "usr_001",
  "created_at": "2026-09-07T06:00:00Z",
  "last_updated": "2026-09-07T08:40:00Z",
  "state": "in_progress",
  "task_ids": ["task_001", "task_002", "task_003"]
}
```

### Task

Represents an individual action item with state, notes, and completion metadata.

```json
{
  "id": "task_001",
  "checklist_id": "chk_bird_building_am_001",
  "animal_id": null,
  "zone_id": "zone_bird_building",
  "title": "Bird Seed Level",
  "category": "feeding",
  "priority": "urgent",
  "state": "incomplete",
  "notes": "Seed bin appears half full.",
  "completed_by": null,
  "completed_at": null,
  "initials": null,
  "na_reason": null,
  "requires_initials": false,
  "supply_need": "bird seed refill"
}
```

Required fields:
- `id`
- `checklist_id`
- `title`
- `category`
- `priority`
- `state`
- `notes`

Supported task states:
- `complete`
- `incomplete`
- `incomplete_with_note`
- `na`
- `blocked`
- `in_progress`

Rules:
- `na` always requires a note explaining why.
- `incomplete` may also require a note.
- `completed_by` is required for completed tasks.
- `initials` is required for bowl drop sign-off tasks.

## 2. Specialized Task Types

### Bird Seed Monitoring Task

Bird areas need a dedicated monitoring task that can represent both quantity and refill instructions.

```json
{
  "id": "task_bird_seed_level_001",
  "title": "Bird Seed Level",
  "category": "feeding",
  "task_type": "bird_seed_level",
  "state": "incomplete",
  "level": "low",
  "empty": false,
  "refill_instructions": "Refill from the commissary seed bin. Use the labelled bird seed container and confirm the tray is covered.",
  "refill_location": "Commissary seed storage",
  "completed_by": "usr_456",
  "completed_at": "2026-09-07T09:30:00Z"
}
```

Recommended values for `level`:
- `full`
- `half`
- `low`
- `empty`

If `empty` is true:
- The app must show refill instructions immediately.
- The app must show where to get the seed.
- The checklist item may be marked incomplete until refill occurs.

### Dropping Bowls Task

This task is used for all animals except birds; it tracks that bowls were dropped during the day. It is intentionally separate from the cleaning checklist so a zone can be considered clean and complete while the bowl-drop task is completed by a different person at a different time.

```json
{
  "id": "task_drop_bowl_042",
  "title": "Dropping Bowls",
  "category": "feeding",
  "task_type": "drop_bowls",
  "workflow_group": "feeding_drop",
  "is_independent_of_cleaning": true,
  "state": "complete",
  "completed_by": "usr_789",
  "completed_at": "2026-09-07T12:10:00Z",
  "initials": "LM",
  "notes": "All bowls dropped and refreshed."
}
```

Rules:
- Applies to all non-bird feeding tasks.
- Sign-off must include initials.
- This task is tracked as its own workflow group and does not belong to the cleaning checklist.
- Cleaning completion and bowl-drop completion are independent operational states.
- This task should be visible in zone summary and staff tasks.

## 3. Shift and Time Rules

### Business/Workday Logic

```json
{
  "business_hours": {
    "open_days": ["Wed", "Thu", "Fri", "Sat", "Sun"],
    "open_time": "11:00",
    "close_time": "16:00",
    "closed_days": ["Mon", "Tue"]
  },
  "workday_rules": {
    "new_day_starts_at": "07:00",
    "overnight_work_counts_for": "previous_day"
  }
}
```

Operational rules:
- The sanctuary is open Wed–Sun from 11:00 to 16:00.
- The sanctuary is closed Monday and Tuesday.
- Any work done overnight belongs to the previous calendar day.
- A new workday starts at 07:00 each morning.

### Sign-In and Sign-Out

```json
{
  "sign_in_event": {
    "user_id": "usr_123",
    "zone_id": "zone_garage",
    "timestamp": "2026-09-07T11:05:00Z",
    "source": "qr_code"
  },
  "sign_out_event": {
    "user_id": "usr_123",
    "zone_id": "zone_garage",
    "timestamp": "2026-09-07T13:10:00Z",
    "source": "checklist_complete"
  }
}
```

Rules:
- Users sign in at the front QR code and then at the zone QR code.
- A person can work in multiple zones.
- Multiple people can be assigned to the same zone.
- Completing a zone checklist signs the user out of that zone.
- Trainee sign-outs are only final after manager approval.

## 4. Zone Checklist Data Model

Each zone should have a standardized checklist object that can include both general tasks and animal-specific tasks.

```json
{
  "zone_id": "zone_bird_building",
  "daily_tasks": [
    "Signs of Life",
    "Fresh Water",
    "Bird Seed",
    "Bird Seed Level",
    "Spiderwebs"
  ],
  "subtasks": [
    {
      "title": "Bird Seed Level",
      "task_type": "bird_seed_level",
      "required": true
    },
    {
      "title": "Dropping Bowls",
      "task_type": "drop_bowls",
      "required": false,
      "applies_to": "non_birds"
    }
  ]
}
```

This supports:
- Zone-level tasks
- Animal-level tasks
- Optional feed tasks by species
- Reusable task templates across zones

## 5. Dashboard and Status Logic

### Zone State

A zone can be in one of three operational states:
- `red`: No one has signed in and the zone is incomplete
- `yellow`: Someone is signed in and work is in progress
- `green`: The checklist is complete and signed off

Suggested logic:
- `green` if checklist complete and no open urgent tasks
- `yellow` if user has signed in but checklist remains incomplete
- `red` if no sign-in and checklist incomplete or stale

### Urgency Rules

Urgent categories:
- Signs of life / health
- Food
- Water
- Secure

These must appear first in the prioritization order.

## 6. Trainee and Approval Model

```json
{
  "user_id": "usr_trainee_01",
  "role": "trainee",
  "task_id": "task_999",
  "approval_required": true,
  "approval_status": "pending"
}
```

Rules:
- Trainee work must be approved by a manager.
- Approval is required before the zone is considered fully complete.
- If rejected, the task reopens and manager notes are added.
- Every task should capture the initials of the completing person.

## 7. Example Zone Inventory Mapping

```json
{
  "zones": [
    "Front Yard",
    "Commissary",
    "Garage",
    "Foxes/Racoons/Owls/Koi/Coati",
    "Nocturnal Building",
    "Bird Building",
    "Pigeons",
    "Back Porch",
    "Back Deck Owls",
    "Vultures",
    "Chickens",
    "Binturong/Lemurs",
    "Barn Cats",
    "Reptile Building",
    "Middle Area",
    "House Animals",
    "Ostriches",
    "Pasture"
  ]
}
```

## 8. Recommended Implementation Approach

For the initial PoC, use a simple but extensible structure:

1. Keep users, animals, zones, checklists, and tasks as first-class records.
2. Use task types for special workflows like bird seed and bowl drops.
3. Store notes and initials on each task.
4. Keep zone state derived from sign-in status and task completeness.
5. Treat the checklist as the system of record for daily operational work.

This gives the app enough structure for the dashboard, QR sign-in flow, manager oversight, trainee approval, and operational reporting without overbuilding before the pilot.

## 9. Proposed Minimal Schema for MVP

```json
{
  "user": {
    "id": "string",
    "name": "string",
    "role": "string",
    "initials": "string",
    "zone_access": ["string"]
  },
  "zone": {
    "id": "string",
    "name": "string",
    "status": "string",
    "qr_code": "string",
    "checklist_id": "string"
  },
  "checklist": {
    "id": "string",
    "zone_id": "string",
    "tasks": ["task_id"]
  },
  "task": {
    "id": "string",
    "title": "string",
    "type": "string",
    "priority": "string",
    "state": "string",
    "notes": "string",
    "completed_by": "string",
    "initials": "string",
    "na_reason": "string"
  }
}
```

This is the best starting design for the PoC because it is simple enough to implement quickly, while still capturing the operational logic that matters most to the sanctuary team.
