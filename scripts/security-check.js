#!/usr/bin/env node
/**
 * Script utilisé par `npm run security:check`.
 * Exécute `npm audit` depuis la racine du dépôt (code de sortie identique à npm audit).
 */
const { execSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');

try {
  execSync('npm audit', { stdio: 'inherit', cwd: root, shell: true });
} catch (e) {
  process.exit(typeof e.status === 'number' ? e.status : 1);
}
