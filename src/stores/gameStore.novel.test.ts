import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AiNovelScene } from "../types";

vi.mock("../services/novelApiClient", () => ({
  startNovelLife: vi.fn(),
  continueNovelScene: vi.fn(),
  generateSettlementScene: vi.fn(),
}));

const { startNovelLife, continueNovelScene, generateSettlementScene } = await import(
  "../services/novelApiClient"
);
const { useGameStore } = await import("./gameStore");

function createNovelScene(overrides: Partial<AiNovelScene> = {}): AiNovelScene {
  return {
    sceneId: "novel_store_scene_001",
    chapterTitle: "錯位清晨",
    storyText:
      "你在同一個清晨醒來，窗外的鳥鳴比記憶中慢了半拍。桌上有一張紙條，字跡像你自己的手，卻寫著你今天會死在第三次選擇之後。門外有人敲門，聲音溫和地叫出另一個名字，那名字不屬於你，卻讓胸口的前世玉符微微發燙。",
    displayLines: [
      "你在同一個清晨醒來，窗外的鳥鳴比記憶中慢了半拍。",
      "桌上有一張紙條，字跡像你自己的手。",
      "門外有人敲門，叫出另一個名字。",
    ],
    choices: [
      {
        choiceId: "open_door",
        text: "承認那個名字，先看門外的人究竟記得哪一世",
        tone: "wise",
      },
      {
        choiceId: "burn_note",
        text: "燒掉紙條，不讓未來死亡替此刻做決定",
        tone: "defy_fate",
      },
    ],
    hiddenEffects: [
      { type: "memoryGain", intensity: "small", reason: "前世紙條甦醒" },
    ],
    storyState: {
      shouldContinue: true,
      isDeathScene: false,
      isSettlementScene: false,
      isWorldClearScene: false,
      currentArc: "錯位清晨",
      tensionLevel: "medium",
    },
    internalSummary: "主角收到前世紙條並被陌生名字呼喚。",
    noveltyHints: ["時間錯位", "前世名字"],
    ...overrides,
  };
}

describe("gameStore novel progression", () => {
  beforeEach(() => {
    vi.mocked(startNovelLife).mockReset();
    vi.mocked(continueNovelScene).mockReset();
    vi.mocked(generateSettlementScene).mockReset();
    useGameStore.getState().resetSave();
  });

  it("starts a new reincarnation with generated world, identity, fate, and LifeTheme", async () => {
    vi.mocked(startNovelLife).mockResolvedValue(createNovelScene());

    await useGameStore.getState().startNewReincarnation();

    const state = useGameStore.getState();
    expect(state.player).toBeDefined();
    expect(state.life?.worldId).toMatch(/^world_/);
    expect(state.life?.identityId).toMatch(/^identity_/);
    expect(state.life?.fateId).toMatch(/^fate_/);
    expect(state.life?.lifeThemeId).toMatch(/^life_theme_/);
    expect(state.novelState.pendingChoices.length).toBe(2);
    expect(startNovelLife).toHaveBeenCalledOnce();
  });

  it("does not generate a new opening while pending choices exist", async () => {
    vi.mocked(startNovelLife).mockResolvedValue(createNovelScene());
    await useGameStore.getState().startNewReincarnation();

    await useGameStore.getState().generateOpeningScene();

    expect(startNovelLife).toHaveBeenCalledOnce();
  });

  it("continues after a selected choice and keeps the story appended", async () => {
    vi.mocked(startNovelLife).mockResolvedValue(createNovelScene());
    vi.mocked(continueNovelScene).mockResolvedValue(
      createNovelScene({
        sceneId: "novel_store_scene_002",
        chapterTitle: "門後之人",
      }),
    );

    await useGameStore.getState().startNewReincarnation();
    await useGameStore.getState().selectNovelChoice("open_door");

    const state = useGameStore.getState();
    expect(continueNovelScene).toHaveBeenCalledOnce();
    expect(state.novelState.visibleStory.map((block) => block.chapterTitle)).toContain("門後之人");
    expect(state.novelState.lastSelectedChoice?.choiceId).toBe("open_door");
  });

  it("death hiddenEffect switches the novel state into settlement-ready death flow", async () => {
    vi.mocked(startNovelLife).mockResolvedValue(
      createNovelScene({
        hiddenEffects: [{ type: "death", intensity: "huge", reason: "名字被替換" }],
        choices: [],
        storyState: {
          shouldContinue: false,
          isDeathScene: true,
          isSettlementScene: false,
          isWorldClearScene: false,
          currentArc: "失名死劫",
          tensionLevel: "climax",
        },
      }),
    );

    await useGameStore.getState().startNewReincarnation();

    const state = useGameStore.getState();
    expect(state.novelState.isDead).toBe(true);
    expect(state.novelState.isSettlementReady).toBe(true);
    expect(state.life?.isAlive).toBe(false);
  });

  it("worldClear hiddenEffect makes settlement available and can preserve a legacy relic", async () => {
    vi.mocked(startNovelLife).mockResolvedValue(
      createNovelScene({
        hiddenEffects: [
          { type: "worldClear", intensity: "large", reason: "找回世界火種" },
          {
            type: "legacyRelicGain",
            target: "relic_broken_jade_talisman",
            intensity: "medium",
            reason: "玉符沉入神魂",
          },
        ],
      }),
    );

    await useGameStore.getState().startNewReincarnation();

    const state = useGameStore.getState();
    expect(state.novelState.isSettlementReady).toBe(true);
    expect(state.meta.legacyRelicIds).toContain("relic_broken_jade_talisman");
  });

  it("skipTypewriter immediately unlocks choices after text is shown", async () => {
    vi.mocked(startNovelLife).mockResolvedValue(createNovelScene());
    await useGameStore.getState().startNewReincarnation();

    expect(useGameStore.getState().novelState.isTyping).toBe(true);
    useGameStore.getState().skipTypewriter();

    expect(useGameStore.getState().novelState.isTyping).toBe(false);
    expect(useGameStore.getState().novelState.pendingChoices.length).toBe(2);
  });
});
