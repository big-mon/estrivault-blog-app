#!/usr/bin/env node

import { execSync } from 'child_process';

const REQUIRED_PNPM = '10.13.1';

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
