/**
 * Agent LangGraph "Sika AI".
 *
 * On utilise le graph prebuilt `createReactAgent` de LangGraph qui implémente
 * le pattern ReAct (Reasoning + Acting) : le modèle alterne réflexion et
 * appels d'outils jusqu'à produire une réponse finale.
 *
 * Le modèle sous-jacent est un LLM multimodal (OpenAI GPT-4o par défaut) qui
 * sait lire des images directement. Les photos envoyées par l'élève sont
 * transmises comme `image_url` dans les messages (data URL base64).
 */

import { ChatOpenAI } from '@langchain/openai';
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
  type BaseMessage,
} from '@langchain/core/messages';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { tutorTools } from './tools';
import { buildSystemPrompt } from './prompts';

export type StoredRole = 'user' | 'assistant' | 'system' | 'tool';

export interface StoredAttachment {
  kind: 'image';
  /** Data URL (data:image/png;base64,...) ou URL publique signée. */
  url: string;
  mimeType?: string;
  name?: string;
}

export interface StoredMessage {
  role: StoredRole;
  content: string;
  images?: StoredAttachment[];
}

export interface RunAgentOptions {
  history: StoredMessage[];
  userMessage: string;
  attachments?: StoredAttachment[];
  student?: {
    name?: string | null;
    level?: string | null;
    subject?: string | null;
  };
  signal?: AbortSignal;
}

export interface RunAgentResult {
  content: string;
  toolCalls: { name: string; args: unknown }[];
  model: string;
}

const DEFAULT_MODEL = process.env.SIKA_AI_MODEL || 'gpt-4o-mini';

/**
 * Construit l'instance du LLM. `gpt-4o-mini` est largement suffisant, rapide
 * et multimodal. On peut surcharger via la variable d'env `SIKA_AI_MODEL`.
 */
function buildModel() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY manquante. Ajoute-la dans .env.local pour activer Sika AI."
    );
  }
  return new ChatOpenAI({
    apiKey,
    model: DEFAULT_MODEL,
    temperature: 0.3,
    maxRetries: 2,
  });
}

/**
 * Convertit un message stocké en BaseMessage LangChain, en intégrant les
 * images (vision) quand nécessaire.
 */
function toLangchainMessage(msg: StoredMessage): BaseMessage | null {
  const images = (msg.images || []).filter((a) => a?.url);
  const hasImages = images.length > 0;

  if (msg.role === 'system') {
    return new SystemMessage({ content: msg.content });
  }

  if (msg.role === 'user') {
    if (!hasImages) {
      return new HumanMessage({ content: msg.content });
    }
    // Format multimodal : content = tableau de blocs texte + image_url.
    const parts: Array<
      | { type: 'text'; text: string }
      | { type: 'image_url'; image_url: { url: string; detail?: 'auto' | 'low' | 'high' } }
    > = [];
    if (msg.content?.trim()) {
      parts.push({ type: 'text', text: msg.content });
    } else {
      parts.push({
        type: 'text',
        text: "Voici une ou plusieurs images. Analyse-les et aide-moi.",
      });
    }
    for (const img of images) {
      parts.push({
        type: 'image_url',
        image_url: { url: img.url, detail: 'auto' },
      });
    }
    return new HumanMessage({ content: parts as any });
  }

  if (msg.role === 'assistant') {
    return new AIMessage({ content: msg.content });
  }

  // 'tool' messages stockés côté DB n'ont pas besoin d'être renvoyés au modèle :
  // l'historique "utile" côté utilisateur est ce qui a été effectivement dit.
  return null;
}

/**
 * Exécute un tour de conversation avec l'agent et renvoie la réponse finale.
 */
export async function runSikaAgent(opts: RunAgentOptions): Promise<RunAgentResult> {
  const model = buildModel();

  const agent = createReactAgent({
    llm: model,
    tools: tutorTools,
  });

  const systemPrompt = buildSystemPrompt({
    studentName: opts.student?.name ?? null,
    subject: opts.student?.subject ?? null,
    level: opts.student?.level ?? null,
  });

  const historyMessages: BaseMessage[] = [];
  historyMessages.push(new SystemMessage({ content: systemPrompt }));

  for (const m of opts.history) {
    const converted = toLangchainMessage(m);
    if (converted) historyMessages.push(converted);
  }

  const currentUserMessage = toLangchainMessage({
    role: 'user',
    content: opts.userMessage,
    images: opts.attachments || [],
  });
  if (currentUserMessage) historyMessages.push(currentUserMessage);

  const result = await agent.invoke(
    { messages: historyMessages },
    { signal: opts.signal, recursionLimit: 12 }
  );

  const finalMessages: BaseMessage[] = (result as any).messages || [];
  const lastAi = [...finalMessages]
    .reverse()
    .find((m) => m instanceof AIMessage) as AIMessage | undefined;

  const finalContent = extractText(lastAi?.content);

  const toolCalls: { name: string; args: unknown }[] = [];
  for (const m of finalMessages) {
    if (m instanceof AIMessage && Array.isArray((m as any).tool_calls)) {
      for (const tc of (m as any).tool_calls as Array<{ name: string; args: unknown }>) {
        toolCalls.push({ name: tc.name, args: tc.args });
      }
    }
  }

  return {
    content: finalContent || "Désolé, je n'ai pas pu formuler de réponse. Reformule ta question ?",
    toolCalls,
    model: DEFAULT_MODEL,
  };
}

function extractText(content: unknown): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((part: any) => {
        if (!part) return '';
        if (typeof part === 'string') return part;
        if (part.type === 'text') return part.text || '';
        return '';
      })
      .join('')
      .trim();
  }
  return '';
}
