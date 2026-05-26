import { parseBody, toApiErrorPayload } from "../../server/narrativeRouteUtils";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { continueOpenAiNarrative } = await import("../../server/narrativeOpenAi");
    const payload = parseBody(req);
    const result = await continueOpenAiNarrative(payload);
    res.status(200).json(result);
  } catch (error) {
    console.error("[narrative] continue route failed", error);
    res
      .status(500)
      .json(toApiErrorPayload(error, "Failed to continue AI narrative scene"));
  }
}
