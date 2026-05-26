function parseBody(request: { body?: unknown }) {
  return typeof request.body === "string" ? JSON.parse(request.body) : request.body;
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

async function handleGenerate(request: any) {
  try {
    const { generateOpenAiNarrative } = await import("../../server/narrativeOpenAi");
    return await generateOpenAiNarrative(parseBody(request));
  } catch (error) {
    console.error("[narrative] generate route failed", error);
    throw error;
  }
}

export default async function handler(request: any, response: any) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    response.status(200).json(await handleGenerate(request));
  } catch (error) {
    response
      .status(500)
      .json(toApiErrorPayload(error, "Failed to generate AI narrative scene"));
  }
}
