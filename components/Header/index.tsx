'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import ThemeToggler from './ThemeToggler';
import getMenuData from './menuData';
import { useLanguage } from '@/context/LanguageContext';
import { useBooking } from '@/context/BookingContext';
import Button from '@/components/Common/Button';
import Dialog from '@/components/Common/Dialog';

export default function Header() {
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const { t, language } = useLanguage();
  const openBooking = useBooking();
  const pathname = usePathname() ?? '';
  const fr = language === 'fr';
  const menu = getMenuData(t);

  useEffect(() => {
    setNavigationOpen(false);
    setActiveSection('');
    if (pathname !== '/') return;
    let frame = 0;
    const update = () => {
      const ids = ['reviews', 'how-it-works', 'tutors', 'pricing'];
      let current = '';
      for (const id of ids) {
        if (
          (document.getElementById(id)?.getBoundingClientRect().top ??
            Infinity) <= 180
        )
          current = id;
      }
      setActiveSection(current);
    };
    const handleScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [pathname]);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1280px)');
    const closeOnDesktop = () => {
      if (desktop.matches) setNavigationOpen(false);
    };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);

  const booking = () => {
    openBooking();
    setNavigationOpen(false);
  };
  const links = menu.map(item => {
    const active =
      pathname === '/'
        ? item.path === `/#${activeSection}`
        : (pathname === '/how-to' && item.path === '/#how-it-works') ||
          (pathname === '/about' && item.path === '/#tutors') ||
          (['/packs', '/book-online'].includes(pathname) &&
            item.path === '/#pricing');
    return (
      <li key={item.id}>
        <Link
          href={item.path!}
          onClick={() => setNavigationOpen(false)}
          className="sika-nav-link inline-flex min-h-11 items-center px-2 text-sm hover:underline"
          aria-current={active ? 'location' : undefined}
        >
          {item.title}
        </Link>
      </li>
    );
  });

  return (
    <header className="border-stroke dark:border-strokedark fixed inset-x-0 top-0 z-40 border-b bg-white/95 py-4 backdrop-blur-md dark:bg-black/95">
      <div className="sika-container flex items-center justify-between gap-6">
        <Link
          href="/"
          aria-label={fr ? 'SikaSchool — Accueil' : 'SikaSchool — Home'}
          className="shrink-0"
        >
          <Image
            src="/images/logo/logo-light.svg"
            alt=""
            width={120}
            height={30}
            loading="eager"
            className="h-auto w-[170px] dark:brightness-0 dark:invert"
          />
        </Link>
        <nav
          className="hidden xl:block"
          aria-label={fr ? 'Navigation principale' : 'Main navigation'}
        >
          <ul className="flex items-center gap-4">{links}</ul>
        </nav>
        <div className="hidden items-center gap-4 xl:flex">
          <ThemeToggler />
          <Link
            href="/auth/signin"
            className="inline-flex min-h-11 items-center text-sm hover:underline"
          >
            {t.nav.signIn}
          </Link>
          <Button onClick={booking}>{t.hero.reserveButton}</Button>
        </div>
        <button
          type="button"
          data-menu-trigger
          ref={menuTriggerRef}
          aria-label={fr ? 'Ouvrir le menu' : 'Open menu'}
          aria-controls={navigationOpen ? 'mobile-navigation' : undefined}
          aria-expanded={navigationOpen}
          aria-haspopup="dialog"
          className="border-stroke dark:border-strokedark flex min-h-12 min-w-12 items-center justify-center rounded-md border xl:hidden"
          onClick={() => setNavigationOpen(true)}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      <Dialog
        isOpen={navigationOpen}
        onClose={() => setNavigationOpen(false)}
        labelledBy="menu-title"
        id="mobile-navigation"
        className="sika-mobile-menu navbar"
        returnFocusRef={menuTriggerRef}
      >
        <div className="mb-8 flex items-center justify-between gap-4">
          <h2 id="menu-title" className="text-xl font-bold">
            Menu
          </h2>
          <Button
            variant="secondary"
            onClick={() => setNavigationOpen(false)}
            aria-label={fr ? 'Fermer le menu' : 'Close menu'}
          >
            ×
          </Button>
        </div>
        <nav aria-label={fr ? 'Navigation principale' : 'Main navigation'}>
          <ul className="space-y-3">{links}</ul>
        </nav>
        <div className="mt-8 flex flex-wrap items-center gap-6">
          <ThemeToggler />
          <Link
            href="/auth/signin"
            className="sika-text-link"
            onClick={() => setNavigationOpen(false)}
          >
            {t.nav.signIn}
          </Link>
        </div>
        <Button className="mt-8 w-full" onClick={booking}>
          {t.hero.reserveButton}
        </Button>
      </Dialog>
    </header>
  );
}
