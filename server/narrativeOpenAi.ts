import { AI_CONFIG } from "../src/config/aiConfig";
import {
  buildGenerateNarrativePrompt,
  buildContinueNarrativePrompt,
  buildNarrativeSystemPrompt,
} from "../src/services/narrativePromptBuilder";
import {
  AI_NARRATIVE_RESPONSE_JSON_SCHEMA,
  parseAiNarrativeResponse,
} from "../src/services/narrativeSchema";
import type {
  AiNarrativeResponse,
  ContinueNarrativeScenePayload,
  GenerateNarrativeScenePayload,
} from "../src/types";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";

interface OpenAiResponseOutputContent {
  type?: string;
  text?: string;
}

interface OpenAiResponseOutputItem {
  type?: string;
  content?: OpenAiResponseOutputContent[];
}

interface OpenAiResponsesPayload {
  output?: OpenAiResponseOutputItem[];
  output_text?: string;
  error?: {
    message?: string;
    code?: string;
    type?: string;
  };
}

function describeOpenAiError(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Unknown OpenAI API error";
  }

  const maybeApiError = error as Error & {
    status?: number;
    code?: string;
    type?: string;
  };

  return [
    maybeApiError.status ? `status=${maybeApiError.status}` : undefined,
    maybeApiError.code ? `code=${maybeApiError.code}` : undefined,
    maybeApiError.type ? `type=${maybeApiError.type}` : undefined,
    error.message,
  ]
    .filter(Boolean)
    .join(" ");
}

function getOpenAiApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  return apiKey;
}

function parseOutputText(outputText: string | undefined): AiNarrativeResponse {
  if (!outputText) {
    throw new Error("OpenAI response did not include output_text");
  }

  return parseAiNarrativeResponse(JSON.parse(outputText));
}

function extractOutputText(payload: OpenAiResponsesPayload): string | undefined {
  if (payload.output_text) {
    return payload.output_text;
  }

  return payload.output
    ?.flatMap((item) => item.content ?? [])
    .find((content) => content.type === "output_text" && content.text)
    ?.text;
}

async function createOpenAiResponse(prompt: string): Promise<OpenAiResponsesPayload> {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    AI_CONFIG.openAiRequestTimeoutMs,
  );

  try {
    const response = await fetch(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getOpenAiApiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: AI_CONFIG.narrativeModel,
        instructions: buildNarrativeSystemPrompt(),
        input: prompt,
        max_output_tokens: AI_CONFIG.maxOutputTokens,
        temperature: AI_CONFIG.temperature,
        store: false,
        text: {
          format: {
            type: "json_schema",
            name: "ai_narrative_scene",
            strict: true,
            schema: AI_NARRATIVE_RESPONSE_JSON_SCHEMA,
          },
        },
      }),
      signal: controller.signal,
    });

    const payload = (await response.json().catch(() => ({}))) as OpenAiResponsesPayload;

    if (!response.ok) {
      const message = payload.error?.message ?? response.statusText;
      const details = [
        `status=${response.status}`,
        payload.error?.code ? `code=${payload.error.code}` : undefined,
        payload.error?.type ? `type=${payload.error.type}` : undefined,
        message,
      ]
        .filter(Boolean)
        .join(" ");
      throw new Error(details);
    }

    return payload;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function probeOpenAiNarrativeConnection() {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    AI_CONFIG.openAiRequestTimeoutMs,
  );

  try {
    const response = await fetch(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getOpenAiApiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: AI_CONFIG.narrativeModel,
        input: "Reply with only OK.",
        max_output_tokens: 16,
        store: false,
      }),
      signal: controller.signal,
    });
    const payload = (await response.json().catch(() => ({}))) as OpenAiResponsesPayload;

    return {
      ok: response.ok,
      status: response.status,
      model: AI_CONFIG.narrativeModel,
      elapsedMs: Date.now() - startedAt,
      error: payload.error?.message ?? null,
      code: payload.error?.code ?? null,
      type: payload.error?.type ?? null,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function createStructuredNarrative(prompt: string): Promise<AiNarrativeResponse> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= AI_CONFIG.schemaRetryCount; attempt += 1) {
    try {
      const response = await createOpenAiResponse(prompt);
      return parseOutputText(extractOutputText(response));
    } catch (error) {
      lastError = error;
      console.error("[narrative] OpenAI response failed", describeOpenAiError(error));
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("AI narrative response could not be parsed");
}

export function generateOpenAiNarrative(
  payload: GenerateNarrativeScenePayload,
): Promise<AiNarrativeResponse> {
  return createStructuredNarrative(buildGenerateNarrativePrompt(payload));
}

export function continueOpenAiNarrative(
  payload: ContinueNarrativeScenePayload,
): Promise<AiNarrativeResponse> {
  return createStructuredNarrative(buildContinueNarrativePrompt(payload));
}
