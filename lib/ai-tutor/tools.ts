/**
 * Outils LangChain utilisés par l'agent LangGraph "Sika AI".
 *
 * Les outils sont volontairement "thinking tools" : ils ne font pas d'appels
 * externes, ils forcent le modèle à structurer sa réflexion selon un format
 * pédagogique précis (résolution pas-à-pas, correction, fiche de révision,
 * explication). C'est un pattern classique avec LangGraph pour canaliser le
 * raisonnement d'un agent.
 */

import { tool } from '@langchain/core/tools';
import { z } from 'zod';

export const solveHomeworkTool = tool(
  async ({ subject, statement, known_facts, constraints }) => {
    return [
      '[solve_homework_step_by_step]',
      `Matière : ${subject}`,
      `Énoncé : ${statement}`,
      known_facts ? `Données connues : ${known_facts}` : '',
      constraints ? `Contraintes : ${constraints}` : '',
      '',
      'Produit ensuite une résolution pédagogique respectant EXACTEMENT ce plan :',
      '1. **Compréhension de l\'énoncé** (reformulation, données, inconnue).',
      '2. **Stratégie** (quelle notion / théorème / méthode choisir, pourquoi).',
      '3. **Résolution pas-à-pas** (étapes numérotées, calculs en LaTeX).',
      '4. **Vérification** (ordre de grandeur, cas limites, cohérence).',
      '5. **Réponse finale encadrée**.',
      '6. **Conseil pédagogique** : une erreur classique à éviter + un exercice similaire pour s\'entraîner.',
    ]
      .filter(Boolean)
      .join('\n');
  },
  {
    name: 'solve_homework_step_by_step',
    description:
      "Résout un exercice / devoir de manière pédagogique, étape par étape, avec justification des règles utilisées. À utiliser quand l'élève demande l'aide pour un exercice.",
    schema: z.object({
      subject: z
        .string()
        .describe('Matière concernée (Mathématiques, Physique, Chimie, SVT, Informatique, Français, ...).'),
      statement: z
        .string()
        .describe("Énoncé exact de l'exercice tel que fourni par l'élève (ou transcrit depuis une image)."),
      known_facts: z
        .string()
        .optional()
        .describe("Données, hypothèses ou résultats déjà établis par l'élève."),
      constraints: z
        .string()
        .optional()
        .describe("Contraintes spécifiques : méthode imposée, niveau scolaire, etc."),
    }),
  }
);

export const correctStudentWorkTool = tool(
  async ({ subject, original_exercise, student_answer, grading_criteria }) => {
    return [
      '[correct_student_work]',
      `Matière : ${subject}`,
      `Exercice : ${original_exercise}`,
      `Proposition de l'élève : ${student_answer}`,
      grading_criteria ? `Critères d'évaluation : ${grading_criteria}` : '',
      '',
      'Produit une correction structurée ainsi :',
      '1. **Note estimée** (sur 20) + justification courte.',
      '2. **Points positifs** (ce qui est juste ou bien présenté).',
      '3. **Erreurs identifiées** : pour chaque erreur -> citation + explication + correction.',
      '4. **Correction type complète** (démarche idéale en LaTeX si besoin).',
      "5. **Conseils personnalisés** pour progresser (méthode, rédaction, rigueur).",
      '6. **Pour aller plus loin** : une ressource ou un exercice de ré-entraînement.',
    ]
      .filter(Boolean)
      .join('\n');
  },
  {
    name: 'correct_student_work',
    description:
      "Corrige un travail rendu par l'élève (rédaction, exercice, copie photographiée). Identifie les erreurs, explique la correction et propose des conseils de progression.",
    schema: z.object({
      subject: z.string().describe('Matière concernée.'),
      original_exercise: z
        .string()
        .describe("Énoncé de l'exercice (tel que fourni par l'élève ou transcrit depuis une image)."),
      student_answer: z
        .string()
        .describe("Réponse / production de l'élève (transcrite si fournie en image)."),
      grading_criteria: z
        .string()
        .optional()
        .describe("Critères ou barème si l'élève les a communiqués."),
    }),
  }
);

export const generateRevisionSheetTool = tool(
  async ({ subject, topic, level, focus }) => {
    return [
      '[generate_revision_sheet]',
      `Matière : ${subject}`,
      `Niveau : ${level}`,
      `Thème : ${topic}`,
      focus ? `Focus particulier : ${focus}` : '',
      '',
      'Produit une fiche de révision dense mais lisible respectant CE format :',
      '# Fiche de révision — <thème>',
      '> *Niveau : <niveau> · Matière : <matière>*',
      '',
      '## 1. Définitions clés',
      '## 2. Propriétés / théorèmes à connaître',
      '## 3. Formules essentielles (LaTeX)',
      '## 4. Méthodes type (quand + comment les utiliser)',
      '## 5. Exemples résolus (2 minimum, croissants en difficulté)',
      '## 6. Pièges classiques & erreurs fréquentes',
      '## 7. Questions flash de révision (5) — avec réponses cachées en fin de fiche',
      '## 8. Pour aller plus loin',
      '',
      'Contraintes : \n- Sois synthétique mais exhaustif sur le cœur du programme.\n- Utilise des listes à puces et du **gras** sur les mots-clés.\n- Utilise LaTeX pour les maths/physique.',
    ]
      .filter(Boolean)
      .join('\n');
  },
  {
    name: 'generate_revision_sheet',
    description:
      "Génère une fiche de révision structurée et dense sur un thème donné, adaptée au niveau de l'élève.",
    schema: z.object({
      subject: z.string().describe('Matière concernée.'),
      topic: z.string().describe('Thème précis de la fiche (ex: "Dérivées", "Second degré", "La Révolution française").'),
      level: z
        .string()
        .describe("Niveau scolaire (ex: '3ème', 'Seconde', 'Terminale Spé Maths', 'L1 Info')."),
      focus: z
        .string()
        .optional()
        .describe("Point particulier à approfondir si demandé par l'élève."),
    }),
  }
);

export const explainConceptTool = tool(
  async ({ subject, concept, level, analogy_request }) => {
    return [
      '[explain_concept]',
      `Matière : ${subject}`,
      `Niveau : ${level}`,
      `Concept : ${concept}`,
      analogy_request ? `L'élève demande une analogie : ${analogy_request}` : '',
      '',
      "Explique en suivant ce plan :",
      '1. **Intuition** (phrase simple, analogie du quotidien).',
      '2. **Définition formelle** (précise, en LaTeX si maths/physique).',
      "3. **À quoi ça sert** (contextes d'utilisation, exemples concrets).",
      "4. **Exemple illustratif** détaillé.",
      "5. **Confusions fréquentes** (ce que le concept n'est PAS).",
      "6. **Mini quiz** de 2 questions pour auto-évaluation.",
    ].join('\n');
  },
  {
    name: 'explain_concept',
    description:
      "Explique un concept ou une notion en profondeur avec intuition, définition, exemples et pièges.",
    schema: z.object({
      subject: z.string().describe('Matière concernée.'),
      concept: z.string().describe('Concept à expliquer.'),
      level: z.string().describe("Niveau scolaire de l'élève."),
      analogy_request: z
        .string()
        .optional()
        .describe("Si l'élève demande une analogie particulière."),
    }),
  }
);

export const tutorTools = [
  solveHomeworkTool,
  correctStudentWorkTool,
  generateRevisionSheetTool,
  explainConceptTool,
];
