export async function parseJsonBody(request: Request) {
  const body = await request.text();
  return body ? JSON.parse(body) : undefined;
}

export function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

export function toApiErrorPayload(error: unknown, fallback: string) {
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
