"use client";
export const dynamic = 'force-dynamic';
import { useEffect, useMemo, useState } from 'react';
import { formatMinutes } from '@/lib/time-utils';

type TabKey = 'historique' | 'reglements' | 'recap';

export default function TutorPaiements() {
  const months = useMemo(() => {
    const now = new Date();
    const list: Array<{ value: string; label: string }> = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      const label = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      list.push({ value, label });
    }
    return list;
  }, []);
  const [activeTab, setActiveTab] = useState<TabKey>('historique');
  const [history, setHistory] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>(undefined);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [annual, setAnnual] = useState<any[]>([]);

  useEffect(() => {
    const m = months[0]?.value;
    setSelectedMonth(m);
  }, [months]);

  useEffect(() => {
    if (!selectedMonth) return;
    (async () => {
      const res = await fetch(`/api/tutor/payments/history?month=${encodeURIComponent(selectedMonth)}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setHistory(data.items || []);
      }
    })();
  }, [selectedMonth]);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/tutor/payments/payouts', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setPayouts(data.payouts || []);
      }
    })();
    (async () => {
      const res = await fetch('/api/tutor/payments/annual', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAnnual(data.summary || []);
      }
    })();
  }, []);

  return (
    <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
      <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
        <h1 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">Mes paiements</h1>

        <div className="mt-6 flex items-center gap-6 overflow-x-auto border-b border-stroke pb-2 text-sm dark:border-strokedark">
          <button onClick={() => setActiveTab('historique')} className={`${activeTab==='historique'?'text-[#4a56e2] font-medium':'text-waterloo dark:text-manatee'}`}>Historique des cours</button>
          <button onClick={() => setActiveTab('reglements')} className={`${activeTab==='reglements'?'text-[#4a56e2] font-medium':'text-waterloo dark:text-manatee'}`}>Règlements</button>
          <button onClick={() => setActiveTab('recap')} className={`${activeTab==='recap'?'text-[#4a56e2] font-medium':'text-waterloo dark:text-manatee'}`}>Récapitulatif annuel</button>
        </div>

        {activeTab==='historique' && (
          <section className="mt-6">
            <div className="mb-3 w-full sm:w-80">
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-full rounded-md border border-stroke bg-transparent px-3 py-2 text-sm dark:border-strokedark">
                {months.map(m => (<option key={m.value} value={m.value}>{m.label}</option>))}
              </select>
            </div>
            <div className="mb-4 rounded-md border border-[#dbe7ff] bg-[#f1f6ff] p-3 text-sm text-[#4a56e2]">Un cours déclaré pour un total de 2h00</div>
            <div className="overflow-x-auto rounded-lg border border-stroke bg-white p-5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
              <table className="min-w-[700px] w-full text-left text-para2">
                <thead>
                  <tr className="border-b border-stroke text-waterloo dark:border-strokedark dark:text-manatee">
                    <th className="py-3 pr-6">Date déclaration</th>
                    <th className="py-3 pr-6">Élève</th>
                    <th className="py-3 pr-6">Cours</th>
                    <th className="py-3 pr-6">Heure</th>
                    <th className="py-3">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id} className="border-b border-stroke last:border-0 dark:border-strokedark">
                      <td className="py-3 pr-6">{new Date(h.declaredAt).toLocaleDateString('fr-FR')}</td>
                      <td className="py-3 pr-6">{h.student} ({h.subject} / {h.level})</td>
                      <td className="py-3 pr-6">{new Date(h.declaredAt).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })} - Durée : {formatMinutes(h.durationMinutes||0)}</td>
                      <td className="py-3 pr-6">{formatMinutes(h.durationMinutes||0)}</td>
                      <td className="py-3"><span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-gray-800 dark:text-green-300">{h.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-xs text-waterloo dark:text-manatee">Colonne Heure = Nombre d'heures comptabilisées en tenant compte de la gestion des 1/2 heures.</p>
            </div>
          </section>
        )}

        {activeTab==='reglements' && (
          <section className="mt-6 overflow-x-auto rounded-lg border border-stroke bg-white p-5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
            <table className="min-w-[700px] w-full text-left text-para2">
              <thead>
                <tr className="border-b border-stroke text-waterloo dark:border-strokedark dark:text-manatee">
                  <th className="py-3 pr-6">Date</th>
                  {/* <th className="py-3 pr-6">Montant</th> */}
                  <th className="py-3">N° Compte</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p, idx) => (
                  <tr key={idx} className={`${idx%2===1?'bg-[#efefef] dark:bg-[#1f1f1f]':''}`}>
                    <td className="py-3 pr-6">{p.date ? new Date(p.date).toLocaleDateString('fr-FR') : '—'}</td>
                    {/* <td className="py-3 pr-6">{(p.amountCents/100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td> */}
                    <td className="py-3">{p.accountMasked}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {activeTab==='recap' && (
          <section className="mt-6 overflow-x-auto rounded-lg border border-stroke bg-white p-5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
            <table className="min-w-[600px] w-full text-left text-para2">
              <thead>
                <tr className="border-b border-stroke text-waterloo dark:border-strokedark dark:text-manatee">
                  <th className="py-3 pr-6">Année</th>
                  {/* <th className="py-3 pr-6">Montant net imposable</th>
                  <th className="py-3">Montant Impôt PAS</th> */}
                </tr>
              </thead>
              <tbody>
                {annual.map((r: any) => (
                  <tr key={r.year} className="border-b border-stroke last:border-0 dark:border-strokedark">
                    <td className="py-3 pr-6">{r.year}</td>
                    {/* <td className="py-3 pr-6">{(r.netCents/100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
                    <td className="py-3">{(r.pasCents/100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </main>
  );
}


