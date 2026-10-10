# SikaSchool — Mémoire persistante

> SikaSchool — Documentation de référence

**Last updated:** 2026-10-10
**Status:** Active
**Source of truth:** contexte, décisions, contradictions résolues, preuves et reprise entre sessions.

## Navigation

[Product](./PRD.md) · [Architecture](./architecture.md) · [Rules](./Rules.md) · [Design](./design.md) · [Tasks](./tasks.md) · [Memory](./memory.md)

## 1. Project Snapshot

- Projet : SikaSchool, plateforme de cours particuliers et accompagnement scolaire.
- Version package : 1.3.1 ; référence main, commit e637788 du 22 septembre 2026 ; branche de travail docs/consolidation-six-files.
- Stack : Next.js 16.3.4, React 19, TypeScript, Tailwind 4, Supabase Auth/Postgres + Auth.js, Stripe, LiveKit, Mercure, SMTP/Resend, LangGraph/OpenAI, Twilio SMS.
- Environnements : local Docker et Next HTTPS décrits ; déploiement cité sikaschool.app/Vercel, non interrogé. Node requis 24, poste observé 26.8.2.
- Fonctions : portails élève/famille/tuteur/admin, réservations, paiements, messages, vidéo, bilans et IA ; présence code ≠ recette complète.

## 2. Current State

Implémentations réelles : comptes Supabase/Auth.js, routes métier et dashboards. Intégrité financière, anti-abus, liaison famille et 2FA restent des chantiers prioritaires. Aucun test E2E ou environnement distant n'a été validé durant cette migration. Frontend V2 **spécifié et planifié, non implémenté**.

Au début de mission, app/api/auth/login/route.ts, next-env.d.ts et next.config.js étaient déjà modifiés. Ces changements appartiennent à l'utilisateur et ont été préservés. En particulier, double allowedDevOrigins et erreurs login observées reflètent l'arbre de travail, pas uniquement main. Les documents ne prétendent pas qu'ils sont déployés.

## 3. Architecture Decisions

| ID      | Date / preuve                                            | Contexte                         | Décision et justification                                                                | Conséquences / statut                                                               |
| ------- | -------------------------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| ADR-001 | Date d'origine non établie ; migrations versionnées      | Ancien catalogue cours/bookings  | Sessions directes et matières texte, suppression tables inutilisées                      | DEPRECATED pour ancien modèle ; décision inférée des migrations, pas auteur inventé |
| ADR-002 | 2026-09-22, commit f82953a ; migration préfixée 20260912 | Auth historique publique         | Supabase Auth pour identité, Auth.js pour session, profiles pour métier                  | IMPLEMENTED ; migration requiert sauvegarde et résolution collisions UUID/e-mail    |
| ADR-003 | 2026-09-22, 1964a19                                      | Développement LiveKit hors ligne | Image Docker locale épinglée, ports loopback                                             | IMPLEMENTED ; mobile nécessite autre configuration autorisée                        |
| ADR-004 | 2026-09-22, e637788                                      | Runtime déploiement              | Node 24 requis                                                                           | IMPLEMENTED en engines/.nvmrc, runtime poste divergent TO_VERIFY                    |
| ADR-005 | 2026-10-10, instruction de mission                       | Documentation dispersée          | Six fichiers exclusifs ; responsabilités séparées et migration traçable                  | Adoptée pour cette migration ; docs extérieures conservées                          |
| ADR-006 | 2026-10-10, instruction de mission                       | Préparation V2                   | Continuité de marque, propositions documentaires seulement, pas de backend/refonte livré | Adoptée pour périmètre ; direction artistique à valider en V2-002/003               |
| ADR-007 | Date d'origine non établie, ancien guide patterns        | Risque de sur-ingénierie         | Services étroits/reducer proposés ; outbox différée après mesure                         | PLANNED, pas architecture existante imposée                                         |

## 4. Historical Context et contradictions résolues

Les audits du 12 septembre 2026 avaient établi une roadmap technique/UX et des résultats lint/type positifs, avec npm audit à 15 vulnérabilités (1 critique, 8 élevées, 6 modérées). Ces résultats sont **historiques**, non transposables aux dépendances actuelles. Les métriques 351 accès API Supabase, 598 types faibles et longueurs de fichiers n'ont pas été réactualisées. Les noms de migrations sont des identifiants d'ordre, pas des dates d'exécution.

| Ancienne affirmation                            | Résolution selon source actuelle                                                                            |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Next 15, Node 18+                               | package/lock/install : Next 16.3.4, engines/.nvmrc Node 24                                                  |
| middleware.ts protège le site                   | proxy.ts actuel ; API exclues et gardes séparés                                                             |
| JWT_SECRET pour session                         | Auth.js lit AUTH_SECRET ou NEXTAUTH_SECRET ; JWT_SECRET subsiste seulement en fallback OTP                  |
| users est la table métier                       | profiles après migration Auth ; alias users dans certaines requêtes n'est pas nom de table                  |
| Baseline = schéma actuel                        | 14 migrations, suppressions et renommages nécessaires                                                       |
| Idempotence Stripe garantie / invoice unique    | Faux dans SQL et addCredits ; TECH-002, double événement facture et erreurs DB à traiter                    |
| Tous handlers échoués donnent 500               | Certaines erreurs Supabase seulement loggées, puis réponse 200                                              |
| Parent a partout les droits élève               | Helper dans routes compatibles ; LiveKit token utilise directement user.id ; retours Stripe /student        |
| Parent change sécurité de l'enfant              | Profil pédagogique effectif, mais password/2fa sur compte connecté                                          |
| Parent multi-enfant pris en charge              | Seed/DB peuvent avoir plusieurs liens ; helper lit premier et POST remplace, pas de support produit complet |
| 2FA globale                                     | Route custom oui, authorize Credentials non ; TECH-013                                                      |
| Lead existant entièrement sécurisé              | Rôle/mot de passe préservés (TECH-001), coordonnées encore modifiables (TECH-016)                           |
| LeadCaptureModal sans focus trap                | Code contient focus/Échap/restauration ; robustesse et double instance restent à tester                     |
| Tous workflows API protégés                     | update-status public et mutation globale ; TECH-015                                                         |
| IA limitée aux STUDENT / 40 derniers messages   | Parent lié compatible ; ordre ascendant + limit(40) = 40 premiers                                           |
| Validation stricte des images IA                | Six URLs retenues, pas de contrôle serveur strict taille/MIME/origine                                       |
| Egress = enregistrement disponible              | Helper seul, aucun appelant trouvé ; PARTIAL                                                                |
| Certificats Next générés automatiquement        | dev passe chemins explicites ; fichiers à provisionner                                                      |
| .env.example disponible                         | Absent ; modèle .env.development.local.example disponible                                                   |
| next lint à remplacer                           | Déjà eslint . ; quick win conservé comme historique remplacé                                                |
| Types générés directement consommés             | Script écrit lib/database.types.ts, imports types/supabase.ts                                               |
| CSP/HSTS/DENY documentés                        | next.config.js n'annonce pas CSP/HSTS, frame SAMEORIGIN, referrer origin-when-cross-origin                  |
| Tarifs/CTA/labels historiques cochés = terminés | Fonction parfois présente, mais recette/preuves restent à fournir ; alias préservés dans tasks              |
| Carte Stripe 0002 = fonds insuffisants          | Référence Stripe : 9995 fonds insuffisants, 0002 refus générique                                            |

L'ancien conseil de test avec carte réelle est remplacé par recette Stripe sandbox, conformément à la référence officielle consultée. Les anciennes affirmations de « meilleur modèle » et ratios de prix IA sont retirées : non mesurées, non nécessaires à l'exploitation. Les secrets locaux de démonstration ne sont pas recopiés ; renvoi vers fichiers locaux/seed. Aucun secret réel d'environnement lu ou migré.

### Matrice exhaustive de migration

Chaque source docs ci-dessous a été lue et traitée. Les empreintes identifient le contenu UTF-8 normalisé lu ; les originaux restent récupérables dans Git. Pas de sauvegarde résiduelle dans docs.

| Source historique (texte, pas lien obsolète) | Destination et couverture                                                                                  | SHA-256 du texte lu (12 caractères) |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `DESIGN_PATTERNS.md`                         | architecture §15 patterns/coûts ; Rules réutilisation ; tasks OPT-003 et tickets existants                 | `0693466226e1`                      |
| `LIVEKIT_SETUP.md`                           | architecture §9 runbook local/cloud, ports, variables, dépannage ; PRD classe                              | `c70ea4b19edd`                      |
| `ROADMAP.md`                                 | tasks IDs historiques, tâche transitions TECH-019, quick wins fusionnés ; Rules DoD/risques                | `c2dc1b2cb440`                      |
| `SIKA_AI_TUTOR.md`                           | architecture §11 outils/configuration/données/limites ; PRD AI ; tasks TECH-018/OPT-001                    | `cf0ca78835c6`                      |
| `STRIPE_SETUP.md`                            | architecture §8 catalogue/webhooks/CLI/Portal/recette ; tasks OPS-001/OPT-002 ; PRD paiements              | `7c33c48c0fe3`                      |
| `SUPABASE_SETUP.md`                          | architecture §6/13/14 et lien supabase/README conservé, correction ancre README inexistante                | `119eea18d64d`                      |
| `TECHNICAL_AUDIT.md`                         | architecture constats actualisés ; tasks TECH-001 à TECH-012 critères/tests ; memory mesures historiques   | `903c2df4267d`                      |
| `UX_UI_AUDIT.md`                             | design identité/constats ; tasks UX/UI/A11Y/PERF critères/tests ; memory contradictions                    | `050f3ee17663`                      |
| `UX_UI_ROADMAP.md`                           | tasks 50 alias 01–50 fusionnés, critères/tests/dépendances ; design proposition ; Rules garde-fous         | `9ae2a4d5d08b`                      |
| `WORKFLOWS.md`                               | PRD parcours/cycle ; architecture flux et patterns proposés ; tasks booking/Stripe/transitions             | `498901cbf002`                      |
| `workflows/01-onboarding-auth.md`            | PRD §4 workflow détaillé, diagrammes/règles/scénarios actualisés ; architecture intégration correspondante | `061fe4f5328d`                      |
| `workflows/02-parent-student.md`             | PRD §4 workflow détaillé, diagrammes/règles/scénarios actualisés ; architecture intégration correspondante | `c4c70029b901`                      |
| `workflows/03-session-lifecycle.md`          | PRD §4 workflow détaillé, diagrammes/règles/scénarios actualisés ; architecture intégration correspondante | `01592b8ead61`                      |
| `workflows/04-payments.md`                   | PRD §4 workflow détaillé, diagrammes/règles/scénarios actualisés ; architecture intégration correspondante | `2dba01966504`                      |
| `workflows/05-tutor-workflows.md`            | PRD §4 workflow détaillé, diagrammes/règles/scénarios actualisés ; architecture intégration correspondante | `c4db3fd10bb8`                      |
| `workflows/06-admin-workflows.md`            | PRD §4 workflow détaillé, diagrammes/règles/scénarios actualisés ; architecture intégration correspondante | `a54231636020`                      |
| `workflows/07-messaging-notifications.md`    | PRD §4 workflow détaillé, diagrammes/règles/scénarios actualisés ; architecture intégration correspondante | `edbb45aef901`                      |
| `workflows/08-live-class.md`                 | PRD §4 workflow détaillé, diagrammes/règles/scénarios actualisés ; architecture intégration correspondante | `b46e350b8cb5`                      |
| `workflows/09-ai-tutor.md`                   | PRD §4 workflow détaillé, diagrammes/règles/scénarios actualisés ; architecture intégration correspondante | `9977b36582eb`                      |
| `workflows/10-profile-security.md`           | PRD §4 workflow détaillé, diagrammes/règles/scénarios actualisés ; architecture intégration correspondante | `a222060aad52`                      |
| `workflows/README.md`                        | PRD rôles et navigation des parcours ; Rules portée de preuves                                             | `c2bf5c0e0e1b`                      |

Informations non transférées comme instructions actives : faux liens, doublons de navigation, prose promotionnelle, recommandations obsolètes (SQL à copier, test bancaire réel, ancien next lint), valeurs de secret de démonstration redondantes et affirmations non vérifiées. Les raisons utiles sont conservées ci-dessus. Aucun workflow, identifiant de tâche ou critère essentiel n'a été volontairement supprimé pour réduire la longueur.

## 5. Known Issues

Reprendre les IDs dans [tasks](./tasks.md), source unique de leur état : TECH-013/014/015/016 pour auth/PII/mutations ; TECH-002/003 pour paiements/réservation ; TECH-019 pour transitions/crédits ; TECH-017 pour parent/LiveKit/retours ; TECH-018 pour IA ; OPS-002 pour stack locale ; UX-001 et A11Y-001 pour modales/landmarks. Décisions bloquantes : conditions/prix/preuves, famille et domaine. Aucun bug applicatif corrigé dans cette mission.

## 6. Last Completed Work

Historique Git lu : f82953a migration Auth ; 3a913ab stabilisation abonnements Mercure ; ce6e7de navigation ; 1964a19 serveur LiveKit local ; 90596cc documentation Auth ; e637788 Node 24. Ces commits prouvent des changements versionnés, pas leur recette en production. Dernière intervention documentaire : entrée datée ci-dessous.

## 7. Current Focus

Consolidation documentaire et préparation de la V2, sans implementation frontend. Priorité recommandée suivante : TECH-013 avec test négatif du chemin Credentials, puis autres P0. Travail de conception possible en parallèle temporel : V2-001 baseline/inventaire, puis tokens et prototype ; ce n'est pas un chantier lancé.

## 8. Change Log

### 2026-10-10 — Documentation Consolidation — Migration to Six Canonical Documents

#### Contexte

21 documents dans docs, audits et workflows parfois contradictoires ; mission strictement documentaire sur main, branche dédiée créée en conservant les changements utilisateur.

#### Modifications

Six documents PRD.md, architecture.md, Rules.md, design.md, tasks.md, memory.md ; workflows, runbooks, backlog historique et vision V2 fusionnés. Matrice exhaustive ci-dessus. Références extérieures actualisées dans README, SECURITY, supabase/README et le message de configuration de lib/stripe.ts. Les 21 anciens documents et le sous-dossier workflows ont été supprimés après vérification de couverture. Aucun fichier extérieur de documentation supprimé.

#### Décisions

Code local prime pour état technique ; statuts explicites, propositions non présentées comme livrées ; IDs historiques conservés et alias UX dédupliqués. Aucun changement métier, dépendance, migration DB, déploiement ni secret modifié. V2 spécifiée/planifiée uniquement.

#### Vérifications

Lecture des 21 sources, package/lock/install, routes critiques, providers/hooks/assets et migrations ; recherche TODO/FIXME et anciens liens. Benchmark textuel de cinq sites, deux références inexploitables ; aucun test visuel concurrentiel.

| Contrôle exécuté                                                         | Résultat et limites                                                                                                                                                          |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Inventaire/matrice avant suppression                                     | 21 sources traitées et mappées ; 104 critères/tests des audits comparés au backlog cible, tous retrouvés                                                                     |
| Validation documentaire Python temporaire                                | Six noms/casse, liens relatifs et ancres, champs de tâches, graphe sans cycle, UTF-8, recherche de secrets par motifs : succès ; 274 liens, 47 tâches uniques et 50 alias UX |
| `npm.cmd run format:check`                                               | Échec, code 1 : 271 fichiers préexistants non conformes ; aucune correction globale. Markdown exclu par .prettierignore                                                      |
| Prettier local, `--write --ignore-path .gitignore` puis `--check` ciblés | Neuf Markdown de la mission uniquement : les six références et README/SECURITY/supabase README ; syntaxe/formatage contrôlés                                                 |
| `npm.cmd run lint`                                                       | Succès, code 0                                                                                                                                                               |
| `npm.cmd run type-check`                                                 | Succès, code 0                                                                                                                                                               |
| `git diff --check`                                                       | Succès ; avertissements de conversion LF/CRLF de Git sans erreur de whitespace                                                                                               |
| Inventaire après suppression                                             | Exactement six fichiers Markdown, aucun sous-dossier ; aucun lien actif vers ancienne documentation                                                                          |

Les contrôles ont utilisé Node 26.8.2/npm 12.0.2 ; recette Node 24 reste à faire. Aucun build lancé : mission documentaire, runtime cible différent et build susceptible de charger la configuration locale/polices ; lint/type et contrôles ciblés suffisent à ce diff sans revendiquer un build réussi. Aucun npm audit actuel, test unitaire/E2E, contrôle de production ou recette visuelle exécuté. Mermaid : clôture des blocs et revue des libellés seulement, sans moteur de rendu installé. Le scan par motifs n'est pas une garantie exhaustive d'absence de secrets. Les scripts temporaires de génération/vérification ont été retirés de l'arbre final.

#### Résultat

Migration terminée : 21 documents analysés, 21 contenus traités/migrés, 21 fichiers supprimés ; six références actives et aucun sous-dossier. Documentation principalement française, 22 IDs historiques préservés, 50 items UX fusionnés sans second ID de tâche, dix tickets V2 nouveaux. Aucun changement fonctionnel ; seule une référence documentaire a été corrigée dans lib/stripe.ts. Les trois modifications applicatives présentes au départ sont restées intactes. DOC-001 terminé avec échec global de formatage explicitement conservé comme dette préexistante.

#### Prochaines étapes

Prioriser TECH-013, TECH-014, TECH-015, TECH-002 et TECH-003, sans omettre TECH-016. Valider règles métier/proofs/domaine avant lancement public V2. Conception : V2-001 puis V2-002/003.

## 9. Agent Handoff

| Clé                   | Valeur                                                                                                                                        |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| PROJECT               | SikaSchool 1.3.1                                                                                                                              |
| CURRENT STATUS        | Documentation consolidée ; V2 non implémentée ; production non vérifiée                                                                       |
| CURRENT PRIORITY      | Sécurité et intégrité P0 avant lancement V2                                                                                                   |
| LAST CHANGE           | Migration des 21 sources vers six références                                                                                                  |
| OPEN BLOCKERS         | Conditions commerciales, autorité parent/élève, domaine, preuves/droits ; dettes sécurité                                                     |
| NEXT RECOMMENDED TASK | TECH-013 ; conception V2-001 peut être préparée sans publier                                                                                  |
| IMPORTANT FILES       | Rules → memory → tasks ; auth.ts ; API leads/sessions/Stripe ; migrations ; globals.css                                                       |
| WARNINGS              | Préserver les trois modifications utilisateur initiales ; Node poste divergent ; ne pas exécuter migration/reset/production sans autorisation |

## 10. Memory Maintenance Protocol

Après intervention significative : actualiser état courant ; enregistrer décisions avec preuve/date connue ; synchroniser problèmes et IDs tasks ; ajouter entrée chronologique avec commandes/résultats/limites ; actualiser handoff. Ne pas recopier catalogue, API ou backlog. Les décisions futures sans validation restent proposées, les auteurs/dates inconnus restent explicitement inconnus.
