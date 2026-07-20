"use client";

import { useLanguage } from "@/context/LanguageContext";

const StagePromo = () => {
  const { t } = useLanguage();
  const benefits = [
    t.stagePromo.benefitReview,
    t.stagePromo.benefitConsolidate,
    t.stagePromo.benefitConfidence,
  ];

  return (
    <section className="px-4 pb-8 md:px-8" aria-labelledby="summer-course-title">
      <div className="mx-auto max-w-c-1315 overflow-hidden rounded-2xl bg-[#24428f] px-6 py-8 text-white shadow-solid-10 md:px-10 md:py-10">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <p className="mb-2 font-semibold uppercase tracking-wider text-[#ffb84d]">
              {t.stagePromo.subtitle}
            </p>
            <h2 id="summer-course-title" className="text-3xl font-bold md:text-4xl">
              {t.stagePromo.title}
            </h2>
            <p className="mt-4 max-w-3xl text-lg text-white/90">
              {t.stagePromo.description}
            </p>
            <ul className="mt-5 flex flex-col gap-2 md:flex-row md:flex-wrap md:gap-x-6">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2 font-medium">
                  <span className="text-[#ffb84d]" aria-hidden="true">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("lead:open", {
                  detail: { campaign: "summer_course" },
                })
              )
            }
            className="shrink-0 rounded-full bg-[#ffb84d] px-7 py-3 font-semibold text-[#24428f] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#24428f]"
          >
            {t.stagePromo.cta}
          </button>
        </div>
      </div>
    </section>
  );
};

export default StagePromo;
