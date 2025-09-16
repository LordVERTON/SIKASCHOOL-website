import { Menu } from "@/types/menu";

const menuData: Menu[] = [
  {
    id: 1,
    title: "Accueil",
    newTab: false,
    path: "/",
  },
  {
    id: 2,
    title: "Comment ça marche",
    newTab: false,
    path: "/#how-it-works",
  },
  {
    id: 3,
    title: "Qui sommes nous ?",
    newTab: false,
    path: "/#about",
  },
  {
    id: 4,
    title: "Packs de séances",
    newTab: false,
    path: "/#pricing",
  },
  {
    id: 5,
    title: "A la séance",
    newTab: false,
    path: "/#contact",
  },
  {
    id: 6,
    title: "Se connecter",
    newTab: false,
    path: "/auth/signin",
  },
];

export default menuData;
