"use client";

export const dynamic = "force-dynamic";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  CLIENT_PLANS,
  LEVEL_COLORS,
  formatEuros,
  type PlanLevel,
} from "@/lib/payments-catalog";

interface CreditRow {
  level: PlanLevel;
  remaining_sessions: number;
  total_purchased: number;
  total_consumed: number;
}
interface PaymentRow {
  id: string;
  plan_id: string;
  kind: string;
  level: string | null;
  sessions_count: number;
  amount_cents: number;
  currency: string;
  status: string;
  receipt_url: string | null;
  hosted_invoice_url: string | null;
  invoice_pdf_url: string | null;
  created_at: string;
  paid_at: string | null;
}
interface SubscriptionRow {
  id: string;
  stripe_subscription_id: string;
  plan_id: string;
  level: string | null;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
}
interface OverviewData {
  credits: CreditRow[];
  payments: PaymentRow[];
  subscription: SubscriptionRow | null;
}

export default function StudentPaiementsPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  const fetchOverview = useCallback(async () => {
    try {
      const res = await fetch("/api/student/payments/overview", { credentials: "include" });
      if (!res.ok) throw new Error("Erreur chargement");
      const json = (await res.json()) as OverviewData;
      setData(json);
    } catch {
      toast.error("Impossible de charger vos paiements");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const onPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/student/payments/portal", {
        method: "POST",
        credentials: "include",
      });
      const body = await res.json();
      if (!res.ok || !body?.url) throw new Error(body?.error || "Erreur portail");
      window.location.href = body.url;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erreur portail";
      toast.error(msg);
      setPortalLoading(false);
    }
  };

  const totalSessions = useMemo(
    () => (data?.credits || []).reduce((sum, c) => sum + (c.remaining_sessions || 0), 0),
    [data]
  );

  return (
    <main className="pb-20 pt-10 lg:pb-25 xl:pb-30">
      <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
        {/* ============== HEADER ============== */}
        <div className="animate_top">
          <h1 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">
            Mes paiements
          </h1>
          <p className="mt-3 text-para2 text-waterloo dark:text-manatee">
            Gère tes achats, tes séances restantes et télécharge tes factures en toute sécurité.
          </p>
        </div>

        {/* ============== TOP STATS ============== */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <StatCard
            loading={loading}
            label="Séances disponibles"
            value={totalSessions.toString()}
            hint={totalSessions > 0 ? "Prêtes à être réservées" : "Aucune séance en solde"}
            accent="primary"
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M2 12h20" />
              </svg>
            }
          />
          <StatCard
            loading={loading}
            label="Abonnement"
            value={data?.subscription ? "Actif" : "Aucun"}
            hint={
              data?.subscription
                ? `Prochain prélèvement ${formatDate(data.subscription.current_period_end)}`
                : "Souscris pour automatiser tes séances"
            }
            accent={data?.subscription ? "emerald" : "slate"}
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 11-3-6.7M21 3v6h-6" />
              </svg>
            }
          />
          <StatCard
            loading={loading}
            label="Dernier paiement"
            value={
              data?.payments?.[0]
                ? formatEuros(data.payments[0].amount_cents)
                : "—"
            }
            hint={
              data?.payments?.[0]
                ? formatDate(data.payments[0].paid_at || data.payments[0].created_at)
                : "Aucun paiement"
            }
            accent="sky"
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 7H4a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM2 11h20" />
              </svg>
            }
          />
        </div>

        {/* ============== CRÉDITS PAR NIVEAU ============== */}
        {!loading && (data?.credits?.length ?? 0) > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-xl font-semibold text-black dark:text-white">
              Mon solde par niveau
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {data!.credits.map((c) => {
                const colors = LEVEL_COLORS[c.level] || LEVEL_COLORS.COLLEGE;
                return (
                  <div
                    key={c.level}
                    className={`rounded-xl border border-stroke bg-white p-5 shadow-solid-3 dark:border-strokedark dark:bg-blacksection`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${colors.bg} ${colors.text}`}>
                        {levelLabel(c.level)}
                      </span>
                      <span className="text-xs text-waterloo dark:text-manatee">
                        {c.total_consumed} / {c.total_purchased} utilisées
                      </span>
                    </div>
                    <div className="mt-3 text-3xl font-bold text-black dark:text-white">
                      {c.remaining_sessions}
                      <span className="ml-2 text-sm font-normal text-waterloo dark:text-manatee">séances restantes</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ============== ABONNEMENT ACTIF ============== */}
        {!loading && data?.subscription && (
          <section className="mt-10 rounded-xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  </span>
                  Abonnement actif
                </div>
                <h3 className="mt-1 text-lg font-bold text-black dark:text-white">
                  {planName(data.subscription.plan_id)}
                </h3>
                <p className="mt-1 text-sm text-waterloo dark:text-manatee">
                  {data.subscription.cancel_at_period_end
                    ? `Résiliation prévue le ${formatDate(data.subscription.current_period_end)}`
                    : `Prochain prélèvement le ${formatDate(data.subscription.current_period_end)}`}
                </p>
              </div>
              <button
                onClick={onPortal}
                disabled={portalLoading}
                className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-black/80 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-white/90"
              >
                {portalLoading ? "Ouverture..." : "Gérer mon abonnement"}
              </button>
            </div>
          </section>
        )}

        {/* ============== HISTORIQUE ============== */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold text-black dark:text-white">Historique des paiements</h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-stroke bg-white dark:border-strokedark dark:bg-blacksection">
            {loading ? (
              <div className="p-8 text-center text-waterloo dark:text-manatee">Chargement...</div>
            ) : !data?.payments?.length ? (
              <div className="p-12 text-center">
                <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3h18v4H3zM5 7v14h14V7M9 11h6M9 15h6" />
                  </svg>
                </div>
                <p className="font-medium text-black dark:text-white">Aucun paiement pour l&apos;instant</p>
                <p className="mt-1 text-sm text-waterloo dark:text-manatee">
                  Tes achats et factures apparaîtront ici.
                </p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-stroke bg-gray-50 text-left text-xs uppercase tracking-wider text-waterloo dark:border-strokedark dark:bg-black/40 dark:text-manatee">
                  <tr>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Produit</th>
                    <th className="px-5 py-3 font-medium">Montant</th>
                    <th className="px-5 py-3 font-medium">Statut</th>
                    <th className="px-5 py-3 font-medium text-right">Facture</th>
                  </tr>
                </thead>
                <tbody>
                  {data.payments.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-stroke last:border-0 dark:border-strokedark"
                    >
                      <td className="px-5 py-3 text-black dark:text-white">
                        {formatDate(p.paid_at || p.created_at)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-black dark:text-white">{planName(p.plan_id)}</div>
                        <div className="text-xs text-waterloo dark:text-manatee">
                          {p.kind === "SUBSCRIPTION"
                            ? "Renouvellement mensuel"
                            : p.kind === "PACK"
                              ? `Pack de ${p.sessions_count} séances`
                              : "Achat de séance"}
                        </div>
                      </td>
                      <td className="px-5 py-3 font-semibold text-black dark:text-white">
                        {formatEuros(p.amount_cents)}
                      </td>
                      <td className="px-5 py-3">
                        <StatusPill status={p.status} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        {p.invoice_pdf_url || p.hosted_invoice_url ? (
                          <a
                            href={p.invoice_pdf_url || p.hosted_invoice_url || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                          >
                            PDF
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M7 17L17 7M7 7h10v10" />
                            </svg>
                          </a>
                        ) : (
                          <span className="text-waterloo dark:text-manatee">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* ============== TRUST SECTION ============== */}
        <section className="mt-10 rounded-xl border border-stroke bg-gray-50 p-6 dark:border-strokedark dark:bg-black/30">
          <div className="flex flex-wrap items-center gap-6">
            <TrustItem icon="🔒" label="Paiement sécurisé" desc="Traitement par Stripe · PCI-DSS" />
            <TrustItem icon="↩️" label="Remboursement simple" desc="Droit de rétractation 14j" />
            <TrustItem icon="🧾" label="Factures auto" desc="Téléchargeables à tout moment" />
            <TrustItem icon="🇪🇺" label="Données hébergées UE" desc="Conforme RGPD" />
          </div>
        </section>
      </div>
    </main>
  );
}

// =============================================================
// Sub components
// =============================================================

function StatCard({
  label,
  value,
  hint,
  icon,
  accent,
  loading,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
  accent: "primary" | "emerald" | "sky" | "slate";
  loading?: boolean;
}) {
  const accentClass =
    accent === "primary"
      ? "bg-primary/10 text-primary"
      : accent === "emerald"
        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
        : accent === "sky"
          ? "bg-sky-500/10 text-sky-600 dark:text-sky-300"
          : "bg-gray-500/10 text-gray-600 dark:text-gray-300";

  return (
    <div className="rounded-xl border border-stroke bg-white p-5 shadow-solid-3 dark:border-strokedark dark:bg-blacksection">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-waterloo dark:text-manatee">{label}</p>
          <p className="mt-2 text-3xl font-bold text-black dark:text-white">
            {loading ? <span className="inline-block h-7 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" /> : value}
          </p>
          {hint && <p className="mt-1 text-xs text-waterloo dark:text-manatee">{hint}</p>}
        </div>
        {icon && <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${accentClass}`}>{icon}</span>}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; label: string }> = {
    PAID: { bg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300", label: "Payé" },
    PENDING: { bg: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300", label: "En attente" },
    FAILED: { bg: "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300", label: "Échec" },
    REFUNDED: { bg: "bg-gray-200 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300", label: "Remboursé" },
    CANCELED: { bg: "bg-gray-200 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300", label: "Annulé" },
  };
  const m = map[status] ?? map.PENDING;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${m.bg}`}>
      {m.label}
    </span>
  );
}

function TrustItem({ icon, label, desc }: { icon: string; label: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <div className="text-sm font-semibold text-black dark:text-white">{label}</div>
        <div className="text-xs text-waterloo dark:text-manatee">{desc}</div>
      </div>
    </div>
  );
}

// =============================================================
// Helpers
// =============================================================

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function levelLabel(level: string): string {
  switch (level) {
    case "COLLEGE":
      return "Collège";
    case "LYCEE":
      return "Lycée";
    case "SUPERIEUR":
      return "Supérieur";
    default:
      return level;
  }
}

function planName(planId: string): string {
  const p = CLIENT_PLANS.find((x) => x.id === planId);
  return p ? `${p.name} · ${p.levelLabel}` : planId;
}
