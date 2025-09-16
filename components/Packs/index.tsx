"use client";
import Image from "next/image";
import SectionHeader from "../Common/SectionHeader";

const Packs = () => {
  const pricingPlans = [
    // Eco Plans (8 séances)
    {
      id: 1,
      name: "NOTA - Eco",
      price: "144€",
      originalPrice: "144€",
      sessions: "8 séances",
      level: "Collège",
      description: "Soutien scolaire Collège",
      type: "eco"
    },
    {
      id: 2,
      name: "AVA - Eco", 
      price: "176€",
      originalPrice: "176€",
      sessions: "8 séances",
      level: "Lycée",
      description: "Soutien scolaire Lycée",
      type: "eco"
    },
    {
      id: 3,
      name: "TODA - Eco",
      price: "224€", 
      originalPrice: "224€",
      sessions: "8 séances",
      level: "Enseignement Supérieur",
      description: "Soutien scolaire Enseignement Supérieur",
      type: "eco"
    },
    // Basic Plans (4 séances)
    {
      id: 4,
      name: "NOTA - Basic",
      price: "88€",
      originalPrice: "88€", 
      sessions: "4 séances",
      level: "Collège",
      description: "Soutien scolaire Collège",
      type: "basic"
    },
    {
      id: 5,
      name: "AVA - Basic",
      price: "108€",
      originalPrice: "108€",
      sessions: "4 séances", 
      level: "Lycée",
      description: "Soutien scolaire Lycée",
      type: "basic"
    },
    {
      id: 6,
      name: "TODA - Basic",
      price: "128€",
      originalPrice: "128€",
      sessions: "4 séances",
      level: "Enseignement Supérieur", 
      description: "Soutien scolaire Enseignement Supérieur",
      type: "basic"
    }
  ];

  return (
    <>
      {/* <!-- ===== Packs Section Start ===== --> */}
      <section className="overflow-hidden pb-20 pt-15 lg:pb-25 xl:pb-30">
        <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
          {/* <!-- Section Title Start --> */}
          <div className="animate_top mx-auto text-center">
            <SectionHeader
              headerInfo={{
                title: `Choisissez votre formule`,
                subtitle: `Trouvez celle qui vous convient`,
                description: `Carnets de séances sans engagement pour tous les niveaux.`,
              }}
            />
          </div>
          {/* <!-- Section Title End --> */}
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
              {pricingPlans.filter(plan => plan.type === 'eco').map((plan) => (
                <div key={plan.id} className="animate_top group relative rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection dark:shadow-none xl:p-12.5">
                  <h4 className="mb-4 text-xl font-bold text-black dark:text-white">
                    {plan.name}
                  </h4>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-primary">{plan.price}</span>
                    <span className="ml-2 text-sm text-waterloo dark:text-manatee">
                      {plan.originalPrice}
                    </span>
                  </div>
                  <p className="mb-4 text-sm font-medium text-black dark:text-white">
                    {plan.sessions} (Sans Engagement)
                  </p>
                  <p className="mb-6 text-sm text-waterloo dark:text-manatee">
                    {plan.description}
                  </p>
                  
                  <button
                    aria-label="Sélectionner button"
                    className="w-full rounded-lg bg-primary px-6 py-3 text-white transition-all duration-300 hover:bg-primaryho"
                  >
                    Sélectionner
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Basic Plans Section */}
          <div>
            <h3 className="mb-8 text-center text-2xl font-bold text-black dark:text-white">
              Formules Basic (4 séances)
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pricingPlans.filter(plan => plan.type === 'basic').map((plan) => (
                <div key={plan.id} className="animate_top group relative rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection dark:shadow-none xl:p-12.5">
                  <h4 className="mb-4 text-xl font-bold text-black dark:text-white">
                    {plan.name}
                  </h4>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-primary">{plan.price}</span>
                    <span className="ml-2 text-sm text-waterloo dark:text-manatee">
                      {plan.originalPrice}
                    </span>
                  </div>
                  <p className="mb-4 text-sm font-medium text-black dark:text-white">
                    {plan.sessions} (Sans Engagement)
                  </p>
                  <p className="mb-6 text-sm text-waterloo dark:text-manatee">
                    {plan.description}
                  </p>
                  
                  <button
                    aria-label="Sélectionner button"
                    className="w-full rounded-lg bg-primary px-6 py-3 text-white transition-all duration-300 hover:bg-primaryho"
                  >
                    Sélectionner
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* <!-- ===== Packs Section End ===== --> */}
    </>
  );
};

export default Packs;
