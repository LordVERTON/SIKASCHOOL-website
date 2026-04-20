"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Lines from "@/components/Lines";
import ScrollToTop from "@/components/ScrollToTop";
import ErrorBoundary from "@/components/ErrorBoundary";
import { SkipLink } from "@/components/Accessibility";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "next-themes";
import ToastContext from "@/context/ToastContext";
import { useEffect, useState } from "react";
import LeadCaptureModal from "@/components/Booking/LeadCaptureModal";
import { getStorageItem, setStorageItem, STORAGE_KEYS } from "@/lib/storage";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadInitialEmail, setLeadInitialEmail] = useState<string>("");

  const handlePrefillEmail = (email: string) => {
    setStorageItem(STORAGE_KEYS.LAST_LEAD_EMAIL, email);
    setLeadInitialEmail(email);
  };

  useEffect(() => {
    const handler = (event: Event) => {
      const detailEmail =
        (event as CustomEvent<{ email?: string }>).detail?.email?.trim() ?? "";
      const fallback = getStorageItem(STORAGE_KEYS.LAST_LEAD_EMAIL) ?? "";
      setLeadInitialEmail(detailEmail || fallback);
      setLeadOpen(true);
    };
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
          <ToastContext />
          {children}
          <LeadCaptureModal
            isOpen={leadOpen}
            onClose={() => setLeadOpen(false)}
            onPrefillEmail={handlePrefillEmail}
            initialEmail={leadInitialEmail}
          />
          <Footer />
          <ScrollToTop />
        </ErrorBoundary>
      </LanguageProvider>
    </ThemeProvider>
  );
}
