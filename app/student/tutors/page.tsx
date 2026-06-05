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

interface Review {
  id: string;
  tutorId: string | null;
  tutorName: string;
  content: string;
  rating: number;
  isApproved: boolean;
  createdAt: string;
}

export default function TutorsPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingTutorId, setBookingTutorId] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const [reviewTutor, setReviewTutor] = useState<Tutor | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/student/reviews', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.warn('Erreur réseau lors de la récupération des commentaires:', error);
    }
  };

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
    fetchReviews();
  }, []);

  const handleReviewSubmit = async () => {
    if (!reviewTutor) return;
    setReviewError(null);

    if (reviewContent.trim().length < 10) {
      setReviewError('Le commentaire doit contenir au moins 10 caractères.');
      return;
    }

    setReviewLoading(true);
    try {
      const response = await fetch('/api/student/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          tutorId: reviewTutor.id,
          rating: reviewRating,
          content: reviewContent,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setReviewError(data?.error || 'Impossible d’envoyer le commentaire.');
        return;
      }

      setReviewTutor(null);
      setReviewContent('');
      setReviewRating(5);
      await fetchReviews();
      setAlertTitle('Commentaire envoyé');
      setAlertMessage(data?.message || 'Votre commentaire sera publié après validation.');
      setAlertType('success');
      setShowAlert(true);
    } catch {
      setReviewError('Erreur réseau lors de l’envoi du commentaire.');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Supprimer ce commentaire ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/student/reviews?reviewId=${encodeURIComponent(reviewId)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setAlertTitle('Suppression impossible');
        setAlertMessage(data?.error || 'Impossible de supprimer ce commentaire.');
        setAlertType('error');
        setShowAlert(true);
        return;
      }

      await fetchReviews();
      setAlertTitle('Commentaire supprimé');
      setAlertMessage('Votre commentaire a bien été supprimé.');
      setAlertType('success');
      setShowAlert(true);
    } catch {
      setAlertTitle('Erreur réseau');
      setAlertMessage('Impossible de supprimer le commentaire pour le moment.');
      setAlertType('error');
      setShowAlert(true);
    }
  };

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

              <div className="space-y-3">
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
                <button
                  type="button"
                  onClick={() => {
                    setReviewTutor(tutor);
                    setReviewError(null);
                    setReviewContent('');
                    setReviewRating(5);
                  }}
                  className="w-full rounded-lg border border-stroke px-4 py-2 text-center text-sm font-medium text-primary transition hover:bg-primary/5 dark:border-strokedark"
                >
                  Laisser un commentaire
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

        {reviews.length > 0 && (
          <section className="mt-12 animate_top">
            <h2 className="text-2xl font-semibold text-black dark:text-white">
              Mes commentaires
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-lg border border-stroke bg-white p-5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection"
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-black dark:text-white">
                        {review.tutorName}
                      </p>
                      <p className="text-sm text-waterloo dark:text-manatee">
                        {new Date(review.createdAt).toLocaleDateString('fr-FR')} · {review.rating}/5
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        review.isApproved
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-200'
                      }`}
                    >
                      {review.isApproved ? 'Publié' : 'En attente'}
                    </span>
                  </div>
                  <p className="text-sm text-waterloo dark:text-manatee">
                    {review.content}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleDeleteReview(review.id)}
                    className="mt-4 text-sm font-medium text-red-600 transition hover:text-red-800 dark:text-red-400"
                  >
                    Supprimer
                  </button>
                </article>
              ))}
            </div>
          </section>
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

      {reviewTutor && (
        <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-solid-10 dark:bg-blacksection">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-black dark:text-white">
                Laisser un commentaire
              </h2>
              <p className="mt-1 text-sm text-waterloo dark:text-manatee">
                Votre avis sur l'accompagnement avec {reviewTutor.name}.
              </p>
            </div>

            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Note
            </label>
            <div className="mb-5 flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setReviewRating(rating)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition ${
                    reviewRating === rating
                      ? 'border-primary bg-primary text-white'
                      : 'border-stroke text-waterloo hover:border-primary hover:text-primary dark:border-strokedark'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>

            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Commentaire
            </label>
            <textarea
              value={reviewContent}
              onChange={(event) => setReviewContent(event.target.value)}
              rows={5}
              placeholder="Partagez votre expérience avec SikaSchool..."
              className="w-full resize-none rounded-lg border border-stroke p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-blacksection"
            />

            {reviewError && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400">{reviewError}</p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setReviewTutor(null)}
                disabled={reviewLoading}
                className="rounded-lg border border-stroke px-5 py-2 text-sm font-medium text-waterloo transition hover:bg-gray-50 disabled:opacity-60 dark:border-strokedark dark:hover:bg-black/30"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleReviewSubmit}
                disabled={reviewLoading}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {reviewLoading ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>
          </div>
        </div>
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
