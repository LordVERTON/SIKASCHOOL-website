"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  primary?: boolean;
  onClick?: () => void;
};

function isActivePath(pathname: string | null, href: string) {
  return (
    pathname === href ||
    (href !== "/student" && href !== "/tutor" && pathname?.startsWith(href + "/"))
  );
}

export default function MobileFooterNav({
  items,
  menuItems = [],
}: {
  items: NavItem[];
  menuItems?: NavItem[];
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuActive = menuItems.some((item) => isActivePath(pathname, item.href));

  return (
    <>
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setMenuOpen(false)} />
      )}
      <div
        className={`fixed inset-x-3 bottom-[calc(72px+env(safe-area-inset-bottom))] z-50 max-h-[68vh] overflow-y-auto rounded-2xl border border-stroke bg-white p-3 shadow-solid-5 transition lg:hidden dark:border-strokedark dark:bg-blacksection ${
          menuOpen ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <div className="mb-3 flex items-center justify-between px-1">
          <p className="text-sm font-semibold text-black dark:text-white">Navigation</p>
          <button
            type="button"
            aria-label="Fermer le menu"
            className="flex h-9 w-9 items-center justify-center rounded-full text-waterloo transition hover:bg-primary/10 hover:text-primary dark:text-manatee"
            onClick={() => setMenuOpen(false)}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {menuItems.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl border px-2 py-3 text-center text-xs font-medium transition ${
                  active
                    ? "border-primary/20 bg-primary/10 text-primary"
                    : "border-stroke text-waterloo hover:border-primary/30 hover:text-primary dark:border-strokedark dark:text-manatee"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                <span className="relative flex h-6 w-6 items-center justify-center [&>svg]:h-full [&>svg]:w-full [&>svg]:shrink-0">
                  {item.icon}
                  {item.badge ? (
                    <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-black" />
                  ) : null}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-stroke bg-white/95 shadow-[0_-10px_30px_rgba(15,23,42,0.06)] backdrop-blur supports-[backdrop-filter]:bg-white/85 dark:border-strokedark dark:bg-black/85 lg:hidden">
      <ul className="grid grid-cols-5 items-center px-1 py-2">
        {items.map((item) => {
          const active =
            !item.primary &&
            !item.onClick &&
            isActivePath(pathname, item.href);
          const itemClassName = `flex min-h-12 items-center justify-center rounded-2xl transition ${
            item.primary || active
              ? "text-primary"
              : "text-waterloo hover:text-primary dark:text-manatee"
          }`;
          const itemContent = (
            <>
              <span
                className={`relative flex items-center justify-center [&>svg]:h-full [&>svg]:w-full [&>svg]:shrink-0 ${
                  item.primary
                    ? "h-12 w-12 -translate-y-3 rounded-full bg-primary text-white shadow-[0_10px_24px_rgba(47,109,246,0.35)]"
                    : "h-7 w-7"
                }`}
              >
                {item.icon}
                {item.badge ? (
                  <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-black" />
                ) : null}
              </span>
              <span className="sr-only">{item.label}</span>
            </>
          );

          if (item.onClick) {
            return (
              <li key={`${item.href}-${item.label}`}>
                <button
                  type="button"
                  aria-label={item.label}
                  className={`${itemClassName} w-full`}
                  onClick={item.onClick}
                >
                  {itemContent}
                </button>
              </li>
            );
          }

          return (
            <li key={`${item.href}-${item.label}`}>
              <Link
                href={item.href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={itemClassName}
              >
                {itemContent}
              </Link>
            </li>
          );
        })}
        {menuItems.length > 0 && (
          <li>
            <button
              type="button"
              aria-label="Ouvrir la navigation"
              aria-expanded={menuOpen}
              className={`flex min-h-12 w-full items-center justify-center rounded-2xl transition ${
                menuOpen || menuActive
                  ? "text-primary"
                  : "text-waterloo hover:text-primary dark:text-manatee"
              }`}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="relative flex h-7 w-7 items-center justify-center [&>svg]:h-full [&>svg]:w-full [&>svg]:shrink-0">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="5" cy="12" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="19" cy="12" r="2" />
                </svg>
              </span>
              <span className="sr-only">Navigation</span>
            </button>
          </li>
        )}
      </ul>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
    </>
  );
}


