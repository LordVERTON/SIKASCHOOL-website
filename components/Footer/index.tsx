'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';

export default function Footer() {
  const { t } = useLanguage();
  const links = [
    { href: '/', label: t.nav.home },
    { href: '/how-to', label: t.nav.howItWorks },
    { href: '/about', label: t.nav.aboutUs },
    { href: '/packs', label: t.nav.sessionPacks },
    { href: '/book-online', label: t.nav.perSession },
  ];
  return (
    <footer className="border-stroke dark:border-strokedark border-t py-12">
      <div className="sika-container">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
          <div className="min-w-0">
            <Link href="/" aria-label="SIKASCHOOL — Accueil">
              <Image
                src="/images/logo/logo-light.svg"
                alt=""
                width={120}
                height={30}
                className="h-auto w-[170px] dark:brightness-0 dark:invert"
              />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed">
              {t.footer.description}
            </p>
            <a
              href="mailto:sikaschoolservice@gmail.com"
              className="sika-text-link mt-4 text-sm break-all"
            >
              sikaschoolservice@gmail.com
            </a>
          </div>
          <nav aria-label={t.footer.quickLinks}>
            <p className="sika-eyebrow mb-3">{t.footer.quickLinks}</p>
            <ul>
              {links.map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-11 items-center text-sm hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="sika-eyebrow mb-3">{t.footer.contact}</p>
            <ul>
              <li>
                <Link
                  href="/support"
                  className="inline-flex min-h-11 items-center text-sm hover:underline"
                >
                  {t.footer.supportLink}
                </Link>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/sikaschool/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center text-sm hover:underline"
                >
                  Instagram{' '}
                  <span className="ml-2" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/33626817578"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center text-sm hover:underline"
                >
                  WhatsApp{' '}
                  <span className="ml-2" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-stroke dark:border-strokedark mt-10 flex flex-wrap items-center justify-between gap-5 border-t pt-6 text-xs">
          <p className="max-w-full">
            © {new Date().getFullYear()} {t.footer.copyright}
          </p>
          <Link
            href="/donnees-personnelles"
            className="inline-flex min-h-11 items-center hover:underline"
          >
            {t.footer.privacyPolicy}
          </Link>
          <LanguageSelector />
        </div>
      </div>
    </footer>
  );
}
