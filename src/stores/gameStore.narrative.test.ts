import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AiNarrativeResponse } from "../types";

vi.mock("../services/narrativeApiClient", () => ({
  generateNarrativeScene: vi.fn(),
  continueNarrativeScene: vi.fn(),
}));

const { generateNarrativeScene, continueNarrativeScene } = await import(
  "../services/narrativeApiClient"
);
const { useGameStore } = await import("./gameStore");

function createAiResponse(overrides: Partial<AiNarrativeResponse> = {}): AiNarrativeResponse {
  return {
    sceneId: "ai_scene_store_001",
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
    ...overrides,
  };
}

function startLife() {
  useGameStore.getState().resetSave();
  useGameStore.getState().startLife({
    name: "測試修士",
    worldId: "world_qingyun",
    identityId: "identity_orphan",
    fateId: "fate_deep_fortune",
  });
}

describe("gameStore AI narrative actions", () => {
  beforeEach(() => {
    vi.mocked(generateNarrativeScene).mockReset();
    vi.mocked(continueNarrativeScene).mockReset();
    startLife();
  });

  it("toggles loading and stores generated AI scene", async () => {
    let resolveScene: (scene: AiNarrativeResponse) => void = () => {};
    vi.mocked(generateNarrativeScene).mockReturnValue(
      new Promise((resolve) => {
        resolveScene = resolve;
      }),
    );

    const pending = useGameStore.getState().generateAiNarrativeEvent();
    expect(useGameStore.getState().aiNarrativeState.isLoading).toBe(true);

    resolveScene(createAiResponse());
    await pending;

    expect(useGameStore.getState().aiNarrativeState.isLoading).toBe(false);
    expect(useGameStore.getState().aiNarrativeState.currentScene?.sceneId).toBe(
      "ai_scene_store_001",
    );
  });

  it("falls back to static event when API fails", async () => {
    vi.mocked(generateNarrativeScene).mockRejectedValue(new Error("quota"));

    await useGameStore.getState().generateAiNarrativeEvent();

    expect(useGameStore.getState().aiNarrativeState.error).toContain("天機額度不足");
    expect(useGameStore.getState().currentEvent).toBeDefined();
  });

  it("continues to the next AI narrative scene after a choice", async () => {
    useGameStore.setState({
      aiNarrativeState: {
        isLoading: false,
        active: true,
        currentScene: createAiResponse(),
        history: [],
        error: null,
      },
      currentPage: "event",
    });
    vi.mocked(continueNarrativeScene).mockResolvedValue(
      createAiResponse({
        sceneId: "ai_scene_store_002",
        title: "符光入體",
      }),
    );

    await useGameStore.getState().chooseAiNarrativeChoice("read_rune");

    expect(continueNarrativeScene).toHaveBeenCalledOnce();
    expect(useGameStore.getState().aiNarrativeState.currentScene?.sceneId).toBe(
      "ai_scene_store_002",
    );
  });

  it("does not settle the life when AI claims the world objective before foundation establishment", () => {
    useGameStore.getState().applyAiNarrativeResult(
      createAiResponse({
        shouldCompleteWorldObjective: true,
        logText: "洞中道韻一閃，似有天機誤認此世已成。",
      }),
    );

    const state = useGameStore.getState();
    expect(state.currentPage).not.toBe("result");
    expect(state.life?.isAlive).toBe(true);
    expect(state.life?.objectiveCompleted).toBe(false);
    expect(state.latestResult).toBeUndefined();
  });
});
