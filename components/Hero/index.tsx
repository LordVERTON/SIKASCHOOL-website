"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TutorSelectionModal from "../Booking/TutorSelectionModal";
import LeadCaptureModal from "../Booking/LeadCaptureModal";
import { validateEmail, sanitizeString } from "@/lib/validation";
import { setStorageItem, STORAGE_KEYS } from "@/lib/storage";
import { useLanguage } from "@/context/LanguageContext";

const Hero = () => {
  const [email, setEmail] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLeadOpen, setIsLeadOpen] = useState(false);
  
  // Listen to header CTA to open lead modal
  useEffect(() => {
    const handler = () => setIsLeadOpen(true);
    window.addEventListener('lead:open' as any, handler);
    return () => window.removeEventListener('lead:open' as any, handler);
  }, []);
  const router = useRouter();
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      console.error('Email validation failed:', emailValidation.error);
      return;
    }
    
    // Open lead capture first per new requirement
    setIsLeadOpen(true);
  };

  const handleSelectTutor = (tutorId: string) => {
    // Store selected tutor securely
    const success = setStorageItem(STORAGE_KEYS.SELECTED_TUTOR, tutorId);
    if (success) {
      router.push('/booking');
    } else {
      console.error('Failed to store tutor selection');
    }
  };

  return (
    <>
      <section className="overflow-hidden pb-20 pt-35 md:pt-40 xl:pb-25 xl:pt-46">
        <div className="mx-auto max-w-c-1390 px-4 md:px-8 2xl:px-0">
          <div className="flex lg:items-center lg:gap-8 xl:gap-32.5">
            <div className="w-full">
              <h4 className="mb-4.5 text-lg font-medium text-black dark:text-white">
                {t.hero.subtitle}
              </h4>
              <h1 className="mb-5 pr-16 text-4xl font-extrabold leading-tight text-black dark:text-white md:text-5xl xl:text-7xl">
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
              <p className="mt-4">
                {t.hero.description}
              </p>

              <div className="mt-10">
                <form onSubmit={handleSubmit}>
                  <div className="flex flex-wrap gap-5">
                    <input
                      value={email}
                      onChange={(e) => setEmail(sanitizeString(e.target.value))}
                      type="email"
                      placeholder={t.hero.emailPlaceholder}
                      required
                      autoComplete="email"
                      maxLength={254}
                      className="rounded-full border border-stroke px-6 py-2.5 shadow-solid-2 focus:border-primary focus:outline-hidden dark:border-strokedark dark:bg-black dark:shadow-none dark:focus:border-primary"
                    />
                    <button
                      aria-label="get started button"
                    className="flex rounded-full bg-black px-7.5 py-2.5 text-white duration-300 ease-in-out hover:bg-blackho dark:bg-btndark dark:hover:bg-blackho"
                    >
                      {t.hero.reserveButton}
                    </button>
                  </div>
                </form>

                <p className="mt-5 text-black dark:text-white">
                  {t.hero.freeTrial}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tutor Selection Modal */}
      <LeadCaptureModal
        isOpen={isLeadOpen}
        onClose={() => setIsLeadOpen(false)}
        onSubmitted={() => setIsModalOpen(true)}
      />

      <TutorSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectTutor={handleSelectTutor}
      />
    </>
  );
};

export default Hero;
