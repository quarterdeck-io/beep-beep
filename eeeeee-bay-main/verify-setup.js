#!/usr/bin/env node

/**
 * Quick setup verification script
 * Run with: node verify-setup.js
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const checks = []
let hasErrors = false

function check(name, condition, errorMessage) {
  const passed = condition()
  checks.push({ name, passed, errorMessage })
  if (!passed) {
    hasErrors = true
    console.error(`❌ ${name}: ${errorMessage}`)
  } else {
    console.log(`✅ ${name}`)
  }
}

console.log('🔍 Verifying local setup...\n')

// Check Node.js version
const nodeVersion = process.version
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])
check(
  'Node.js version',
  () => majorVersion >= 18,
  `Node.js 18+ required. Found: ${nodeVersion}`
)

// Check if package.json exists
check(
  'package.json exists',
  () => existsSync(join(__dirname, 'package.json')),
  'package.json not found'
)

// Check if node_modules exists
check(
  'Dependencies installed',
  () => existsSync(join(__dirname, 'node_modules')),
  'Run "npm install" to install dependencies'
)

// Check if .env file exists
const envExists = existsSync(join(__dirname, '.env'))
check(
  '.env file exists',
  () => envExists,
  'Create .env file with eBay API credentials (see README.md)'
)

// Check .env contents if it exists
if (envExists) {
  try {
    const envContent = readFileSync(join(__dirname, '.env'), 'utf8')
    
    check(
      'VITE_EBAY_CLIENT_ID set',
      () => envContent.includes('VITE_EBAY_CLIENT_ID=') && 
            !envContent.includes('VITE_EBAY_CLIENT_ID=your_app_id_here'),
      'Set VITE_EBAY_CLIENT_ID in .env file'
    )
    
    check(
      'VITE_EBAY_CLIENT_SECRET set',
      () => envContent.includes('VITE_EBAY_CLIENT_SECRET=') && 
            !envContent.includes('VITE_EBAY_CLIENT_SECRET=your_cert_id_here'),
      'Set VITE_EBAY_CLIENT_SECRET in .env file'
    )
    
    check(
      'VITE_EBAY_SANDBOX set',
      () => envContent.includes('VITE_EBAY_SANDBOX='),
      'Set VITE_EBAY_SANDBOX in .env file (true for testing)'
    )
  } catch (error) {
    console.error('❌ Error reading .env file:', error.message)
    hasErrors = true
  }
}

// Check if TypeScript config exists
check(
  'TypeScript config exists',
  () => existsSync(join(__dirname, 'tsconfig.json')),
  'tsconfig.json not found'
)

// Check if vitest config exists
check(
  'Vitest config exists',
  () => existsSync(join(__dirname, 'vitest.config.ts')),
  'vitest.config.ts not found'
)

// Summary
console.log('\n' + '='.repeat(50))
if (hasErrors) {
  console.log('❌ Setup verification failed. Please fix the issues above.')
  console.log('\nNext steps:')
  console.log('1. Install dependencies: npm install')
  console.log('2. Create .env file with your eBay API credentials')
  console.log('3. Run this script again to verify')
  process.exit(1)
} else {
  console.log('✅ All checks passed!')
  console.log('\nNext steps:')
  console.log('1. Run tests: npm run test')
  console.log('2. Check types: npm run typecheck')
  console.log('3. Start dev server: npm run dev')
  process.exit(0)
}

