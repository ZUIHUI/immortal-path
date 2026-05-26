import {
  jsonResponse,
  parseJsonBody,
  toApiErrorPayload,
} from "../../server/narrativeRouteUtils";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request): Promise<Response> {
  try {
    const { continueOpenAiNarrative } = await import("../../server/narrativeOpenAi");
    const payload = await parseJsonBody(request);
    const result = await continueOpenAiNarrative(payload);
    return jsonResponse(result);
  } catch (error) {
    console.error("[narrative] continue route failed", error);
    return jsonResponse(
      toApiErrorPayload(error, "Failed to continue AI narrative scene"),
      500,
    );
  }
}

export function GET(): Response {
  return jsonResponse({ error: "Method not allowed" }, 405);
}
