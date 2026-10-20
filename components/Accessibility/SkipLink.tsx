'use client';

export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="focus:bg-primary sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:px-4 focus:py-2 focus:text-white"
    >
      Aller au contenu principal
    </a>
  );
}
