"use client";

import { LanguageProvider } from "@/context/LanguageContext";

export default function StudentProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  );
}
