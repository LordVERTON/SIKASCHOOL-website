const fetch = require('node-fetch');

async function testSignup() {
  try {
    console.log('🧪 Test de l\'inscription...');

    const testUser = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test.user@sikaschool.com',
      password: 'testpassword123'
    };

    const response = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Inscription réussie !');
      console.log('Utilisateur créé:', result.user);
    } else {
      console.log('❌ Erreur d\'inscription:', result.error);
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testSignup();
