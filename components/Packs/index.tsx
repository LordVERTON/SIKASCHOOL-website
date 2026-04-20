"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import SectionHeader from "../Common/SectionHeader";
import { CLIENT_PLANS, formatEuros, LEVEL_COLORS } from "@/lib/payments-catalog";

const Packs = () => {
  const router = useRouter();
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);

  const ecoPlans = CLIENT_PLANS.filter((p) => p.kind === "PACK" && p.sessions === 8);
  const basicPlans = CLIENT_PLANS.filter((p) => p.kind === "PACK" && p.sessions === 4);

  const onSelect = async (planId: string) => {
    setPendingPlan(planId);
    try {
      // Vérifie auth via /api/auth/me
      const meRes = await fetch("/api/auth/me", { credentials: "include" });
      if (!meRes.ok) {
        // Non connecté -> signin avec retour vers /student/paiements
        router.push(`/auth/signin?next=${encodeURIComponent("/student/paiements")}`);
        return;
      }
      const me = await meRes.json();
      if (me?.role !== "STUDENT") {
        toast.error("Seuls les comptes Élève peuvent acheter un pack.");
        setPendingPlan(null);
        return;
      }

      // Crée une session Stripe Checkout
      const res = await fetch("/api/student/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ planId }),
      });
      const body = await res.json();
      if (!res.ok || !body?.url) {
        throw new Error(body?.error || "Erreur lors du paiement");
      }
      window.location.href = body.url;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erreur";
      toast.error(msg);
      setPendingPlan(null);
    }
  };

  return (
    <>
      <section className="overflow-hidden pb-20 pt-15 lg:pb-25 xl:pb-30">
        <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
          <div className="animate_top mx-auto text-center">
            <SectionHeader
              headerInfo={{
                title: `Choisissez votre formule`,
                subtitle: `Trouvez celle qui vous convient`,
                description: `Carnets de séances sans engagement pour tous les niveaux.`,
              }}
            />
          </div>
        </div>

        <div className="relative mx-auto mt-15 max-w-[1400px] px-4 md:px-8 xl:mt-20 xl:px-0">
          <div className="absolute -bottom-15 -z-1 h-full w-full">
            <Image
              fill
              src="./images/shape/shape-dotted-light.svg"
              alt="Dotted"
              className="dark:hidden"
            />
          </div>

          {/* Eco Plans Section */}
          <div className="mb-12">
            <h3 className="mb-8 text-center text-2xl font-bold text-black dark:text-white">
              Formules Eco (8 séances)
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {ecoPlans.map((plan) => {
                const colors = LEVEL_COLORS[plan.level];
                const isLoading = pendingPlan === plan.id;
                return (
                  <div
                    key={plan.id}
                    className="animate_top group relative rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection dark:shadow-none xl:p-12.5"
                  >
                    <div className={`mb-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${colors.bg} ${colors.text}`}>
                      {plan.levelLabel}
                    </div>
                    <h4 className="mb-1 text-lg font-semibold text-waterloo dark:text-manatee">
                      {plan.name}
                    </h4>
                    <div className="mb-2">
                      <span className="text-3xl font-bold text-primary">{formatEuros(plan.priceCents)}</span>
                      {plan.sessions && plan.sessions > 1 && (
                        <span className="ml-2 text-sm text-waterloo dark:text-manatee">
                          soit {formatEuros(plan.priceCents / plan.sessions)} / séance
                        </span>
                      )}
                    </div>
                    <p className="mb-2 text-sm font-medium text-black dark:text-white">
                      {plan.sessions} séances (Sans Engagement)
                    </p>
                    <p className="mb-6 text-sm text-waterloo dark:text-manatee">
                      {plan.description}
                    </p>

                    <button
                      onClick={() => onSelect(plan.id)}
                      disabled={isLoading}
                      aria-label="Sélectionner button"
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-white transition-all duration-300 hover:bg-primaryho disabled:opacity-60"
                    >
                      {isLoading ? (
                        <>
                          <Spinner /> Redirection...
                        </>
                      ) : (
                        "Sélectionner"
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Basic Plans Section */}
          <div>
            <h3 className="mb-8 text-center text-2xl font-bold text-black dark:text-white">
              Formules Basic (4 séances)
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {basicPlans.map((plan) => {
                const colors = LEVEL_COLORS[plan.level];
                const isLoading = pendingPlan === plan.id;
                return (
                  <div
                    key={plan.id}
                    className="animate_top group relative rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection dark:shadow-none xl:p-12.5"
                  >
                    <div className={`mb-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${colors.bg} ${colors.text}`}>
                      {plan.levelLabel}
                    </div>
                    <h4 className="mb-1 text-lg font-semibold text-waterloo dark:text-manatee">
                      {plan.name}
                    </h4>
                    <div className="mb-2">
                      <span className="text-3xl font-bold text-primary">{formatEuros(plan.priceCents)}</span>
                      {plan.sessions && plan.sessions > 1 && (
                        <span className="ml-2 text-sm text-waterloo dark:text-manatee">
                          soit {formatEuros(plan.priceCents / plan.sessions)} / séance
                        </span>
                      )}
                    </div>
                    <p className="mb-2 text-sm font-medium text-black dark:text-white">
                      {plan.sessions} séances (Sans Engagement)
                    </p>
                    <p className="mb-6 text-sm text-waterloo dark:text-manatee">
                      {plan.description}
                    </p>

                    <button
                      onClick={() => onSelect(plan.id)}
                      disabled={isLoading}
                      aria-label="Sélectionner button"
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-white transition-all duration-300 hover:bg-primaryho disabled:opacity-60"
                    >
                      {isLoading ? (
                        <>
                          <Spinner /> Redirection...
                        </>
                      ) : (
                        "Sélectionner"
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Explainer */}
          <div className="mx-auto mt-10 max-w-[900px] text-center text-sm text-waterloo dark:text-manatee">
            <p>
              Pack = carnet de séances à tarif avantageux. À la séance = paiement à l&apos;unité.
              Choisissez selon votre besoin et votre régularité. Paiement 100% sécurisé par Stripe.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export default Packs;
