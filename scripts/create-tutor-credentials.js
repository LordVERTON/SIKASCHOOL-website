const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Fonction pour générer un mot de passe aléatoire sécurisé
function generateSecurePassword(length = 12) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  // S'assurer qu'on a au moins un caractère de chaque type
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // minuscule
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // majuscule
  password += '0123456789'[Math.floor(Math.random() * 10)]; // chiffre
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // symbole
  
  // Remplir le reste avec des caractères aléatoires
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Mélanger le mot de passe
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Tuteurs avec leurs informations
const tutors = [
  {
    id: '1',
    firstName: 'Alix',
    lastName: 'Tarrade',
    email: 'alix.tarrade@sikaschool.com',
    role: 'TUTOR'
  },
  {
    id: '2', 
    firstName: 'Nolwen',
    lastName: 'Verton',
    email: 'nolwen.verton@sikaschool.com',
    role: 'TUTOR'
  },
  {
    id: '3',
    firstName: 'Ruudy',
    lastName: 'Mbouza-Bayonne',
    email: 'ruudy.mbouza-bayonne@sikaschool.com',
    role: 'TUTOR'
  },
  {
    id: '4',
    firstName: 'Daniel',
    lastName: 'Verton',
    email: 'daniel.verton@sikaschool.com',
    role: 'TUTOR'
  },
  {
    id: '5',
    firstName: 'Walid',
    lastName: 'Lakas',
    email: 'walid.lakas@sikaschool.com',
    role: 'TUTOR'
  }
];

async function createTutorCredentials() {
  console.log('=== Création des credentials pour les tuteurs ===\n');
  
  const credentials = [];
  
  for (const tutor of tutors) {
    // Générer un mot de passe aléatoire
    const plainPassword = generateSecurePassword(12);
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(plainPassword, 12);
    
    const credential = {
      tutor,
      email: tutor.email,
      plainPassword,
      hashedPassword
    };
    
    credentials.push(credential);
    
    console.log(`Tuteur: ${tutor.firstName} ${tutor.lastName}`);
    console.log(`Email: ${tutor.email}`);
    console.log(`Mot de passe: ${plainPassword}`);
    console.log(`Mot de passe hashé: ${hashedPassword}`);
    console.log('---');
  }
  
  // Générer les requêtes SQL
  console.log('\n=== Requêtes SQL pour Supabase ===\n');
  
  console.log('-- Insertion des utilisateurs tuteurs');
  console.log('INSERT INTO users (id, email, first_name, last_name, role, is_active, created_at, updated_at) VALUES');
  
  const userValues = tutors.map((tutor, index) => {
    const uuid = `uuid_generate_v4()`;
    return `  (${uuid}, '${tutor.email}', '${tutor.firstName}', '${tutor.lastName}', '${tutor.role}', true, NOW(), NOW())`;
  }).join(',\n');
  
  console.log(userValues + ';');
  
  console.log('\n-- Insertion des credentials');
  console.log('INSERT INTO user_credentials (user_id, credential_type, credential_value, is_active, created_at, updated_at) VALUES');
  
  const credentialValues = credentials.map((cred, index) => {
    return `  ((SELECT id FROM users WHERE email = '${cred.email}'), 'password', '${cred.hashedPassword}', true, NOW(), NOW())`;
  }).join(',\n');
  
  console.log(credentialValues + ';');
  
  console.log('\n=== Résumé des credentials ===');
  console.log('Conservez ces informations en sécurité :\n');
  
  credentials.forEach(cred => {
    console.log(`${cred.tutor.firstName} ${cred.tutor.lastName}:`);
    console.log(`  Email: ${cred.email}`);
    console.log(`  Mot de passe: ${cred.plainPassword}`);
    console.log('');
  });
}

createTutorCredentials().catch(console.error);
