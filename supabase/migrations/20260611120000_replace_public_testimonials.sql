-- Replace public testimonials displayed on the homepage.
DELETE FROM reviews
WHERE lower(student_name) IN (
  'camille r.',
  'thomas l.',
  'marie dubois',
  'jean martin',
  'sophie laurent',
  'milly koula',
  'steve kenfack',
  'raissa bouity',
  'clara briand-nail'
);

INSERT INTO reviews (student_id, tutor_id, student_name, student_role, content, rating, is_approved, avatar_url) VALUES
  (
    NULL,
    NULL,
    'Milly Koula',
    'préparation concours IAE',
    $$« une fois 2 plus, j'aimerais te te remercie pour ton accompagnement et ton aide tout au long de la préparation de ce concours. Tes explications et tes conseils ont été précieux et seront utiles à la réussite de cet examen. Je ne manquerai pas de revenir vers toi une fois mon score connu alors. Merci encore et à bientôt. »$$,
    5,
    true,
    'https://images.pexels.com/photos/7880373/pexels-photo-7880373.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop'
  ),
  (
    NULL,
    NULL,
    'Steve Kenfack',
    'école d’ingénieure informatique',
    $$« Mon examen s’est super bien passé je pense au moins avoir 18, j’ai aussi appris beaucoup de chose sur npm next js et je kiffe vraiment tout ça grâce à toi merci »$$,
    5,
    true,
    'https://images.pexels.com/photos/4259709/pexels-photo-4259709.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop'
  ),
  (
    NULL,
    NULL,
    'Raissa Bouity',
    'maman de Liele - école primaire',
    $$des tuteurs à l’écoute et bienveillants, patient avec ma fille. Ils ont su lui faire gagner en confiance en elle$$,
    5,
    true,
    'https://images.pexels.com/photos/6482279/pexels-photo-6482279.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop'
  ),
  (
    NULL,
    NULL,
    'Clara Briand-Nail',
    'rattrapage de comptabilité',
    $$« Bonsoir à vous !
Je vous informe que j’ai validé mon rattrapage 🙏🏻
Gloire à Dieu, merci Daniel pour les seances  »$$,
    5,
    true,
    'https://images.pexels.com/photos/19797873/pexels-photo-19797873.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop'
  );
