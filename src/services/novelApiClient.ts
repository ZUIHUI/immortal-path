import { parseAiNovelScene } from "./novelSchema";
import type {
  AiNovelChoice,
  AiNovelScene,
  LifeState,
  MetaProgress,
  NarrativePlayerSnapshot,
  NovelState,
} from "../types";

export interface NovelApiPayload {
  lifeState: LifeState;
  metaProgress: MetaProgress;
  playerSnapshot: NarrativePlayerSnapshot;
  novelState: NovelState;
  selectedChoice?: AiNovelChoice | null;
  generationGoal?: "death" | "settlement";
}

async function postNovelScene(url: string, payload: NovelApiPayload): Promise<AiNovelScene> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = typeof json.error === "string" ? json.error : response.statusText;
    throw new Error(message || "天機推演失敗");
  }

  return parseAiNovelScene(json);
}

export function startNovelLife(payload: NovelApiPayload): Promise<AiNovelScene> {
  return postNovelScene("/api/narrative/start", payload);
}

export function continueNovelScene(payload: NovelApiPayload): Promise<AiNovelScene> {
  return postNovelScene("/api/narrative/continue", payload);
}

export function generateSettlementScene(payload: NovelApiPayload): Promise<AiNovelScene> {
  return postNovelScene("/api/narrative/settlement", payload);
}
