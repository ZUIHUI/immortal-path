import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  generateNarrativeScene,
  getNarrativeApiUsage,
} from "./narrativeApiClient";
import { NARRATIVE_USAGE_STORAGE_KEY } from "../config/aiConfig";
import type { AiNarrativeResponse, GenerateNarrativeScenePayload } from "../types";

function createStorageMock() {
  const values = new Map<string, string>();

  return {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      values.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      values.delete(key);
    }),
    clear: vi.fn(() => {
      values.clear();
    }),
  };
}

function createAiResponse(): AiNarrativeResponse {
  return {
    sceneId: "ai_scene_client_test",
    title: "雲階古符",
    content:
      "青雲山階被夜霧覆住，石縫間有細碎金光游走。你俯身看去，古符像一尾活物般貼上掌心，丹田隨之震動。遠處山門鐘聲忽遠忽近，似在催促你於謹慎與貪念之間做出抉擇。",
    mood: "mysterious",
    rarity: "rare",
    choices: [
      {
        choiceId: "read_rune",
        text: "凝神讀符",
        previewText: "穩定獲得感悟。",
        riskLevel: "low",
        choiceType: "wise",
      },
      {
        choiceId: "tear_rune",
        text: "強奪古符",
        previewText: "可能爆發，也可能受傷。",
        riskLevel: "high",
        choiceType: "reckless",
      },
    ],
    suggestedEffects: [
      { type: "cultivationGain", intensity: "small", reason: "古符入識" },
    ],
    settlementTags: ["古符"],
    logText: "古符在掌心留下微光。",
    shouldEndEvent: false,
    shouldTriggerDeath: false,
    shouldTriggerBreakthrough: false,
    shouldCompleteWorldObjective: false,
  };
}

const payload = {
  lifeState: { worldId: "world_qingyun" },
  metaProgress: {},
  worldId: "world_qingyun",
  playerSnapshot: {},
  recentLogs: [],
  triggerType: "manual_explore",
} as unknown as GenerateNarrativeScenePayload;

describe("narrativeApiClient usage tracking", () => {
  beforeEach(() => {
    const localStorage = createStorageMock();
    vi.stubGlobal("window", {
      localStorage,
      setTimeout,
      clearTimeout,
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify(createAiResponse()), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        ),
      ),
    );
  });

  it("increments local usage only after a valid AI response", async () => {
    await generateNarrativeScene(payload);

    expect(getNarrativeApiUsage().count).toBe(1);
  });

  it("does not increment local usage when the API fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify({ error: "OPENAI_API_KEY is not configured" }), {
            status: 500,
            statusText: "Internal Server Error",
            headers: { "Content-Type": "application/json" },
          }),
        ),
      ),
    );

    await expect(generateNarrativeScene(payload)).rejects.toThrow(
      "OPENAI_API_KEY is not configured",
    );
    expect(getNarrativeApiUsage().count).toBe(0);
  });

  it("preserves existing usage-limit records", () => {
    const today = new Date().toISOString().slice(0, 10);
    window.localStorage.setItem(
      NARRATIVE_USAGE_STORAGE_KEY,
      JSON.stringify({ date: today, count: 39 }),
    );

    expect(getNarrativeApiUsage().count).toBe(39);
  });
});
