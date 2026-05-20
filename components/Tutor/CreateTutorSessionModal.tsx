"use client";

import { useState } from "react";

const HOURS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"));
const QUARTER_HOURS = ["00", "15", "30", "45"];

type Student = {
  id: string;
  name: string;
};

export default function CreateTutorSessionModal({
  students,
  onClose,
  onSuccess,
}: {
  students: Student[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const today = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState({
    selectedStudentIds: [] as string[],
    subject: "",
    duration: 60,
    sessionDate: today,
    sessionTime: "14:00",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          studentId: formData.selectedStudentIds[0],
          studentIds: formData.selectedStudentIds,
          subject: formData.subject,
          duration: formData.duration,
          startedAt: `${formData.sessionDate}T${formData.sessionTime}:00`,
        }),
      });

      if (res.ok) {
        onSuccess();
        return;
      }

      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erreur lors de la creation de la seance");
    } catch {
      setError("Erreur de connexion");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div
        className="max-h-[82vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-solid-5 dark:bg-blacksection"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-black dark:text-white">Creer une seance</h3>
          <button
            type="button"
            aria-label="Fermer"
            className="flex h-9 w-9 items-center justify-center rounded-full text-waterloo transition hover:bg-primary/10 hover:text-primary dark:text-manatee"
            onClick={onClose}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-black dark:text-white">Eleves</label>
            {students.length === 0 ? (
              <div className="rounded-lg border border-stroke bg-gray-50 px-3 py-2 text-sm text-waterloo dark:border-strokedark dark:bg-gray-800 dark:text-manatee">
                Aucun eleve assigne pour le moment.
              </div>
            ) : (
              <select
                multiple
                value={formData.selectedStudentIds}
                onChange={(event) => {
                  const selectedStudentIds = Array.from(event.target.selectedOptions).map((option) => option.value);
                  setFormData({ ...formData, selectedStudentIds });
                }}
                className="min-h-[112px] w-full rounded-lg border border-stroke bg-transparent px-3 py-2 text-sm dark:border-strokedark"
                required
              >
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-black dark:text-white">Matiere</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(event) => setFormData({ ...formData, subject: event.target.value })}
              className="w-full rounded-lg border border-stroke bg-transparent px-3 py-2 text-sm dark:border-strokedark"
              placeholder="Mathematiques, physique..."
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-black dark:text-white">Duree</label>
            <select
              value={formData.duration}
              onChange={(event) => setFormData({ ...formData, duration: Number(event.target.value) })}
              className="w-full rounded-lg border border-stroke bg-transparent px-3 py-2 text-sm dark:border-strokedark"
            >
              <option value={30}>30 minutes</option>
              <option value={60}>1 heure</option>
              <option value={90}>1h30</option>
              <option value={120}>2 heures</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-black dark:text-white">Date</label>
            <input
              type="date"
              value={formData.sessionDate}
              onChange={(event) => setFormData({ ...formData, sessionDate: event.target.value })}
              className="w-full rounded-lg border border-stroke bg-transparent px-3 py-2 text-sm dark:border-strokedark"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-black dark:text-white">Heure</label>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <select
                value={formData.sessionTime.split(":")[0] || ""}
                onChange={(event) => {
                  const minutes = formData.sessionTime.split(":")[1] || "00";
                  setFormData({ ...formData, sessionTime: `${event.target.value}:${minutes}` });
                }}
                className="w-full rounded-lg border border-stroke bg-transparent px-3 py-2 text-sm dark:border-strokedark"
                required
                aria-label="Heure"
              >
                <option value="">HH</option>
                {HOURS.map((hour) => (
                  <option key={hour} value={hour}>
                    {hour}
                  </option>
                ))}
              </select>
              <span className="text-base font-semibold text-black dark:text-white">:</span>
              <select
                value={formData.sessionTime.split(":")[1] || ""}
                onChange={(event) => {
                  const hour = formData.sessionTime.split(":")[0] || "08";
                  setFormData({ ...formData, sessionTime: `${hour}:${event.target.value}` });
                }}
                className="w-full rounded-lg border border-stroke bg-transparent px-3 py-2 text-sm dark:border-strokedark"
                required
                aria-label="Minutes"
              >
                <option value="">MM</option>
                {QUARTER_HOURS.map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-black transition hover:bg-gray-50 dark:border-strokedark dark:text-white dark:hover:bg-gray-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving || students.length === 0}
              className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Creation..." : "Creer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
