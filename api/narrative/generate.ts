export const runtime = "nodejs";
export const maxDuration = 30;

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

async function parseJsonBody(request: Request) {
  const body = await request.text();
  return body ? JSON.parse(body) : undefined;
}

function toApiErrorPayload(error: unknown, fallback: string) {
  if (!(error instanceof Error)) {
    return { error: fallback };
  }

  const apiError = error as Error & {
    status?: number;
    code?: string;
    type?: string;
  };

  return {
    error: error.message,
    status: apiError.status,
    code: apiError.code,
    type: apiError.type,
  };
}

async function handleGenerate(request: Request): Promise<Response> {
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

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    return handleGenerate(request);
  },
};
