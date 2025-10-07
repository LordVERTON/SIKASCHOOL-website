/**
 * Script pour exécuter le test de cohérence entre dashboard et agenda
 */

const { exec } = require('child_process');
const path = require('path');

async function runConsistencyTest() {
  console.log('🚀 Lancement du test de cohérence Dashboard/Agenda');
  console.log('==================================================');

  try {
    // 1. Exécuter le script SQL de test
    console.log('\n📊 Exécution du script SQL de test...');
    const sqlScript = path.join(__dirname, '../supabase/test-dashboard-agenda-consistency.sql');
    
    // Note: Ceci nécessiterait une connexion directe à la base de données
    // Pour l'instant, on va juste exécuter le test JavaScript
    console.log('⚠️  Script SQL à exécuter manuellement dans Supabase');
    console.log(`   Fichier: ${sqlScript}`);

    // 2. Exécuter le test JavaScript
    console.log('\n🧪 Exécution du test JavaScript...');
    const testScript = path.join(__dirname, 'test-dashboard-consistency.js');
    
    exec(`node ${testScript}`, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Erreur lors de l\'exécution du test:', error);
        return;
      }
      
      if (stderr) {
        console.error('⚠️  Avertissements:', stderr);
      }
      
      console.log(stdout);
    });

  } catch (error) {
    console.error('❌ Erreur lors du lancement du test:', error);
  }
}

runConsistencyTest();
