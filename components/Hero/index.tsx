"use client";
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
      <section className="overflow-hidden pb-20 pt-35 md:pt-40 xl:pb-25 xl:pt-46">
        <div className="mx-auto max-w-c-1390 px-4 md:px-8 2xl:px-0">
          <div className="flex lg:items-center lg:gap-8 xl:gap-32.5">
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
