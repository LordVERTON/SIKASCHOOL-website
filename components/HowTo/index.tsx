"use client";
import Image from "next/image";
import SectionHeader from "../Common/SectionHeader";

const HowTo = () => {
  const steps = [
    {
      id: 1,
      title: "Testez !",
      description: "Réservez votre première séance gratuite via l'agenda des disponibilités avec l'un de nos tuteurs.",
      buttonText: "Réserver",
      image: "/images/wix/test.jpg"
    },
    {
      id: 2,
      title: "Choisissez !",
      description: "Une formule de paiement personnalisée qui vous convient :",
      options: ["NOTA (Collège)", "AVA (Lycée)", "TODA (Supérieur)"],
      image: "/images/wix/choose.jpg"
    },
    {
      id: 3,
      title: "Progressez !",
      description: "Des exercices thématiques, des méthodes efficaces, des sessions de préparation d'examens...",
      image: "/images/wix/progress3.png"
    }
  ];

  return (
    <>
      {/* <!-- ===== How To Section Start ===== --> */}
      <section className="overflow-hidden pb-20 pt-15 lg:pb-25 xl:pb-30">
        <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
          {/* <!-- Section Title Start --> */}
          <div className="animate_top mx-auto text-center">
            <SectionHeader
              headerInfo={{
                title: `Comment ça marche ?`,
                subtitle: `Sika vous offre une expérience de cours en ligne simple et qualitative en quelques clics.`,
                description: ``,
              }}
            />
          </div>
          {/* <!-- Section Title End --> */}
        </div>

        <div className="mx-auto mt-15 max-w-[1200px] px-4 md:px-8 xl:mt-20 xl:px-0">
          {steps.map((step, index) => (
            <div key={step.id} className={`mb-20 flex flex-col items-center gap-8 lg:flex-row ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              {/* Image */}
              <div className="w-full lg:w-1/2">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
                  <Image
                    src={step.image}
                    alt={`Étape ${step.id} - ${step.title}`}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      // Fallback to placeholder if image doesn't exist
                      e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='Arial' font-size='18'%3EImage placeholder%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="w-full lg:w-1/2">
                <div className="text-center lg:text-left">
                  {/* Step Number */}
                  <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
                    {step.id}
                  </div>
                  
                  {/* Title */}
                  <h3 className="mb-4 text-2xl font-bold text-black dark:text-white lg:text-3xl">
                    {step.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="mb-6 text-lg text-waterloo dark:text-manatee">
                    {step.description}
                  </p>
                  
                  {/* Options for step 2 */}
                  {step.options && (
                    <div className="mb-6">
                      <ul className="space-y-2">
                        {step.options.map((option, optionIndex) => (
                          <li key={optionIndex} className="flex items-center text-black dark:text-white">
                            <span className="mr-2 text-primary">•</span>
                            {option}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Button for step 1 */}
                  {step.buttonText && (
                    <a
                      href="#contact"
                      className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-white transition-all duration-300 hover:bg-primaryho"
                    >
                      {step.buttonText}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* <!-- ===== How To Section End ===== --> */}
    </>
  );
};

export default HowTo;
