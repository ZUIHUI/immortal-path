import { describe, expect, it } from "vitest";
import { SAVE_KEY, SAVE_VERSION } from "../constants/game";
import { createInitialMeta } from "../core/reincarnation";
import { createSaveService, type StorageLike } from "./saveService";
import type { SaveData } from "../types";

function createMemoryStorage(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();

  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
  };
}

function createSaveData(): SaveData {
  return {
    version: SAVE_VERSION,
    savedAt: new Date().toISOString(),
    meta: createInitialMeta(),
    logs: [],
    currentPage: "start",
  };
}

describe("saveService", () => {
  it("saves and loads SaveData", () => {
    const storage = createMemoryStorage();
    const service = createSaveService(() => storage);
    const data = createSaveData();

    const result = service.save(data);
    const loaded = service.load();

    expect(result.ok).toBe(true);
    expect(loaded?.version).toBe(SAVE_VERSION);
    expect(storage.data.has(SAVE_KEY)).toBe(true);
  });

  it("compacts and retries when storage quota is exceeded once", () => {
    const storage = createMemoryStorage();
    let shouldThrow = true;
    const failingStorage: StorageLike = {
      getItem: storage.getItem,
      removeItem: storage.removeItem,
      setItem: (key, value) => {
        if (shouldThrow) {
          shouldThrow = false;
          throw new DOMException("Quota exceeded", "QuotaExceededError");
        }

        storage.setItem(key, value);
      },
    };
    const service = createSaveService(() => failingStorage);
    const data: SaveData = {
      ...createSaveData(),
      logs: Array.from({ length: 60 }, (_, index) => ({
        id: `log_${index}`,
        generation: 1,
        type: "system",
        message: `log ${index}`,
        createdAt: new Date().toISOString(),
      })),
    };

    const result = service.save(data);
    const loaded = service.load();

    expect(result.ok).toBe(true);
    expect(result.compacted).toBe(true);
    expect(loaded?.logs.length).toBe(30);
  });

  it("saves active novel story and pending choices", () => {
    const storage = createMemoryStorage();
    const service = createSaveService(() => storage);
    const data: SaveData = {
      ...createSaveData(),
      novelState: {
        currentLifeId: "life_test",
        currentWorldId: "world_qingyun",
        currentLifeThemeId: "life_theme_shadow_ascends_first",
        currentArc: "影子先成仙",
        storySoFarSummary: "影子在月光下先一步吐納。",
        visibleStory: [
          {
            id: "scene_001",
            chapterTitle: "月下影息",
            storyText: "你的影子在月光下先一步吐納。",
            displayLines: ["你的影子在月光下先一步吐納。"],
            sceneType: "opening",
            createdAt: new Date().toISOString(),
          },
        ],
        pendingChoices: [
          {
            choiceId: "follow_shadow",
            text: "跟著影子走進月光照不到的巷口",
            tone: "reckless",
          },
        ],
        lastSelectedChoice: null,
        internalFlags: [],
        hiddenState: {
          tensionLevel: "medium",
          relationshipHints: [],
          unresolvedMysteries: ["影子的境界"],
          obtainedRelics: [],
          recentSceneTypes: ["opening"],
          recentMotifs: ["影子"],
        },
        isGenerating: false,
        isTyping: false,
        hasStarted: true,
        isDead: false,
        isSettlementReady: false,
        error: null,
      },
    };

    service.save(data);
    const loaded = service.load();

    expect(loaded?.novelState?.visibleStory[0]?.chapterTitle).toBe("月下影息");
    expect(loaded?.novelState?.pendingChoices[0]?.choiceId).toBe("follow_shadow");
  });
});
