import { Menu } from '@/types/menu';
import type { Translations } from '@/lib/translations';

// Same order as the corresponding homepage sections.
const getMenuData = (t: Translations): Menu[] => [
  { id: 1, title: t.nav.reviews, newTab: false, path: '/#reviews' },
  { id: 2, title: t.nav.howItWorks, newTab: false, path: '/#how-it-works' },
  { id: 3, title: t.nav.tutors, newTab: false, path: '/#tutors' },
  { id: 4, title: t.nav.pricing, newTab: false, path: '/#pricing' },
];

export default getMenuData;
