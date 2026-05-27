import {
  generateNovelScene,
  parseBody,
  toApiErrorPayload,
} from "./novelShared.js";

export default async function handler(request: any, response: any) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const payload = parseBody(request);
    const kind = payload?.generationGoal === "death" ? "death" : "settlement";
    response.status(200).json(await generateNovelScene(kind, payload));
  } catch (error) {
    console.error("[novel] settlement route failed", error);
    response.status(500).json(toApiErrorPayload(error, "Failed to generate settlement scene"));
  }
}
