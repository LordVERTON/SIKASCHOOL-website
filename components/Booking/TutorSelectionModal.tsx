"use client";
import { useState } from "react";
import Image from "next/image";
import { validateTutorId } from "@/lib/validation";
import { logger } from "@/lib/logger";

interface Tutor {
  id: string;
  name: string;
  avatar: string;
  available: boolean;
}

interface TutorSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTutor: (tutorId: string) => void;
}

const TutorSelectionModal = ({ isOpen, onClose, onSelectTutor }: TutorSelectionModalProps) => {
  const [selectedTutor, setSelectedTutor] = useState<string>("any");

  const tutors: Tutor[] = [
    {
      id: "any",
      name: "Tout membre disponible",
      avatar: "/images/tutors/any.svg",
      available: true
    },
    {
      id: "daniel",
      name: "Daniel VERTON",
      avatar: "/images/tutors/daniel.jpg",
      available: true
    },
    {
      id: "distel",
      name: "Distel NOUEMBISSI",
      avatar: "/images/tutors/distel.jpg",
      available: true
    },
    {
      id: "walid",
      name: "Walid Lakas",
      avatar: "/images/tutors/walid.jpg",
      available: true
    }
  ];

  const handleSave = () => {
    const validation = validateTutorId(selectedTutor);
    if (!validation.isValid) {
      logger.error('Invalid tutor ID selected', { tutorId: selectedTutor });
      return;
    }
    
    onSelectTutor(selectedTutor);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-2xl dark:bg-blacksection">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-black dark:text-white">
            Séance d'essai gratuite
          </h2>
          <p className="text-sm text-waterloo dark:text-manatee">1 h</p>
        </div>

        {/* Tutor Selection */}
        <div className="mb-6">
          <h3 className="mb-4 text-lg font-medium text-black dark:text-white">
            Sélectionner un membre d'équipe
          </h3>
          
          <div className="space-y-3">
            {tutors.map((tutor) => (
              <label
                key={tutor.id}
                className={`flex cursor-pointer items-center space-x-3 rounded-lg border p-3 transition-all ${
                  selectedTutor === tutor.id
                    ? "border-primary bg-primary/5"
                    : "border-stroke hover:border-primary/50 dark:border-strokedark"
                }`}
              >
                <input
                  type="radio"
                  name="tutor"
                  value={tutor.id}
                  checked={selectedTutor === tutor.id}
                  onChange={(e) => setSelectedTutor(e.target.value)}
                  className="h-4 w-4 text-primary focus:ring-primary"
                />
                
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    {tutor.id === "any" ? (
                      <div className="flex h-full w-full items-center justify-center bg-primary text-white">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    ) : (
                      <Image
                        src={tutor.avatar}
                        alt={tutor.name}
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-size='12'%3E%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    )}
                  </div>
                  
                  <div>
                    <p className="font-medium text-black dark:text-white">
                      {tutor.name}
                    </p>
                    {tutor.id === "any" && (
                      <p className="text-xs text-waterloo dark:text-manatee">
                        Maximum de créneaux horaires disponibles
                      </p>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-sm text-waterloo hover:text-primary dark:text-manatee dark:hover:text-primary"
          >
            ← Retour
          </button>
          
          <button
            onClick={handleSave}
            className="rounded-lg bg-primary px-6 py-2 text-white transition-all duration-300 hover:bg-primaryho"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorSelectionModal;
