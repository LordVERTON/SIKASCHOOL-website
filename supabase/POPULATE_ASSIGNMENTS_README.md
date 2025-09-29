# Peuplement des Attributions Tuteur-Étudiant

Ce guide explique comment peupler automatiquement la table `tutor_student_assignments` basée sur les sessions existantes.

## 🎯 Objectif

Créer automatiquement les attributions tuteur-étudiant en analysant les sessions existantes dans la base de données, permettant aux étudiants de voir leurs tuteurs attribués.

## 📊 Principe de Fonctionnement

1. **Analyse des sessions** : Le script examine toutes les sessions existantes
2. **Groupement par paire** : Identifie les paires tuteur-étudiant uniques
3. **Création d'attributions** : Crée une attribution pour chaque paire active
4. **Évitement des doublons** : Ne crée pas d'attributions déjà existantes

## 🛠️ Méthodes Disponibles

### Méthode 1: Script SQL (Recommandée)

**Fichier** : `supabase/populate-assignments-from-sessions.sql`

1. Ouvrez votre projet Supabase dans le dashboard
2. Allez dans l'éditeur SQL
3. Copiez et exécutez le contenu du fichier
4. Vérifiez les statistiques affichées

**Avantages** :
- ✅ Exécution directe dans Supabase
- ✅ Pas de configuration supplémentaire
- ✅ Statistiques détaillées
- ✅ Gestion des erreurs intégrée

### Méthode 2: Script Node.js Interactif

**Fichier** : `scripts/setup-assignments-interactive.js`

```bash
node scripts/setup-assignments-interactive.js
```

**Avantages** :
- ✅ Interface utilisateur conviviale
- ✅ Confirmation avant exécution
- ✅ Aperçu des attributions à créer
- ✅ Statistiques en temps réel

### Méthode 3: Script Node.js Direct

**Fichier** : `scripts/populate-assignments-from-sessions.js`

1. Configurez vos credentials Supabase dans le script
2. Exécutez : `node scripts/populate-assignments-from-sessions.js`

## 📋 Critères d'Attribution

### Sessions Prises en Compte
- ✅ Sessions avec `tutor_id` et `student_id` non nuls
- ✅ Sessions avec `started_at` non nul
- ✅ Sessions passées uniquement (optionnel)
- ✅ Groupement par paire tuteur-étudiant unique

### Informations Générées
- **Date d'attribution** : Date de la première session
- **Notes** : Nombre de sessions, dates de première et dernière session
- **Statut** : Actif par défaut
- **Auto-attribution** : Basée sur les sessions existantes

## 📊 Statistiques Générées

### Avant Exécution
- Nombre total de sessions
- Paires tuteur-étudiant uniques
- Tuteurs actifs
- Étudiants actifs

### Après Exécution
- Attributions créées
- Attributions existantes
- Statistiques par tuteur
- Statistiques par étudiant

## 🔍 Exemple de Résultat

### Sessions Existantes
```
Sessions trouvées: 25
Paires tuteur-étudiant uniques: 8
Tuteurs actifs: 3
Étudiants actifs: 5
```

### Attributions Créées
```
Attributions créées: 8
Notes: "Attribution automatique basée sur 3 session(s) existante(s). 
        Première session: 15/01/2024, Dernière session: 20/01/2024"
```

## 🚨 Points d'Attention

### Vérifications Préalables
1. **Table d'attribution** : Doit exister (`tutor_student_assignments`)
2. **Sessions valides** : Avec tuteur et étudiant identifiés
3. **Permissions** : Service role key pour les scripts Node.js

### Gestion des Doublons
- ✅ Contrainte unique sur `(tutor_id, student_id)`
- ✅ Vérification des attributions existantes
- ✅ Pas de création de doublons

### Nettoyage (Si Nécessaire)
```sql
-- Supprimer les attributions automatiques
DELETE FROM tutor_student_assignments 
WHERE notes LIKE 'Attribution automatique basée sur%';
```

## 🔧 Configuration Avancée

### Filtrage des Sessions
```sql
-- Sessions des 30 derniers jours uniquement
AND s.started_at >= NOW() - INTERVAL '30 days'

-- Sessions d'un niveau spécifique
AND s.level = 'Lycée'

-- Sessions d'une matière spécifique
AND s.subject = 'Mathématiques'
```

### Attribution Manuelle
```sql
-- Attribution avec notes personnalisées
INSERT INTO tutor_student_assignments (tutor_id, student_id, assigned_by, notes)
VALUES ('tutor-uuid', 'student-uuid', 'admin-uuid', 'Attribution manuelle pour cours de physique');
```

## 📈 Monitoring

### Vérification des Attributions
```sql
-- Attributions par tuteur
SELECT 
    u.first_name || ' ' || u.last_name as tutor,
    COUNT(tsa.student_id) as students_assigned
FROM users u
LEFT JOIN tutor_student_assignments tsa ON u.id = tsa.tutor_id
WHERE u.role = 'TUTOR'
GROUP BY u.id, u.first_name, u.last_name;
```

### Vérification des Étudiants
```sql
-- Étudiants sans tuteur attribué
SELECT 
    u.first_name || ' ' || u.last_name as student,
    u.email
FROM users u
LEFT JOIN tutor_student_assignments tsa ON u.id = tsa.student_id
WHERE u.role = 'STUDENT'
AND tsa.id IS NULL;
```

## 🎯 Résultat Final

Après exécution du script :

1. **Étudiants** : Voient leurs tuteurs attribués sur `/student/tutors`
2. **Tuteurs** : Peuvent être contactés par leurs étudiants attribués
3. **Administration** : Peut gérer les attributions via les APIs
4. **Système** : Fonctionne avec les règles d'attribution définies

## 🆘 Dépannage

### Erreur "Table n'existe pas"
- Exécutez d'abord `add-tutor-student-assignments.sql`

### Erreur "Aucune session trouvée"
- Vérifiez que des sessions existent dans la table `sessions`
- Vérifiez que les sessions ont `tutor_id` et `student_id`

### Erreur de connexion (Scripts Node.js)
- Vérifiez l'URL Supabase
- Vérifiez le Service Role Key
- Vérifiez les permissions

## 📚 Documentation Associée

- **Structure de base** : `supabase/add-tutor-student-assignments.sql`
- **APIs d'attribution** : `app/api/admin/assign-tutor/route.ts`
- **Interface étudiant** : `app/student/tutors/page.tsx`
- **Documentation complète** : `supabase/TUTOR_ASSIGNMENTS_README.md`
