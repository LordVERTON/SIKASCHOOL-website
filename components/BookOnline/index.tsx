"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import SectionHeader from "../Common/SectionHeader";
import { CLIENT_PLANS, formatEuros } from "@/lib/payments-catalog";

const BookOnline = () => {
  const router = useRouter();
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const sessionPlans = CLIENT_PLANS.filter((plan) => plan.kind === "SESSION");

  const startCheckout = async (planId: string) => {
    setPendingPlan(planId);
    try {
      const meResponse = await fetch("/api/auth/me", { credentials: "include" });
      if (!meResponse.ok) {
        router.push(`/auth/signin?next=${encodeURIComponent("/book-online")}`);
        return;
      }

      const currentUser = await meResponse.json();
      if (currentUser?.role !== "STUDENT" && currentUser?.role !== "PARENT") {
        toast.error("Seuls les comptes Élève ou Parent peuvent acheter une séance.");
        setPendingPlan(null);
        return;
      }

      const checkoutResponse = await fetch("/api/student/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ planId }),
      });
      const checkout = await checkoutResponse.json();
      if (!checkoutResponse.ok || !checkout?.url) {
        throw new Error(checkout?.error || "Impossible de préparer le paiement");
      }

      window.location.href = checkout.url;
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue");
      setPendingPlan(null);
    }
  };

  return (
    <>
      {/* <!-- ===== Book Online Section Start ===== --> */}
      <section className="overflow-hidden pb-20 pt-15 lg:pb-25 xl:pb-30">
        <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
          {/* <!-- Section Title Start --> */}
          <div className="animate_top mx-auto text-center">
            <SectionHeader
              headerInfo={{
                title: `Séances à la carte`,
                subtitle: `Un prix clair pour chaque niveau`,
                description: `Choisissez et payez votre séance avant de réserver le créneau qui vous convient.`,
              }}
            />
          </div>
          {/* <!-- Section Title End --> */}
        </div>

        <div className="mx-auto mt-15 max-w-[1200px] px-4 md:px-8 xl:mt-20 xl:px-0">
          {/* Hero Image */}
          <div className="mb-12 text-center">
            <div className="relative mx-auto h-64 w-full max-w-2xl overflow-hidden rounded-lg">
              <Image
                src="/images/hero/hero-light.svg"
                alt=""
                fill
                className="object-cover dark:hidden"
              />
              <Image
                src="/images/hero/hero-dark.svg"
                alt=""
                fill
                className="hidden object-cover dark:block"
              />
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
            <div className="animate_top group relative rounded-lg border border-stroke bg-white p-8 shadow-solid-10 dark:border-strokedark dark:bg-blacksection dark:shadow-none">
              <div className="mb-6">
                <p className="mb-2 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Tous niveaux
                </p>
                <h3 className="mb-1 text-lg font-semibold text-black dark:text-white">Séance d’essai gratuite</h3>
                <p className="text-sm text-waterloo dark:text-manatee">Découvrez l’accompagnement SikaSchool avec un tuteur adapté.</p>
              </div>
              <div className="mb-6 border-t border-stroke pt-6 dark:border-strokedark">
                <p className="text-sm font-medium text-black dark:text-white">1 h · Gratuit · Sans engagement</p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/booking")}
                className="flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-6 py-3 text-center font-medium text-white transition-all duration-300 hover:bg-primaryho"
              >
                Réserver ma séance d’essai
              </button>
            </div>

            {sessionPlans.map((plan) => {
              const isLoading = pendingPlan === plan.id;
              return (
                <div key={plan.id} className="animate_top group relative rounded-lg border border-stroke bg-white p-8 shadow-solid-10 dark:border-strokedark dark:bg-blacksection dark:shadow-none">
                  <div className="mb-6">
                    <p className="mb-2 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {plan.levelLabel}
                    </p>
                    <h3 className="mb-1 text-lg font-semibold text-black dark:text-white">Séance à la carte</h3>
                    <p className="text-sm text-waterloo dark:text-manatee">{plan.description}</p>
                  </div>
                  <div className="mb-6 border-t border-stroke pt-6 dark:border-strokedark">
                    <p className="text-3xl font-bold text-primary">{formatEuros(plan.priceCents)}</p>
                    <p className="mt-1 text-sm font-medium text-black dark:text-white">1 séance de 60 min · prix TTC</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => startCheckout(plan.id)}
                    disabled={isLoading}
                    className="flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-6 py-3 text-center font-medium text-white transition-all duration-300 hover:bg-primaryho disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? "Redirection…" : `Choisir cette séance à ${formatEuros(plan.priceCents)}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      {/* <!-- ===== Book Online Section End ===== --> */}
    </>
  );
};

export default BookOnline;
