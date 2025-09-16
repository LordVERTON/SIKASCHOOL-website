import { Metadata } from "next";
import { BookingCalendar } from "@/components/Booking";

export const metadata: Metadata = {
  title: "Réserver une séance - SikaSchool",
  description: "Choisissez votre créneau horaire pour votre séance d'essai gratuite avec nos tuteurs.",
};

export default function BookingPage() {
  return (
    <main>
      <BookingCalendar />
    </main>
  );
}
