"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  primary?: boolean;
};

export default function MobileFooterNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-stroke bg-white/95 shadow-[0_-10px_30px_rgba(15,23,42,0.06)] backdrop-blur supports-[backdrop-filter]:bg-white/85 dark:border-strokedark dark:bg-black/85 lg:hidden">
      <ul className="grid grid-cols-5 items-end px-1 pt-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <li key={`${item.href}-${item.label}`}>
              <Link
                href={item.href}
                aria-label={item.label}
                className={`flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-medium transition ${
                  item.primary
                    ? "text-primary"
                    : active
                      ? "bg-primary/10 text-primary"
                      : "text-waterloo hover:text-primary dark:text-manatee"
                }`}
              >
                <span
                  className={`relative flex items-center justify-center ${
                    item.primary
                      ? "h-12 w-12 -translate-y-3 rounded-full bg-primary text-white shadow-[0_10px_24px_rgba(47,109,246,0.35)]"
                      : "h-6 w-6"
                  }`}
                >
                  {item.icon}
                  {item.badge ? (
                    <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-black" />
                  ) : null}
                </span>
                <span className={item.primary ? "-mt-2 text-primary" : ""}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}


