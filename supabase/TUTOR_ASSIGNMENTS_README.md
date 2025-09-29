# Système d'Attribution Tuteur-Étudiant

Ce guide explique le système d'attribution des tuteurs aux étudiants dans SikaSchool.

## 🎯 Principe

- **Nouveaux étudiants** : N'ont aucun tuteur attribué par défaut
- **Attribution** : Seuls les administrateurs peuvent attribuer des tuteurs
- **Multi-attribution** : Un étudiant peut avoir plusieurs tuteurs
- **Visibilité** : Les étudiants ne voient que leurs tuteurs attribués

## 📊 Structure de la Base de Données

### Table `tutor_student_assignments`
```sql
CREATE TABLE tutor_student_assignments (
    id UUID PRIMARY KEY,
    tutor_id UUID REFERENCES users(id),
    student_id UUID REFERENCES users(id),
    assigned_by UUID REFERENCES users(id), -- Admin qui a fait l'attribution
    assigned_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    notes TEXT, -- Notes sur l'attribution
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(tutor_id, student_id)
);
```

## 🔧 APIs Disponibles

### Pour les Étudiants

#### `GET /api/student/assigned-tutors`
Récupère les tuteurs attribués à l'étudiant connecté.

**Réponse :**
```json
{
  "tutors": [
    {
      "id": "uuid",
      "name": "Nom du tuteur",
      "email": "tuteur@email.com",
      "avatar": "/path/to/avatar.jpg",
      "bio": "Biographie du tuteur",
      "subjects": ["Mathématiques", "Physique"],
      "experience": 5,
      "isAvailable": true,
      "assignedAt": "2024-01-01T00:00:00Z",
      "notes": "Notes d'attribution"
    }
  ],
  "count": 1
}
```

### Pour les Administrateurs

#### `POST /api/admin/assign-tutor`
Attribue un tuteur à un étudiant.

**Requête :**
```json
{
  "tutorId": "uuid-du-tuteur",
  "studentId": "uuid-de-l-etudiant",
  "notes": "Attribution pour cours de mathématiques (optionnel)"
}
```

#### `DELETE /api/admin/assign-tutor`
Désattribue un tuteur d'un étudiant.

**Requête :**
```
DELETE /api/admin/assign-tutor?tutorId=uuid&studentId=uuid
```

#### `GET /api/admin/assignments`
Liste tous les étudiants, tuteurs et attributions.

**Réponse :**
```json
{
  "students": [...],
  "tutors": [...],
  "assignments": [...]
}
```

## 🚀 Configuration Initiale

### 1. Exécuter le Script SQL
```bash
# Dans l'éditeur SQL de Supabase
-- Exécuter le contenu de add-tutor-student-assignments.sql
```

### 2. Attributions de Démonstration
```bash
# Dans l'éditeur SQL de Supabase
-- Exécuter le contenu de demo-assignments.sql
```

### 3. Vérification
- Aller sur `/student/tutors` avec un compte étudiant
- Vérifier que seuls les tuteurs attribués apparaissent

## 👥 Interface Utilisateur

### Pour les Étudiants
- **Page "Mes tuteurs"** : Affiche uniquement les tuteurs attribués
- **Message informatif** : Si aucun tuteur n'est attribué
- **Recherche et filtrage** : Disponibles sur les tuteurs attribués

### Pour les Administrateurs
- **API d'attribution** : Pour gérer les attributions
- **Interface d'administration** : À développer selon les besoins

## 🔒 Sécurité

- **Authentification requise** : Toutes les APIs vérifient l'authentification
- **Rôles vérifiés** : Seuls les admins peuvent attribuer/désattribuer
- **Validation des données** : Schémas Zod pour valider les entrées
- **Contraintes de base** : Un tuteur ne peut être attribué qu'une fois à un étudiant

## 📝 Cas d'Usage

### Nouvel Étudiant
1. L'étudiant se connecte
2. Va sur "Mes tuteurs"
3. Voit le message "Aucun tuteur attribué"
4. Contacte l'administration

### Attribution par l'Admin
1. L'admin utilise l'API `/api/admin/assign-tutor`
2. L'étudiant voit maintenant ses tuteurs attribués
3. Peut réserver des séances avec ces tuteurs

### Multi-attribution
1. Un étudiant peut avoir plusieurs tuteurs
2. Chaque attribution est indépendante
3. L'étudiant voit tous ses tuteurs attribués

## 🛠️ Développement

### Ajouter de Nouvelles Fonctionnalités
1. Modifier la table `tutor_student_assignments` si nécessaire
2. Mettre à jour les APIs correspondantes
3. Adapter l'interface utilisateur
4. Tester avec les utilisateurs de démonstration

### Debugging
- Vérifier les logs de l'API
- Contrôler les contraintes de base de données
- Tester les permissions utilisateur
- Valider les données d'entrée

## 📚 Documentation Supplémentaire

- **Schéma de base** : `supabase/schema-simple.sql`
- **Scripts d'attribution** : `supabase/add-tutor-student-assignments.sql`
- **APIs** : `app/api/student/assigned-tutors/` et `app/api/admin/assign-tutor/`
- **Interface** : `app/student/tutors/page.tsx`
