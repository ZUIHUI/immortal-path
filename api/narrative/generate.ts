import {
  jsonResponse,
  parseJsonBody,
  toApiErrorPayload,
} from "../../server/narrativeRouteUtils";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request): Promise<Response> {
  try {
    const { generateOpenAiNarrative } = await import("../../server/narrativeOpenAi");
    const payload = await parseJsonBody(request);
    const result = await generateOpenAiNarrative(payload);
    return jsonResponse(result);
  } catch (error) {
    console.error("[narrative] generate route failed", error);
    return jsonResponse(
      toApiErrorPayload(error, "Failed to generate AI narrative scene"),
      500,
    );
  }
}

export function GET(): Response {
  return jsonResponse({ error: "Method not allowed" }, 405);
}
