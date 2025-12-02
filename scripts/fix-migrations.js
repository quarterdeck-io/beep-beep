#!/usr/bin/env node

/**
 * Script to resolve failed Prisma migrations on Render
 * This script resolves the failed baseline migration before applying new ones
 */

const { execSync } = require('child_process');

console.log('🔧 Starting migration deployment...');

// Deploy migrations
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
  console.error('Please check Render logs for details');
  process.exit(1)
}

