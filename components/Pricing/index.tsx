"use client";
import Image from "next/image";
import SectionHeader from "../Common/SectionHeader";
import { useLanguage } from "@/context/LanguageContext";

const Pricing = () => {
  const { t } = useLanguage();

  return (
    <>
      <section className="overflow-hidden pb-20 pt-15 lg:pb-25 xl:pb-30">
        <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
          <div className="animate_top mx-auto text-center">
            <SectionHeader
              headerInfo={{
                title: t.pricing.title,
                subtitle: t.pricing.subtitle,
                description: t.pricing.description,
              }}
            />
          </div>
        </div>

        <div className="relative mx-auto mt-15 max-w-[1207px] px-4 md:px-8 xl:mt-20 xl:px-0">
          <div className="absolute -bottom-15 -z-1 h-full w-full">
            <Image fill src="./images/shape/shape-dotted-light.svg" alt="Dotted" className="dark:hidden" />
          </div>
          <div className="flex flex-wrap justify-center gap-7.5 lg:flex-nowrap xl:gap-12.5">
            <PricingCard
              discount="-30%"
              title={t.pricing.college}
              description="8 cours/mois. Méthodologies simples et efficaces pour le bien-être scolaire."
              items={["Suivi personnalisé", "Devoirs et méthodologie", "Bilan mensuel"]}
              cta={t.pricing.discoverPack}
            />
            <PricingCard
              discount="-25%"
              title={t.pricing.highSchool}
              description="8 cours/mois. Consolider les savoirs et préparer l'avenir."
              items={["Approfondissement des compétences", "Préparation examens", "Suivi d'autonomie"]}
              cta={t.pricing.discoverPack}
            />
            <PricingCard
              discount="-20%"
              title={t.pricing.university}
              description="8 cours/mois. Développer expertise et autonomie intellectuelle."
              items={["Cours ciblés par matière", "Accompagnement projets", "Orientation et mentoring"]}
              cta={t.pricing.discoverPack}
            />
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-waterloo dark:text-manatee">{t.pricing.legalNotice}</p>
          </div>
        </div>
      </section>
    </>
  );
};

type PricingCardProps = {
  discount: string;
  title: string;
  description: string;
  items: string[];
  cta: string;
};

const PricingCard = ({ discount, title, description, items, cta }: PricingCardProps) => (
  <div className="animate_top group relative rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection dark:shadow-none md:w-[45%] lg:w-1/3 xl:p-12.5">
    <div className="absolute -right-3.5 top-7.5 -rotate-90 rounded-bl-full rounded-tl-full bg-red-500 px-4.5 py-1.5 text-metatitle font-medium uppercase text-white">
      {discount}
    </div>
    <h4 className="mb-2.5 text-para2 font-medium text-black dark:text-white">{title}</h4>
    <p>{description}</p>
    <div className="mt-9 border-t border-stroke pb-12.5 pt-9 dark:border-strokedark">
      <ul>
        {items.map((item) => (
          <li key={item} className="mb-4 text-black last:mb-0 dark:text-manatee">{item}</li>
        ))}
      </ul>
    </div>
    <a href="/packs" className="group/btn inline-flex items-center gap-2.5 font-medium text-primary transition-all duration-300 dark:text-white dark:hover:text-primary">
      <span className="duration-300 group-hover/btn:pr-2">{cta}</span>
      <svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M10.4767 6.16701L6.00668 1.69701L7.18501 0.518677L13.6667 7.00034L7.18501 13.482L6.00668 12.3037L10.4767 7.83368H0.333344V6.16701H10.4767Z" fill="currentColor" />
      </svg>
    </a>
  </div>
);

export default Pricing;
