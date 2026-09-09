---
# Entity Template
# Usage: Generic entity/topic page for topics, concepts, or entities that don't fit zone or checklist.
# Fields: title, tags, summary, references, source_file (populated by ingestion), generated_at (ISO timestamp)
title: "[Entity Name]"
tags: 
  - tag1
  - tag2
summary: "One-line summary of this entity"
source_file: ""
generated_at: ""
---

## Summary

[2–3 line executive summary about this entity]

## Overview

[Detailed description and context]

## Key Points

- Key point 1
- Key point 2
- Key point 3

## References

- [Related Wiki Link 1](wiki-link-1)
- [Related Wiki Link 2](wiki-link-2)

## Provenance

**Source:** [Raw source file path will be inserted by ingestion]  
**Generated:** [Timestamp will be inserted]

---

*Template usage note: This template is suitable for general knowledge entities, procedures, or topics. Fields in front-matter (title, tags, summary) are indexed and queryable by Co-Teacher app. Modify sections as needed but preserve YAML structure.*
