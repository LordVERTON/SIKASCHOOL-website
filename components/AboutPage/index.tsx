"use client";
import Image from "next/image";
import SectionHeader from "../Common/SectionHeader";

const AboutPage = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Ruudy Mbouza-Bayonne",
      image: "/images/team/ruudy.jpg",
      role: "Tuteur"
    },
    {
      id: 2,
      name: "Walid Lakas",
      image: "/images/team/walid.jpg", 
      role: "Tuteur"
    },
    {
      id: 3,
      name: "Daniel Verton",
      image: "/images/team/daniel.jpg",
      role: "Tuteur"
    },
    {
      id: 4,
      name: "Alix Tarrade",
      image: "/images/team/alix.jpg",
      role: "Tutrice"
    },
    {
      id: 5,
      name: "Nolwen Verton",
      image: "/images/team/nolwen.jpg",
      role: "Tutrice"
    },
  ];

  const pedagogy = [
    {
      id: 1,
      title: "Redonner de la confiance à l'étudiant...",
      description: "La patience et l'écoute nous permettent de redonner confiance à l'étudiant, de raviver son intérêt pour la matière et de l'aider à exploiter pleinement son potentiel.",
      author: "Walid"
    },
    {
      id: 2,
      title: "Challenger les meilleurs !",
      description: "Développer une compréhension approfondie des concepts scientifiques, tout en s'appuyant sur des exercices d'application rigoureux pour ancrer solidement les connaissances.",
      author: "Dan"
    }
  ];

  const schoolLogos = [
    { id: 'polytechnique', name: 'Polytechnique', src: '/images/logo/École_polytechnique_logo.png' },
    { id: 'sorbonne', name: 'Sorbonne', src: '/images/logo/Sorbonne_logo.png' },
    { id: 'stanford', name: 'Stanford', src: '/images/logo/Stanford Logo_0.png' },
    { id: 'insa', name: 'INSA', src: '/images/logo/insa-logo.png' },
  ];

  return (
    <>
      {/* <!-- ===== About Page Start ===== --> */}
      <section className="overflow-hidden pb-20 pt-15 lg:pb-25 xl:pb-30">
        <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
          {/* <!-- Section Title Start --> */}
          <div className="animate_top mx-auto text-center">
            <SectionHeader
              headerInfo={{
                title: `Qui sommes nous ?`,
                subtitle: `On ne naît pas excellent, on le devient !`,
                description: `Découvrez notre équipe de tuteurs passionnés et notre approche pédagogique unique.`
              }}
            />
          </div>
          {/* <!-- Section Title End --> */}
        </div>

        <div className="mx-auto mt-15 max-w-[1200px] px-4 md:px-8 xl:mt-20 xl:px-0">
          {/* Introduction */}
          <div className="mb-16 text-center">
            <p className="text-lg text-waterloo dark:text-manatee">
              Ingénieurs passionnés par l'enseignement et soucieux de transmettre, nous mettons les nouvelles technologies au service d'une pédagogie humaine, moderne et efficace.
            </p>
          </div>

          {/* School Logos */}
          <div className="mb-16 flex flex-wrap justify-center gap-8">
            {schoolLogos.map((logo) => (
              <div key={logo.id} className="flex items-center justify-center rounded-lg border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-blacksection">
                <div className="h-16 w-32 rounded flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                  <Image
                    src={logo.src}
                    alt={logo.name}
                    width={128}
                    height={64}
                    className="max-h-16 max-w-[128px] object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent && !parent.querySelector('span')) {
                        const span = document.createElement('span');
                        span.className = 'text-xs text-gray-500 dark:text-gray-400';
                        span.textContent = logo.name;
                        parent.appendChild(span);
                      }
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Pedagogy Section */}
          <div className="mb-16">
            <h2 className="mb-12 text-center text-3xl font-bold text-black dark:text-white">
              Notre Pédagogie
            </h2>
            
            <div className="grid gap-8 md:grid-cols-2">
              {pedagogy.map((item) => (
                <div key={item.id} className="rounded-lg border border-stroke bg-white p-8 shadow-sm dark:border-strokedark dark:bg-blacksection">
                  <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mb-6 text-waterloo dark:text-manatee">
                    "{item.description}"
                  </p>
                  <p className="text-sm font-medium text-primary">
                    - {item.author}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="mb-16 text-center">
            <div className="rounded-lg border border-primary bg-primary/5 p-8">
              <h3 className="mb-4 text-2xl font-bold text-black dark:text-white">
                Séance d'essai Gratuite
              </h3>
              <a
                href="/packs"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-white transition-all duration-300 hover:bg-primaryho"
              >
                Voir les formules
              </a>
            </div>
          </div>

          {/* Team Section */}
          <div>
            <h2 className="mb-12 text-center text-3xl font-bold text-black dark:text-white">
              Rencontrez notre équipe
            </h2>
            
            <div className="grid gap-8 md:grid-cols-3">
              {teamMembers.map((member) => (
                <div key={member.id} className="text-center">
                  <div className="mb-4 inline-block overflow-hidden rounded-full">
                    <div className="h-32 w-32 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <Image
                        src={member.image}
                        alt={member.name}
                        width={128}
                        height={128}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'%3E%3Crect width='128' height='128' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-size='16'%3E%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-black dark:text-white">
                    {member.name}
                  </h3>
                  <p className="text-waterloo dark:text-manatee">
                    {member.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* <!-- ===== About Page End ===== --> */}
    </>
  );
};

export default AboutPage;
