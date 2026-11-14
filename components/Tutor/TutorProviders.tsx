"use client";

import { LanguageProvider } from "@/context/LanguageContext";
import ToastContext from "@/context/ToastContext";

export default function TutorProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <ToastContext />
      {children}
    </LanguageProvider>
  );
}
