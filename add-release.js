#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('📝 Add New Release to Changelog\n');

  // Read existing changelog
  const changelogPath = path.join(__dirname, 'lib', 'changelog.json');
  const changelog = JSON.parse(fs.readFileSync(changelogPath, 'utf8'));

  // Get version
  const version = await question('Version (e.g., 1.3.0): ');
  if (!version) {
    console.log('❌ Version is required');
    rl.close();
    return;
  }

  // Get date (default to today)
  const today = new Date();
  const defaultDate = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const dateInput = await question(`Date (default: ${defaultDate}): `);
  const date = dateInput || defaultDate;

  // Get changes
  console.log('\nEnter changes (one per line, empty line to finish):');
  const changes = [];
  let changeNum = 1;
  while (true) {
    const change = await question(`  ${changeNum}. `);
    if (!change) break;
    changes.push(change);
    changeNum++;
  }

  if (changes.length === 0) {
    console.log('❌ At least one change is required');
    rl.close();
    return;
  }

  // Mark all existing releases as not latest
  changelog.releases.forEach(release => {
    release.isLatest = false;
  });

  // Add new release at the beginning
  changelog.releases.unshift({
    version,
    date,
    isLatest: true,
    changes
  });

  // Write updated changelog
  fs.writeFileSync(changelogPath, JSON.stringify(changelog, null, 2) + '\n');

  console.log(`\n✅ Release v${version} added successfully!`);
  console.log(`📍 Location: lib/changelog.json`);
  rl.close();
}

main().catch(err => {
  console.error('❌ Error:', err);
  rl.close();
  process.exit(1);
});
