#!/usr/bin/env node

/**
 * Script to find all hardcoded localhost API URLs in the codebase
 * Run this to identify files that need updating for production deployment
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Searching for hardcoded localhost URLs...\n');

try {
  // Search for localhost:5000 references
  const result = execSync(
    'grep -r "localhost:5000" --include="*.tsx" --include="*.ts" --include="*.jsx" --include="*.js" --exclude-dir=node_modules --exclude-dir=dist .',
    { cwd: __dirname, encoding: 'utf-8' }
  );
  
  console.log('❌ Found hardcoded URLs in the following files:\n');
  console.log(result);
  console.log('\n⚠️  Replace these with:');
  console.log('   import { getApiUrl } from "@/config/api";');
  console.log('   const response = await fetch(getApiUrl("/api/..."), {...});');
  console.log('\n   OR use environment variable directly:');
  console.log('   const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";');
  
} catch (error) {
  if (error.status === 1) {
    console.log('✅ No hardcoded localhost:5000 URLs found!');
    console.log('   Your codebase is ready for deployment.');
  } else {
    console.error('Error running search:', error.message);
  }
}
