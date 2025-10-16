"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Lines from "@/components/Lines";
import ScrollToTop from "@/components/ScrollToTop";
import ErrorBoundary from "@/components/ErrorBoundary";
import { SkipLink } from "@/components/Accessibility";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "next-themes";
import ToasterContext from "../context/ToastContext";
import { useEffect, useState } from "react";
import LeadCaptureModal from "@/components/Booking/LeadCaptureModal";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [leadOpen, setLeadOpen] = useState(false);

  useEffect(() => {
    const handler = () => setLeadOpen(true);
    window.addEventListener('lead:open', handler);
    return () => window.removeEventListener('lead:open', handler);
  }, []);

  return (
    <ThemeProvider
      enableSystem={false}
      attribute="class"
      defaultTheme="light"
    >
      <LanguageProvider>
        <ErrorBoundary>
          <SkipLink />
          <Lines />
          <Header />
          <ToasterContext />
          {children}
          <LeadCaptureModal isOpen={leadOpen} onClose={() => setLeadOpen(false)} />
          <Footer />
          <ScrollToTop />
        </ErrorBoundary>
      </LanguageProvider>
    </ThemeProvider>
  );
}
