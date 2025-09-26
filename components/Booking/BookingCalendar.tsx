"use client";
import { toast } from "react-hot-toast";
import { useState } from "react";
// import Image from "next/image";
import SectionHeader from "../Common/SectionHeader";

const BookingCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  // Mock data for available time slots
  const availableSlots = [
    { date: "2024-01-15", time: "14:00", available: true },
    { date: "2024-01-15", time: "15:00", available: true },
    { date: "2024-01-15", time: "16:00", available: false },
    { date: "2024-01-16", time: "09:00", available: true },
    { date: "2024-01-16", time: "10:00", available: true },
    { date: "2024-01-16", time: "11:00", available: true },
    { date: "2024-01-17", time: "14:00", available: true },
    { date: "2024-01-17", time: "15:00", available: false },
    { date: "2024-01-17", time: "16:00", available: true },
  ];

  const groupedSlots = availableSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, typeof availableSlots>);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  const handleTimeSelect = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
  };

  const handleConfirmBooking = () => {
    if (selectedDate && selectedTime) {
      toast.success(`Réservation confirmée pour le ${formatDate(selectedDate)} à ${selectedTime}`);
    }
  };

  return (
    <>
      {/* <!-- ===== Booking Calendar Start ===== --> */}
      <section className="overflow-hidden pb-20 pt-15 lg:pb-25 xl:pb-30">
        <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
          {/* <!-- Section Title Start --> */}
          <div className="animate_top mx-auto text-center">
            <SectionHeader
              headerInfo={{
                title: `Réserver votre séance`,
                subtitle: `Sélectionnez votre créneau horaire`,
                description: `Choisissez la date et l'heure qui vous conviennent pour votre séance d'essai gratuite.`,
              }}
            />
          </div>
          {/* <!-- Section Title End --> */}
        </div>

        <div className="mx-auto mt-15 max-w-[1000px] px-4 md:px-8 xl:mt-20 xl:px-0">
          {/* Back Button */}
          <div className="mb-8">
            <button
              onClick={() => window.history.back()}
              className="flex items-center text-waterloo hover:text-primary dark:text-manatee dark:hover:text-primary"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="space-y-8">
            {Object.entries(groupedSlots).map(([date, slots]) => (
              <div key={date} className="rounded-lg border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-blacksection">
                <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
                  {formatDate(date)}
                </h3>
                
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {slots.map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => slot.available && handleTimeSelect(date, slot.time)}
                      disabled={!slot.available}
                      className={`rounded-lg border p-3 text-center transition-all ${
                        slot.available
                          ? selectedDate === date && selectedTime === slot.time
                            ? "border-primary bg-primary text-white"
                            : "border-stroke bg-white text-black hover:border-primary hover:bg-primary/5 dark:border-strokedark dark:bg-blacksection dark:text-white"
                          : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-600"
                      }`}
                    >
                      <div className="text-sm font-medium">
                        {slot.time}
                      </div>
                      {!slot.available && (
                        <div className="text-xs text-gray-400">
                          Indisponible
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Selected Time Summary */}
          {selectedDate && selectedTime && (
            <div className="mt-8 rounded-lg border border-primary bg-primary/5 p-6">
              <h4 className="mb-2 text-lg font-semibold text-black dark:text-white">
                Séance sélectionnée
              </h4>
              <p className="text-waterloo dark:text-manatee">
                {formatDate(selectedDate)} à {selectedTime}
              </p>
              <p className="mt-2 text-sm text-waterloo dark:text-manatee">
                Durée : 1 heure • Séance d'essai gratuite
              </p>
            </div>
          )}

          {/* Confirm Button */}
          <div className="mt-8 text-center">
            <button
              onClick={handleConfirmBooking}
              disabled={!selectedDate || !selectedTime}
              className={`rounded-lg px-8 py-3 font-medium transition-all ${
                selectedDate && selectedTime
                  ? "bg-primary text-white hover:bg-primaryho"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
              }`}
            >
              Confirmer la réservation
            </button>
          </div>
        </div>
      </section>
      {/* <!-- ===== Booking Calendar End ===== --> */}
    </>
  );
};

export default BookingCalendar;
