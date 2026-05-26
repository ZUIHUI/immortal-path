import { AI_CONFIG } from "../../src/config/aiConfig";
import { jsonResponse } from "../../server/narrativeRouteUtils";

export const runtime = "nodejs";
export const maxDuration = 10;

export function GET(): Response {
  return jsonResponse({
    ok: true,
    hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY),
    model: AI_CONFIG.narrativeModel,
    nodeEnv: process.env.NODE_ENV ?? null,
  });
}

export function POST(): Response {
  return jsonResponse({ ok: false, error: "Method not allowed" }, 405);
}
