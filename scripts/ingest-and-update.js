#!/usr/bin/env node

/**
 * ingest-and-update.js
 * 
 * Karpathy LLM Wiki ingestion pipeline
 * Scans raw/ for source files → generates wiki markdown → logs provenance
 * 
 * Usage:
 *   node scripts/ingest-and-update.js         # Live mode (needs ANTHROPIC_API_KEY)
 *   node scripts/ingest-and-update.js --dry-run  # Dry-run mode (no API calls, local writes)
 * 
 * Modes:
 *   - dry-run: Writes files locally, no network calls, no push. Network can reconnect later.
 *   - live: Calls Anthropic API (if ANTHROPIC_API_KEY set), generates enhanced wiki, logs metadata
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const RAW_DIR = path.join(__dirname, '..', 'raw');
const WIKI_DIR = path.join(__dirname, '..', 'wiki');
const LOG_DIR = path.join(__dirname, '..', 'log');
const SCHEMA_DIR = path.join(__dirname, '..', 'schema', 'templates');

// Determine mode
const IS_DRY_RUN = process.argv.includes('--dry-run');
const HAS_ANTHROPIC_KEY = !!process.env.ANTHROPIC_API_KEY;
const MODE = IS_DRY_RUN ? 'dry-run' : (HAS_ANTHROPIC_KEY ? 'live' : 'dry-run');

console.log(`[llm-wiki] Starting ingestion in ${MODE} mode...`);

/**
 * Compute SHA256 checksum of a file
 */
function computeChecksum(content) {
  return crypto
    .createHash('sha256')
    .update(content)
    .digest('hex')
    .substring(0, 16);
}

/**
 * Sanitize filename for wiki directory
 */
function sanitizeFilename(filename) {
  return filename
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .toLowerCase();
}

/**
 * Read a template file
 */
function readTemplate(templateName) {
  const templatePath = path.join(SCHEMA_DIR, `${templateName}.md`);
  if (fs.existsSync(templatePath)) {
    return fs.readFileSync(templatePath, 'utf-8');
  }
  return null;
}

/**
 * Generate wiki markdown from raw content
 * In live mode with Anthropic, use LLM to generate enhanced content
 * In dry-run mode, use template-based local rendering
 */
async function generateWikiMarkdown(rawContent, sourceFilename, sourceChecksum) {
  const timestamp = new Date().toISOString();
  const sanitized = sanitizeFilename(sourceFilename);
  
  // Prompt to use for Anthropic
  const ANTHROPIC_PROMPT = `Convert the following raw source into a concise, well-structured markdown wiki page that follows the repository schema. Include:

- Front-matter with keys: title, source_file, source_path, generated_at, provenance_hash
- A 2–3 line summary under a 'Summary' heading
- A short 'Key points' bullet list
- 'Related' links section with suggested wiki link names
- 'Provenance' section containing a short snippet quoting the raw source (1–3 lines) and a note about the source file path

Preserve all factual content and create accessible, clean headings. Output only markdown.

Raw source:
${rawContent}`;

  let generatedMarkdown = '';
  let anthropicMeta = null;
  let error = null;

  if (MODE === 'live' && HAS_ANTHROPIC_KEY) {
    // Call Anthropic API
    try {
      console.log(`  → Calling Anthropic for ${sourceFilename}...`);
      const response = await callAnthropicAPI(ANTHROPIC_PROMPT);
      generatedMarkdown = response.content;
      anthropicMeta = {
        model: response.model || 'unknown',
        tokens_in: response.usage?.input_tokens || 0,
        tokens_out: response.usage?.output_tokens || 0,
        stop_reason: response.stop_reason || 'unknown'
      };
    } catch (err) {
      console.error(`  ✗ Anthropic API error: ${err.message}`);
      error = err.message;
      // Fall back to local rendering
      generatedMarkdown = generateLocalMarkdown(rawContent, sourceFilename, timestamp);
    }
  } else {
    // Dry-run or no API key: use local template-based rendering
    generatedMarkdown = generateLocalMarkdown(rawContent, sourceFilename, timestamp);
  }

  // Ensure YAML front-matter if not present
  if (!generatedMarkdown.startsWith('---')) {
    generatedMarkdown = `---
title: "${sanitized}"
source_file: "${sourceFilename}"
generated_at: "${timestamp}"
provenance_hash: "${sourceChecksum}"
---

${generatedMarkdown}`;
  }

  const generatedChecksum = computeChecksum(generatedMarkdown);
  const wikiFilename = `${sanitized}.md`;
  const wikiPath = path.join(WIKI_DIR, wikiFilename);

  return {
    wikiFilename,
    wikiPath,
    content: generatedMarkdown,
    generatedChecksum,
    anthropicMeta,
    error
  };
}

/**
 * Local rendering (no Anthropic)
 * Uses template-based approach
 */
function generateLocalMarkdown(rawContent, sourceFilename, timestamp) {
  const sanitized = sanitizeFilename(sourceFilename);
  
  // Extract first 100 chars as summary
  const summary = rawContent.substring(0, 150).replace(/\n/g, ' ').trim();

  // Build markdown
  let md = `---
title: "${sanitized}"
source_file: "${sourceFilename}"
generated_at: "${timestamp}"
---

## Summary

${summary}

## Content

\`\`\`
${rawContent}
\`\`\`

## Provenance

**Source:** raw/${sourceFilename}  
**Generated:** ${timestamp}

---

*Generated by llm-wiki ingestion pipeline (local mode)*`;

  return md;
}

/**
 * Call Anthropic Claude API
 * Requires ANTHROPIC_API_KEY environment variable
 * 
 * Uses Claude Haiku by default (cost-optimized, ~5x cheaper than Sonnet)
 * To upgrade: change model string to 'claude-3-5-sonnet-20241022' or 'claude-opus-4-1-20250805'
 */
async function callAnthropicAPI(prompt) {
  // Dynamic import for node-fetch or similar
  // For Node.js 18+, use built-in fetch
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const apiUrl = 'https://api.anthropic.com/v1/messages';

  const requestBody = {
    model: 'claude-3-5-haiku-20241022', // Use Haiku for cost efficiency (5x cheaper than Sonnet)
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    // Extract content from response
    const content = data.content[0]?.text || '';
    
    return {
      content,
      model: data.model,
      usage: data.usage,
      stop_reason: data.stop_reason
    };
  } catch (err) {
    throw new Error(`Failed to call Anthropic API: ${err.message}`);
  }
}

/**
 * Check if a file is new or changed
 */
function isFileChanged(rawPath, lastLog) {
  if (!fs.existsSync(rawPath)) return false;
  
  const content = fs.readFileSync(rawPath, 'utf-8');
  const currentChecksum = computeChecksum(content);
  
  // If no previous log, assume new
  if (!lastLog) return true;
  
  // Check if checksum changed
  return currentChecksum !== lastLog.source_checksum;
}

/**
 * Load the latest run log to track processed files
 */
function loadLastRunLog() {
  const logFiles = fs.readdirSync(LOG_DIR)
    .filter(f => f.startsWith('run-') && f.endsWith('.json'))
    .sort()
    .reverse();
  
  if (logFiles.length === 0) return null;
  
  const latestLog = JSON.parse(fs.readFileSync(path.join(LOG_DIR, logFiles[0]), 'utf-8'));
  return latestLog;
}

/**
 * Create a log entry for this run
 */
function createRunLog(processedFiles, summary) {
  const now = new Date();
  const isoTimestamp = now.toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const runId = crypto.randomUUID();

  const runLog = {
    run_id: runId,
    timestamp: now.toISOString(),
    mode: MODE,
    environment: {
      has_anthropic_key: HAS_ANTHROPIC_KEY,
      node_version: process.version,
      platform: process.platform
    },
    files_processed: processedFiles,
    summary: summary
  };

  const logFilename = `run-${isoTimestamp}Z.json`;
  const logPath = path.join(LOG_DIR, logFilename);
  
  fs.writeFileSync(logPath, JSON.stringify(runLog, null, 2), 'utf-8');
  console.log(`\n✓ Log written to ${logFilename}`);
  
  return { logFilename, runLog };
}

/**
 * Main ingestion logic
 */
async function main() {
  try {
    // Ensure directories exist
    [WIKI_DIR, LOG_DIR].forEach(dir => {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });

    if (!fs.existsSync(RAW_DIR)) {
      console.log('✗ raw/ directory not found. Exiting.');
      process.exit(0);
    }

    // Scan raw/ for files
    const rawFiles = fs.readdirSync(RAW_DIR)
      .filter(f => !f.startsWith('.'))
      .filter(f => fs.statSync(path.join(RAW_DIR, f)).isFile());

    if (rawFiles.length === 0) {
      console.log('ℹ No files in raw/ directory.');
      process.exit(0);
    }

    console.log(`Found ${rawFiles.length} file(s) in raw/\n`);

    // Load last run log to check for changes
    const lastRunLog = loadLastRunLog();
    const lastFileMap = {};
    if (lastRunLog) {
      lastRunLog.files_processed.forEach(f => {
        lastFileMap[f.source_filename] = f;
      });
    }

    // Process each file
    const processedFiles = [];
    let created = 0, updated = 0, skipped = 0, errors = 0;

    for (const filename of rawFiles) {
      const rawPath = path.join(RAW_DIR, filename);
      const rawContent = fs.readFileSync(rawPath, 'utf-8');
      const sourceChecksum = computeChecksum(rawContent);
      const lastFile = lastFileMap[filename];

      console.log(`Processing: ${filename}`);

      // Check if changed
      if (lastFile && lastFile.source_checksum === sourceChecksum) {
        console.log(`  ✓ Skipped (unchanged)`);
        processedFiles.push({
          source_filename: filename,
          source_path: `raw/${filename}`,
          source_checksum: sourceChecksum,
          action: 'skipped',
          generated_filename: lastFile.generated_filename,
          generated_checksum: lastFile.generated_checksum
        });
        skipped++;
        continue;
      }

      try {
        // Generate wiki markdown
        const result = await generateWikiMarkdown(rawContent, filename, sourceChecksum);

        // Write to wiki/
        fs.writeFileSync(result.wikiPath, result.content, 'utf-8');
        
        const action = lastFile ? 'updated' : 'created';
        console.log(`  ✓ ${action}: ${result.wikiFilename}`);

        // Record in log
        const fileEntry = {
          source_filename: filename,
          source_path: `raw/${filename}`,
          source_checksum: sourceChecksum,
          prompt_used: 'anthropic-default',
          generated_filename: result.wikiFilename,
          generated_checksum: result.generatedChecksum,
          action: action,
          anthropic_response_meta: result.anthropicMeta || null,
          error_message: result.error || null
        };

        processedFiles.push(fileEntry);
        action === 'created' ? created++ : updated++;
      } catch (err) {
        console.error(`  ✗ Error: ${err.message}`);
        processedFiles.push({
          source_filename: filename,
          source_path: `raw/${filename}`,
          source_checksum: sourceChecksum,
          action: 'error',
          error_message: err.message
        });
        errors++;
      }
    }

    // Create run log
    const summary = {
      total_files_scanned: rawFiles.length,
      files_created: created,
      files_updated: updated,
      files_skipped: skipped,
      errors: errors
    };

    const { logFilename, runLog } = createRunLog(processedFiles, summary);

    console.log(`
Summary:
  Created: ${created}
  Updated: ${updated}
  Skipped: ${skipped}
  Errors:  ${errors}
  Mode:    ${MODE}

Next steps:
  - Review changes in wiki/ directory
  - Check log/${logFilename} for details
  - Run: npm run validate -- log/${logFilename}
  - (In workflow: changes will be committed and pushed)
`);

  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

// Run
main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
