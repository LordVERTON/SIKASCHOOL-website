"use client";
import Image from "next/image";
import SectionHeader from "../Common/SectionHeader";

const BookOnline = () => {
  const services = [
    {
      id: 1,
      title: "Séance d'essai gratuite",
      description: "Programmez votre première séance GRATUITE avec un tuteur pédagogique.",
      duration: "1 h",
      price: "Gratuit",
      originalPrice: null,
      level: "Tous niveaux",
      features: ["Maths, Physique, Français"],
      buttonText: "Programmer un appel",
      buttonLink: "#contact",
      isFree: true
    },
    {
      id: 2,
      title: "Collège (à la séance)",
      description: "De la 6ème à la 3ème. (Séance unique)",
      duration: "1 h",
      price: "23 €",
      originalPrice: null,
      level: "Collège",
      features: ["Maths", "Français", "Physique-Chimie"],
      buttonText: "Programmer un appel",
      buttonLink: "#contact"
    },
    {
      id: 3,
      title: "Lycée (à la séance)",
      description: "De la 2nde à la Terminale. (Séance unique)",
      duration: "1 h",
      price: "27 €",
      originalPrice: null,
      level: "Lycée",
      features: ["Maths", "Physique", "SVT", "Spécialités"],
      buttonText: "Programmer un appel",
      buttonLink: "#contact"
    },
    {
      id: 4,
      title: "Supérieur (à la séance)",
      description: "Prépas, Fac, IUT, BTS... (Séance unique)",
      duration: "1 h",
      price: "33 €",
      originalPrice: null,
      level: "Enseignement Supérieur",
      features: ["Maths", "Physique", "Informatique"],
      buttonText: "Programmer un appel",
      buttonLink: "#contact"
    }
  ];

  return (
    <>
      {/* <!-- ===== Book Online Section Start ===== --> */}
      <section className="overflow-hidden pb-20 pt-15 lg:pb-25 xl:pb-30">
        <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
          {/* <!-- Section Title Start --> */}
          <div className="animate_top mx-auto text-center">
            <SectionHeader
              headerInfo={{
                title: `Nos Services`,
                subtitle: `Informations sur le service`,
                description: `Choisissez votre séance à la carte selon votre niveau.`,
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
                alt="Hero"
                fill
                className="object-cover dark:hidden"
              />
              <Image
                src="/images/hero/hero-dark.svg"
                alt="Hero"
                fill
                className="hidden object-cover dark:block"
              />
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <div key={service.id} className="animate_top group relative rounded-lg border border-stroke bg-white p-8 shadow-solid-10 dark:border-strokedark dark:bg-blacksection dark:shadow-none">
                {/* Service Header */}
                <div className="mb-6">
                  <div className="mb-2 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {service.level}
                  </div>
                  <h3 className="mb-1 text-lg font-semibold text-black dark:text-white">{service.title}</h3>
                  <p className="text-sm text-waterloo dark:text-manatee">
                    {service.description}
                  </p>
                </div>

                {/* Features */}
                <div className="mb-6">
                  {service.features.map((feature, index) => (
                    <div key={index} className="mb-2 flex items-center text-sm text-waterloo dark:text-manatee">
                      <span className="mr-2 h-2 w-2 rounded-full bg-primary"></span>
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Separator */}
                <div className="mb-6 border-t border-stroke dark:border-strokedark"></div>

                {/* Duration and Price */}
                <div className="mb-6 flex items-center justify-between">
                  <div className="text-sm font-medium text-black dark:text-white">
                    {service.duration}
                  </div>
                  <div className="text-right">
                    {service.isFree ? (
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        {service.price}
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-black dark:text-white">
                          {service.price}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  <a
                    href={service.buttonLink}
                    className={`w-full rounded-lg px-6 py-3 text-center font-medium transition-all duration-300 ${
                      service.isFree
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-primary text-white hover:bg-primaryho"
                    }`}
                  >
                    {service.buttonText}
                  </a>
                  <a
                    href="/packs"
                    className="w-full rounded-lg border border-stroke px-6 py-3 text-center font-medium text-primary transition-all duration-300 hover:border-primary hover:bg-primary/5 dark:border-strokedark dark:hover:border-primary"
                  >
                    Découvrir les formules
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* <!-- ===== Book Online Section End ===== --> */}
    </>
  );
};

export default BookOnline;
