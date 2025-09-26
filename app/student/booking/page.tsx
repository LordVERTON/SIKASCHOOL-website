"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Tutor {
  id: string;
  name: string;
  avatar: string;
  subjects: string[];
  rating: number;
  pricePerHour: number;
  bio: string;
  availability: string[];
}

interface BookingForm {
  tutorId: string;
  subject: string;
  sessionType: 'NOTA' | 'AVA' | 'TODA';
  level: 'Collège' | 'Lycée' | 'Supérieur';
  date: string;
  time: string;
  duration: number;
  notes: string;
}

export default function BookingPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [formData, setFormData] = useState<BookingForm>({
    tutorId: '',
    subject: '',
    sessionType: 'NOTA',
    level: 'Lycée',
    date: '',
    time: '',
    duration: 60,
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Tuteurs de SikaSchool avec leurs spécialisations
    const mockTutors: Tutor[] = [
        {
          id: '1',
          name: 'Alix Tarrade',
          avatar: '/images/team/alix.jpg',
          subjects: ['Français', 'Méthodologie', 'Droits'],
          rating: 0, // Note retirée
          pricePerHour: 60,
          bio: 'Spécialiste en français et méthodologie, diplômée en lettres modernes et en droit. Approche pédagogique adaptée du collège au supérieur.',
          availability: ['Lundi 14h-18h', 'Mercredi 16h-20h', 'Samedi 10h-14h']
        },
        {
          id: '2',
          name: 'Nolwen Verton',
          avatar: '/images/team/nolwen.jpg',
          subjects: ['Mathématiques', 'Mécanique'],
          rating: 0, // Note retirée
          pricePerHour: 60,
          bio: 'Ingénieur de formation, passionnée par les mathématiques et la mécanique. Expertise solide dans les sciences exactes avec approche pratique.',
          availability: ['Mardi 15h-19h', 'Jeudi 14h-18h', 'Dimanche 10h-16h']
        },
        {
          id: '3',
          name: 'Ruudy Mbouza-Bayonne',
          avatar: '/images/team/ruudy.jpg',
          subjects: ['Mécanique des fluides', 'Physique', 'Mathématiques'],
          rating: 0, // Note retirée
          pricePerHour: 70,
          bio: 'Expert en mécanique des fluides et physique, docteur en physique. Expérience internationale et pédagogie exceptionnelle.',
          availability: ['Lundi 16h-20h', 'Mercredi 14h-18h', 'Vendredi 15h-19h']
        },
        {
          id: '4',
          name: 'Daniel Verton',
          avatar: '/images/team/daniel.jpg',
          subjects: ['Mathématiques', 'Physique', 'Informatique', 'Sciences de l\'ingénieur'],
          rating: 0, // Note retirée
          pricePerHour: 65,
          bio: 'Polyvalent et expérimenté, ingénieur diplômé en informatique. Méthode pédagogique structurée et approche pratique.',
          availability: ['Lundi 14h-18h', 'Mercredi 16h-20h', 'Samedi 10h-14h', 'Dimanche 14h-18h']
        },
        {
          id: '5',
          name: 'Walid Lakas',
          avatar: '/images/team/walid.jpg',
          subjects: ['Mathématiques', 'Informatique', 'Physique'],
          rating: 0, // Note retirée
          pricePerHour: 60,
          bio: 'Spécialiste en mathématiques et informatique, diplômé en informatique et mathématiques appliquées. Approche méthodique et progressive.',
          availability: ['Mardi 15h-19h', 'Jeudi 14h-18h', 'Vendredi 16h-20h']
        }
    ];
    
    setTimeout(() => {
      setTutors(mockTutors);
      setLoading(false);
    }, 1000);
  }, []);

  const handleTutorSelect = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setFormData(prev => ({ ...prev, tutorId: tutor.id }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Simuler la soumission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Ici, vous feriez l'appel API pour créer la réservation
      console.warn('Réservation créée:', formData);
      
      // Rediriger vers le dashboard ou afficher un message de succès
      alert('Réservation créée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la réservation:', error);
      alert('Erreur lors de la création de la réservation');
    } finally {
      setSubmitting(false);
    }
  };

  const calculatePrice = () => {
    if (!selectedTutor) return 0;
    
    const basePrice = selectedTutor.pricePerHour;
    const multiplier = formData.sessionType === 'AVA' ? 1.2 : formData.sessionType === 'TODA' ? 1.4 : 1;
    const durationHours = formData.duration / 60;
    
    return Math.round(basePrice * multiplier * durationHours);
  };

  if (loading) {
    return (
      <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
        <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
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
            Réserver une séance
          </h1>
          <p className="mt-4 text-para2 text-waterloo dark:text-manatee">
            Choisissez votre tuteur et planifiez votre prochain cours particulier.
          </p>
        </div>

        <div className="mt-10 grid gap-7.5 lg:grid-cols-2">
          {/* Sélection du tuteur */}
          <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-6">
              Choisir un tuteur
            </h2>
            <div className="space-y-4">
              {tutors.map((tutor) => (
                <div
                  key={tutor.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedTutor?.id === tutor.id
                      ? 'border-primary bg-primary/5'
                      : 'border-stroke dark:border-strokedark hover:border-primary/50'
                  }`}
                  onClick={() => handleTutorSelect(tutor)}
                >
                  <div className="flex items-start space-x-4">
                    <Image
                      src={tutor.avatar}
                      alt={tutor.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-black dark:text-white">{tutor.name}</h3>
                      <p className="text-sm text-waterloo dark:text-manatee mb-2">{tutor.bio}</p>
                      <div className="mt-2">
                        <p className="text-xs text-waterloo dark:text-manatee mb-1">Matières:</p>
                        <div className="flex flex-wrap gap-1">
                          {tutor.subjects.map((subject) => (
                            <span key={subject} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Formulaire de réservation */}
          <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-6">
              Détails de la séance
            </h2>
            
            {selectedTutor ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Matière
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full p-3 border border-stroke rounded-lg dark:border-strokedark dark:bg-blacksection"
                    required
                  >
                    <option value="">Sélectionner une matière</option>
                    {selectedTutor.subjects.map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Type de séance
                  </label>
                  <select
                    value={formData.sessionType}
                    onChange={(e) => setFormData(prev => ({ ...prev, sessionType: e.target.value as any }))}
                    className="w-full p-3 border border-stroke rounded-lg dark:border-strokedark dark:bg-blacksection"
                  >
                    <option value="NOTA">NOTA - Niveau de base</option>
                    <option value="AVA">AVA - Niveau avancé</option>
                    <option value="TODA">TODA - Niveau expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Niveau
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as any }))}
                    className="w-full p-3 border border-stroke rounded-lg dark:border-strokedark dark:bg-blacksection"
                  >
                    <option value="Collège">Collège</option>
                    <option value="Lycée">Lycée</option>
                    <option value="Supérieur">Supérieur</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full p-3 border border-stroke rounded-lg dark:border-strokedark dark:bg-blacksection"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                      Heure
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full p-3 border border-stroke rounded-lg dark:border-strokedark dark:bg-blacksection"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Durée (minutes)
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full p-3 border border-stroke rounded-lg dark:border-strokedark dark:bg-blacksection"
                  >
                    <option value={60}>1 heure</option>
                    <option value={90}>1h30</option>
                    <option value={120}>2 heures</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Notes (optionnel)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full p-3 border border-stroke rounded-lg dark:border-strokedark dark:bg-blacksection"
                    rows={3}
                    placeholder="Décrivez ce que vous souhaitez travailler..."
                  />
                </div>

                {/* Récapitulatif et prix */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h3 className="font-semibold text-black dark:text-white mb-2">Récapitulatif</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-waterloo dark:text-manatee">Tuteur:</span>
                      <span className="text-black dark:text-white">{selectedTutor.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-waterloo dark:text-manatee">Matière:</span>
                      <span className="text-black dark:text-white">{formData.subject}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-waterloo dark:text-manatee">Type:</span>
                      <span className="text-black dark:text-white">{formData.sessionType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-waterloo dark:text-manatee">Durée:</span>
                      <span className="text-black dark:text-white">{formData.duration}min</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t border-stroke dark:border-strokedark">
                      <span className="text-black dark:text-white">Total:</span>
                      <span className="text-primary">{calculatePrice()}€</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !formData.subject || !formData.date || !formData.time}
                  className="w-full py-3 px-6 bg-primary text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Réservation en cours...' : 'Réserver la séance'}
                </button>
              </form>
            ) : (
              <div className="text-center py-8">
                <p className="text-waterloo dark:text-manatee">
                  Veuillez d'abord sélectionner un tuteur
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Retour au dashboard */}
        <div className="mt-10 text-center">
          <Link
            href="/student/dashboard"
            className="inline-flex items-center px-6 py-3 border border-stroke text-black dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            ← Retour au tableau de bord
          </Link>
        </div>
      </div>
    </main>
  );
}
