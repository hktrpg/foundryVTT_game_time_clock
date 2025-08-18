#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Version bump utility for FoundryVTT modules
 * Usage: node scripts/version-bump.js [major|minor|patch] [--dry-run]
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

function main() {
  const args = process.argv.slice(2);
  const bumpType = args[0];
  const isDryRun = args.includes('--dry-run');
  
  if (!bumpType) {
    console.log('Usage: node scripts/version-bump.js [major|minor|patch] [--dry-run]');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/version-bump.js patch');
    console.log('  node scripts/version-bump.js minor --dry-run');
    console.log('  node scripts/version-bump.js major');
    process.exit(1);
  }
  
  const moduleData = readModuleJson();
  const currentVersion = moduleData.version;
  
  console.log(`Current version: ${currentVersion}`);
  
  try {
    validateVersion(currentVersion);
    const newVersion = bumpVersion(currentVersion, bumpType);
    
    console.log(`New version: ${newVersion}`);
    
    if (isDryRun) {
      console.log('🔍 Dry run - no changes made');
      return;
    }
    
    // Update the version in module.json
    moduleData.version = newVersion;
    writeModuleJson(moduleData);
    
    console.log(`✅ Version bumped from ${currentVersion} to ${newVersion}`);
    console.log('');
    console.log('Next steps:');
    console.log(`1. Commit the changes: git add module.json && git commit -m "Bump version to ${newVersion}"`);
    console.log(`2. Create a tag: git tag v${newVersion}`);
    console.log(`3. Push changes: git push && git push --tags`);
    console.log(`4. The CI/CD pipeline will automatically create a release`);
    
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
