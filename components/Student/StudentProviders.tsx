"use client";

import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "next-themes";

export default function StudentProviders({
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
        {children}
      </LanguageProvider>
    </ThemeProvider>
  );
}
