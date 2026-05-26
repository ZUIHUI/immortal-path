import { AI_CONFIG } from "../../src/config/aiConfig";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  res.status(200).json({
    ok: true,
    hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY),
    model: AI_CONFIG.narrativeModel,
    nodeEnv: process.env.NODE_ENV ?? null,
  });
}
