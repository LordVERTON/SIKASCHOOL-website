const { spawnSync } = require('node:child_process');

function runDocker(args) {
  return spawnSync('docker', args, {
    stdio: 'pipe',
    encoding: 'utf8',
  });
}

const check = runDocker(['version']);
if (check.error || check.status !== 0) {
  console.log("[mailpit] Docker indisponible, rien à arrêter.");
  process.exit(0);
}

runDocker(['stop', 'mailpit']);
runDocker(['rm', 'mailpit']);
console.log('[mailpit] Conteneur mailpit arrêté.');
