import { NextRequest, NextResponse } from 'next/server';

const HOMEPAGE_TESTIMONIALS = [
  {
    id: '1',
    name: 'Milly Koula',
    role: 'préparation concours IAE',
    content:
      "« une fois 2 plus, j'aimerais te te remercie pour ton accompagnement et ton aide tout au long de la préparation de ce concours. Tes explications et tes conseils ont été précieux et seront utiles à la réussite de cet examen. Je ne manquerai pas de revenir vers toi une fois mon score connu alors. Merci encore et à bientôt. »",
    rating: 5,
    avatar:
      'https://images.pexels.com/photos/7880373/pexels-photo-7880373.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
  },
  {
    id: '2',
    name: 'Steve Kenfack',
    role: 'école d’ingénieure informatique',
    content:
      '« Mon examen s’est super bien passé je pense au moins avoir 18, j’ai aussi appris beaucoup de chose sur npm next js et je kiffe vraiment tout ça grâce à toi merci »',
    rating: 5,
    avatar:
      'https://images.pexels.com/photos/4259709/pexels-photo-4259709.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
  },
  {
    id: '3',
    name: 'Raissa Bouity',
    role: 'maman de Liele - école primaire',
    content:
      'des tuteurs à l’écoute et bienveillants, patient avec ma fille. Ils ont su lui faire gagner en confiance en elle',
    rating: 5,
    avatar:
      'https://images.pexels.com/photos/6482279/pexels-photo-6482279.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
  },
  {
    id: '4',
    name: 'Clara Briand-Nail',
    role: 'rattrapage de comptabilité',
    content:
      '« Bonsoir à vous !\nJe vous informe que j’ai validé mon rattrapage 🙏🏻\nGloire à Dieu, merci Daniel pour les seances  »',
    rating: 5,
    avatar:
      'https://images.pexels.com/photos/19797873/pexels-photo-19797873.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
  },
];

export async function GET(_request: NextRequest) {
  return NextResponse.json(HOMEPAGE_TESTIMONIALS);
}
