#!/usr/bin/env node

import { spawn } from 'child_process';
import { existsSync } from 'fs';

function runCommand(command, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Running: ${command}`);
    
    const child = spawn('sh', ['-c', command], {
      stdio: 'inherit',
      ...options
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}: ${command}`));
      }
    });
    
    child.on('error', reject);
  });
}

async function ensurePackagesBuilt() {
  // 固定のパッケージパス（2つだけなので抽象化は不要）
  const packages = [
    'packages/content-processor/dist',
    'packages/cloudinary-utils/dist'
  ];
  
  const missingBuilds = packages.filter(path => !existsSync(path));
  
  if (missingBuilds.length > 0) {
    console.log('🔨 Building workspace packages...');
    await runCommand('pnpm run build:packages');
    console.log('✅ Packages built successfully!');
  } else {
    console.log('✅ All packages already built');
  }
}

async function startDevelopment() {
  try {
    console.log('🚀 Starting development environment...\n');
    
    // Validate workspace
    await runCommand('node scripts/validate-workspace.js');
    
    // Ensure packages are built
    await ensurePackagesBuilt();
    
    // Start development with hot reload
    console.log('\n🎯 Starting dev servers...');
    await runCommand('concurrently "pnpm run dev:packages" "pnpm --filter svelte-blog dev"');
    
  } catch (error) {
    console.error('\n❌ Development startup failed:');
    console.error(error.message);
    console.error('\n🔧 Try these steps:');
    console.error('   1. pnpm install');
    console.error('   2. pnpm run build:packages'); 
    console.error('   3. pnpm run dev');
    process.exit(1);
  }
}

startDevelopment();