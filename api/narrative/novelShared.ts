import { calculateNoveltyScore } from "../../src/core/noveltyCore";
import {
  buildContinuePrompt,
  buildDeathPrompt,
  buildNovelSystemPrompt,
  buildOpeningPrompt,
  buildSettlementPrompt,
  type NovelPromptPayload,
} from "../../src/services/narrativePromptBuilder";
import { AI_NOVEL_SCENE_JSON_SCHEMA, parseAiNovelScene } from "../../src/services/novelSchema";
import type { AiNovelScene } from "../../src/types";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-nano";
const OPENAI_TIMEOUT_MS = 28_000;

export type NovelRouteKind = "start" | "continue" | "death" | "settlement";

function getOpenAiApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  return apiKey;
}

export function parseBody(request: { body?: unknown }) {
  return typeof request.body === "string" ? JSON.parse(request.body) : request.body;
}

export function toApiErrorPayload(error: unknown, fallback: string) {
  if (!(error instanceof Error)) return { error: fallback };
  const apiError = error as Error & { code?: string | number; type?: string };
  return {
    error: error.message || fallback,
    code: apiError.code,
    type: apiError.type,
  };
}

function extractOutputText(payload: any): string | undefined {
  if (typeof payload.output_text === "string") return payload.output_text;
  return payload.output
    ?.flatMap((item: any) => item.content ?? [])
    .find((content: any) => content.type === "output_text" && content.text)
    ?.text;
}

function buildPrompt(kind: NovelRouteKind, payload: NovelPromptPayload): string {
  if (kind === "start") return buildOpeningPrompt(payload);
  if (kind === "death") return buildDeathPrompt(payload);
  if (kind === "settlement") return buildSettlementPrompt(payload);
  return buildContinuePrompt(payload);
}

async function callOpenAi(prompt: string, maxOutputTokens: number): Promise<AiNovelScene> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

  try {
    const response = await fetch(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getOpenAiApiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        instructions: buildNovelSystemPrompt(),
        input: prompt,
        max_output_tokens: maxOutputTokens,
        temperature: 0.72,
        store: false,
        text: {
          format: {
            type: "json_schema",
            name: "novel_scene",
            strict: true,
            schema: AI_NOVEL_SCENE_JSON_SCHEMA,
          },
        },
      }),
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = payload.error?.message ?? response.statusText;
      throw new Error([`status=${response.status}`, payload.error?.code, payload.error?.type, message].filter(Boolean).join(" "));
    }

    const outputText = extractOutputText(payload);
    if (!outputText) throw new Error("OpenAI response did not include output_text");

    return parseAiNovelScene(JSON.parse(outputText));
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function generateNovelScene(kind: NovelRouteKind, payload: NovelPromptPayload): Promise<AiNovelScene> {
  const maxOutputTokens = kind === "settlement" || kind === "death" ? 1800 : 2400;
  const prompt = buildPrompt(kind, payload);
  const recentContext = payload.novelState.visibleStory
    .slice(-3)
    .flatMap((block) => [block.chapterTitle, ...block.displayLines.slice(0, 2)])
    .filter(Boolean);
  let scene = await callOpenAi(prompt, maxOutputTokens);
  let novelty = calculateNoveltyScore(scene, recentContext);

  if (novelty.shouldRegenerate && kind !== "settlement") {
    scene = await callOpenAi(
      `${prompt}\n\n上一版新奇度不足：${novelty.reasons.join("、")}。請重寫，加入世界規則異常、前世衝突、因果代價或跨世界反轉，但仍符合原本狀態。`,
      maxOutputTokens,
    );
    novelty = calculateNoveltyScore(scene, recentContext);
  }

  return {
    ...scene,
    noveltyHints: Array.from(new Set([...scene.noveltyHints, ...novelty.reasons])).slice(0, 8),
  };
}

export default function handler(_request: any, response: any) {
  response.status(404).json({
    ok: false,
    error: "This helper module is not a public narrative endpoint.",
  });
}
