# Sika AI — Tuteur permanent (LangChain / LangGraph)

Assistant IA pédagogique intégré dans la section **Messages** d'un compte
étudiant. Permet de :

- répondre aux questions techniques (maths, physique, informatique, …),
- aider à faire un devoir pas-à-pas,
- **corriger une photo d'exercice / d'examen** grâce à la vision GPT-4o,
- générer des **fiches de révision** structurées,
- expliquer un concept avec intuition, exemple et pièges.

## Architecture

```
app/
  student/messages/
    page.tsx                           # Carte "Sika AI" épinglée en haut
    ai-tutor/
      page.tsx                         # Liste des discussions IA
      [conversationId]/page.tsx        # Chat UI (texte + images)
  api/student/ai-tutor/
    conversations/route.ts             # GET (liste) / POST (créer)
    conversations/[conversationId]/
      route.ts                         # GET / POST (agent) / PATCH / DELETE

lib/ai-tutor/
  prompts.ts                           # System prompts pédagogiques
  tools.ts                             # Outils LangChain (solve, correct, fiche, explain)
  agent.ts                             # Agent LangGraph (createReactAgent + vision)

supabase/
  create-ai-tutor-tables.sql           # Schéma ai_tutor_conversations / ai_tutor_messages
```

## Stack

- **`@langchain/langgraph`** — `createReactAgent` pour le pattern ReAct
  (réflexion + appels d'outils en boucle jusqu'à réponse finale).
- **`@langchain/openai`** — `ChatOpenAI` avec un modèle multimodal
  (`gpt-4o-mini` par défaut, `gpt-4o` possible pour plus de précision).
- **`@langchain/core`** — messages, outils typés avec `zod`.
- **`langchain`** — pour les utilitaires haut-niveau (si besoin futur).

L'agent expose 4 outils "cognitifs" qui forcent une sortie pédagogique
structurée :

| Outil                          | Usage                                                |
| ------------------------------ | ---------------------------------------------------- |
| `solve_homework_step_by_step`  | Résolution pas-à-pas avec vérification               |
| `correct_student_work`         | Correction d'une copie / d'une photo de devoir       |
| `generate_revision_sheet`      | Fiche de révision dense et structurée                |
| `explain_concept`              | Explication concept (intuition / définition / quiz) |

Les images envoyées par l'élève sont transmises comme `image_url` (data URL
base64) dans le message utilisateur ; le modèle GPT-4o les lit nativement.

## Installation

### 1. Dépendances

Déjà installées :

```bash
npm install @langchain/core @langchain/openai @langchain/langgraph langchain
```

### 2. Variables d'environnement

Ajoute dans `.env.local` (ou `.env`) :

```
OPENAI_API_KEY=sk-...          # obligatoire
SIKA_AI_MODEL=gpt-4o-mini      # optionnel, défaut gpt-4o-mini
```

> Sans `OPENAI_API_KEY`, l'API renvoie un message d'erreur propre et enregistre
> une réponse "assistant indisponible" sans casser la conversation.

### 3. Schéma Supabase

Exécuter le script SQL :

```bash
# via Supabase CLI
supabase db execute --file supabase/create-ai-tutor-tables.sql

# ou coller le contenu dans l'éditeur SQL Supabase Studio
```

Tables créées :

- `ai_tutor_conversations` — une ligne par discussion, liée à `users.id`.
- `ai_tutor_messages` — messages (role ∈ `user` / `assistant` / `system` /
  `tool`), images en `JSONB`, metadata (tool calls, modèle) en `JSONB`.

Un trigger met à jour automatiquement `updated_at` de la conversation à
chaque nouveau message.

## Utilisation

1. L'étudiant se connecte puis va sur `/student/messages`.
2. Il voit la carte **Sika AI — Tuteur permanent · 24/7** pinnée en haut.
3. Il clique, arrive sur `/student/messages/ai-tutor` (liste), crée une
   discussion, et chatte dans `/student/messages/ai-tutor/<id>`.
4. Il peut :
   - envoyer du texte,
   - attacher jusqu'à **6 images** par message (photos d'exercices,
     d'énoncés, de copies — redimensionnées automatiquement côté client à
     1600 px max / qualité 0.85 pour réduire le payload),
   - utiliser les prompts rapides ("Corrige une photo", "Fiche de
     révision", …).

L'agent :

- charge l'historique des 40 derniers messages utiles pour le contexte,
- injecte un system prompt pédagogique personnalisé (nom, niveau, matière
  quand renseignés),
- peut enchaîner plusieurs outils avant de répondre.

## Sécurité

- Toutes les routes API vérifient `getUserSession()` et exigent le rôle
  `STUDENT`.
- Chaque conversation est scopée par `user_id` (vérification côté serveur
  sur GET/POST/PATCH/DELETE).
- Les images sont stockées en **data URL** directement dans Postgres
  (simple, pas besoin de bucket). Pour une production à gros volume,
  migrer vers Supabase Storage et ne stocker qu'une URL signée.

## Coût / performance

- `gpt-4o-mini` est le meilleur ratio qualité/prix pour ce use-case (vision
  OK, raisonnement OK, ~5-10x moins cher que `gpt-4o`).
- `recursionLimit: 12` dans `runSikaAgent` empêche les boucles d'outils
  infinies.
- La compression client (canvas → JPEG 0.85, max 1600 px) réduit
  drastiquement le coût vision.

## Pistes d'évolution

- Streaming des tokens (`agent.stream()` + Server-Sent Events dans
  `route.ts`).
- Ajout d'un outil `search_course` connecté à un index vectoriel
  (Supabase pgvector) des cours / fiches SikaSchool existants pour
  augmenter les réponses.
- Upload des images vers Supabase Storage au lieu de data URL.
- Export PDF des fiches de révision générées.
- Quotas par élève (messages / jour) et logs d'utilisation.
