"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Lines from "@/components/Lines";
import ScrollToTop from "@/components/ScrollToTop";
import ErrorBoundary from "@/components/ErrorBoundary";
import { SkipLink } from "@/components/Accessibility";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import ToasterContext from "../context/ToastContext";

export default function ClientProviders({
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
      <SessionProvider>
        <LanguageProvider>
          <ErrorBoundary>
            <SkipLink />
            <Lines />
            <Header />
            <ToasterContext />
            {children}
            <Footer />
            <ScrollToTop />
          </ErrorBoundary>
        </LanguageProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
