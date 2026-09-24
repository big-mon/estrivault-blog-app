import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repository = fileURLToPath(new URL('../', import.meta.url));

const workflow = readFileSync(
  new URL('../.github/workflows/refresh-ogp-metadata.yml', import.meta.url),
  'utf8',
);
function step(name) {
  const block = workflow.split(`      - name: ${name}\n`)[1]?.split('\n      - name: ')[0];
  assert.ok(block, `Missing step: ${name}`);
  assert.match(block, / {8}shell: bash\n/);
  return {
    block,
    script: block.split('        run: |\n')[1].replace(/^ {10}/gm, ''),
  };
}

test('PR handling edits only same-repository open PRs and propagates search failures', () => {
  const directory = mkdtempSync(path.join(repository, '.ogp-workflow-'));
  try {
    for (const scenario of [
      'open',
      'fork',
      'fork-and-open',
      'merged',
      'closed',
      'none',
      'failure',
    ]) {
      const pulls = [];
      if (scenario.startsWith('fork')) pulls.push({ number: 999, isCrossRepository: true });
      if (scenario === 'open' || scenario === 'fork-and-open') {
        pulls.push({ number: 321, isCrossRepository: false });
      }
      const result = spawnSync(
        '/bin/bash',
        [
          '--noprofile',
          '--norc',
          '-e',
          '-o',
          'pipefail',
          '-c',
          `
          gh() {
            printf '%s\\n' "$*" >&2
            case "$1 $2" in
              'pr list')
                [[ "$SCENARIO" != failure ]] || return 42
                while [[ "$1" != --jq ]]; do shift; done
                printf '%s' "$PULLS" | jq -r "$2 // empty"
                return $? ;;
              'pr view')
                [[ "$SCENARIO" == open || "$SCENARIO" == merged || "$SCENARIO" == closed ]] ;;
              'pr edit'|'pr create') return 0 ;;
              *) return 99 ;;
            esac
          }
          ${step('Open pull request').script}`,
        ],
        {
          cwd: directory,
          env: {
            SCENARIO: scenario,
            PATH: process.env.PATH,
            PULLS: JSON.stringify(pulls),
            UPDATE_BRANCH: 'codex/refresh-ogp-metadata',
            GITHUB_REPOSITORY: 'example/blog',
          },
          encoding: 'utf8',
          timeout: 5000,
        },
      );
      assert.ifError(result.error);
      assert.equal(result.status, scenario === 'failure' ? 42 : 0, scenario);
      const calls = result.stderr.trim().split('\n');
      assert.equal(
        calls[0],
        'pr list --state open --base main --head codex/refresh-ogp-metadata --repo example/blog --json number,isCrossRepository --jq map(select(.isCrossRepository == false))[0].number',
        scenario,
      );
      const metadata =
        '--title chore: refresh OGP metadata --body Automated refresh of content/ogp-metadata.json.';
      assert.deepEqual(
        calls.slice(1),
        scenario === 'failure' ? []
        : scenario === 'open' || scenario === 'fork-and-open' ?
          [`pr edit 321 --repo example/blog ${metadata}`]
        : [
            `pr create --repo example/blog --base main --head codex/refresh-ogp-metadata ${metadata}`,
          ],
        scenario,
      );
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('unchanged metadata keeps both commit/push and PR steps disabled', () => {
  for (const name of ['Commit metadata changes', 'Open pull request']) {
    assert.match(step(name).block, / {8}if: steps\.metadata-diff\.outputs\.changed == 'true'\n/);
  }
  const directory = mkdtempSync(path.join(repository, '.ogp-workflow-'));
  try {
    const output = path.join(directory, 'github-output');
    const result = spawnSync(
      '/bin/bash',
      [
        '--noprofile',
        '--norc',
        '-e',
        '-o',
        'pipefail',
        '-c',
        `git() { [[ "$*" == 'diff --quiet -- content/ogp-metadata.json' ]]; }
      ${step('Stop if metadata did not change').script}`,
      ],
      { cwd: directory, env: { GITHUB_OUTPUT: output }, encoding: 'utf8', timeout: 5000 },
    );
    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(readFileSync(output, 'utf8'), 'changed=false\n');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
