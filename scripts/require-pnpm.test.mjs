import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

const scriptPath = path.join(import.meta.dirname, 'require-pnpm.js');
const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

function run(script, bin, userAgent) {
  const env = { PATH: bin };
  if (userAgent !== undefined) env.npm_config_user_agent = userAgent;
  const result = spawnSync(process.execPath, [script], {
    env,
    encoding: 'utf8',
    timeout: 5000,
  });
  assert.ifError(result.error);
  assert.equal(result.signal, null);
  return result;
}

test('preinstall remains registered to the real enforcement script', () => {
  assert.equal(packageJson.scripts.preinstall, 'node scripts/require-pnpm.js');
});

test('client decisions and guidance never depend on or execute pnpm in PATH', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'require-pnpm-'));
  try {
    const bin = path.join(directory, 'bin');
    const emptyBin = path.join(directory, 'empty');
    const marker = path.join(bin, 'pnpm.invoked');
    mkdirSync(bin);
    mkdirSync(emptyBin);
    writeFileSync(path.join(bin, 'pnpm'), '#!/bin/sh\nprintf invoked > "$0.invoked"\n', {
      mode: 0o755,
    });
    const version = packageJson.packageManager.match(/^pnpm@(.+)$/)[1];
    let commonGuide;
    for (const searchPath of [emptyBin, bin]) {
      for (const userAgent of [
        `pnpm/${version}`,
        `npm/10 pnpm/${version} node/v22`,
        'npm/10',
        'yarn/1',
        undefined,
      ]) {
        const result = run(scriptPath, searchPath, userAgent);
        assert.equal(existsSync(marker), false, 'pnpm must not be invoked');
        assert.equal(result.stdout, '');
        if (userAgent?.includes('pnpm/')) {
          assert.equal(result.status, 0);
          assert.equal(result.stderr, '');
        } else {
          assert.equal(result.status, 1);
          assert.match(result.stderr, /This repository requires pnpm\./);
          assert.ok(result.stderr.includes(`npm install -g pnpm@${version}`));
          assert.ok(result.stderr.includes(`corepack prepare pnpm@${version} --activate`));
          assert.ok(result.stderr.includes('  pnpm install\n'));
          commonGuide ??= result.stderr;
          assert.equal(result.stderr, commonGuide);
        }
      }
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('packageManager validation is retained for every client', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'require-pnpm-validation-'));
  try {
    mkdirSync(path.join(directory, 'scripts'));
    const script = path.join(directory, 'scripts', 'require-pnpm.js');
    copyFileSync(scriptPath, script);
    for (const packageManager of [undefined, null, 123, 'npm@10', 'pnpm@']) {
      writeFileSync(
        path.join(directory, 'package.json'),
        JSON.stringify({ type: 'module', packageManager }),
      );
      let expectedMessage = 'packageManager is not defined in package.json';
      if (typeof packageManager === 'string') {
        expectedMessage = `Unexpected packageManager value: ${packageManager}`;
      }
      for (const userAgent of ['pnpm/11', 'npm/10', 'yarn/1', undefined]) {
        const result = run(script, directory, userAgent);
        assert.equal(result.status, 1);
        assert.equal(result.stdout, '');
        assert.ok(result.stderr.includes(expectedMessage));
      }
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
