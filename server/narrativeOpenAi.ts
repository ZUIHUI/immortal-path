import OpenAI from "openai";
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

let client: OpenAI | undefined;

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

function getClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  client ??= new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  return client;
}

function parseOutputText(outputText: string): AiNarrativeResponse {
  return parseAiNarrativeResponse(JSON.parse(outputText));
}

async function createStructuredNarrative(prompt: string): Promise<AiNarrativeResponse> {
  const openai = getClient();
  let lastError: unknown;

  for (let attempt = 0; attempt <= AI_CONFIG.schemaRetryCount; attempt += 1) {
    try {
      const response = await openai.responses.create({
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
      });

      return parseOutputText(response.output_text);
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
