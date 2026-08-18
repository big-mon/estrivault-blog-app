import { execFile as execFileCallback } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const execFile = promisify(execFileCallback);
const scriptPath = path.join(import.meta.dirname, 'clean-workspace-dist.mjs');

test('removes only the invoking workspace dist directory recursively', async () => {
  const workspaceDir = await mkdtemp(path.join(tmpdir(), 'clean-workspace-dist-'));
  const nestedDistFile = path.join(workspaceDir, 'dist', 'nested', 'output.txt');
  const siblingFile = path.join(workspaceDir, 'keep.txt');
  const siblingDir = path.join(workspaceDir, 'keep-directory');
  const siblingDirFile = path.join(siblingDir, 'keep.txt');

  try {
    await mkdir(path.dirname(nestedDistFile), { recursive: true });
    await mkdir(siblingDir);
    await writeFile(nestedDistFile, 'remove me');
    await writeFile(siblingFile, 'preserve me');
    await writeFile(siblingDirFile, 'preserve me too');

    await execFile(process.execPath, [scriptPath], { cwd: workspaceDir });

    await assert.rejects(readFile(nestedDistFile));
    await assert.equal(await readFile(siblingFile, 'utf8'), 'preserve me');
    await assert.equal(await readFile(siblingDirFile, 'utf8'), 'preserve me too');
  } finally {
    await rm(workspaceDir, { recursive: true, force: true });
  }
});
