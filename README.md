# Mischief Manager - LLM Wiki System

An automated wiki ingestion pipeline for Mischief sanctuary operations documentation, based on Karpathy's LLM Wiki structure.

## Overview

This system implements a **raw → wiki → schema → log** pipeline for maintaining structured, AI-enhanced sanctuary operations documentation.

- **raw/**: Source documents (text, markdown, procedures)
- **wiki/**: Generated wiki pages with YAML front-matter
- **schema/**: Templates defining page structure (zone, checklist, entity)
- **log/**: Audit trail of all ingestion runs with provenance metadata

## Quick Start

### Local Setup

```bash
# Clone and navigate
cd /workspaces/Mischief_-Manager

# Install dependencies
npm install

# Run in dry-run mode (default, no API calls)
npm run dry-run

# Review generated files
ls -la wiki/
cat log/run-*.json | jq .
```

### Live Mode (with Anthropic)

Set the `ANTHROPIC_API_KEY` environment variable:

```bash
export ANTHROPIC_API_KEY="sk-..."

# Run in live mode (calls Anthropic API)
npm start

# Or trigger the GitHub workflow
# (See GitHub Actions tab in the repo)
```

### Validation

```bash
# Validate the latest run
npm run validate -- --latest

# Validate a specific run log
npm run validate -- log/run-2026-09-06T10-30-00Z.json
```

## File Structure

```
.
├── raw/                           # Source documents
│   └── example-article.txt
│
├── wiki/                          # Generated wiki pages
│   ├── _HOME.md                   # Index/homepage
│   └── example-article.md         # Generated from raw
│
├── schema/                        # Template definitions
│   ├── README.md                  # Schema documentation
│   └── templates/
│       ├── entity.md              # Generic entity template
│       ├── zone.md                # Zone/area template (with approval_needed)
│       └── checklist.md           # Checklist template
│
├── log/                           # Audit trail
│   ├── README.md
│   └── run-2026-09-06T10-30-00Z.json
│
├── scripts/
│   ├── ingest-and-update.js       # Main ingestion script
│   └── validate-run-log.js        # Log validator
│
├── .github/workflows/
│   └── llm-wiki-update.yml        # GitHub Actions workflow
│
├── package.json
├── .gitignore
└── README.md (this file)
```

## How It Works

### 1. Scanning (raw/)

The pipeline scans `raw/` for new and modified files by comparing SHA256 checksums against the last run log.

### 2. Processing

For each new/changed file:

- **Live Mode**: Calls Anthropic Claude API with the file content and a structured prompt
- **Dry-Run Mode**: Uses local template-based rendering (no network calls)

### 3. Generation

The pipeline produces markdown files with YAML front-matter:

```markdown
---
title: "Bird Building Morning Routine"
source_file: "example-article.txt"
generated_at: "2026-09-06T10:30:00Z"
provenance_hash: "abc123..."
---

## Summary

[LLM-generated or template-rendered content]
```

### 4. Logging

Each run creates a JSON log entry in `log/run-<ISO_TIMESTAMP>.json` with:

- File checksums (source and generated)
- Anthropic API metadata (model, tokens, stop reason)
- Error messages and action taken (created/updated/skipped/error)
- Summary counts

### 5. Commit & Push (Workflow Only)

In GitHub Actions, the workflow:

1. Runs the ingestion pipeline
2. Validates the run log
3. Commits `wiki/` and `log/` changes
4. Pushes to `karpathy-llm-wiki-setup` branch

**Note:** Local dry-run does NOT commit or push (network can reconnect later).

## Sanctuary Zones

The system supports 16 predefined zones:

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
13. Foxes/Raccoons/Koy/Coati/Owls
14. Vultures
15. Ant Eater
16. Ostriches

Each zone can have its own checklist and status tracking.

## Templates

### entity.md

Generic template for topics, concepts, entities, or procedures.

**Front-matter fields:**
- `title`, `tags`, `summary`, `source_file`, `generated_at`

### zone.md

For sanctuary zones with daily monitoring requirements.

**Front-matter fields:**
- `zone`, `assigned_to`, `last_checked`, `status`
- `stale_warning_threshold_minutes` (default 480 = 8 hours)
- **`approval_needed`** (boolean; used to flag trainee-generated content for Director review)
- `source_file`, `generated_at`

### checklist.md

For task lists tied to zones or processes.

**Front-matter fields:**
- `checklist_for_zone`, `checklist_id`, `created_at`, `last_updated`, `created_by`

## Trainee Guardrails

If a checklist update comes from a user flagged as **Trainee**:

1. The ingestion script sets `approval_needed: true` on the zone's wiki page
2. A log entry is created documenting the trainee submission
3. The Co-Teacher app reads `approval_needed` to show a Director oversight banner
4. Director must review and approve before the zone is marked active

## Environment Variables

### Required for Live Mode

- **ANTHROPIC_API_KEY**: Your Anthropic Claude API key (starts with `sk-...`)

Set in:
- Local shell: `export ANTHROPIC_API_KEY="sk-..."`
- GitHub Actions: Settings → Secrets → Actions → New repository secret named `ANTHROPIC_API_KEY`

## Modes

### Dry-Run (Default)

```bash
npm run dry-run
# or
node scripts/ingest-and-update.js --dry-run
```

- No network calls
- Writes files to `wiki/` and `log/` locally
- Does NOT commit or push
- Perfect for offline work or testing
- Network can reconnect later and changes will persist

### Live

```bash
npm start
# or
node scripts/ingest-and-update.js
```

- Requires `ANTHROPIC_API_KEY`
- Calls Anthropic Claude API
- Generates enhanced wiki markdown
- Logs API metadata (model, tokens, stop reason)
- In GitHub Actions: commits and pushes automatically

## API & Schema

### Anthropic API Call

The pipeline sends raw content + prompt to Claude:

```javascript
const ANTHROPIC_PROMPT = `
Convert the following raw source into a concise, well-structured markdown wiki page...
[Full prompt in scripts/ingest-and-update.js]
`;
```

Response is processed and stored in wiki pages.

### Run Log Schema

Each log entry includes:

```json
{
  "run_id": "uuid",
  "timestamp": "ISO-8601",
  "mode": "dry-run | live",
  "environment": { "has_anthropic_key": boolean },
  "files_processed": [
    {
      "source_filename": "...",
      "source_checksum": "sha256-abbrev",
      "generated_filename": "...",
      "generated_checksum": "sha256-abbrev",
      "action": "created | updated | skipped | error",
      "anthropic_response_meta": {
        "model": "claude-...",
        "tokens_in": 123,
        "tokens_out": 456
      },
      "error_message": "if applicable"
    }
  ],
  "summary": { "total_files_scanned": 1, "files_created": 1, "..." }
}
```

## Security & Best Practices

- **No secrets in logs**: Environment variables like `ANTHROPIC_API_KEY` are masked
- **Dry-run offline-first**: Local writes persist until network is available
- **Validation before commit**: Run logs are validated before being committed in GitHub Actions
- **Checksum tracking**: All files tracked by SHA256 to detect changes
- **Audit trail**: Every run logged indefinitely for learning and compliance

## Troubleshooting

### "raw/ directory not found"

```bash
mkdir -p raw
echo "Example content" > raw/test.txt
npm run dry-run
```

### Anthropic API Error

Check that:
1. `ANTHROPIC_API_KEY` is set correctly: `echo $ANTHROPIC_API_KEY`
2. API key is valid (starts with `sk-`)
3. Account has credit/quota
4. Network connectivity is available

In dry-run mode, API errors are skipped and local rendering is used.

### Checksum Mismatch

Run validation:

```bash
npm run validate -- --latest
```

This checks that all generated wiki files match their log checksums.

### Git Push Failed in Workflow

If the workflow fails to push:
1. Check repo permissions (Settings → Actions)
2. Ensure the branch exists
3. Review the Actions log output

## Contributing

- Add raw source files to `raw/`
- Run `npm run dry-run` to test locally
- Review generated wiki in `wiki/`
- Check logs in `log/`
- Commit changes and create a pull request if needed

## Development

### Scripts

- `npm start` - Run ingestion in live mode (requires ANTHROPIC_API_KEY)
- `npm run dry-run` - Run ingestion locally (no API calls)
- `npm run validate` - Validate logs (use with `--latest` or filename)

### Extending Templates

1. Create new template in `schema/templates/`
2. Update `schema/README.md` with field documentation
3. Modify `ingest-and-update.js` to detect and use new template
4. Commit and test

## References

- [Karpathy's LLM Wiki Gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
- [Anthropic Claude API Docs](https://docs.anthropic.com/Claude/reference/getting-started-with-the-api)

## License

MIT

---

**Last Updated:** 2026-09-06  
**Version:** 0.1.0  
**Task Manager for Animal Sanctuary Management and Employees**
