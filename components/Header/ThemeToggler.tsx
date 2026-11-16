import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

const ThemeToggler = () => {
  const { theme, setTheme } = useTheme();
  const { language } = useLanguage();
  // The persisted theme is unavailable to SSR. Keep the hydration attributes
  // stable, then announce the resolved state once the client has mounted.
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  return (
    <button
      type="button"
      aria-label={language === 'fr' ? 'Thème sombre' : 'Dark theme'}
      aria-pressed={mounted && theme === 'dark'}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="bg-gray-2 dark:bg-dark-bg relative mr-1.5 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-black transition-all hover:shadow-sm dark:text-white"
    >
      <Image
        src="/images/icon/icon-moon.svg"
        alt=""
        width={21}
        height={21}
        className="dark:hidden"
      />

      <Image
        src="/images/icon/icon-sun.svg"
        alt=""
        width={22}
        height={22}
        className="hidden dark:block"
      />
    </button>
  );
};

export default ThemeToggler;
