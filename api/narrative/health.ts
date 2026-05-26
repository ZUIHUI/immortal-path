import { AI_CONFIG } from "../../src/config/aiConfig";
import { jsonResponse } from "../../server/narrativeRouteUtils";

export const runtime = "nodejs";
export const maxDuration = 15;

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const probe = url.searchParams.get("probe");
  let openAiProbe = null;

  if (probe === "openai") {
    const { probeOpenAiNarrativeConnection } = await import(
      "../../server/narrativeOpenAi"
    );
    openAiProbe = await probeOpenAiNarrativeConnection();
  }

  return jsonResponse({
    ok: true,
    hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY),
    model: AI_CONFIG.narrativeModel,
    nodeEnv: process.env.NODE_ENV ?? null,
    openAiProbe,
  });
}

export function POST(): Response {
  return jsonResponse({ ok: false, error: "Method not allowed" }, 405);
}
