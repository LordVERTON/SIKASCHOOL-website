const bcrypt = require('bcryptjs');

// Fonction pour générer un mot de passe aléatoire
function generateRandomPassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  // Assurer au moins un caractère de chaque type
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Majuscule
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Minuscule
  password += '0123456789'[Math.floor(Math.random() * 10)]; // Chiffre
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // Symbole
  
  // Compléter avec des caractères aléatoires
  for (let i = 4; i < 12; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  
  // Mélanger le mot de passe
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Élèves avec leurs informations
const students = [
  {
    id: '1',
    firstName: 'Liele',
    lastName: 'Ghoma',
    email: 'liele.ghoma@sikaschool.com',
    role: 'STUDENT',
    level: 'CE2',
    needs: ['Maths', 'Aide aux devoirs', 'Français', 'Histoire']
  },
  {
    id: '2', 
    firstName: 'Steve',
    lastName: 'Kenfack',
    email: 'steve.kenfack@sikaschool.com',
    role: 'STUDENT',
    level: 'Supérieur',
    needs: ['Mécanique', 'Électronique', 'Informatique', 'Thermodynamique', 'Électromagnétisme']
  },
  {
    id: '3',
    firstName: 'Milly',
    lastName: 'Koula',
    email: 'milly.koula@sikaschool.com',
    role: 'STUDENT',
    level: 'Supérieur',
    needs: ['Préparation au concours de l\'IAE']
  }
];

async function createStudentCredentials() {
  console.log('=== Création des credentials pour les élèves ===\n');
  
  const credentials = [];

  for (const student of students) {
    const password = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(password, 12);
    
    credentials.push({
      student,
      password,
      hashedPassword
    });
    
    console.log(`👨‍🎓 ${student.firstName} ${student.lastName}`);
    console.log(`   📧 Email: ${student.email}`);
    console.log(`   🔑 Mot de passe: ${password}`);
    console.log(`   📚 Niveau: ${student.level}`);
    console.log(`   🎯 Besoins: ${student.needs.join(', ')}`);
    console.log(`   🔐 Hash: ${hashedPassword}`);
    console.log('');
  }

  // Générer le fichier SQL
  console.log('=== Génération du fichier SQL ===\n');
  
  let sqlContent = `-- =============================================
-- Insertion des élèves SikaSchool dans Supabase
-- =============================================

-- Insertion des utilisateurs élèves
INSERT INTO users (id, email, first_name, last_name, role, is_active, created_at, updated_at) VALUES
`;

  // Ajouter les utilisateurs
  for (let i = 0; i < credentials.length; i++) {
    const { student } = credentials[i];
    const comma = i < credentials.length - 1 ? ',' : ';';
    sqlContent += `  (uuid_generate_v4(), '${student.email}', '${student.firstName}', '${student.lastName}', '${student.role}', true, NOW(), NOW())${comma}\n`;
  }

  sqlContent += `
-- Insertion des credentials (mots de passe hashés)
INSERT INTO user_credentials (user_id, credential_type, credential_value, is_active, created_at, updated_at) VALUES
`;

  // Ajouter les credentials
  for (let i = 0; i < credentials.length; i++) {
    const { student, hashedPassword } = credentials[i];
    const comma = i < credentials.length - 1 ? ',' : ';';
    sqlContent += `  ((SELECT id FROM users WHERE email = '${student.email}'), 'password', '${hashedPassword}', true, NOW(), NOW())${comma}\n`;
  }

  sqlContent += `
-- Insertion des profils élèves détaillés
INSERT INTO students (user_id, level, subjects_of_interest, learning_goals, created_at, updated_at) VALUES
`;

  // Ajouter les profils élèves
  for (let i = 0; i < credentials.length; i++) {
    const { student } = credentials[i];
    const subjectsArray = student.needs.map(need => `'${need}'`).join(', ');
    const comma = i < credentials.length - 1 ? ',' : ';';
    sqlContent += `  ((SELECT id FROM users WHERE email = '${student.email}'), '${student.level}', ARRAY[${subjectsArray}], 'Progression et réussite scolaire', NOW(), NOW())${comma}\n`;
  }

  sqlContent += `
-- =============================================
-- CREDENTIALS POUR LES ÉLÈVES
-- =============================================
-- Conservez ces informations en sécurité :

`;

  // Ajouter les credentials en clair
  for (const { student, password } of credentials) {
    sqlContent += `-- ${student.firstName} ${student.lastName}:
--   Email: ${student.email}
--   Mot de passe: ${password}
--   Niveau: ${student.level}
--   Besoins: ${student.needs.join(', ')}

`;
  }

  sqlContent += `-- =============================================`;

  // Écrire le fichier
  const fs = require('fs');
  fs.writeFileSync('supabase/student-credentials.sql', sqlContent);
  
  console.log('✅ Fichier SQL généré: supabase/student-credentials.sql');
  console.log('\n📋 Résumé des élèves créés:');
  console.log('=====================================\n');
  
  for (const { student, password } of credentials) {
    console.log(`👨‍🎓 ${student.firstName} ${student.lastName}`);
    console.log(`   📧 Email: ${student.email}`);
    console.log(`   🔑 Mot de passe: ${password}`);
    console.log(`   📚 Niveau: ${student.level}`);
    console.log(`   🎯 Besoins: ${student.needs.join(', ')}`);
    console.log('');
  }
}

createStudentCredentials();
