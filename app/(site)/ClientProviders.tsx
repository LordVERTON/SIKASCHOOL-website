'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import ScrollToTop from '@/components/ScrollToTop';
import ErrorBoundary from '@/components/ErrorBoundary';
import { SkipLink } from '@/components/Accessibility';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from 'next-themes';
import ToastContext from '@/context/ToastContext';
import { useCallback, useEffect, useRef, useState } from 'react';
import LeadCaptureModal from '@/components/Booking/LeadCaptureModal';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '@/lib/storage';
import { BookingContext, type BookingOptions } from '@/context/BookingContext';
import { MotionConfig } from 'framer-motion';

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadInitialEmail, setLeadInitialEmail] = useState<string>('');
  const [bookingOptions, setBookingOptions] = useState<BookingOptions>({});
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const closeBooking = useCallback(() => setLeadOpen(false), []);
  const openBooking = useCallback((options: BookingOptions = {}) => {
    const activeElement = document.activeElement;
    // A mobile menu CTA disappears when its drawer closes: return to the menu trigger.
    returnFocusRef.current =
      activeElement instanceof HTMLElement && activeElement.closest('.navbar')
        ? document.querySelector<HTMLElement>('[data-menu-trigger]')
        : activeElement instanceof HTMLElement
          ? activeElement
          : null;
    setLeadInitialEmail(
      options.email?.trim() ||
        getStorageItem(STORAGE_KEYS.LAST_LEAD_EMAIL) ||
        ''
    );
    setBookingOptions(options);
    setLeadOpen(true);
  }, []);

  const handlePrefillEmail = (email: string) => {
    setStorageItem(STORAGE_KEYS.LAST_LEAD_EMAIL, email);
    setLeadInitialEmail(email);
  };

  useEffect(() => {
    const handler = (event: Event) => {
      // Compatibility for older callers; first-party CTAs use the context.
      openBooking((event as CustomEvent<BookingOptions>).detail);
    };
    window.addEventListener('lead:open', handler);
    return () => window.removeEventListener('lead:open', handler);
  }, [openBooking]);

  return (
    <ThemeProvider enableSystem={false} attribute="class" defaultTheme="light">
      <LanguageProvider>
        <MotionConfig reducedMotion="user">
          <BookingContext.Provider value={openBooking}>
            <ErrorBoundary>
              <div inert={leadOpen}>
                <SkipLink />
                <Header />
                <ToastContext />
                {children}
                <Footer />
                <ScrollToTop />
              </div>
              <LeadCaptureModal
                isOpen={leadOpen}
                onClose={closeBooking}
                onPrefillEmail={handlePrefillEmail}
                initialEmail={leadInitialEmail}
                initialSubject={bookingOptions.subject}
                campaign={bookingOptions.campaign}
                returnFocusRef={returnFocusRef}
              />
            </ErrorBoundary>
          </BookingContext.Provider>
        </MotionConfig>
      </LanguageProvider>
    </ThemeProvider>
  );
}
