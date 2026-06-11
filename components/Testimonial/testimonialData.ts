import { Testimonial } from "@/types/testimonial";

const parentAvatar1 =
  "https://images.pexels.com/photos/7880373/pexels-photo-7880373.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop";
const parentAvatar2 =
  "https://images.pexels.com/photos/4259709/pexels-photo-4259709.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop";
const parentAvatar3 =
  "https://images.pexels.com/photos/6482279/pexels-photo-6482279.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop";
const parentAvatar4 =
  "https://images.pexels.com/photos/19797873/pexels-photo-19797873.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop";

// This will be updated to use translations dynamically
export const getTestimonialData = (_t: any): Testimonial[] => [
  {
    id: 1,
    name: "Milly Koula",
    designation: "préparation concours IAE",
    image: parentAvatar1,
    content:
      "« une fois 2 plus, j'aimerais te te remercie pour ton accompagnement et ton aide tout au long de la préparation de ce concours. Tes explications et tes conseils ont été précieux et seront utiles à la réussite de cet examen. Je ne manquerai pas de revenir vers toi une fois mon score connu alors. Merci encore et à bientôt. »",
  },
  {
    id: 2,
    name: "Steve Kenfack",
    designation: "école d’ingénieure informatique",
    image: parentAvatar3,
    content:
      "« Mon examen s’est super bien passé je pense au moins avoir 18, j’ai aussi appris beaucoup de chose sur npm next js et je kiffe vraiment tout ça grâce à toi merci »",
  },
  {
    id: 3,
    name: "Raissa Bouity",
    designation: "maman de Liele - école primaire",
    image: parentAvatar4,
    content:
      "des tuteurs à l’écoute et bienveillants, patient avec ma fille. Ils ont su lui faire gagner en confiance en elle",
  },
  {
    id: 4,
    name: "Clara Briand-Nail",
    designation: "rattrapage de comptabilité",
    image: parentAvatar2,
    content:
      "« Bonsoir à vous !\nJe vous informe que j’ai validé mon rattrapage 🙏🏻\nGloire à Dieu, merci Daniel pour les seances  »",
  },
];

// Keep the original export for backward compatibility
export const testimonialData: Testimonial[] = [
  {
    id: 1,
    name: "Milly Koula",
    designation: "préparation concours IAE",
    image: parentAvatar1,
    content:
      "« une fois 2 plus, j'aimerais te te remercie pour ton accompagnement et ton aide tout au long de la préparation de ce concours. Tes explications et tes conseils ont été précieux et seront utiles à la réussite de cet examen. Je ne manquerai pas de revenir vers toi une fois mon score connu alors. Merci encore et à bientôt. »",
  },
  {
    id: 2,
    name: "Steve Kenfack",
    designation: "école d’ingénieure informatique",
    image: parentAvatar3,
    content:
      "« Mon examen s’est super bien passé je pense au moins avoir 18, j’ai aussi appris beaucoup de chose sur npm next js et je kiffe vraiment tout ça grâce à toi merci »",
  },
  {
    id: 3,
    name: "Raissa Bouity",
    designation: "maman de Liele - école primaire",
    image: parentAvatar4,
    content:
      "des tuteurs à l’écoute et bienveillants, patient avec ma fille. Ils ont su lui faire gagner en confiance en elle",
  },
  {
    id: 4,
    name: "Clara Briand-Nail",
    designation: "rattrapage de comptabilité",
    image: parentAvatar2,
    content:
      "« Bonsoir à vous !\nJe vous informe que j’ai validé mon rattrapage 🙏🏻\nGloire à Dieu, merci Daniel pour les seances  »",
  },
];
