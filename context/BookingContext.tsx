'use client';

import { createContext, useContext } from 'react';

export type BookingOptions = {
  email?: string;
  subject?: string;
  campaign?: 'back_to_school';
};

export const BookingContext = createContext<
  ((options?: BookingOptions) => void) | null
>(null);

export function useBooking() {
  const openBooking = useContext(BookingContext);
  if (!openBooking)
    throw new Error('useBooking requires the public site provider');
  return openBooking;
}
