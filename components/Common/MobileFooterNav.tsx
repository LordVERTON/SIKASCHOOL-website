"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

export default function MobileFooterNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-stroke bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-strokedark dark:bg-black/80 lg:hidden">
      <ul className="grid grid-cols-4">
        {items.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 py-2 text-xs ${active ? 'text-primary' : 'text-waterloo dark:text-manatee'}`}
              >
                <span className={`h-6 w-6 ${active ? 'text-primary' : ''}`}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}


