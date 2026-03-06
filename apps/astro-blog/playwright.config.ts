import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    baseURL: 'http://127.0.0.1:4173',
  },
  webServer: {
    command: 'pnpm run build && node ./scripts/preview-static.mjs --host 127.0.0.1 --port 4173',
    env: {
      ASTRO_TELEMETRY_DISABLED: '1',
      XDG_CONFIG_HOME: '/tmp/astro-config',
    },
    port: 4173,
    timeout: 300_000,
    reuseExistingServer: true,
  },
  testDir: 'e2e',
});
