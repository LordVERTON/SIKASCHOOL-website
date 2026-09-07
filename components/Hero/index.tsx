"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import LeadCaptureModal from "../Booking/LeadCaptureModal";
import { setStorageItem, STORAGE_KEYS } from "@/lib/storage";
import { useLanguage } from "@/context/LanguageContext";

const Hero = () => {
  const [isLeadOpen, setIsLeadOpen] = useState(false);
  const [leadCampaign, setLeadCampaign] = useState<"back_to_school" | undefined>();
  
  // Listen to header CTA to open lead modal
  useEffect(() => {
    const handler = (event: Event) => {
      const campaign = (event as CustomEvent<{ campaign?: string }>).detail?.campaign;
      setLeadCampaign(campaign === "back_to_school" ? "back_to_school" : undefined);
      setIsLeadOpen(true);
    };
    window.addEventListener('lead:open', handler);
    return () => window.removeEventListener('lead:open', handler);
  }, []);
  const { t } = useLanguage();

  const openBooking = () => {
    setLeadCampaign(undefined);
    setIsLeadOpen(true);
  };

  const handlePrefillEmail = (leadEmail: string) => {
    setStorageItem(STORAGE_KEYS.LAST_LEAD_EMAIL, leadEmail);
  };

  return (
    <>
      <section className="relative overflow-hidden pb-20 pt-35 md:pt-40 xl:pb-25 xl:pt-46">
        <div className="pointer-events-none absolute inset-x-0 top-20 -z-1 mx-auto h-80 max-w-5xl rounded-full bg-primary/5 blur-3xl dark:bg-primary/10" />
        <div className="mx-auto max-w-c-1390 px-4 md:px-8 2xl:px-0">
          <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10 xl:gap-18">
            <div className="w-full">
              <p className="mb-4.5 text-lg font-medium text-black dark:text-white">
                {t.hero.subtitle}
              </p>
              <h1 className="mb-5 max-w-4xl text-4xl font-extrabold leading-tight text-black dark:text-white md:text-5xl xl:text-7xl">
                {t.hero.title}
              </h1>
              <p className="mt-3 text-lg">
                <span className="font-handwritten relative inline-block text-2xl md:text-3xl">
                  <span className="relative z-10">Comprendre</span>
                  <span className="absolute -bottom-1 left-0 right-0 z-0 h-2 rounded bg-yellow-300/70"></span>
                </span>
                <span className="mx-2">,</span>
                <span className="font-handwritten relative inline-block text-2xl md:text-3xl">
                  <span className="relative z-10">Progresser</span>
                  <span className="absolute -bottom-1 left-0 right-0 z-0 h-2 rounded bg-sky-300/70"></span>
                </span>
                <span className="mx-2">,</span>
                <span className="font-handwritten relative inline-block text-2xl md:text-3xl">
                  <span className="relative z-10">Réussir</span>
                  <span className="absolute -bottom-1 left-0 right-0 z-0 h-2 rounded bg-green-300/70"></span>
                </span>
              </p>
              <p className="mt-4 max-w-2xl text-lg">
                {t.hero.description}
              </p>

              <div className="mt-10">
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={openBooking}
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-black px-7.5 py-2.5 text-white duration-300 ease-in-out hover:bg-blackho dark:bg-btndark dark:hover:bg-blackho"
                  >
                    {t.hero.reserveButton}
                  </button>
                  <Link
                    href="/packs"
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-stroke px-7.5 py-2.5 font-medium text-black duration-300 hover:border-primary hover:text-primary dark:border-strokedark dark:text-white dark:hover:border-primary dark:hover:text-primary"
                  >
                    {t.hero.secondaryButton}
                  </Link>
                </div>

                <p className="mt-5 text-sm font-medium text-black dark:text-white">
                  {t.hero.freeTrial}
                </p>

                <ol className="mt-8 grid gap-3 sm:grid-cols-3" aria-label="Comment fonctionne la réservation">
                  {[t.hero.steps.needs, t.hero.steps.schedule, t.hero.steps.learn].map((step, index) => (
                    <li key={step} className="flex items-center gap-3 rounded-xl border border-stroke bg-white/75 px-3 py-3 text-sm font-medium text-black shadow-solid-2 backdrop-blur dark:border-strokedark dark:bg-blacksection/75 dark:text-white">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl lg:justify-self-end">
              <div className="absolute -inset-3 -z-1 rounded-[2rem] bg-linear-to-br from-primary/15 via-transparent to-meta/15 blur-2xl" />
              <div className="overflow-hidden rounded-2xl border border-stroke bg-white p-2 shadow-solid-l dark:border-strokedark dark:bg-blacksection">
                <Image
                  src="/images/hero/hero-light.svg"
                  alt=""
                  width={700}
                  height={444}
                  priority
                  className="h-auto w-full rounded-xl dark:hidden"
                />
                <Image
                  src="/images/hero/hero-dark.svg"
                  alt=""
                  width={700}
                  height={444}
                  priority
                  className="hidden h-auto w-full rounded-xl dark:block"
                />
              </div>
              <div className="absolute -bottom-5 left-4 right-4 rounded-xl border border-stroke bg-white p-4 shadow-solid-5 dark:border-strokedark dark:bg-blacksection md:left-8 md:right-auto md:w-[78%]">
                <p className="text-sm font-semibold text-black dark:text-white">Un accompagnement adapté à votre objectif</p>
                <p className="mt-1 text-sm text-waterloo dark:text-manatee">Niveau, matière et créneau : vous choisissez ce qui vous convient.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lead capture modal */}
      <LeadCaptureModal
        isOpen={isLeadOpen}
        onClose={() => setIsLeadOpen(false)}
        onPrefillEmail={handlePrefillEmail}
        campaign={leadCampaign}
      />
    </>
  );
};

export default Hero;
