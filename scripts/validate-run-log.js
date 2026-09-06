#!/usr/bin/env node

/**
 * validate-run-log.js
 * 
 * Validates ingestion run logs for consistency and safety
 * 
 * Usage:
 *   node scripts/validate-run-log.js log/run-2026-09-06T10-30-00Z.json
 *   node scripts/validate-run-log.js --latest   # Validate the latest log
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const LOG_DIR = path.join(__dirname, '..', 'log');
const WIKI_DIR = path.join(__dirname, '..', 'wiki');

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
 * Find the latest run log
 */
function findLatestLog() {
  const logFiles = fs.readdirSync(LOG_DIR)
    .filter(f => f.startsWith('run-') && f.endsWith('.json'))
    .sort()
    .reverse();
  
  if (logFiles.length === 0) {
    console.error('✗ No run logs found in log/ directory');
    process.exit(1);
  }
  
  return path.join(LOG_DIR, logFiles[0]);
}

/**
 * Validate a run log
 */
function validateRunLog(logPath) {
  console.log(`Validating: ${path.basename(logPath)}\n`);

  // Read and parse log
  let log;
  try {
    const content = fs.readFileSync(logPath, 'utf-8');
    log = JSON.parse(content);
  } catch (err) {
    console.error(`✗ Failed to read/parse log: ${err.message}`);
    process.exit(1);
  }

  // Validate structure
  console.log('Checking structure...');
  const errors = [];
  const warnings = [];

  if (!log.run_id) errors.push('Missing run_id');
  if (!log.timestamp) errors.push('Missing timestamp');
  if (!log.mode) errors.push('Missing mode');
  if (!log.files_processed || !Array.isArray(log.files_processed)) {
    errors.push('Invalid or missing files_processed array');
  }
  if (!log.summary) errors.push('Missing summary');

  // Check for secrets
  console.log('Checking for secrets...');
  const logText = JSON.stringify(log);
  const secretPatterns = [
    /ANTHROPIC_API_KEY/i,
    /sk-[a-zA-Z0-9]{20,}/,  // Anthropic key pattern
    /password\s*[:=]/i,
    /secret\s*[:=]/i,
    /token\s*[:=]/i
  ];

  secretPatterns.forEach(pattern => {
    if (pattern.test(logText)) {
      errors.push(`Potential secret leaked in log (matched pattern: ${pattern})`);
    }
  });

  // Validate files_processed entries
  console.log('Checking file entries...');
  log.files_processed.forEach((entry, idx) => {
    if (!entry.source_filename) errors.push(`Entry ${idx}: missing source_filename`);
    if (!entry.source_path) errors.push(`Entry ${idx}: missing source_path`);
    if (!entry.action) errors.push(`Entry ${idx}: missing action`);
    
    const validActions = ['created', 'updated', 'skipped', 'error'];
    if (!validActions.includes(entry.action)) {
      errors.push(`Entry ${idx}: invalid action "${entry.action}"`);
    }

    // If file was created or updated, check wiki file exists
    if ((entry.action === 'created' || entry.action === 'updated') && entry.generated_filename) {
      const wikiPath = path.join(WIKI_DIR, entry.generated_filename);
      if (!fs.existsSync(wikiPath)) {
        errors.push(`Entry ${idx}: generated file not found (${entry.generated_filename})`);
      } else {
        // Verify checksum
        const wikiContent = fs.readFileSync(wikiPath, 'utf-8');
        const actualChecksum = computeChecksum(wikiContent);
        if (entry.generated_checksum && entry.generated_checksum !== actualChecksum) {
          warnings.push(`Entry ${idx}: checksum mismatch for ${entry.generated_filename}`);
        }
      }
    }

    // Check for error without error_message
    if (entry.action === 'error' && !entry.error_message) {
      warnings.push(`Entry ${idx}: action is 'error' but no error_message`);
    }
  });

  // Check summary consistency
  console.log('Checking summary...');
  const actualCounts = {
    created: log.files_processed.filter(f => f.action === 'created').length,
    updated: log.files_processed.filter(f => f.action === 'updated').length,
    skipped: log.files_processed.filter(f => f.action === 'skipped').length,
    errors: log.files_processed.filter(f => f.action === 'error').length
  };

  if (log.summary.files_created !== actualCounts.created) {
    errors.push(`Summary mismatch: files_created (${log.summary.files_created} vs ${actualCounts.created})`);
  }
  if (log.summary.files_updated !== actualCounts.updated) {
    errors.push(`Summary mismatch: files_updated (${log.summary.files_updated} vs ${actualCounts.updated})`);
  }
  if (log.summary.files_skipped !== actualCounts.skipped) {
    errors.push(`Summary mismatch: files_skipped (${log.summary.files_skipped} vs ${actualCounts.skipped})`);
  }
  if (log.summary.errors !== actualCounts.errors) {
    errors.push(`Summary mismatch: errors (${log.summary.errors} vs ${actualCounts.errors})`);
  }

  // Report results
  console.log('\n' + '='.repeat(60));
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✓ Validation passed!');
  } else if (errors.length === 0) {
    console.log('✓ Validation passed with warnings');
  } else {
    console.log('✗ Validation failed');
  }

  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(e => console.log(`  - ${e}`));
  }

  if (warnings.length > 0) {
    console.log('\nWarnings:');
    warnings.forEach(w => console.log(`  - ${w}`));
  }

  console.log('\nRun Details:');
  console.log(`  Run ID: ${log.run_id}`);
  console.log(`  Timestamp: ${log.timestamp}`);
  console.log(`  Mode: ${log.mode}`);
  console.log(`  Files processed: ${log.files_processed.length}`);
  console.log(`  Summary:`, log.summary);

  console.log('='.repeat(60));

  if (errors.length > 0) {
    process.exit(1);
  }
}

// Main
const args = process.argv.slice(2);
let logPath;

if (args.includes('--latest')) {
  logPath = findLatestLog();
} else if (args[0]) {
  logPath = args[0];
  if (!path.isAbsolute(logPath)) {
    logPath = path.join(LOG_DIR, logPath);
  }
} else {
  console.log('Usage:');
  console.log('  node scripts/validate-run-log.js <log-file>');
  console.log('  node scripts/validate-run-log.js --latest');
  process.exit(0);
}

validateRunLog(logPath);
