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
export const getTestimonialData = (t: any): Testimonial[] => [
  {
    id: 1,
    name: "Nadège (Paris)",
    designation: "Mère de Timothée (Lycée)",
    image: parentAvatar1,
    content: "Super prof, patient avec mon fils, il lui a fait aimer les maths. Merci Walid je le recommande.",
  },
  {
    id: 2,
    name: t.testimonials.author,
    designation: "Maman de Sarah (collège)",
    image: parentAvatar3,
    content: t.testimonials.quote,
  },
  {
    id: 3,
    name: "Cylia (Toulouse)",
    designation: "élève ingénieur aéronautique",
    image: parentAvatar4,
    content:
      "« J'ai fait appel à Distel pour des cours de mathématiques niveau bac+4. Il est à l'écoute et a réussi à cibler mes faiblesses en adaptant ses enseignements. Sa patience, sa pédagogie et sa disponibilité m'ont permis de redécouvrir les mathématiques. Grâce à lui, j'ai constaté une nette amélioration. »",
  },
  {
    id: 4,
    name: "Steve (Bruxelles)",
    designation: "élève ingénieur ECAM",
    image: parentAvatar2,
    content:
      "« Daniel est à l'écoute et très réactif. De plus il arrive à donner goût à l'apprentissage. Merci pour le suivi, je recommande vivement ! »",
  },
];

// Keep the original export for backward compatibility
export const testimonialData: Testimonial[] = [
  {
    id: 1,
    name: "Nadège (Paris)",
    designation: "Mère de Timothée (Lycée)",
    image: parentAvatar1,
    content: "Super prof, patient avec mon fils, il lui a fait aimer les maths. Merci Walid je le recommande.",
  },
  {
    id: 2,
    name: "Hélène (Paris)",
    designation: "Maman de Sarah (collège)",
    image: parentAvatar3,
    content:
      "« Ruudy que dire… Un excellent professeur ! J'étais assez hésitant pour mon enfant au départ. Mais l'enseignement, la pédagogie, il se met à la place de l'enfant, il essaie de se mettre à sa portée. Et ça c'est vraiment très bien. JE RECOMMANDE ! »",
  },
  {
    id: 3,
    name: "Cylia (Toulouse)",
    designation: "élève ingénieur aéronautique",
    image: parentAvatar4,
    content:
      "« J'ai fait appel à Distel pour des cours de mathématiques niveau bac+4. Il est à l'écoute et a réussi à cibler mes faiblesses en adaptant ses enseignements. Sa patience, sa pédagogie et sa disponibilité m'ont permis de redécouvrir les mathématiques. Grâce à lui, j'ai constaté une nette amélioration. »",
  },
  {
    id: 4,
    name: "Steve (Bruxelles)",
    designation: "élève ingénieur ECAM",
    image: parentAvatar2,
    content:
      "« Daniel est à l'écoute et très réactif. De plus il arrive à donner goût à l'apprentissage. Merci pour le suivi, je recommande vivement ! »",
  },
];
