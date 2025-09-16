"use client";
import Image from "next/image";
import SectionHeader from "../Common/SectionHeader";
import { useLanguage } from "@/context/LanguageContext";

const Pricing = () => {
  const { t } = useLanguage();

  return (
    <>
      {/* <!-- ===== Pricing Table Start ===== --> */}
      <section className="overflow-hidden pb-20 pt-15 lg:pb-25 xl:pb-30">
        <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
          {/* <!-- Section Title Start --> */}
          <div className="animate_top mx-auto text-center">
            <SectionHeader
              headerInfo={{
                title: t.pricing.title,
                subtitle: t.pricing.subtitle,
                description: t.pricing.description,
              }}
            />
          </div>
          {/* <!-- Section Title End --> */}
        </div>

        <div className="relative mx-auto mt-15 max-w-[1207px] px-4 md:px-8 xl:mt-20 xl:px-0">
          <div className="absolute -bottom-15 -z-1 h-full w-full">
            <Image
              fill
              src="./images/shape/shape-dotted-light.svg"
              alt="Dotted"
              className="dark:hidden"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-7.5 lg:flex-nowrap xl:gap-12.5">
            {/* <!-- Pricing Item --> */}
            <div className="animate_top group relative rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection dark:shadow-none md:w-[45%] lg:w-1/3 xl:p-12.5">
              {/* Discount Badge */}
              <div className="absolute -right-3.5 top-7.5 -rotate-90 rounded-bl-full rounded-tl-full bg-red-500 px-4.5 py-1.5 text-metatitle font-medium uppercase text-white">
                -30%
              </div>
              
              <div className="mb-2 flex items-center gap-2">
                <span className="relative text-lg text-black dark:text-white">
                  23.5€
                  <span className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 -rotate-12 bg-red-500"></span>
                </span>
                <h3 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">
                  18 <span className="text-regular text-waterloo dark:text-manatee">€/cours</span>
                </h3>
              </div>
          <h4 className="mb-2.5 text-para2 font-medium text-black dark:text-white">
            {t.pricing.college}
          </h4>
          <p>8 cours/mois. Méthodologies simples et efficaces pour le bien-être scolaire.</p>

              <div className="mt-9 border-t border-stroke pb-12.5 pt-9 dark:border-strokedark">
                <ul>
                  <li className="mb-4 text-black last:mb-0 dark:text-manatee">Suivi personnalisé</li>
                  <li className="mb-4 text-black last:mb-0 dark:text-manatee">Devoirs et méthodologie</li>
                  <li className="mb-4 text-black last:mb-0 dark:text-manatee">Bilan mensuel</li>
                </ul>
              </div>

              <a
                href="/packs"
                className="group/btn inline-flex items-center gap-2.5 font-medium text-primary transition-all duration-300 dark:text-white dark:hover:text-primary"
              >
            <span className="duration-300 group-hover/btn:pr-2">
              {t.pricing.discoverPack}
            </span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.4767 6.16701L6.00668 1.69701L7.18501 0.518677L13.6667 7.00034L7.18501 13.482L6.00668 12.3037L10.4767 7.83368H0.333344V6.16701H10.4767Z"
                    fill="currentColor"
                  />
                </svg>
              </a>
            </div>

            {/* <!-- Pricing Item --> */}
            <div className="animate_top group relative rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection dark:shadow-none md:w-[45%] lg:w-1/3 xl:p-12.5">
              {/* Discount Badge */}
              <div className="absolute -right-3.5 top-7.5 -rotate-90 rounded-bl-full rounded-tl-full bg-red-500 px-4.5 py-1.5 text-metatitle font-medium uppercase text-white">
                -25%
              </div>

              <div className="mb-2 flex items-center gap-2">
                <span className="relative text-lg text-black dark:text-white">
                  27.5€
                  <span className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 -rotate-12 bg-red-500"></span>
                </span>
                <h3 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">
                  22 <span className="text-regular text-waterloo dark:text-manatee">€/cours</span>
                </h3>
              </div>
          <h4 className="mb-2.5 text-para2 font-medium text-black dark:text-white">
            {t.pricing.highSchool}
          </h4>
              <p>8 cours/mois. Consolider les savoirs et préparer l'avenir.</p>

              <div className="mt-9 border-t border-stroke pb-12.5 pt-9 dark:border-strokedark">
                <ul>
                  <li className="mb-4 text-black last:mb-0 dark:text-manatee">Approfondissement des compétences</li>
                  <li className="mb-4 text-black last:mb-0 dark:text-manatee">Préparation examens</li>
                  <li className="mb-4 text-black last:mb-0 dark:text-manatee">Suivi d'autonomie</li>
                </ul>
              </div>

              <a
                href="/packs"
                className="group/btn inline-flex items-center gap-2.5 font-medium text-primary transition-all duration-300 dark:text-white dark:hover:text-primary"
              >
            <span className="duration-300 group-hover/btn:pr-2">
              {t.pricing.discoverPack}
            </span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.4767 6.16701L6.00668 1.69701L7.18501 0.518677L13.6667 7.00034L7.18501 13.482L6.00668 12.3037L10.4767 7.83368H0.333344V6.16701H10.4767Z"
                    fill="currentColor"
                  />
                </svg>
              </a>
            </div>

            {/* <!-- Pricing Item --> */}
            <div className="animate_top group relative rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection dark:shadow-none md:w-[45%] lg:w-1/3 xl:p-12.5">
              {/* Discount Badge */}
              <div className="absolute -right-3.5 top-7.5 -rotate-90 rounded-bl-full rounded-tl-full bg-red-500 px-4.5 py-1.5 text-metatitle font-medium uppercase text-white">
                -20%
              </div>

              <div className="mb-2 flex items-center gap-2">
                <span className="relative text-lg text-black dark:text-white">
                  33.5€
                  <span className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 -rotate-12 bg-red-500"></span>
                </span>
                <h3 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">
                  28 <span className="text-regular text-waterloo dark:text-manatee">€/cours</span>
                </h3>
              </div>
              <h4 className="mb-2.5 text-para2 font-medium text-black dark:text-white">
                {t.pricing.university}
              </h4>
              <p>8 cours/mois. Développer expertise et autonomie intellectuelle.</p>

              <div className="mt-9 border-t border-stroke pb-12.5 pt-9 dark:border-strokedark">
                <ul>
                  <li className="mb-4 text-black last:mb-0 dark:text-manatee">Cours ciblés par matière</li>
                  <li className="mb-4 text-black last:mb-0 dark:text-manatee">Accompagnement projets</li>
                  <li className="mb-4 text-black last:mb-0 dark:text-manatee">Orientation et mentoring</li>
                </ul>
              </div>

              <a
                href="/packs"
                className="group/btn inline-flex items-center gap-2.5 font-medium text-primary transition-all duration-300 dark:text-white dark:hover:text-primary"
              >
                <span className="duration-300 group-hover/btn:pr-2">Découvrir le pack</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.4767 6.16701L6.00668 1.69701L7.18501 0.518677L13.6667 7.00034L7.18501 13.482L6.00668 12.3037L10.4767 7.83368H0.333344V6.16701H10.4767Z"
                    fill="currentColor"
                  />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Legal Notice */}
          <div className="mt-8 text-center">
            <p className="text-sm text-waterloo dark:text-manatee">
              {t.pricing.legalNotice}
            </p>
          </div>
        </div>
      </section>
      {/* <!-- ===== Pricing Table End ===== --> */}
    </>
  );
};

export default Pricing;
