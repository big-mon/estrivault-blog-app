#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

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

const REQUIRED_PNPM = getRequiredPnpmVersion();

function hasPnpmInPath() {
  try {
    execSync('pnpm --version', { stdio: 'ignore', shell: true });
    return true;
  } catch {
    return false;
  }
}

function printInstallGuide() {
  console.error('This repository requires pnpm.');
  console.error('Install pnpm and retry:');
  console.error(`  npm install -g pnpm@${REQUIRED_PNPM}`);
  console.error('Then run:');
  console.error('  pnpm install');
  console.error('Alternative (if you prefer corepack):');
  console.error('  corepack enable');
  console.error(`  corepack prepare pnpm@${REQUIRED_PNPM} --activate`);
}

function main() {
  const userAgent = process.env.npm_config_user_agent ?? '';
  const isPnpmClient = userAgent.includes('pnpm/');

  if (isPnpmClient) {
    process.exit(0);
  }

  if (!hasPnpmInPath()) {
    printInstallGuide();
    process.exit(1);
  }

  console.error('Detected non-pnpm package manager.');
  console.error('Use pnpm for this repository:');
  console.error('  pnpm install');
  process.exit(1);
}

main();
