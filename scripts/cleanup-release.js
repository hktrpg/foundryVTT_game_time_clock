#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Cleanup Release Script
 * Usage: node scripts/cleanup-release.js [version]
 * 
 * This script helps clean up existing tags and releases for a specific version
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

function runCommand(command, description) {
  try {
    console.log(`🔄 ${description}...`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
  return true;
}

function main() {
  const args = process.argv.slice(2);
  const targetVersion = args[0];
  
  if (!targetVersion) {
    console.log('Usage: node scripts/cleanup-release.js [version]');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/cleanup-release.js 2.0.1');
    console.log('  node scripts/cleanup-release.js 2.0.0');
    console.log('');
    console.log('This will:');
    console.log('1. Delete local tag if it exists');
    console.log('2. Delete remote tag if it exists');
    console.log('3. Allow you to recreate the release');
    process.exit(1);
  }
  
  const moduleData = readModuleJson();
  const currentVersion = moduleData.version;
  
  console.log(`📦 Current version in module.json: ${currentVersion}`);
  console.log(`🎯 Target version to cleanup: ${targetVersion}`);
  console.log('');
  
  const tagName = `v${targetVersion}`;
  
  // Check if local tag exists
  const localTagExists = runCommand(`git tag -l | grep -q "^${tagName}$"`, 'Checking local tag');
  
  // Check if remote tag exists
  const remoteTagExists = runCommand(`git ls-remote --tags origin | grep -q "refs/tags/${tagName}$"`, 'Checking remote tag');
  
  console.log('');
  console.log('🧹 Starting cleanup process...');
  console.log('');
  
  // Delete local tag if it exists
  if (localTagExists) {
    console.log(`🗑️  Deleting local tag: ${tagName}`);
    runCommand(`git tag -d ${tagName}`, 'Delete local tag');
  } else {
    console.log(`ℹ️  Local tag ${tagName} does not exist`);
  }
  
  // Delete remote tag if it exists
  if (remoteTagExists) {
    console.log(`🗑️  Deleting remote tag: ${tagName}`);
    runCommand(`git push origin --delete ${tagName}`, 'Delete remote tag');
  } else {
    console.log(`ℹ️  Remote tag ${tagName} does not exist`);
  }
  
  console.log('');
  console.log('🎉 Cleanup completed!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Update version in module.json if needed');
  console.log('2. Commit and push changes');
  console.log('3. The auto-release workflow will create a new release');
  console.log('');
  console.log('Or run: npm run release:patch (or minor/major)');
}

if (require.main === module) {
  main();
}

module.exports = {
  readModuleJson,
  runCommand
};
