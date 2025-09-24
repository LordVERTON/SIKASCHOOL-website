"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import TutorSelectionModal from "../Booking/TutorSelectionModal";
import { validateEmail, sanitizeString } from "@/lib/validation";
import { setStorageItem, STORAGE_KEYS } from "@/lib/storage";
import { useLanguage } from "@/context/LanguageContext";

const Hero = () => {
  const [email, setEmail] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    
    setIsModalOpen(true);
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
            <div className=" md:w-1/2">
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

            <div className="animate_right hidden md:w-1/2 lg:block">
              <div className="relative 2xl:-mr-7.5">
                <Image
                  src="/images/shape/shape-01.png"
                  alt="shape"
                  width={46}
                  height={246}
                  className="absolute -left-11.5 top-0"
                />
                <Image
                  src="/images/shape/shape-02.svg"
                  alt="shape"
                  width={36.9}
                  height={36.7}
                  className="absolute bottom-0 right-0 z-10"
                />
                <Image
                  src="/images/shape/shape-03.svg"
                  alt="shape"
                  width={21.64}
                  height={21.66}
                  className="absolute -right-6.5 bottom-0 z-1"
                />
                <div className=" relative aspect-700/444 w-full">
                  <Image
                    className="shadow-solid-l dark:hidden"
                    src="/images/hero/hero-light.svg"
                    alt="Hero"
                    fill
                  />
                  <Image
                    className="hidden shadow-solid-l dark:block"
                    src="/images/hero/hero-dark.svg"
                    alt="Hero"
                    fill
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tutor Selection Modal */}
      <TutorSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectTutor={handleSelectTutor}
      />
    </>
  );
};

export default Hero;
