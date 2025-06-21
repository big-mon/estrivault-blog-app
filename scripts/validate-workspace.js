#!/usr/bin/env node

import { existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { PACKAGES } from './workspace-config.js';

function checkPackageExists(pkg) {
  const packagePath = join(process.cwd(), pkg.path, 'package.json');
  if (!existsSync(packagePath)) {
    console.error(`❌ Package ${pkg.name} not found at ${pkg.path}`);
    return false;
  }
  return true;
}

function checkDistExists(pkg) {
  const distPath = join(process.cwd(), pkg.distPath);
  if (!existsSync(distPath)) {
    console.warn(`⚠️  Build directory missing for ${pkg.name}`);
    console.warn(`   Run: pnpm run build:packages`);
    return false;
  }
  return true;
}

function checkPnpmInstalled() {
  try {
    execSync('pnpm --version', { stdio: 'ignore' });
    return true;
  } catch {
    console.error('❌ pnpm is not installed or not in PATH');
    console.error('   Install pnpm: npm install -g pnpm');
    return false;
  }
}

function main() {
  console.log('🔍 Validating workspace setup...\n');
  
  let allValid = true;
  
  // Check pnpm
  if (!checkPnpmInstalled()) {
    allValid = false;
  }
  
  // Check packages
  for (const pkg of PACKAGES) {
    if (!checkPackageExists(pkg)) {
      allValid = false;
    } else {
      console.log(`✅ Package ${pkg.name} found`);
    }
    
    if (!checkDistExists(pkg)) {
      allValid = false;
    } else {
      console.log(`✅ Build artifacts for ${pkg.name} found`);
    }
  }
  
  console.log();
  
  if (allValid) {
    console.log('✅ Workspace validation passed!');
    console.log('🚀 You can now run: pnpm run dev');
  } else {
    console.log('❌ Workspace validation failed!');
    console.log('\n🔧 Quick fix commands:');
    console.log('   pnpm install');
    console.log('   pnpm run build:packages');
    console.log('   pnpm run dev');
    process.exit(1);
  }
}

main();