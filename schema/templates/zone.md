---
# Zone Template
# Usage: Represents a physical or organizational zone requiring monitoring, checklists, and approvals.
# All fields below are required unless marked optional.
zone: "[Zone Name]"
assigned_to: ""
last_checked: ""
status: "active"  # active, inactive, under_maintenance, archived
stale_warning_threshold_minutes: 480  # 8 hours default
approval_needed: false  # true if pending trainee approval
source_file: ""
generated_at: ""
---

## Overview

[Brief description of the zone, its purpose, and scope]

## Standard Checklist

### Daily Tasks
- [ ] Check feeders and refill as necessary
- [ ] Refill water containers
- [ ] Morning enrichment activity performed
- [ ] Quick visual health check (report spikes, bleeding, wounds)
- [ ] Clean enclosure surface and pick debris
- [ ] Note any hazards (loose wires, broken fixtures)

### Log Entry
- [ ] Record time-in
- [ ] Record time-out
- [ ] User signed in

## Notes / Flags

**Active Hazards:**
- [List any current safety concerns or maintenance issues]

**Recent Updates:**
- [Recent changes or important notes]

## Latest Check-ins

| Timestamp | User | Notes |
|-----------|------|-------|
| [ISO time] | [User] | [Brief note] |

## Provenance

**Source:** [Raw source file path will be inserted by ingestion]  
**Generated:** [Timestamp will be inserted]  
**Status:** [active/inactive/pending_approval]

---

*Template usage note: This template is designed for sanctuary zones. The approval_needed field flags updates from trainees. Co-Teacher app reads this field to show Director oversight banner. Preserve front-matter structure.*
