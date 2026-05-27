const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const NARRATIVE_MODEL =
  process.env.OPENAI_NOVEL_MODEL ??
  process.env.OPENAI_MODEL ??
  "gpt-5.5-thinking";
const OPENAI_TIMEOUT_MS = 12_000;

function getOpenAiApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  return apiKey;
}

function toApiErrorPayload(error: unknown, fallback: string) {
  if (!(error instanceof Error)) {
    return { ok: false, error: fallback };
  }

  const apiError = error as Error & {
    code?: string | number;
    type?: string;
  };

  return {
    ok: false,
    error: error.message,
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

async function probeOpenAi() {
  const startedAt = Date.now();
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
        model: NARRATIVE_MODEL,
        input: "Reply with only OK.",
        max_output_tokens: 16,
        store: false,
      }),
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));

    return {
      ok: response.ok,
      status: response.status,
      model: NARRATIVE_MODEL,
      elapsedMs: Date.now() - startedAt,
      error: payload.error?.message ?? null,
      code: payload.error?.code ?? null,
      type: payload.error?.type ?? null,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export default async function handler(request: any, response: any) {
  if (request.method !== "GET") {
    response.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  let openAiProbe = null;

  if (getProbe(request) === "openai") {
    try {
      openAiProbe = await probeOpenAi();
    } catch (error) {
      openAiProbe = toApiErrorPayload(error, "OpenAI probe failed");
    }
  }

  response.status(200).json({
    ok: true,
    hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY),
    model: NARRATIVE_MODEL,
    nodeEnv: process.env.NODE_ENV ?? null,
    openAiProbe,
  });
}
