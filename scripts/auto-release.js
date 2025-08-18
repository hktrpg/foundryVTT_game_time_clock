#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Auto Release Helper Script
 * Usage: node scripts/auto-release.js [major|minor|patch] [commit-message]
 */

const MODULE_JSON_PATH = path.join(__dirname, '..', 'module.json');

function readModuleJson() {
  try {
    const content = fs.readFileSync(MODULE_JSON_PATH, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading module.json:', error.message);
    process.exit(1);
  }
}

function writeModuleJson(moduleData) {
  try {
    const content = JSON.stringify(moduleData, null, 2);
    fs.writeFileSync(MODULE_JSON_PATH, content + '\n');
    console.log('✅ Updated module.json');
  } catch (error) {
    console.error('Error writing module.json:', error.message);
    process.exit(1);
  }
}

function bumpVersion(currentVersion, bumpType) {
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  
  switch (bumpType) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error(`Invalid bump type: ${bumpType}. Use major, minor, or patch.`);
  }
}

function validateVersion(version) {
  const versionRegex = /^\d+\.\d+\.\d+$/;
  if (!versionRegex.test(version)) {
    throw new Error(`Invalid version format: ${version}. Expected format: x.y.z`);
  }
}

function runCommand(command, description) {
  try {
    console.log(`🔄 ${description}...`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

function main() {
  const args = process.argv.slice(2);
  const bumpType = args[0];
  const commitMessage = args[1] || `Bump version to`;
  
  if (!bumpType) {
    console.log('Usage: node scripts/auto-release.js [major|minor|patch] [commit-message]');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/auto-release.js patch');
    console.log('  node scripts/auto-release.js minor "Add new feature"');
    console.log('  node scripts/auto-release.js major "Breaking changes"');
    console.log('');
    console.log('This will:');
    console.log('1. Bump version in module.json');
    console.log('2. Commit the changes');
    console.log('3. Push to trigger auto-release');
    process.exit(1);
  }
  
  const moduleData = readModuleJson();
  const currentVersion = moduleData.version;
  
  console.log(`📦 Current version: ${currentVersion}`);
  
  try {
    validateVersion(currentVersion);
    const newVersion = bumpVersion(currentVersion, bumpType);
    
    console.log(`🆕 New version: ${newVersion}`);
    
    // Update the version in module.json
    moduleData.version = newVersion;
    writeModuleJson(moduleData);
    
    // Commit and push changes
    const finalCommitMessage = commitMessage === 'Bump version to' 
      ? `Bump version to ${newVersion}`
      : `${commitMessage} (v${newVersion})`;
    
    runCommand('git add module.json', 'Stage module.json');
    runCommand(`git commit -m "${finalCommitMessage}"`, 'Commit changes');
    runCommand('git push', 'Push to trigger auto-release');
    
    console.log('');
    console.log('🎉 Auto-release process initiated!');
    console.log('');
    console.log('What happens next:');
    console.log('1. GitHub Actions will detect the version change');
    console.log('2. Auto-release workflow will create a tag');
    console.log('3. GitHub release will be created automatically');
    console.log('4. Module will be packaged and uploaded');
    console.log('');
    console.log('You can monitor the progress at:');
    console.log('https://github.com/hktrpg/foundryVTT_game_time_clock/actions');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  readModuleJson,
  writeModuleJson,
  bumpVersion,
  validateVersion
};
