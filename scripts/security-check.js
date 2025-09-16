#!/usr/bin/env node

/**
 * Security check script for SikaSchool project
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔒 Running security checks...\n');

// Check 1: npm audit
console.log('1. Running npm audit...');
try {
  execSync('npm audit --audit-level=moderate', { stdio: 'inherit' });
  console.log('✅ npm audit passed\n');
} catch (error) {
  console.log('❌ npm audit found vulnerabilities\n');
}

// Check 2: TypeScript compilation
console.log('2. Running TypeScript type check...');
try {
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ TypeScript type check passed\n');
} catch (error) {
  console.log('❌ TypeScript type check failed\n');
}

// Check 3: ESLint
console.log('3. Running ESLint...');
try {
  execSync('npx eslint . --ext .ts,.tsx --max-warnings 0', { stdio: 'inherit' });
  console.log('✅ ESLint passed\n');
} catch (error) {
  console.log('❌ ESLint found issues\n');
}

// Check 4: Check for sensitive files
console.log('4. Checking for sensitive files...');
const sensitiveFiles = ['.env', '.env.local', '.env.production'];
const foundSensitiveFiles = sensitiveFiles.filter(file => 
  fs.existsSync(path.join(process.cwd(), file))
);

if (foundSensitiveFiles.length > 0) {
  console.log('⚠️  Found sensitive files:', foundSensitiveFiles.join(', '));
  console.log('   Make sure these are in .gitignore\n');
} else {
  console.log('✅ No sensitive files found in root\n');
}

// Check 5: Check .gitignore
console.log('5. Checking .gitignore...');
const gitignorePath = path.join(process.cwd(), '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  const requiredIgnores = ['node_modules', '.env', '.next', 'dist'];
  const missingIgnores = requiredIgnores.filter(ignore => 
    !gitignoreContent.includes(ignore)
  );
  
  if (missingIgnores.length === 0) {
    console.log('✅ .gitignore looks good\n');
  } else {
    console.log('⚠️  .gitignore missing:', missingIgnores.join(', '), '\n');
  }
} else {
  console.log('❌ .gitignore file not found\n');
}

console.log('🔒 Security check completed!');
