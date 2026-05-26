export const runtime = "nodejs";
export const maxDuration = 15;

const NARRATIVE_MODEL = "gpt-4.1-nano";

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

async function handleHealth(request: Request): Promise<Response> {
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
    model: NARRATIVE_MODEL,
    nodeEnv: process.env.NODE_ENV ?? null,
    openAiProbe,
  });
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== "GET") {
      return jsonResponse({ ok: false, error: "Method not allowed" }, 405);
    }

    return handleHealth(request);
  },
};
