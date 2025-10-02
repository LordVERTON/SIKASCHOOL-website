"use client";

import { useState } from 'react';

interface AssessmentModalProps {
  open: boolean;
  onClose: () => void;
  sessionId: string | null;
  studentId: string | null;
  sessionLabel?: string;
}

export default function AssessmentModal({ open, onClose, sessionId, studentId, sessionLabel }: AssessmentModalProps) {
  const [form, setForm] = useState({
    concentration: 3,
    participation: 3,
    preparation: 3,
    improvement: 3,
    retention: 3,
    comprehension: 3,
    time_management: 3,
    collaboration: 3,
    notes: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const Range = ({ name, label }: { name: keyof typeof form; label: string }) => (
    <div>
      <label className="block text-sm text-waterloo dark:text-manatee mb-1">{label}</label>
      <input
        type="range"
        min={1}
        max={5}
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: parseInt(e.target.value) })}
        className="w-full"
      />
      <div className="text-xs text-right text-waterloo">{form[name]}/5</div>
    </div>
  );

  const submit = async () => {
    if (!sessionId || !studentId) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/tutor/session-assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sessionId, studentId, ...form })
      });
      if (!res.ok) throw new Error('Échec de l’enregistrement');
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-3xl rounded-lg border border-stroke dark:border-strokedark bg-white dark:bg-blacksection p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-black dark:text-white">{sessionLabel || 'Évaluation de la séance'}</h2>
          <button onClick={onClose} className="text-waterloo hover:text-black dark:text-manatee dark:hover:text-white">✕</button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Range name="concentration" label="Niveau de concentration" />
          <Range name="participation" label="Participation" />
          <Range name="preparation" label="Niveau de préparation" />
          <Range name="improvement" label="Amélioration" />
          <Range name="retention" label="Rétention d’information" />
          <Range name="comprehension" label="Compréhension globale" />
          <Range name="time_management" label="Gestion de temps" />
          <Range name="collaboration" label="Collaboration (en groupe)" />
        </div>

        <div className="mt-4">
          <label className="block text-sm text-waterloo dark:text-manatee mb-1">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full border border-stroke dark:border-strokedark rounded p-2 dark:bg-blacksection"
            rows={4}
          />
        </div>

        {error && <div className="text-red-600 text-sm mt-3">{error}</div>}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-stroke dark:border-strokedark rounded-md text-black dark:text-white">Annuler</button>
          <button onClick={submit} disabled={saving} className="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50">
            {saving ? 'Enregistrement…' : 'Valider la session'}
          </button>
        </div>
      </div>
    </div>
  );
}


