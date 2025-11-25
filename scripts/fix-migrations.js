#!/usr/bin/env node

/**
 * Script to resolve failed Prisma migrations on Render
 * This script resolves the failed baseline migration before applying new ones
 */

const { execSync } = require('child_process');

console.log('🔧 Fixing failed migrations...');

// Always try to resolve the failed baseline migration first
// This is safe to run even if the migration is already resolved
console.log('🔧 Attempting to resolve failed baseline migration (if any)...');
try {
  execSync('npx prisma migrate resolve --rolled-back 20251126015216_baseline', {
    stdio: 'pipe', // Suppress output unless there's an error
    env: process.env
  });
  console.log('✅ Failed baseline migration resolved');
} catch (resolveError) {
  // This is expected if migration doesn't exist or is already resolved
  const errorOutput = resolveError.stderr?.toString() || resolveError.stdout?.toString() || '';
  if (errorOutput.includes('not in a failed state') || errorOutput.includes('not found')) {
    console.log('ℹ️  Baseline migration not in failed state (already resolved or doesn\'t exist)');
  } else {
    // Other errors might be important, but we'll continue anyway
    console.log('ℹ️  Could not resolve baseline migration (may already be resolved)');
  }
}

// Now deploy migrations
console.log('📦 Deploying migrations...');
try {
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: process.env
  });
  console.log('✅ All migrations applied successfully');
  process.exit(0);
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  // Try to resolve the baseline migration as a last resort
  try {
    console.log('🔄 Attempting to resolve baseline migration...');
    execSync('npx prisma migrate resolve --rolled-back 20251126015216_baseline', {
      stdio: 'pipe',
      env: process.env
    });
    // Retry deploy
    console.log('🔄 Retrying migration deploy...');
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: process.env
    });
    console.log('✅ Migration succeeded after resolving failed migration');
    process.exit(0);
  } catch (retryError) {
    console.error('❌ Final migration attempt failed');
    process.exit(1);
  }
}

