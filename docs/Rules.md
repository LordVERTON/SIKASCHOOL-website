# SikaSchool — Rules

> SikaSchool — Documentation de référence

**Last updated:** 2026-10-10
**Status:** Active
**Source of truth:** contrat normatif de développement et protocole de travail des agents IA.

## Navigation

[Product](./PRD.md) · [Architecture](./architecture.md) · [Rules](./Rules.md) · [Design](./design.md) · [Tasks](./tasks.md) · [Memory](./memory.md)

## Portée et vocabulaire

MUST = obligatoire ; MUST NOT = interdit ; SHOULD = recommandé, exception motivée ; MAY = facultatif. Ces règles encadrent les travaux futurs ; elles ne prétendent pas que tout le code historique y satisfait. Les instructions explicites de la mission et les contraintes de sécurité/environnement prévalent ; signaler les conflits au lieu d'inventer une autorisation.

## 1. Inspecter le code existant

Le développeur/agent MUST lire l'implémentation, les usages et les contrats avant modification. Il MUST NOT recréer une fonction déjà disponible. Il SHOULD réutiliser Common, Student/Tutor, hooks et services existants. Une proposition d'audit n'est pas un ordre d'implémentation.

## 2. Préserver les parcours

Les changements MUST préserver authentification, réservations, paiements, permissions, données, LiveKit, messagerie et administration sauf changement métier explicitement autorisé. Une refonte visuelle MUST conserver routes, payloads, rôles et effets métier ou documenter le changement approuvé. Les mocks MUST NOT donner de confirmations commerciales sur une route publique. Les changements utilisateur présents avant intervention MUST être conservés.

## 3. TypeScript et conventions

MUST conserver strict, strictNullChecks et alias `@/*`. MUST traiter l'entrée externe comme unknown puis valider ; SHOULD éviter any, casts forcés et suppressions TypeScript, en documentant toute exception étroite. MUST utiliser les types partagés et vérifier la divergence actuelle types/supabase.ts versus génération lib/database.types.ts. MUST respecter ESLint et la configuration Prettier effectivement résolue ; MUST NOT reformater tout le dépôt pour une modification ciblée.

## 4. Sécurité et confidentialité

MUST vérifier identité, rôle/capacité et ownership côté serveur sur chaque action sensible ; le proxy et les contrôles React ne suffisent pas. MUST NOT exposer service role, clés privées, OTP, mots de passe ou données personnelles dans le client, logs, Git, exemples ou réponses. MUST préserver signature webhook sur body brut. MUST protéger contre replay et abus les nouvelles commandes sensibles. MUST NOT affirmer MFA, chiffrement, conformité ou redaction complète sans preuve. MUST distinguer compte payeur, utilisateur connecté et élève effectif. SHOULD minimiser le contexte envoyé au fournisseur IA et prévoir limites de coût/taille/rétention.

## 5. Base de données

MUST versionner les migrations et inspecter la chaîne complète. MUST respecter RLS et privilèges SQL ; service role impose des contrôles API explicites. MUST NOT appliquer reset, suppression, repair d'historique ou migration destructive à une base non autorisée. MUST utiliser transaction/RPC et unicité pour nouveaux invariants critiques (crédits, créneaux), avec idempotence par opération métier. SHOULD tester sauvegarde/restauration avant production. Les données seed MUST rester locales.

## 6. API

MUST documenter méthode, entrée, sortie, rôle, propriété, codes d'erreur et effets secondaires. SHOULD utiliser Zod aux frontières, codes HTTP adaptés et messages sûrs ; SHOULD converger vers le Result décrit dans architecture sans casser les consommateurs. MUST vérifier les erreurs Supabase retournées, pas seulement catch. MUST NOT acquitter un événement financier non persisté. Les logs SHOULD utiliser un identifiant de corrélation sans PII.

## 7. Frontend et accessibilité

MUST concevoir mobile-first et fournir loading, empty, error, success pertinents. MUST associer labels et erreurs, conserver saisies après erreur récupérable, permettre navigation clavier et focus visible. MUST prévoir focus initial/piège/Échap/retour pour dialog, un seul main et titres cohérents. SHOULD viser WCAG 2.2 AA et cibles confortables 44 px ; MUST distinguer objectifs de conformité mesurée. MUST respecter prefers-reduced-motion ; SHOULD animer transform/opacity brièvement, sans animation permanente inutile. MUST réutiliser les tokens/composants validés.

## 8. SEO et contenu

SHOULD rendre côté serveur le contenu statique pertinent. MUST utiliser HTML sémantique, metadata et canonical cohérents pour nouvelles pages publiques ; SHOULD maintenir sitemap/robots et maillage lors de leur mise en place. MUST NOT créer de faux avis, statistiques, partenariats ou données structurées trompeuses. Les routes privées MUST être protégées ; robots/noindex ne remplacent pas l'autorisation. MUST éviter les pages matière/niveau dupliquées sans contenu ni service réel.

## 9. Performance

MUST mesurer avant d'annoncer un gain ; SHOULD respecter les budgets de design, servir images dimensionnées avec sizes, limiter JavaScript client, différer l'interactif non critique et les requêtes redondantes. MUST NOT mettre en cache des données privées entre utilisateurs. SHOULD vérifier fonts, hydratation et effets de mouvement sur petit écran/réseau contraint.

## 10. Vérification selon le changement

| Changement               | Vérifications attendues                                                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Documentation seule      | Structure six fichiers, liens/ancres, contenu/source, secrets, diff ; format ciblé ; commandes qualité disponibles sans correction hors périmètre |
| UI                       | Lint/type/build pertinents, recette clair/sombre, 320/375/390/430 px puis tablette/desktop, clavier/zoom ; états réseau et liens                  |
| API / auth / permissions | Validation, négatifs rôle × ressource × action, ownership, session expirée/inactive, tests intégration sur données isolées                        |
| Paiement / réservation   | Replay, concurrence, rollback d'écriture partielle, catalogue/arrondi, Stripe test, réconciliation DB ; non-régression automatisée P0             |
| Schéma                   | Reset local jetable autorisé, migrations complètes, RLS, types, données existantes et restauration                                                |
| Déploiement autorisé     | Build Node cible, parcours E2E staging, configuration réelle, monitoring et rollback vérifiés                                                     |

MUST exécuter les contrôles appropriés et déclarer exactement commande, résultat et limites. MUST NOT annoncer « tests passés » pour des scénarios seulement écrits. Aucun runner unit/intégration/E2E n'existe actuellement : sa mise en place relève de TECH-010. Un test futur SHOULD vérifier un comportement utile, pas simplement recopier l'implémentation. En documentation, MUST NOT créer de tests applicatifs sans nécessité.

## 11. Dépendances

MUST justifier toute nouvelle dépendance, vérifier version/résolution et réutilisation possible. MUST NOT installer une bibliothèque pour une solution simple déjà disponible. Mise à jour majeure SHOULD être isolée avec recette ; npm audit fix MUST NOT être lancé sans examen de son effet. Mission documentaire : aucune dépendance ajoutée.

## 12. Git

MUST produire un diff ciblé, préserver les modifications préexistantes, exclure secrets et artefacts générés inutiles. SHOULD utiliser une branche dédiée et des commits explicites (`docs:`, `fix:`, `feat:` selon portée), si création/commit autorisés. MUST NOT déployer, pousser ou fusionner sans autorisation correspondante. Une branche ne signifie pas que ses modifications sont déjà validées.

## 13. Documentation

Toute modification significative MUST déclencher l'évaluation des six documents. MUST NOT créer d'autre fichier/sous-dossier dans docs. Un fait MUST avoir une source de vérité unique : PRD métier, architecture technique, Rules normes, design visuel/UX, tasks actions, memory décisions/historique. MUST lier au lieu de recopier des blocs. MUST préserver IDs et critères des tâches migrées, mettre à jour Last updated, statut et preuve. Les documents hors docs MUST être conservés et leurs liens maintenus.

## 14. Design V2

MUST préserver la continuité de marque (logo/bleu/ton humain) et les contrats métier. MAY proposer une évolution des tokens/typos dans design ; une proposition n'est pas une décision approuvée. MUST NOT modifier le backend pour convenance visuelle sans nécessité et validation dans le périmètre. MUST distinguer marketing et application connectée avec un socle partagé. Photos, avis et logos d'établissements MUST avoir preuve/droits appropriés avant publication.

## 15. Priorisation

MUST consulter tasks et ses dépendances ; sécurité et parcours critiques priment sur finition visuelle. MUST NOT transformer tout audit ou benchmark en obligation. Les tâches BLOCKED doivent nommer l'arbitrage manquant ; IN_PROGRESS exige une intervention réellement active ; DONE exige critères et preuves, jamais une ancienne case cochée seule.

## Protocole agent IA

1. Lire Rules.md.
2. Lire memory.md.
3. Lire tasks.md.
4. Consulter PRD.md si changement produit.
5. Consulter architecture.md si changement technique.
6. Consulter design.md si changement UI/UX.
7. Inspecter le code concerné et l'état Git.
8. Définir périmètre, dépendances et risques.
9. Implémenter uniquement ce qui est autorisé.
10. Tester avec les vérifications adaptées.
11. Actualiser les documents pertinents.
12. Actualiser tasks.md, critères et preuves.
13. Ajouter une entrée datée à memory.md.
14. Résumer changements, résultats et limites.

## Conflits entre sources et validations humaines

Pour décrire **l'état actuel**, le code et les migrations locales priment sur prose historique ; configuration déployée doit être constatée séparément. Pour **l'état souhaité**, l'instruction explicite et les décisions validées priment sur une proposition. MUST enregistrer contradiction/résolution/incertitude dans memory. Les noms de migrations ne prouvent pas une date de création.

MUST obtenir un arbitrage si non déjà autorisé pour changement de prix/conditions/remboursement, responsabilités parent/mineur, suppression de données, privilèges, publication de preuves, enregistrement vidéo, fournisseur/rétention IA, domaine canonique ou déploiement. MUST préparer une proposition concrète et révisable avant une demande de validation finale. Les choix techniques réversibles dans le périmètre autorisé MAY être tranchés par l'agent sans confirmation supplémentaire.

## Definition of Done

Une tâche est DONE quand ses critères et tests pertinents ont une preuve datée, les erreurs/états/permissions ont été revus, le diff est ciblé, la documentation et memory sont synchronisées et aucune limite bloquante n'est cachée. Une impossibilité d'exécuter un contrôle MUST être nommée ; elle ne devient pas un succès. Pour UI, inclure desktop/mobile/clavier et non-régression des parcours critiques. Pour cette migration, une dette globale préexistante de format/lint peut être rapportée sans réécriture applicative.
