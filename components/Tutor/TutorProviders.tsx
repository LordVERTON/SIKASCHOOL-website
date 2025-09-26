"use client";

import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "next-themes";
import ToasterContext from "@/app/context/ToastContext";

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
        <ToasterContext />
        {children}
      </LanguageProvider>
    </ThemeProvider>
  );
}
