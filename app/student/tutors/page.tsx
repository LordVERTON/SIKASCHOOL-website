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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  useEffect(() => {
    const fetchTutors = async () => {
      // Tuteurs de SikaSchool avec leurs spécialisations
      const mockTutors: Tutor[] = [
        {
          id: '1',
          name: 'Alix Tarrade',
          avatar: '/images/team/alix.jpg',
          subjects: ['Français', 'Méthodologie', 'Droits'],
          rating: 0, // Note retirée
          totalReviews: 0, // Avis retirés
          pricePerHour: 0, // Tarif retiré de l'affichage
          bio: 'Spécialiste en français et méthodologie, diplômée en lettres modernes et en droit. Approche pédagogique adaptée du collège au supérieur.',
          experience: 7,
          availability: ['Lundi 14h-18h', 'Mercredi 16h-20h', 'Samedi 10h-14h'],
          isAvailable: true,
          totalSessions: 380
        },
        {
          id: '2',
          name: 'Nolwen Verton',
          avatar: '/images/team/nolwen.jpg',
          subjects: ['Mathématiques', 'Mécanique'],
          rating: 0, // Note retirée
          totalReviews: 0, // Avis retirés
          pricePerHour: 0, // Tarif retiré de l'affichage
          bio: 'Ingénieur de formation, passionnée par les mathématiques et la mécanique. Expertise solide dans les sciences exactes avec approche pratique.',
          experience: 5,
          availability: ['Mardi 15h-19h', 'Jeudi 14h-18h', 'Dimanche 10h-16h'],
          isAvailable: true,
          totalSessions: 290
        },
        {
          id: '3',
          name: 'Ruudy Mbouza-Bayonne',
          avatar: '/images/team/ruudy.jpg',
          subjects: ['Mécanique des fluides', 'Physique', 'Mathématiques'],
          rating: 0, // Note retirée
          totalReviews: 0, // Avis retirés
          pricePerHour: 0, // Tarif retiré de l'affichage
          bio: 'Expert en mécanique des fluides et physique, docteur en physique. Expérience internationale et pédagogie exceptionnelle.',
          experience: 12,
          availability: ['Lundi 16h-20h', 'Mercredi 14h-18h', 'Vendredi 15h-19h'],
          isAvailable: true,
          totalSessions: 520
        },
        {
          id: '4',
          name: 'Daniel Verton',
          avatar: '/images/team/daniel.jpg',
          subjects: ['Mathématiques', 'Physique', 'Informatique', 'Sciences de l\'ingénieur'],
          rating: 0, // Note retirée
          totalReviews: 0, // Avis retirés
          pricePerHour: 0, // Tarif retiré de l'affichage
          bio: 'Polyvalent et expérimenté, ingénieur diplômé en informatique. Méthode pédagogique structurée et approche pratique.',
          experience: 10,
          availability: ['Lundi 14h-18h', 'Mercredi 16h-20h', 'Samedi 10h-14h', 'Dimanche 14h-18h'],
          isAvailable: true,
          totalSessions: 650
        },
        {
          id: '5',
          name: 'Walid Lakas',
          avatar: '/images/team/walid.jpg',
          subjects: ['Mathématiques', 'Informatique', 'Physique'],
          rating: 0, // Note retirée
          totalReviews: 0, // Avis retirés
          pricePerHour: 0, // Tarif retiré de l'affichage
          bio: 'Spécialiste en mathématiques et informatique, diplômé en informatique et mathématiques appliquées. Approche méthodique et progressive.',
          experience: 8,
          availability: ['Mardi 15h-19h', 'Jeudi 14h-18h', 'Vendredi 16h-20h'],
          isAvailable: true,
          totalSessions: 420
        }
      ];
      
      setTimeout(() => {
        setTutors(mockTutors);
        setLoading(false);
      }, 1000);
    };

    fetchTutors();
  }, []);

  const allSubjects = Array.from(new Set(tutors.flatMap(tutor => tutor.subjects)));

  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tutor.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = !selectedSubject || tutor.subjects.includes(selectedSubject);
    return matchesSearch && matchesSubject;
  });

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
            Nos tuteurs
          </h1>
          <p className="mt-4 text-para2 text-waterloo dark:text-manatee">
            Découvrez nos professeurs qualifiés et choisissez celui qui vous convient le mieux.
          </p>
        </div>

        {/* Filtres et recherche */}
        <div className="mt-10 animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                Rechercher
              </label>
              <input
                type="text"
                placeholder="Nom du tuteur ou matière..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-stroke rounded-lg dark:border-strokedark dark:bg-blacksection"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                Matière
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full p-3 border border-stroke rounded-lg dark:border-strokedark dark:bg-blacksection"
              >
                <option value="">Toutes les matières</option>
                {allSubjects.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Liste des tuteurs */}
        <div className="mt-10 grid gap-7.5 md:grid-cols-2 lg:grid-cols-3">
          {filteredTutors.map((tutor) => (
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
                <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
                  {tutor.name}
                </h3>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-black dark:text-white mb-2">
                  Matières enseignées:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {tutor.subjects.map((subject) => (
                    <span
                      key={subject}
                      className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-waterloo dark:text-manatee line-clamp-3">
                  {tutor.bio}
                </p>
              </div>

              <div className="mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-waterloo dark:text-manatee">Expérience:</span>
                  <span className="text-black dark:text-white">{tutor.experience} ans</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-waterloo dark:text-manatee">Séances données:</span>
                  <span className="text-black dark:text-white">{tutor.totalSessions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-waterloo dark:text-manatee">Statut:</span>
                  <span className={`font-medium ${
                    tutor.isAvailable ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {tutor.isAvailable ? 'Disponible' : 'Indisponible'}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-black dark:text-white mb-2">
                  Disponibilités:
                </h4>
                <div className="space-y-1">
                  {tutor.availability.slice(0, 3).map((slot, idx) => (
                    <div key={idx} className="text-xs text-waterloo dark:text-manatee">
                      {slot}
                    </div>
                  ))}
                  {tutor.availability.length > 3 && (
                    <div className="text-xs text-primary">
                      +{tutor.availability.length - 3} autres créneaux
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                <Link
                  href={`/student/booking?tutor=${tutor.id}`}
                  className={`flex-1 py-2 px-4 rounded-lg text-center transition ${
                    tutor.isAvailable
                      ? 'bg-primary text-white hover:opacity-90'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {tutor.isAvailable ? 'Réserver' : 'Indisponible'}
                </Link>
                <button className="py-2 px-4 border border-stroke dark:border-strokedark text-black dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  Profil
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredTutors.length === 0 && (
          <div className="mt-10 animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection text-center">
            <div className="py-12">
              <div className="text-6xl mb-4">👨‍🏫</div>
              <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
                Aucun tuteur trouvé
              </h3>
              <p className="text-waterloo dark:text-manatee mb-6">
                Essayez de modifier vos critères de recherche.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSubject('');
                }}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition"
              >
                Réinitialiser les filtres
              </button>
            </div>
          </div>
        )}

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
