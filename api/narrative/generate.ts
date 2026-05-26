import { parseBody, toApiErrorPayload } from "./routeUtils";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { generateOpenAiNarrative } = await import("../../server/narrativeOpenAi");
    const payload = parseBody(req);
    const result = await generateOpenAiNarrative(payload);
    res.status(200).json(result);
  } catch (error) {
    console.error("[narrative] generate route failed", error);
    res
      .status(500)
      .json(toApiErrorPayload(error, "Failed to generate AI narrative scene"));
  }
}
