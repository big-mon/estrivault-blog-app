#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const PACKAGES = [
  {
    name: '@estrivault/content-processor',
    path: 'packages/content-processor',
    distPath: 'packages/content-processor/dist',
  },
  {
    name: '@estrivault/cloudinary-utils',
    path: 'packages/cloudinary-utils',
    distPath: 'packages/cloudinary-utils/dist',
  },
  {
    name: '@estrivault/og-image-generator',
    path: 'packages/og-image-generator',
    distPath: 'packages/og-image-generator/dist',
  },
];

const __dirname = dirname(fileURLToPath(import.meta.url));

function getRequiredPnpmVersion() {
  const packageJsonPath = join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  const packageManager = packageJson.packageManager;

  if (typeof packageManager !== 'string') {
    throw new Error('packageManager is not defined in package.json');
  }

  const match = packageManager.match(/^pnpm@(.+)$/);
  if (!match) {
    throw new Error(`Unexpected packageManager value: ${packageManager}`);
  }

  return match[1];
}

const PNPM_VERSION = getRequiredPnpmVersion();

function checkPackageExists(pkg) {
  const packagePath = join(process.cwd(), pkg.path, 'package.json');
  if (!existsSync(packagePath)) {
    console.error(`ERROR: Package ${pkg.name} not found at ${pkg.path}`);
    return false;
  }
  return true;
}

function checkDistExists(pkg) {
  const distPath = join(process.cwd(), pkg.distPath);
  if (!existsSync(distPath)) {
    console.warn(`WARN: Build directory missing for ${pkg.name}`);
    console.warn('  Run: pnpm run build:packages');
    return false;
  }
  return true;
}

function checkPnpmInstalled() {
  try {
    execSync('pnpm --version', { stdio: 'ignore', shell: true });
    return true;
  } catch {
    console.error('ERROR: pnpm is not installed or not in PATH');
    console.error('Install pnpm:');
    console.error(`  npm install -g pnpm@${PNPM_VERSION}`);
    console.error('Alternative (corepack):');
    console.error('  corepack enable');
    console.error(`  corepack prepare pnpm@${PNPM_VERSION} --activate`);
    console.error('Then run: pnpm install');
    return false;
  }
}

function main() {
  console.log('Validating workspace setup...\n');

  let allValid = true;

  if (!checkPnpmInstalled()) {
    allValid = false;
  }

  for (const pkg of PACKAGES) {
    if (!checkPackageExists(pkg)) {
      allValid = false;
    } else {
      console.log(`OK: Package ${pkg.name} found`);
    }

    if (!checkDistExists(pkg)) {
      allValid = false;
    } else {
      console.log(`OK: Build artifacts for ${pkg.name} found`);
    }
  }

  console.log();

  if (allValid) {
    console.log('OK: Workspace validation passed');
    console.log('You can now run: pnpm run dev');
  } else {
    console.log('ERROR: Workspace validation failed');
    console.log('\nQuick fix commands:');
    console.log('  pnpm install');
    console.log('  pnpm run build:packages');
    console.log('  pnpm run dev');
    process.exit(1);
  }
}

main();
