import { Menu } from "@/types/menu";

// This will be updated to use translations dynamically
const getMenuData = (t: any): Menu[] => [
  {
    id: 1,
    title: t.nav.home,
    newTab: false,
    path: "/",
  },
  {
    id: 2,
    title: t.nav.howItWorks,
    newTab: false,
    path: "/how-to",
  },
  {
    id: 3,
    title: t.nav.aboutUs,
    newTab: false,
    path: "/about",
  },
  {
    id: 4,
    title: t.nav.sessionPacks,
    newTab: false,
    path: "/packs",
  },
  {
    id: 5,
    title: t.nav.perSession,
    newTab: false,
    path: "/book-online",
  },
];

export default getMenuData;
