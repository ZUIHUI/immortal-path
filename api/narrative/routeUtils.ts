export function parseBody(req: { body?: unknown }) {
  return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
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
