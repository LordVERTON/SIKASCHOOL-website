"use client";

import { useState, useEffect } from 'react';

interface Tutor {
  id: string;
  name: string;
}

interface CreateSessionModalProps {
  date?: string | null;
  tutors: Tutor[];
  preselectedTutorId?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateSessionModal({ 
  date, 
  tutors, 
  preselectedTutorId,
  onClose, 
  onSuccess 
}: CreateSessionModalProps) {
  const [selectedTutor, setSelectedTutor] = useState('');
  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState(60);
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (date) {
      setSessionDate(date);
    } else {
      // Date par défaut : aujourd'hui
      const today = new Date();
      setSessionDate(today.toISOString().split('T')[0]);
    }
  }, [date]);

  useEffect(() => {
    if (preselectedTutorId && tutors.some(t => t.id === preselectedTutorId)) {
      setSelectedTutor(preselectedTutorId);
    }
  }, [preselectedTutorId, tutors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const startedAt = `${sessionDate}T${sessionTime}:00`;
      
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          tutorId: selectedTutor,
          subject,
          duration,
          startedAt,
        }),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors de la création de la séance');
      }
      } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose} onTouchMove={(e) => e.preventDefault()}>
      <div className="bg-white dark:bg-blacksection rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-black dark:text-white">Demander une séance</h3>
          <button className="text-waterloo dark:text-manatee" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">
              Tuteur
            </label>
            <select
              value={selectedTutor}
              onChange={(e) => setSelectedTutor(e.target.value)}
              className="w-full p-3 border border-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-blacksection"
              required
            >
              <option value="">Sélectionner un tuteur</option>
              {tutors.map((tutor) => (
                <option key={tutor.id} value={tutor.id}>
                  {tutor.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">
              Matière
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-3 border border-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-blacksection"
              placeholder="Ex: Mathématiques, Physique..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">
              Durée (minutes)
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full p-3 border border-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-blacksection"
            >
              <option value={30}>30 minutes</option>
              <option value={60}>1 heure</option>
              <option value={90}>1h30</option>
              <option value={120}>2 heures</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">
              Date
            </label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full p-3 border border-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-blacksection"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-2">
              Heure
            </label>
            <input
              type="time"
              value={sessionTime}
              onChange={(e) => setSessionTime(e.target.value)}
              className="w-full p-3 border border-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-blacksection"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-stroke text-black dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Demander la séance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
