-- Restore French accents and apostrophes in the original demonstration content.
-- Match both the deterministic seed ID and the original value so edited content
-- and all other records are preserved. Safe to apply before or after seeding.

UPDATE public.profiles AS target
SET address = correction.corrected
FROM (VALUES
  ('00000000-0000-4000-8000-000000000001', '10 rue de la Republique', '10 rue de la République'),
  ('00000000-0000-4000-8000-000000000002', '24 avenue Jean Jaures', '24 avenue Jean Jaurès'),
  ('00000000-0000-4000-8000-000000000003', '5 rue des Ecoles', '5 rue des Écoles'),
  ('00000000-0000-4000-8000-000000000004', '5 rue des Ecoles', '5 rue des Écoles'),
  ('00000000-0000-4000-8000-000000000006', '7 allee des Marronniers', '7 allée des Marronniers'),
  ('00000000-0000-4000-8000-000000000009', '8 rue du Rhone', '8 rue du Rhône'),
  ('00000000-0000-4000-8000-00000000000b', '7 allee des Marronniers', '7 allée des Marronniers')
) AS correction(id, original, corrected)
WHERE target.id = correction.id::uuid
  AND target.address = correction.original;

UPDATE public.profiles AS target
SET last_name = correction.corrected
FROM (VALUES
  ('00000000-0000-4000-8000-000000000002', 'Demo', 'Démo'),
  ('00000000-0000-4000-8000-000000000003', 'Demo', 'Démo'),
  ('00000000-0000-4000-8000-000000000004', 'Demo', 'Démo')
) AS correction(id, original, corrected)
WHERE target.id = correction.id::uuid
  AND target.last_name = correction.original;

UPDATE auth.users AS target
SET raw_user_meta_data = jsonb_set(target.raw_user_meta_data, '{last_name}', to_jsonb(correction.corrected))
FROM (VALUES
  ('00000000-0000-4000-8000-000000000002', 'Demo', 'Démo'),
  ('00000000-0000-4000-8000-000000000003', 'Demo', 'Démo'),
  ('00000000-0000-4000-8000-000000000004', 'Demo', 'Démo')
) AS correction(id, original, corrected)
WHERE target.id = correction.id::uuid
  AND target.raw_user_meta_data ->> 'last_name' = correction.original;

UPDATE public.profiles AS target
SET first_name = correction.corrected
FROM (VALUES
  ('00000000-0000-4000-8000-000000000003', 'Lea', 'Léa'),
  ('00000000-0000-4000-8000-00000000000c', 'Ines', 'Inès')
) AS correction(id, original, corrected)
WHERE target.id = correction.id::uuid
  AND target.first_name = correction.original;

UPDATE auth.users AS target
SET raw_user_meta_data = jsonb_set(target.raw_user_meta_data, '{first_name}', to_jsonb(correction.corrected))
FROM (VALUES
  ('00000000-0000-4000-8000-000000000003', 'Lea', 'Léa'),
  ('00000000-0000-4000-8000-00000000000c', 'Ines', 'Inès')
) AS correction(id, original, corrected)
WHERE target.id = correction.id::uuid
  AND target.raw_user_meta_data ->> 'first_name' = correction.original;

UPDATE public.profiles AS target
SET city = correction.corrected
FROM (VALUES
  ('00000000-0000-4000-8000-000000000009', 'Geneve', 'Genève'),
  ('00000000-0000-4000-8000-00000000000d', 'Chambery', 'Chambéry'),
  ('00000000-0000-4000-8000-00000000000e', 'Chambery', 'Chambéry')
) AS correction(id, original, corrected)
WHERE target.id = correction.id::uuid
  AND target.city = correction.original;

UPDATE public.tutors AS target
SET bio = correction.corrected
FROM (VALUES
  ('20000000-0000-4000-8000-000000000002', 'Ingenieur et enseignant, specialiste des mathematiques et de la physique du college au superieur.', 'Ingénieur et enseignant, spécialiste des mathématiques et de la physique du collège au supérieur.'),
  ('20000000-0000-4000-8000-000000000007', 'Professeure certifiee, accompagne les eleves en francais, philosophie et histoire-geographie.', 'Professeure certifiée, accompagne les élèves en français, philosophie et histoire-géographie.'),
  ('20000000-0000-4000-8000-000000000008', 'Developpeur et formateur en algorithmique, programmation web, economie et gestion de projet.', 'Développeur et formateur en algorithmique, programmation web, économie et gestion de projet.'),
  ('20000000-0000-4000-8000-000000000009', 'Enseignante bilingue, preparation aux examens et pratique orale en anglais et espagnol.', 'Enseignante bilingue, préparation aux examens et pratique orale en anglais et espagnol.')
) AS correction(id, original, corrected)
WHERE target.id = correction.id::uuid
  AND target.bio = correction.original;

UPDATE public.tutors AS target
SET subjects = correction.corrected::text[]
FROM (VALUES
  ('20000000-0000-4000-8000-000000000002', ARRAY['Mathematiques', 'Physique', 'Statistiques'], ARRAY['Mathématiques', 'Physique', 'Statistiques']),
  ('20000000-0000-4000-8000-000000000007', ARRAY['Francais', 'Philosophie', 'Histoire-Geographie'], ARRAY['Français', 'Philosophie', 'Histoire-Géographie']),
  ('20000000-0000-4000-8000-000000000008', ARRAY['Informatique', 'Algorithmique', 'Economie'], ARRAY['Informatique', 'Algorithmique', 'Économie'])
) AS correction(id, original, corrected)
WHERE target.id = correction.id::uuid
  AND target.subjects = correction.original::text[];

UPDATE public.students AS target
SET school_name = correction.corrected
FROM (VALUES
  ('30000000-0000-4000-8000-000000000003', 'Lycee Rene Descartes', 'Lycée René Descartes'),
  ('30000000-0000-4000-8000-000000000005', 'Lycee Stendhal', 'Lycée Stendhal'),
  ('30000000-0000-4000-8000-000000000006', 'Lycee Berthollet', 'Lycée Berthollet'),
  ('30000000-0000-4000-8000-00000000000c', 'Universite Grenoble Alpes', 'Université Grenoble Alpes'),
  ('30000000-0000-4000-8000-00000000000d', 'College Louise Michel', 'Collège Louise Michel'),
  ('30000000-0000-4000-8000-00000000000f', 'College Champollion', 'Collège Champollion')
) AS correction(id, original, corrected)
WHERE target.id = correction.id::uuid
  AND target.school_name = correction.original;

UPDATE public.students AS target
SET academic_goals = correction.corrected
FROM (VALUES
  ('30000000-0000-4000-8000-000000000003', 'Obtenir une mention au baccalaureat et integrer une CPGE.', 'Obtenir une mention au baccalauréat et intégrer une CPGE.'),
  ('30000000-0000-4000-8000-000000000005', 'Gagner en confiance a l ecrit et preparer les epreuves anticipees.', 'Gagner en confiance à l’écrit et préparer les épreuves anticipées.'),
  ('30000000-0000-4000-8000-000000000006', 'Consolider les specialites mathematiques et anglais.', 'Consolider les spécialités mathématiques et anglais.'),
  ('30000000-0000-4000-8000-00000000000c', 'Reussir le premier semestre et maitriser Python.', 'Réussir le premier semestre et maîtriser Python.'),
  ('30000000-0000-4000-8000-00000000000d', 'Ameliorer les bases en sciences et devenir autonome.', 'Améliorer les bases en sciences et devenir autonome.'),
  ('30000000-0000-4000-8000-00000000000f', 'Preparer le brevet et progresser en travail de groupe.', 'Préparer le brevet et progresser en travail de groupe.'),
  ('30000000-0000-4000-8000-000000000011', 'Compte desactive servant a tester les filtres administrateur.', 'Compte désactivé servant à tester les filtres administrateur.')
) AS correction(id, original, corrected)
WHERE target.id = correction.id::uuid
  AND target.academic_goals = correction.original;

UPDATE public.students AS target
SET learning_style = correction.corrected
FROM (VALUES
  ('30000000-0000-4000-8000-000000000003', 'Visuel, exercices progressifs et fiches de synthese', 'Visuel, exercices progressifs et fiches de synthèse'),
  ('30000000-0000-4000-8000-000000000006', 'Pratique, exercices chronometres', 'Pratique, exercices chronométrés'),
  ('30000000-0000-4000-8000-00000000000c', 'Projet, demonstration puis mise en pratique', 'Projet, démonstration puis mise en pratique')
) AS correction(id, original, corrected)
WHERE target.id = correction.id::uuid
  AND target.learning_style = correction.original;

UPDATE public.students AS target
SET emergency_contact = correction.corrected
FROM (VALUES
  ('30000000-0000-4000-8000-000000000003', 'Nathalie Demo +33630000004', 'Nathalie Démo +33630000004')
) AS correction(id, original, corrected)
WHERE target.id = correction.id::uuid
  AND target.emergency_contact = correction.original;

UPDATE public.students AS target
SET address = correction.corrected
FROM (VALUES
  ('30000000-0000-4000-8000-000000000003', '5 rue des Ecoles', '5 rue des Écoles'),
  ('30000000-0000-4000-8000-000000000006', '7 allee des Marronniers', '7 allée des Marronniers')
) AS correction(id, original, corrected)
WHERE target.id = correction.id::uuid
  AND target.address = correction.original;

UPDATE public.students AS target
SET first_name = correction.corrected
FROM (VALUES
  ('30000000-0000-4000-8000-000000000003', 'Lea', 'Léa'),
  ('30000000-0000-4000-8000-00000000000c', 'Ines', 'Inès')
) AS correction(id, original, corrected)
WHERE target.id = correction.id::uuid
  AND target.first_name = correction.original;

UPDATE public.students AS target
SET last_name = correction.corrected
FROM (VALUES
  ('30000000-0000-4000-8000-000000000003', 'Demo', 'Démo')
) AS correction(id, original, corrected)
WHERE target.id = correction.id::uuid
  AND target.last_name = correction.original;

UPDATE public.students AS target
SET grade_level = correction.corrected
FROM (VALUES
  ('30000000-0000-4000-8000-00000000000d', 'Cinquieme', 'Cinquième'),
  ('30000000-0000-4000-8000-00000000000f', 'Troisieme', 'Troisième'),
  ('30000000-0000-4000-8000-000000000011', 'Premiere', 'Première')
) AS correction(id, original, corrected)
WHERE target.id = correction.id::uuid
  AND target.grade_level = correction.original;

UPDATE public.students AS target
SET city = correction.corrected
FROM (VALUES
  ('30000000-0000-4000-8000-00000000000d', 'Chambery', 'Chambéry')
) AS correction(id, original, corrected)
WHERE target.id = correction.id::uuid
  AND target.city = correction.original;

UPDATE public.tutor_student_assignments AS target
SET notes = correction.corrected
FROM (VALUES
  ('40000000-0000-4000-8000-000000000001', 'Suivi principal mathematiques et physique.', 'Suivi principal mathématiques et physique.'),
  ('40000000-0000-4000-8000-000000000003', 'Preparation du francais.', 'Préparation du français.'),
  ('40000000-0000-4000-8000-000000000005', 'Specialite mathematiques.', 'Spécialité mathématiques.'),
  ('40000000-0000-4000-8000-000000000006', 'Preparation orale en anglais.', 'Préparation orale en anglais.'),
  ('40000000-0000-4000-8000-000000000008', 'Sciences niveau college.', 'Sciences niveau collège.'),
  ('40000000-0000-4000-8000-000000000009', 'Preparation au brevet.', 'Préparation au brevet.'),
  ('40000000-0000-4000-8000-000000000010', 'Ancienne affectation cloturee apres reorientation.', 'Ancienne affectation cloturee après reorientation.')
) AS correction(id, original, corrected)
WHERE target.id = correction.id::uuid
  AND target.notes = correction.original;

UPDATE public.sessions AS target
SET subject = correction.corrected
FROM (VALUES
  ('50000000-0000-4000-8000-000000000001', 'Mathematiques', 'Mathématiques'),
  ('50000000-0000-4000-8000-000000000002', 'Francais', 'Français'),
  ('50000000-0000-4000-8000-000000000006', 'Mathematiques', 'Mathématiques'),
  ('50000000-0000-4000-8000-000000000009', 'Francais', 'Français'),
  ('50000000-0000-4000-8000-000000000013', 'Mathematiques', 'Mathématiques'),
  ('50000000-0000-4000-8000-000000000014', 'Mathematiques', 'Mathématiques'),
  ('50000000-0000-4000-8000-000000000015', 'Mathematiques - atelier collectif', 'Mathématiques - atelier collectif')
) AS correction(id, original, corrected)
WHERE target.id = correction.id::uuid
  AND target.subject = correction.original;

UPDATE public.sessions AS target
SET topics_covered = correction.corrected::text[]
FROM (VALUES
  ('50000000-0000-4000-8000-000000000001', ARRAY['Fonctions derivees', 'Variations'], ARRAY['Fonctions dérivées', 'Variations']),
  ('50000000-0000-4000-8000-000000000002', ARRAY['Commentaire compose', 'Figures de style'], ARRAY['Commentaire composé', 'Figures de style']),
  ('50000000-0000-4000-8000-000000000004', ARRAY['Python', 'Recursivite', 'Complexite'], ARRAY['Python', 'Récursivité', 'Complexité']),
  ('50000000-0000-4000-8000-000000000006', ARRAY['Probabilites conditionnelles', 'Loi binomiale'], ARRAY['Probabilités conditionnelles', 'Loi binomiale']),
  ('50000000-0000-4000-8000-000000000008', ARRAY['Electricite'], ARRAY['Électricité']),
  ('50000000-0000-4000-8000-000000000015', ARRAY['Proportionnalite', 'Statistiques'], ARRAY['Proportionnalité', 'Statistiques'])
) AS correction(id, original, corrected)
WHERE target.id = correction.id::uuid
  AND target.topics_covered = correction.original::text[];

UPDATE public.sessions AS target
SET homework_assigned = correction.corrected
FROM (VALUES
  ('50000000-0000-4000-8000-000000000001', 'Exercices 12 a 18 du chapitre 4.', 'Exercices 12 à 18 du chapitre 4.'),
  ('50000000-0000-4000-8000-000000000002', 'Rediger une introduction complete.', 'Rédiger une introduction complète.'),
  ('50000000-0000-4000-8000-000000000004', 'Implementer trois tris et comparer leur complexite.', 'Implémenter trois tris et comparer leur complexité.'),
  ('50000000-0000-4000-8000-000000000005', 'Preparer deux minutes sur un sujet libre.', 'Préparer deux minutes sur un sujet libre.'),
  ('50000000-0000-4000-8000-000000000008', 'Relire la loi des noeuds.', 'Relire la loi des nœuds.'),
  ('50000000-0000-4000-8000-000000000015', 'Quiz de revision du brevet.', 'Quiz de révision du brevet.')
) AS correction(id, original, corrected)
WHERE target.id = correction.id::uuid
  AND target.homework_assigned = correction.original;

UPDATE public.sessions AS target
SET student_notes = correction.corrected
FROM (VALUES
  ('50000000-0000-4000-8000-000000000001', 'La methode devient plus claire.', 'La méthode devient plus claire.'),
  ('50000000-0000-4000-8000-000000000004', 'La recursion est comprise.', 'La récursion est comprise.'),
  ('50000000-0000-4000-8000-000000000005', 'Je parle avec plus de fluidite.', 'Je parle avec plus de fluidité.'),
  ('50000000-0000-4000-8000-000000000006', 'Les arbres ponderes sont acquis.', 'Les arbres pondérés sont acquis.'),
  ('50000000-0000-4000-8000-000000000009', 'Apporter le texte de Moliere.', 'Apporter le texte de Molière.'),
  ('50000000-0000-4000-8000-000000000011', 'Preparation Grand Oral.', 'Préparation Grand Oral.'),
  ('50000000-0000-4000-8000-000000000015', 'Le groupe aide a comparer les methodes.', 'Le groupe aide à comparer les méthodes.')
) AS correction(id, original, corrected)
WHERE target.id = correction.id::uuid
  AND target.student_notes = correction.original;

UPDATE public.sessions AS target
SET tutor_notes = correction.corrected
FROM (VALUES
  ('50000000-0000-4000-8000-000000000003', 'Les unites sont mieux maitrisees.', 'Les unités sont mieux maîtrisées.'),
  ('50000000-0000-4000-8000-000000000004', 'Tres bon raisonnement, attention aux cas limites.', 'Très bon raisonnement, attention aux cas limites.'),
  ('50000000-0000-4000-8000-000000000006', 'Progression reguliere et calculs propres.', 'Progression régulière et calculs propres.'),
  ('50000000-0000-4000-8000-000000000007', 'Annulation tardive : eleve absent sans justificatif.', 'Annulation tardive : élève absent sans justificatif.'),
  ('50000000-0000-4000-8000-000000000008', 'Seance en cours : circuit RC.', 'Séance en cours : circuit RC.'),
  ('50000000-0000-4000-8000-000000000013', 'Annulee par le parent plus de 48 heures avant.', 'Annulée par le parent plus de 48 heures avant.'),
  ('50000000-0000-4000-8000-000000000014', 'Demande de preparation intensive.', 'Demande de préparation intensive.')
) AS correction(id, original, corrected)
WHERE target.id = correction.id::uuid
  AND target.tutor_notes = correction.original;

UPDATE public.session_assessments AS target
SET notes = correction.corrected
FROM (VALUES
  ('52000000-0000-4000-8000-000000000001', 'Premiere evaluation de reference.', 'Première évaluation de référence.'),
  ('52000000-0000-4000-8000-000000000002', 'Bonne analyse du texte, gagner en precision.', 'Bonne analyse du texte, gagner en précision.'),
  ('52000000-0000-4000-8000-000000000003', 'Progression visible sur la methode.', 'Progression visible sur la méthode.'),
  ('52000000-0000-4000-8000-000000000004', 'Tres autonome sur les exercices Python.', 'Très autonome sur les exercices Python.'),
  ('52000000-0000-4000-8000-000000000005', 'Prise de parole spontanee et vocabulaire varie.', 'Prise de parole spontanée et vocabulaire varié.'),
  ('52000000-0000-4000-8000-000000000006', 'Objectifs atteints sur les probabilites.', 'Objectifs atteints sur les probabilités.'),
  ('52000000-0000-4000-8000-000000000007', 'Tres bonne collaboration pendant l atelier.', 'Très bonne collaboration pendant l’atelier.')
) AS correction(id, original, corrected)
WHERE target.id = correction.id::uuid
  AND target.notes = correction.original;

UPDATE public.payments AS target
SET metadata = correction.corrected::jsonb
FROM (VALUES
  ('60000000-0000-4000-8000-000000000001', '{"source":"seed","label":"Pack AVA Eco"}', '{"source":"seed","label":"Pack AVA Éco"}')
) AS correction(id, original, corrected)
WHERE target.id = correction.id::uuid
  AND target.metadata = correction.original::jsonb;

UPDATE public.message_threads AS target
SET subject = correction.corrected
FROM (VALUES
  ('70000000-0000-4000-8000-000000000001', 'Suivi de Lea - mathematiques', 'Suivi de Léa - mathématiques'),
  ('70000000-0000-4000-8000-000000000002', 'Preparation du commentaire compose', 'Préparation du commentaire composé'),
  ('70000000-0000-4000-8000-000000000004', 'Ancien suivi cloture', 'Ancien suivi clôturé')
) AS correction(id, original, corrected)
WHERE target.id = correction.id::uuid
  AND target.subject = correction.original;

UPDATE public.messages AS target
SET content = correction.corrected
FROM (VALUES
  ('71000000-0000-4000-8000-000000000001', 'Bonjour, pouvez-vous me faire un retour sur les dernieres seances de Lea ?', 'Bonjour, pouvez-vous me faire un retour sur les dernières séances de Léa ?'),
  ('71000000-0000-4000-8000-000000000002', 'Bonjour, Lea progresse tres bien. Les probabilites sont maintenant acquises.', 'Bonjour, Léa progresse très bien. Les probabilités sont maintenant acquises.'),
  ('71000000-0000-4000-8000-000000000006', 'Le recu du dernier pack est-il disponible ?', 'Le reçu du dernier pack est-il disponible ?'),
  ('71000000-0000-4000-8000-000000000007', 'Oui, il est telechargeable dans Paiements > Historique.', 'Oui, il est téléchargeable dans Paiements > Historique.'),
  ('71000000-0000-4000-8000-000000000008', 'Ce fil est archive apres changement de tuteur.', 'Ce fil est archivé après changement de tuteur.')
) AS correction(id, original, corrected)
WHERE target.id = correction.id::uuid
  AND target.content = correction.original;

UPDATE public.notifications AS target
SET title = correction.corrected
FROM (VALUES
  ('72000000-0000-4000-8000-000000000001', 'Exercice a rendre', 'Exercice à rendre'),
  ('72000000-0000-4000-8000-000000000003', 'Seance confirmee', 'Séance confirmée'),
  ('72000000-0000-4000-8000-000000000004', 'Paiement accepte', 'Paiement accepté'),
  ('72000000-0000-4000-8000-000000000006', 'Adresse e-mail a verifier', 'Adresse e-mail à vérifier'),
  ('72000000-0000-4000-8000-000000000007', 'Mot de passe modifie', 'Mot de passe modifié'),
  ('72000000-0000-4000-8000-000000000008', 'Seance demarree', 'Séance démarrée'),
  ('72000000-0000-4000-8000-000000000009', 'Nouveau tuteur attribue', 'Nouveau tuteur attribué')
) AS correction(id, original, corrected)
WHERE target.id = correction.id::uuid
  AND target.title = correction.original;

UPDATE public.notifications AS target
SET message = correction.corrected
FROM (VALUES
  ('72000000-0000-4000-8000-000000000001', 'Le sujet de probabilites est a terminer avant la prochaine seance.', 'Le sujet de probabilités est à terminer avant la prochaine séance.'),
  ('72000000-0000-4000-8000-000000000002', 'Daniel a repondu dans votre conversation.', 'Daniel a répondu dans votre conversation.'),
  ('72000000-0000-4000-8000-000000000003', 'Votre seance de francais est programmee demain.', 'Votre séance de français est programmée demain.'),
  ('72000000-0000-4000-8000-000000000004', 'Votre renouvellement mensuel a bien ete paye.', 'Votre renouvellement mensuel a bien été payé.'),
  ('72000000-0000-4000-8000-000000000005', 'Completez votre profil pour profiter de toutes les fonctionnalites.', 'Complétez votre profil pour profiter de toutes les fonctionnalités.'),
  ('72000000-0000-4000-8000-000000000006', 'Confirmez votre adresse pour securiser votre compte.', 'Confirmez votre adresse pour sécuriser votre compte.'),
  ('72000000-0000-4000-8000-000000000007', 'Votre mot de passe a ete modifie avec succes.', 'Votre mot de passe a été modifié avec succès.'),
  ('72000000-0000-4000-8000-000000000008', 'Votre seance de physique est en cours.', 'Votre séance de physique est en cours.'),
  ('72000000-0000-4000-8000-000000000009', 'Ana Souza vous accompagne desormais en anglais.', 'Ana Souza vous accompagne désormais en anglais.'),
  ('72000000-0000-4000-8000-000000000010', 'Une seance superieur attend la validation du paiement.', 'Une séance du supérieur attend la validation du paiement.')
) AS correction(id, original, corrected)
WHERE target.id = correction.id::uuid
  AND target.message = correction.original;

UPDATE public.notifications AS target
SET data = correction.corrected::jsonb
FROM (VALUES
  ('72000000-0000-4000-8000-000000000001', '{"subject":"Mathematiques","source":"seed"}', '{"subject":"Mathématiques","source":"seed"}')
) AS correction(id, original, corrected)
WHERE target.id = correction.id::uuid
  AND target.data = correction.original::jsonb;

UPDATE public.ai_tutor_conversations AS target
SET subject = correction.corrected
FROM (VALUES
  ('80000000-0000-4000-8000-000000000001', 'Mathematiques', 'Mathématiques'),
  ('80000000-0000-4000-8000-000000000002', 'Francais', 'Français')
) AS correction(id, original, corrected)
WHERE target.id = correction.id::uuid
  AND target.subject = correction.original;

UPDATE public.ai_tutor_conversations AS target
SET title = correction.corrected
FROM (VALUES
  ('80000000-0000-4000-8000-000000000002', 'Plan de commentaire compose', 'Plan de commentaire composé'),
  ('80000000-0000-4000-8000-000000000003', 'Debogage Python', 'Débogage Python')
) AS correction(id, original, corrected)
WHERE target.id = correction.id::uuid
  AND target.title = correction.original;

UPDATE public.ai_tutor_messages AS target
SET content = correction.corrected
FROM (VALUES
  ('81000000-0000-4000-8000-000000000001', 'Tu es un tuteur patient. Guide l eleve sans donner immediatement la reponse.', 'Tu es un tuteur patient. Guide l’élève sans donner immédiatement la réponse.'),
  ('81000000-0000-4000-8000-000000000002', 'Peux-tu m expliquer simplement quand utiliser une loi binomiale ?', 'Peux-tu m’expliquer simplement quand utiliser une loi binomiale ?'),
  ('81000000-0000-4000-8000-000000000003', 'On l utilise quand une meme experience a deux issues est repetee independamment un nombre fixe de fois, avec une probabilite de succes constante.', 'On l’utilise quand une même expérience à deux issues est répétée indépendamment un nombre fixé de fois, avec une probabilité de succès constante.'),
  ('81000000-0000-4000-8000-000000000004', 'Comment construire un plan en deux parties pour ce texte de Moliere ?', 'Comment construire un plan en deux parties pour ce texte de Molière ?'),
  ('81000000-0000-4000-8000-000000000005', 'Commence par relever les oppositions du passage. Elles peuvent faire emerger deux axes coherents.', 'Commence par relever les oppositions du passage. Elles peuvent faire émerger deux axes cohérents.'),
  ('81000000-0000-4000-8000-000000000006', 'Pourquoi ma fonction recursive ne renvoie rien ?', 'Pourquoi ma fonction récursive ne renvoie rien ?'),
  ('81000000-0000-4000-8000-000000000007', 'Analyse statique terminee : branche sans instruction return detectee.', 'Analyse statique terminée : branche sans instruction return détectée.'),
  ('81000000-0000-4000-8000-000000000008', 'Une branche atteint la fin sans return. Ajoute un cas de base explicite et retourne aussi le resultat de l appel recursif.', 'Une branche atteint la fin sans return. Ajoute un cas de base explicite et retourne aussi le résultat de l’appel récursif.')
) AS correction(id, original, corrected)
WHERE target.id = correction.id::uuid
  AND target.content = correction.original;

UPDATE public.reviews AS target
SET student_name = correction.corrected
FROM (VALUES
  ('90000000-0000-4000-8000-000000000001', 'Lea Demo', 'Léa Démo'),
  ('90000000-0000-4000-8000-000000000003', 'Ines Robert', 'Inès Robert')
) AS correction(id, original, corrected)
WHERE target.id = correction.id::uuid
  AND target.student_name = correction.original;

UPDATE public.reviews AS target
SET student_role = correction.corrected
FROM (VALUES
  ('90000000-0000-4000-8000-000000000001', 'Terminale - mathematiques', 'Terminale - mathématiques'),
  ('90000000-0000-4000-8000-000000000002', 'Seconde - francais', 'Seconde - français'),
  ('90000000-0000-4000-8000-000000000005', 'Troisieme - atelier collectif', 'Troisième - atelier collectif'),
  ('90000000-0000-4000-8000-000000000006', 'Parent d eleve', 'Parent d’élève')
) AS correction(id, original, corrected)
WHERE target.id = correction.id::uuid
  AND target.student_role = correction.original;

UPDATE public.reviews AS target
SET content = correction.corrected
FROM (VALUES
  ('90000000-0000-4000-8000-000000000001', 'Daniel explique clairement et me laisse chercher avant de me guider. Mes resultats sont devenus reguliers.', 'Daniel explique clairement et me laisse chercher avant de me guider. Mes résultats sont devenus réguliers.'),
  ('90000000-0000-4000-8000-000000000002', 'Les methodes de Sophie m ont aidee a structurer mes commentaires et a gagner confiance.', 'Les méthodes de Sophie m’ont aidée à structurer mes commentaires et à gagner confiance.'),
  ('90000000-0000-4000-8000-000000000003', 'Karim donne des exemples concrets et m a appris a deboguer de facon autonome.', 'Karim donne des exemples concrets et m’a appris à déboguer de façon autonome.'),
  ('90000000-0000-4000-8000-000000000004', 'Les conversations avec Ana sont tres utiles pour preparer mon oral.', 'Les conversations avec Ana sont très utiles pour préparer mon oral.'),
  ('90000000-0000-4000-8000-000000000005', 'J ai aime travailler en petit groupe et comparer plusieurs methodes.', 'J’ai aimé travailler en petit groupe et comparer plusieurs méthodes.'),
  ('90000000-0000-4000-8000-000000000006', 'Accompagnement serieux et bilans tres utiles apres chaque seance.', 'Accompagnement sérieux et bilans très utiles après chaque séance.')
) AS correction(id, original, corrected)
WHERE target.id = correction.id::uuid
  AND target.content = correction.original;

UPDATE public.faqs AS target
SET question = correction.corrected
FROM (VALUES
  ('91000000-0000-4000-8000-000000000001', 'Comment fonctionne une seance ?', 'Comment fonctionne une séance ?'),
  ('91000000-0000-4000-8000-000000000002', 'Quels niveaux sont proposes ?', 'Quels niveaux sont proposés ?'),
  ('91000000-0000-4000-8000-000000000003', 'Comment utiliser un pack de seances ?', 'Comment utiliser un pack de séances ?'),
  ('91000000-0000-4000-8000-000000000006', 'Ancienne question masquee', 'Ancienne question masquée')
) AS correction(id, original, corrected)
WHERE target.id = correction.id::uuid
  AND target.question = correction.original;

UPDATE public.faqs AS target
SET answer = correction.corrected
FROM (VALUES
  ('91000000-0000-4000-8000-000000000001', 'Apres reservation, l eleve retrouve la seance dans son calendrier et rejoint le cours depuis son espace.', 'Après réservation, l’élève retrouve la séance dans son calendrier et rejoint le cours depuis son espace.'),
  ('91000000-0000-4000-8000-000000000002', 'NOTA couvre le college, AVA le lycee et TODA l enseignement superieur.', 'NOTA couvre le collège, AVA le lycée et TODA l’enseignement supérieur.'),
  ('91000000-0000-4000-8000-000000000003', 'Chaque achat credite le nombre de seances correspondant au niveau choisi. Un credit est consomme lors de la seance.', 'Chaque achat crédite le nombre de séances correspondant au niveau choisi. Un crédit est consommé lors de la séance.'),
  ('91000000-0000-4000-8000-000000000004', 'Oui. Un meme compte parent peut acceder aux espaces des enfants qui lui sont lies.', 'Oui. Un même compte parent peut accéder aux espaces des enfants qui lui sont liés.'),
  ('91000000-0000-4000-8000-000000000005', 'Utilisez la messagerie de votre espace ou les coordonnees affichees sur le site.', 'Utilisez la messagerie de votre espace ou les coordonnées affichées sur le site.'),
  ('91000000-0000-4000-8000-000000000006', 'Cette entree inactive permet de tester le filtrage public.', 'Cette entrée inactive permet de tester le filtrage public.')
) AS correction(id, original, corrected)
WHERE target.id = correction.id::uuid
  AND target.answer = correction.original;
