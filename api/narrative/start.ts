import {
  generateNovelScene,
  parseBody,
  toApiErrorPayload,
} from "./novelShared";

export default async function handler(request: any, response: any) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    response.status(200).json(await generateNovelScene("start", parseBody(request)));
  } catch (error) {
    console.error("[novel] start route failed", error);
    response.status(500).json(toApiErrorPayload(error, "Failed to start novel scene"));
  }
}
