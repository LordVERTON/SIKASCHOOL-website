const bcrypt = require('bcryptjs');

// Hash passwords for seed data
const passwords = {
  'admin@sikaschool.com': 'password123',
  'tutor@sikaschool.com': 'Daniel',
  'marie.tutor@sikaschool.com': 'password123',
  'pierre.tutor@sikaschool.com': 'password123',
  'student@sikaschool.com': 'Steve',
  'sophie.student@sikaschool.com': 'password123',
  'lucas.student@sikaschool.com': 'password123'
};

console.log('Hashed passwords for seed data:');
console.log('================================');

Object.entries(passwords).forEach(async ([email, password]) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(`'${email}': '${hashedPassword}',`);
});
