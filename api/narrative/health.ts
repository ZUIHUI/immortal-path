const NARRATIVE_MODEL = "gpt-4.1-nano";

function toApiErrorPayload(error: unknown, fallback: string) {
  if (!(error instanceof Error)) {
    return { ok: false, error: fallback };
  }

  const apiError = error as Error & {
    status?: number;
    code?: string;
    type?: string;
  };

  return {
    ok: false,
    error: error.message,
    status: apiError.status,
    code: apiError.code,
    type: apiError.type,
  };
}

function getProbe(request: any): string | null {
  if (typeof request.query?.probe === "string") {
    return request.query.probe;
  }

  return new URL(request.url ?? "/", "https://local.invalid").searchParams.get("probe");
}

async function handleHealth(request: any) {
  const probe = getProbe(request);
  let openAiProbe = null;

  if (probe === "openai") {
    try {
      const { probeOpenAiNarrativeConnection } = await import(
        "../../server/narrativeOpenAi"
      );
      openAiProbe = await probeOpenAiNarrativeConnection();
    } catch (error) {
      openAiProbe = toApiErrorPayload(error, "OpenAI probe failed");
    }
  }

  return {
    ok: true,
    hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY),
    model: NARRATIVE_MODEL,
    nodeEnv: process.env.NODE_ENV ?? null,
    openAiProbe,
  };
}

export default async function handler(request: any, response: any) {
  if (request.method !== "GET") {
    response.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  response.status(200).json(await handleHealth(request));
}
