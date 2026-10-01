import { bindings, defineConfig } from 'cf/config';

export default defineConfig({
  worker: {
    name: 'estrilda',
    compatibilityDate: '2025-06-27',
    entrypoint: 'worker/index.mjs',
    assets: {
      runWorkerFirst: true,
    },
    env: {
      ASSETS: bindings.assets(),
    },
  },
});
