"use client";

import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "next-themes";
import ToastContext from "@/context/ToastContext";

export default function TutorProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      enableSystem={false}
      attribute="class"
      defaultTheme="light"
    >
      <LanguageProvider>
        <ToastContext />
        {children}
      </LanguageProvider>
    </ThemeProvider>
  );
}
