"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import CreateSessionModal from '@/components/Student/CreateSessionModal';
import AlertModal from '@/components/AlertModal';

interface Tutor {
  id: string;
  name: string;
  avatar: string;
  subjects: string[];
  rating: number;
  totalReviews: number;
  pricePerHour: number;
  bio: string;
  experience: number;
  availability: string[];
  isAvailable: boolean;
  totalSessions: number;
}

export default function TutorsPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingTutorId, setBookingTutorId] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('success');

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const response = await fetch('/api/student/assigned-tutors', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          const tutorsData: Tutor[] = (data.tutors || []).map((tutor: any) => ({
            id: tutor.id,
            name: tutor.name,
            avatar: tutor.avatar || '/images/user/user-01.png',
            subjects: Array.isArray(tutor.subjects) ? tutor.subjects : [],
            rating: Number(tutor.rating) || 0,
            totalReviews: Number(tutor.totalReviews) || 0,
            pricePerHour: Number(tutor.pricePerHour) || 0,
            bio: tutor.bio || 'Aucune biographie disponible',
            experience: Number(tutor.experienceYears ?? tutor.experience) || 0,
            availability: Array.isArray(tutor.availability) && tutor.availability.length > 0 ? tutor.availability : ['Disponible sur demande'],
            isAvailable: typeof tutor.isAvailable === 'boolean' ? tutor.isAvailable : true,
            totalSessions: Number(tutor.totalSessions) || 0
          }));
          
          setTutors(tutorsData);
        } else {
          // Si l'API retourne une erreur, afficher un message informatif
          console.warn('API assigned-tutors non disponible, utilisation des tuteurs de démonstration');
          setTutors([]);
        }
      } catch (error) {
        console.warn('Erreur réseau lors de la récupération des tuteurs attribués:', error);
        setTutors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, []);

  if (loading) {
    return (
      <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
        <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
      <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
        <div className="animate_top">
          <h1 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">
            Mes tuteurs attribués
          </h1>
          <p className="mt-4 text-para2 text-waterloo dark:text-manatee">
            Voici les tuteurs qui vous ont été attribués par l'administration. Contactez-les pour planifier vos séances.
          </p>
        </div>

        {/* Liste des tuteurs */}
        <div className="mt-10 grid gap-7.5 md:grid-cols-2 lg:grid-cols-3">
          {tutors.map((tutor) => (
            <div
              key={tutor.id}
              className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection"
            >
              <div className="text-center mb-6">
                <Image
                  src={tutor.avatar}
                  alt={tutor.name}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
                />
                <h3 className="mb-2 flex items-center justify-center gap-2 text-xl font-semibold text-black dark:text-white">
                  {tutor.name}
                  {tutor.isAvailable && (
                    <span
                      aria-label="Disponible"
                      title="Disponible"
                      className="h-2.5 w-2.5 rounded-full bg-green-500"
                    />
                  )}
                </h3>
              </div>

              <div className="mb-6">
                <p className="text-sm text-waterloo dark:text-manatee line-clamp-3">
                  {tutor.bio}
                </p>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-black dark:text-white mb-2">
                  Matières enseignées:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(tutor.subjects || []).map((subject) => (
                    <span
                      key={subject}
                      className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <button
                  type="button"
                  disabled={!tutor.isAvailable}
                  onClick={() => setBookingTutorId(tutor.id)}
                  className={`w-full py-2 px-4 rounded-lg text-center transition ${
                    tutor.isAvailable
                      ? 'bg-primary text-white hover:opacity-90'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {tutor.isAvailable ? 'Réserver' : 'Indisponible'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {tutors.length === 0 && (
          <div className="mt-10 animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection text-center">
            <div className="py-12">
              <div className="text-6xl mb-4">👨‍🏫</div>
              <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
                Aucun tuteur attribué
              </h3>
              <p className="text-waterloo dark:text-manatee mb-6">
                Aucun tuteur ne vous a encore été attribué. Contactez l&apos;administration pour obtenir des tuteurs.
              </p>
            </div>
          </div>
        )}

      </div>

      {bookingTutorId && (
        <CreateSessionModal
          tutors={tutors.map(t => ({ id: t.id, name: t.name }))}
          preselectedTutorId={bookingTutorId}
          onClose={() => setBookingTutorId(null)}
          onSuccess={() => {
            setBookingTutorId(null);
            setAlertTitle('Séance demandée');
            setAlertMessage('Votre demande de séance a bien été envoyée au tuteur.');
            setAlertType('success');
            setShowAlert(true);
          }}
        />
      )}

      <AlertModal
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
      />
    </main>
  );
}
