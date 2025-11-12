import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de protection des données | SikaSchool",
  description:
    "Découvrez la politique de protection des données de SikaSchool, plateforme de cours particuliers en présentiel et en visio.",
};

export default function DonneesPersonnellesPage() {
  return (
    <main className="min-h-screen bg-whiten py-16 text-black dark:bg-blacksection dark:text-white">
      <div className="mx-auto max-w-4xl px-6">
        <header className="mb-12">
          <p className="text-sm uppercase tracking-wide text-primary">Politique de confidentialité</p>
          <h1 className="mt-2 text-3xl font-semibold md:text-4xl">
            Politique de protection des données personnelles
          </h1>
          <p className="mt-4 text-waterloo dark:text-manatee">
            Chez SikaSchool, nous protégeons vos données avec le même engagement que nous consacrons à la réussite
            scolaire de chaque élève. Cette politique explique comment nous collectons, utilisons et sécurisons vos
            informations lorsque vous nous confiez un accompagnement, en présentiel ou en visioconférence.
          </p>
        </header>

        <section className="space-y-8 text-base leading-relaxed">
          <article>
            <h2 className="text-2xl font-semibold">Responsable du traitement</h2>
            <p className="mt-2 text-waterloo dark:text-manatee">
              Les données personnelles sont traitées par SikaSchool, en qualité de responsable de traitement.
              Notre délégué à la protection des données (DPO) veille au respect de la réglementation en vigueur
              (RGPD et loi Informatique et Libertés).
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-semibold">Données collectées</h2>
            <p className="mt-2 text-waterloo dark:text-manatee">
              Nous collectons uniquement les informations strictement nécessaires pour préparer, planifier et assurer un suivi
              pédagogique de qualité des cours particuliers, qu’ils aient lieu en visio ou sur place.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-waterloo dark:text-manatee">
              <li><strong>Données d’identification :</strong> nom, prénom, civilité, date de naissance.</li>
              <li><strong>Coordonnées :</strong> adresses e-mail et postale, numéro(s) de téléphone.</li>
              <li><strong>Informations sur la scolarité :</strong> niveau, classe, matières suivies, objectifs d’apprentissage.</li>
              <li><strong>Données de connexion :</strong> adresse IP, logs de connexion, traces d’usage de nos espaces en ligne.</li>
              <li><strong>Éléments financiers :</strong> moyens et historique de paiement, informations de facturation.</li>
              <li><strong>Données liées aux cours en visio :</strong> liens de salle virtuelle, horaires de connexion, enregistrements éventuels (uniquement sur accord explicite).</li>
              <li><strong>Suivi pédagogique :</strong> comptes rendus de séance, échanges avec l’équipe SikaSchool, avis et retours d’expérience.</li>
            </ul>
          </article>

          <article>
            <h2 className="text-2xl font-semibold">Finalités du traitement</h2>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-waterloo dark:text-manatee">
              <li>Répondre aux demandes d’information et accompagner l’inscription d’un élève.</li>
              <li>Identifier et authentifier les familles, élèves et tuteurs.</li>
              <li>Organiser les cours particuliers en présentiel ou en visioconférence et assurer leur suivi administratif.</li>
              <li>Gérer la facturation, les paiements et, le cas échéant, les impayés.</li>
              <li>Adapter nos contenus pédagogiques et proposer des offres personnalisées.</li>
              <li>Évaluer la qualité des prestations via des enquêtes de satisfaction.</li>
              <li>Administrer un espace personnel sécurisé pour les familles, les élèves et les enseignants.</li>
              <li>Respecter les obligations légales et réglementaires liées à notre activité.</li>
            </ul>
          </article>

          <article>
            <h2 className="text-2xl font-semibold">Durée de conservation</h2>
            <p className="mt-2 text-waterloo dark:text-manatee">
              Nous conservons vos données uniquement le temps nécessaire au regard des objectifs poursuivis :
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-waterloo dark:text-manatee">
              <li><strong>Clients et intervenants :</strong> 5 ans à compter du dernier contact.</li>
              <li><strong>Prospects :</strong> 3 ans après le dernier échange.</li>
              <li><strong>Candidats tuteurs :</strong> 2 ans lorsque la candidature n’est pas retenue.</li>
              <li><strong>Enregistrements vidéo :</strong> 30 jours maximum, uniquement lorsque l’enregistrement a été expressément accepté.</li>
            </ul>
          </article>

          <article>
            <h2 className="text-2xl font-semibold">Destinataires des données</h2>
            <p className="mt-2 text-waterloo dark:text-manatee">
              Vos données peuvent être partagées, dans la limite de leurs habilitations et pour les besoins stricts de
              nos services, avec :
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-waterloo dark:text-manatee">
              <li>Les équipes internes SikaSchool (pédagogie, relation familles, support technique).</li>
              <li>Les enseignants et intervenants chargés des cours particuliers.</li>
              <li>Nos prestataires techniques (solutions de visio, outils de gestion, hébergeurs) soumis à des clauses contractuelles strictes.</li>
              <li>Les autorités administratives lorsque la loi l’exige.</li>
            </ul>
          </article>

          <article>
            <h2 className="text-2xl font-semibold">Sécurité de vos données</h2>
            <p className="mt-2 text-waterloo dark:text-manatee">
              Nous mettons en œuvre des mesures techniques et organisationnelles adaptées pour garantir la
              confidentialité, l’intégrité et la disponibilité de vos informations : chiffrement des données sensibles,
              hébergement en Union Européenne, contrôle des accès, audits réguliers de nos infrastructures,
              sensibilisation de nos équipes et surveillance des connexions aux salles virtuelles.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-semibold">Vos droits</h2>
            <p className="mt-2 text-waterloo dark:text-manatee">
              Conformément à la réglementation sur la protection des données, vous disposez des droits suivants :
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6 text-waterloo dark:text-manatee">
              <li>Droit d’accès, de rectification et d’effacement de vos données.</li>
              <li>Droit de limitation ou d’opposition au traitement.</li>
              <li>Droit à la portabilité des données que vous nous avez fournies.</li>
              <li>Droit de définir des directives relatives au sort de vos données après votre décès.</li>
            </ul>
            <p className="mt-4 text-waterloo dark:text-manatee">
              Pour exercer vos droits, contactez notre DPO :{" "}
              <a
                href="mailto:dpo@sikaschool.com"
                className="text-primary underline hover:text-primaryho"
              >
                dpo@sikaschool.com
              </a>{" "}
              ou par courrier : SikaSchool – DPO, 27 rue des Tuteurs Solidaires, 75000 Paris, France. Toute demande doit être
              accompagnée d’un justificatif d’identité. Vous conservez également la possibilité de saisir la CNIL
              (3 place de Fontenoy – TSA 80715 – 75334 Paris Cedex 07).
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-semibold">Mises à jour</h2>
            <p className="mt-2 text-waterloo dark:text-manatee">
              Cette politique peut être amenée à évoluer pour tenir compte des innovations pédagogiques,
              technologiques ou des évolutions réglementaires. Nous vous invitons à la consulter régulièrement ; toute
              modification substantielle sera communiquée sur la plateforme et par e-mail lorsque cela est pertinent.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}


