const { spawnSync } = require('node:child_process');

function runDocker(args, options = {}) {
  return spawnSync('docker', args, {
    stdio: options.stdio ?? 'pipe',
    encoding: 'utf8',
  });
}

function exitWithMessage(message) {
  console.error(`[mailpit] ${message}`);
  process.exit(1);
}

const check = runDocker(['version']);
if (check.error) {
  exitWithMessage("Docker introuvable. Installe Docker Desktop ou lance Mailpit manuellement.");
}

if (check.status !== 0) {
  exitWithMessage("Docker n'est pas démarré. Lance Docker Desktop puis relance npm run dev.");
}

runDocker(['rm', '-f', 'mailpit']);

const start = runDocker([
  'run',
  '-d',
  '--name',
  'mailpit',
  '-p',
  '1025:1025',
  '-p',
  '8025:8025',
  'axllent/mailpit',
]);

if (start.status !== 0) {
  const details = (start.stderr || start.stdout || '').trim();
  exitWithMessage(`Impossible de démarrer le conteneur Mailpit.${details ? `\n${details}` : ''}`);
}

console.log('[mailpit] Mailpit démarré sur SMTP :1025 et UI : http://localhost:8025');
