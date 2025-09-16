import image1 from "@/public/images/user/user-01.png";
import image2 from "@/public/images/user/user-02.png";
import { Testimonial } from "@/types/testimonial";

export const testimonialData: Testimonial[] = [
  {
    id: 1,
    name: "Nadège (Paris)",
    designation: "Mère de Timothée (Lycée)",
    image: image1,
    content: "Super prof, patient avec mon fils, il lui a fait aimer les maths. Merci Walid je le recommande.",
  },
  {
    id: 2,
    name: "Hélène (Paris)",
    designation: "Maman de Sarah (collège)",
    image: image2,
    content:
      "« Ruudy que dire… Un excellent professeur ! J’étais assez hésitant pour mon enfant au départ. Mais l’enseignement, la pédagogie, il se met à la place de l’enfant, il essaie de se mettre à sa portée. Et ça c’est vraiment très bien. JE RECOMMANDE ! »",
  },
  {
    id: 3,
    name: "Cylia (Toulouse)",
    designation: "élève ingénieur aéronautique",
    image: image1,
    content:
      "« J’ai fait appel à Distel pour des cours de mathématiques niveau bac+4. Il est à l’écoute et a réussi à cibler mes faiblesses en adaptant ses enseignements. Sa patience, sa pédagogie et sa disponibilité m’ont permis de redécouvrir les mathématiques. Grâce à lui, j’ai constaté une nette amélioration. »",
  },
  {
    id: 4,
    name: "Steve (Bruxelles)",
    designation: "élève ingénieur ECAM",
    image: image2,
    content:
      "« Daniel est à l'écoute et très réactif. De plus il arrive à donner goût à l'apprentissage. Merci pour le suivi, je recommande vivement ! »",
  },
];
