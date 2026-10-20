'use client';
import { useId, useState } from 'react';
import Image from 'next/image';
import { validateTutorId } from '@/lib/validation';
import { logger } from '@/lib/logger';
import Dialog from '@/components/Common/Dialog';
import Button from '@/components/Common/Button';

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

const TutorSelectionModal = ({
  isOpen,
  onClose,
  onSelectTutor,
}: TutorSelectionModalProps) => {
  const [selectedTutor, setSelectedTutor] = useState<string>('any');
  const titleId = useId();

  const tutors: Tutor[] = [
    {
      id: 'any',
      name: 'Tout membre disponible',
      avatar: '/images/tutors/any.svg',
      available: true,
    },
    {
      id: 'alix',
      name: 'Alix',
      avatar: '/images/team/alix.jpg',
      available: true,
    },
    {
      id: 'nolwen',
      name: 'Nolwen',
      avatar: '/images/team/nolwen.jpg',
      available: true,
    },
    {
      id: 'daniel',
      name: 'Daniel',
      avatar: '/images/team/daniel.jpg',
      available: true,
    },
    {
      id: 'distel',
      name: 'Distel',
      avatar: '/images/team/distel.jpg',
      available: true,
    },
    {
      id: 'walid',
      name: 'Walid',
      avatar: '/images/team/walid.jpg',
      available: true,
    },
    {
      id: 'ruudy',
      name: 'Ruudy',
      avatar: '/images/team/ruudy.jpg',
      available: true,
    },
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
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      labelledBy={titleId}
      className="max-w-md!"
    >
      {/* Close Button */}
      <button
        type="button"
        aria-label="Fermer le choix du tuteur"
        onClick={onClose}
        className="absolute top-4 right-4 flex min-h-11 min-w-11 items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Header */}
      <div className="mb-6">
        <h2
          id={titleId}
          className="pr-12 text-xl font-bold text-black dark:text-white"
        >
          Séance d'essai gratuite
        </h2>
        <p className="text-waterloo dark:text-manatee text-sm">1 h</p>
      </div>

      {/* Tutor Selection */}
      <div className="mb-6">
        <h3 className="mb-4 text-lg font-medium text-black dark:text-white">
          Sélectionner un membre d'équipe
        </h3>

        <fieldset className="space-y-3">
          <legend className="sr-only">Sélectionner un membre d’équipe</legend>
          {tutors.map(tutor => (
            <label
              key={tutor.id}
              className={`flex cursor-pointer items-center space-x-3 rounded-lg border p-3 transition-all ${
                selectedTutor === tutor.id
                  ? 'border-primary bg-primary/5'
                  : 'border-stroke hover:border-primary/50 dark:border-strokedark'
              }`}
            >
              <input
                type="radio"
                name="tutor"
                value={tutor.id}
                checked={selectedTutor === tutor.id}
                onChange={e => setSelectedTutor(e.target.value)}
                className="text-primary focus:ring-primary h-4 w-4"
              />

              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  {tutor.id === 'any' ? (
                    <div className="bg-primary flex h-full w-full items-center justify-center text-white">
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
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
                      onError={e => {
                        e.currentTarget.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-size='12'%3E%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  )}
                </div>

                <div>
                  <p className="font-medium text-black dark:text-white">
                    {tutor.name}
                  </p>
                  {tutor.id === 'any' && (
                    <p className="text-waterloo dark:text-manatee text-xs">
                      Maximum de créneaux horaires disponibles
                    </p>
                  )}
                </div>
              </div>
            </label>
          ))}
        </fieldset>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <Button variant="secondary" onClick={onClose}>
          ← Retour
        </Button>

        <Button onClick={handleSave}>Enregistrer</Button>
      </div>
    </Dialog>
  );
};

export default TutorSelectionModal;
