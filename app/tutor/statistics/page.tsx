"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

type Period = 'session' | 'week' | 'month' | 'year';

export default function TutorStudentStatisticsPage() {
  return (
    <Suspense fallback={<div className="pb-20 pt-15 lg:pb-25 xl:pb-30"><div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0"><div className="text-waterloo dark:text-manatee">Chargement…</div></div></div>}>
      <TutorStudentStatisticsClient />
    </Suspense>
  );
}

function TutorStudentStatisticsClient() {
  const search = useSearchParams();
  const router = useRouter();
  const studentId = search?.get('student') ?? '';

  const [assessments, setAssessments] = useState<any[]>([]);
  const [period, setPeriod] = useState<Period>('month');
  const [globalNote, setGlobalNote] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!studentId) return;
    const loadAssessments = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/tutor/session-assessments?studentId=${encodeURIComponent(studentId)}`, { credentials: 'include' });
        const json = await res.json().catch(() => ({ assessments: [] }));
        if (res.ok) setAssessments(json.assessments || json || []);
      } finally {
        setLoading(false);
      }
    };
    loadAssessments();
  }, [studentId]);

  useEffect(() => {
    if (!assessments || assessments.length === 0) {
      setGlobalNote(null);
      return;
    }
    const filtered = filterAssessmentsByPeriod(assessments, period);
    if (filtered.length === 0) {
      setGlobalNote(null);
      return;
    }
    const metricsKeys: Array<keyof typeof filtered[number]> = [
      'concentration',
      'participation',
      'preparation',
      'improvement',
      'retention',
      'comprehension',
      'time_management',
      'collaboration',
    ];
    const averages = metricsKeys.map((k) => average(filtered.map((a: any) => a[k] as number)));
    const overall = average(averages);
    setGlobalNote(Number.isFinite(overall) ? overall : null);
  }, [assessments, period]);

  return (
    <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
      <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
        <div className="animate_top">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">Statistiques élève</h1>
            <button onClick={() => router.push('/tutor/eleves')} className="rounded-md border border-stroke px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-strokedark dark:hover:bg-gray-800">← Retour</button>
          </div>
          {!studentId && (
            <p className="mt-4 text-para2 text-waterloo dark:text-manatee">Sélectionnez d'abord un élève depuis la page Mes élèves.</p>
          )}
        </div>

        {studentId && (
          <>
            <div className="mt-8 flex items-center justify-between">
              <div className="text-lg">
                Note globale: <span className="font-semibold">{globalNote !== null ? `${globalNote.toFixed(1)}/5` : 'N/A'}</span>
              </div>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as Period)}
                className="border border-stroke dark:border-strokedark bg-transparent rounded px-2 py-1 text-sm"
              >
                <option value="session">Par séance</option>
                <option value="week">Par semaine</option>
                <option value="month">Par mois</option>
                <option value="year">Par année</option>
              </select>
            </div>

            <div className="mt-8 animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
              {loading ? (
                <div className="text-waterloo dark:text-manatee">Chargement…</div>
              ) : (
                <MetricsBars assessments={assessments} period={period} />
              )}
            </div>

            <div className="mt-8 animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
              <h2 className="text-xl font-semibold text-black dark:text-white mb-4">Évolution de la note globale</h2>
              {loading ? (
                <div className="text-waterloo dark:text-manatee">Chargement…</div>
              ) : (
                <GlobalNoteTimeline assessments={assessments} period={period} />
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function MetricsBars({ assessments, period }: { assessments: any[]; period: Period }) {
  const data = filterAssessmentsByPeriod(assessments, period);
  const categories = [
    { key: 'concentration', label: 'Niveau de concentration' },
    { key: 'participation', label: 'Participation' },
    { key: 'preparation', label: 'Niveau de préparation' },
    { key: 'improvement', label: 'Amélioration (vs dernière séance)' },
    { key: 'retention', label: "Rétention d’information (vs dernière séance)" },
    { key: 'comprehension', label: 'Compréhension globale' },
    { key: 'time_management', label: 'Gestion de temps' },
    { key: 'collaboration', label: 'Collaboration (en groupe)' },
  ] as const;

  if (!data || data.length === 0) {
    return <div className="text-waterloo dark:text-manatee text-sm">Aucune donnée disponible.</div>;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {categories.map((cat) => {
        const avg = average(data.map((a: any) => a[cat.key] as number));
        return (
          <div key={cat.key} className="p-3 rounded border border-stroke dark:border-strokedark">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">{cat.label}</span>
              <span className="text-sm font-medium">{avg.toFixed(1)}/5</span>
            </div>
            <Bar value={avg} />
          </div>
        );
      })}
    </div>
  );
}

function Bar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded">
      <div className="h-3 bg-primary rounded" style={{ width: `${pct}%` }} />
    </div>
  );
}

function GlobalNoteTimeline({ assessments, period }: { assessments: any[]; period: Period }) {
  const buckets = bucketByPeriodWithSort(assessments, period);
  const points = buckets.map(({ label, items }) => ({
    label,
    value: computeGlobal(items),
  }));

  if (points.length === 0) {
    return <div className="text-waterloo dark:text-manatee text-sm">Aucune donnée disponible.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[720px]">
        <div className="mb-3">
          <div className="relative h-6">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gray-300 dark:bg-gray-700" />
            <div className="flex justify-between text-xs text-waterloo dark:text-manatee">
              {[0,1,2,3,4,5].map((n) => (
                <span key={n}>{n}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {points.map((p) => (
            <div key={p.label} className="flex items-center gap-3">
              <div className="w-40 shrink-0 text-xs text-waterloo dark:text-manatee">{p.label}</div>
              <HorizontalBar value={p.value} />
              <div className="w-10 text-right text-sm font-medium">{p.value.toFixed(1)}/5</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HorizontalBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded">
      <div className="h-4 bg-primary rounded" style={{ width: `${pct}%` }} />
    </div>
  );
}

function bucketByPeriodWithSort(list: any[], period: Period) {
  const map = new Map<string, { items: any[]; sortTs: number }>();
  for (const a of list) {
    const dt = new Date(a.created_at || a.updated_at || Date.now());
    let key = '';
    if (period === 'session') key = new Date(dt).toLocaleString('fr-FR');
    if (period === 'week') key = `${dt.getFullYear()}-S${getWeek(dt)}`;
    if (period === 'month') key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
    if (period === 'year') key = `${dt.getFullYear()}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { items: [a], sortTs: dt.getTime() });
    } else {
      existing.items.push(a);
      existing.sortTs = Math.min(existing.sortTs, dt.getTime());
    }
  }
  return Array.from(map.entries())
    .sort((a, b) => a[1].sortTs - b[1].sortTs)
    .map(([label, v]) => ({ label, items: v.items }));
}

function computeGlobal(items: any[]) {
  if (!items || items.length === 0) return 0;
  const metricsKeys: Array<keyof typeof items[number]> = [
    'concentration','participation','preparation','improvement','retention','comprehension','time_management','collaboration'
  ];
  const averages = metricsKeys.map((k) => average(items.map((a: any) => a[k] as number)));
  return average(averages);
}

function getWeek(date: Date) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((target as any) - (yearStart as any)) / 86400000 + 1) / 7);
  return weekNo;
}

function filterAssessmentsByPeriod(list: any[], period: Period) {
  if (!list || list.length === 0) return [];
  if (period === 'session') {
    return [list[0]];
  }
  const now = new Date();
  const from = new Date(now);
  if (period === 'week') from.setDate(now.getDate() - 7);
  if (period === 'month') from.setDate(now.getDate() - 30);
  if (period === 'year') from.setDate(now.getDate() - 365);
  return list.filter((a) => {
    const dt = new Date(a.created_at || a.updated_at || Date.now());
    return dt >= from && dt <= now;
  });
}

function average(arr: number[]) {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}


