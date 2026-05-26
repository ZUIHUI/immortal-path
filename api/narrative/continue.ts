import { continueOpenAiNarrative } from "../../server/narrativeOpenAi";

function parseBody(req: { body?: unknown }) {
  return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const payload = parseBody(req);
    const result = await continueOpenAiNarrative(payload);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to continue AI narrative scene",
    });
  }
}
