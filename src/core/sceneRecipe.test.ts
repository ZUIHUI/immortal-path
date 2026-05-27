import { describe, expect, it } from "vitest";
import { getLifeThemeById } from "../data/lifeThemes";
import { getWorldById } from "../data/worlds";
import type { LifeState, NovelState } from "../types";
import { createSceneRecipe } from "./sceneRecipe";

function createLifeState(): LifeState {
  return {
    generation: 1,
    worldId: "world_qingyun",
    identityId: "identity_orphan",
    fateId: "fate_deep_fortune",
    storySeed: "seed_test",
    lifeThemeId: "life_theme_shadow_ascends_first",
    startingAge: 16,
    yearsSurvived: 0,
    highestRealmId: "realm_mortal",
    completedEventIds: [],
    importantEventIds: [],
    rareEventsCompleted: 0,
    epicEventsCompleted: 0,
    legendaryEventsCompleted: 0,
    mythicEventsCompleted: 0,
    enlightenmentCount: 0,
    maxSingleCultivationGain: 0,
    defyingBreakthroughCount: 0,
    objectiveCompleted: false,
    reincarnationPointMultiplier: 1,
    enemiesDefeated: 0,
    isAlive: true,
    startedAt: "2026-01-01T00:00:00.000Z",
  };
}

function createNovelState(): NovelState {
  return {
    currentLifeId: "life_test",
    currentWorldId: "world_qingyun",
    currentLifeThemeId: "life_theme_shadow_ascends_first",
    currentArc: "影子先成仙",
    storySoFarSummary: "玩家已經在山洞遇過老者與殘卷。",
    visibleStory: [
      {
        id: "scene_001",
        chapterTitle: "山洞殘卷",
        storyText: "玩家在山洞中遇見老者，影子卻先一步翻開殘卷。",
        displayLines: ["玩家在山洞中遇見老者。", "影子卻先一步翻開殘卷。"],
        sceneType: "opening",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ],
    typingBlockId: null,
    pendingChoices: [],
    lastSelectedChoice: null,
    internalFlags: [],
    hiddenState: {
      tensionLevel: "medium",
      relationshipHints: [],
      unresolvedMysteries: ["影子的境界"],
      obtainedRelics: [],
      recentSceneTypes: ["opening"],
      recentMotifs: ["山洞", "老者", "殘卷", "影子"],
    },
    isGenerating: false,
    isTyping: false,
    hasStarted: true,
    isDead: false,
    isSettlementReady: false,
    error: null,
  };
}

describe("sceneRecipe", () => {
  it("builds rich narrative directives and avoids recently used motifs", () => {
    const directives = createSceneRecipe({
      lifeState: createLifeState(),
      novelState: createNovelState(),
      world: getWorldById("world_qingyun"),
      lifeTheme: getLifeThemeById("life_theme_shadow_ascends_first"),
      selectedChoice: {
        choiceId: "free_shadow",
        text: "放影子自由，讓它先走完這條道",
        tone: "defy_fate",
      },
    });

    expect(directives.sceneRecipe.requiredTwist).toBeTruthy();
    expect(directives.sceneRecipe.requiredNewElement).toBeTruthy();
    expect(directives.sceneRecipe.doNotRepeat).toContain("山洞");
    expect(directives.sceneRecipe.forbiddenMotifs).toContain("老者");
    expect(directives.lifeTheme?.motifs).toContain("影子吐納");
    expect(directives.storyThemes.length).toBe(2);
  });
});
