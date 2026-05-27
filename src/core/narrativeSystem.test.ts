import { describe, expect, it } from "vitest";
import { resolveAiSuggestedEffects } from "./narrativeEffectResolver";
import { createInitialMeta, createNewLife } from "./reincarnation";
import { getFateById } from "../data/fates";
import { getIdentityById } from "../data/identities";
import { getWorldById } from "../data/worlds";
import { buildGenerateNarrativePrompt } from "../services/narrativePromptBuilder";
import {
  parseAiNarrativeResponse,
  validateAiNarrativeResponse,
} from "../services/narrativeSchema";
import type {
  AiNarrativeResponse,
  GenerateNarrativeScenePayload,
  NarrativePlayerSnapshot,
} from "../types";

function createNarrativeFixture() {
  const world = getWorldById("world_qingyun");
  const identity = getIdentityById("identity_outer_disciple");
  const fate = getFateById("fate_past_wisdom");
  const created = createNewLife({
    name: "測試修士",
    world,
    identity,
    fate,
    meta: createInitialMeta(),
  });
  const playerSnapshot: NarrativePlayerSnapshot = {
    name: created.player.name,
    generation: created.player.generation,
    currentWorldId: created.player.currentWorldId,
    identityId: created.player.identityId,
    fateId: created.player.fateId,
    realmId: created.player.realmId,
    highestRealmId: created.player.highestRealmId,
    cultivation: created.player.cultivation,
    age: created.player.age,
    lifespan: created.player.lifespan,
    hp: created.player.hp,
    maxHp: created.player.maxHp,
    spiritualRoot: created.player.spiritualRoot,
    divineSense: created.player.divineSense,
    attack: created.player.attack,
    defense: created.player.defense,
    comprehension: created.player.comprehension,
    luck: created.player.luck,
    daoHeart: created.player.daoHeart,
    status: created.player.status,
    resources: created.player.resources,
  };

  return {
    ...created,
    world,
    identity,
    fate,
    playerSnapshot,
  };
}

function createAiResponse(overrides: Partial<AiNarrativeResponse> = {}): AiNarrativeResponse {
  return {
    sceneId: "ai_scene_test_001",
    title: "古洞靈光",
    content:
      "雲霧沿著山腰翻湧，古洞深處有青金色靈光一閃而逝。你踏入石階，只覺丹田微熱，壁上殘缺符文似在呼應前世殘影。洞中有靈泉，也有被驚醒的陰冷氣息，進退之間皆牽動因果。",
    mood: "mysterious",
    rarity: "rare",
    choices: [
      {
        choiceId: "cautious_watch",
        text: "先觀符文",
        previewText: "較安全，可能獲得少量感悟。",
        riskLevel: "low",
        choiceType: "wise",
      },
      {
        choiceId: "greedy_enter",
        text: "深入靈泉",
        previewText: "收益較高，但可能受傷。",
        riskLevel: "medium",
        choiceType: "greedy",
      },
    ],
    suggestedEffects: [
      {
        type: "cultivationGain",
        intensity: "small",
        reason: "洞中靈氣入體",
      },
    ],
    settlementTags: ["古洞", "靈泉"],
    logText: "你在古洞中窺見一縷靈光。",
    shouldEndEvent: false,
    shouldTriggerDeath: false,
    shouldTriggerBreakthrough: false,
    shouldCompleteWorldObjective: false,
    ...overrides,
  };
}

describe("AI narrative system", () => {
  it("builds a prompt with required context", () => {
    const fixture = createNarrativeFixture();
    const payload: GenerateNarrativeScenePayload = {
      lifeState: fixture.life,
      metaProgress: fixture.meta,
      worldId: fixture.world.worldId,
      playerSnapshot: fixture.playerSnapshot,
      recentLogs: [{ type: "life", message: "第 1 世開始。" }],
      triggerType: "manual_explore",
    };
    const prompt = buildGenerateNarrativePrompt(payload);

    expect(prompt).toContain(fixture.world.worldName);
    expect(prompt).toContain(fixture.identity.name);
    expect(prompt).toContain(fixture.fate.name);
    expect(prompt).toContain("最近修仙日誌");
    expect(prompt).toContain("target 欄位");
    expect(prompt).toContain("主線章節");
  });

  it("validates and parses AI response schema", () => {
    const raw = {
      ...createAiResponse(),
      deathReason: null,
    };

    expect(validateAiNarrativeResponse(raw)).toBe(true);
    expect(parseAiNarrativeResponse(raw).deathReason).toBeUndefined();
    expect(validateAiNarrativeResponse({ ...raw, rarity: "impossible" })).toBe(false);
  });

  it("converts suggested effects into game effects", () => {
    const fixture = createNarrativeFixture();
    const resolved = resolveAiSuggestedEffects({
      aiEffects: [
        { type: "cultivationGain", intensity: "small", reason: "靈泉洗脈" },
        { type: "resourceGain", target: "pills", intensity: "tiny", reason: "拾得丹藥" },
      ],
      player: fixture.player,
      lifeState: fixture.life,
      metaProgress: fixture.meta,
      worldConfig: fixture.world,
    });

    expect(resolved.effects.some((effect) => effect.type === "cultivationDelta")).toBe(true);
    expect(resolved.effects.some((effect) => effect.type === "resourceDelta")).toBe(true);
    expect(resolved.visibleChanges.length).toBeGreaterThan(0);
  });

  it("clamps oversized cultivation rewards", () => {
    const fixture = createNarrativeFixture();
    const resolved = resolveAiSuggestedEffects({
      aiEffects: [{ type: "cultivationGain", intensity: "huge", reason: "神話靈潮" }],
      player: {
        ...fixture.player,
        realmId: "realm_qi_refining_early",
        highestRealmId: "realm_qi_refining_early",
      },
      lifeState: {
        ...fixture.life,
        highestRealmId: "realm_qi_refining_early",
      },
      metaProgress: fixture.meta,
      worldConfig: fixture.world,
    });

    expect(resolved.balanceWarnings).toContain("cultivationGain clamped to realm-safe maximum");
  });

  it("converts death and breakthrough flags into game effects", () => {
    const fixture = createNarrativeFixture();
    const response = createAiResponse({
      shouldTriggerDeath: true,
      deathReason: "心魔反噬，神魂墜入黑潮。",
      shouldTriggerBreakthrough: true,
    });
    const resolved = resolveAiSuggestedEffects({
      aiEffects: response.suggestedEffects,
      player: fixture.player,
      lifeState: fixture.life,
      metaProgress: fixture.meta,
      worldConfig: fixture.world,
      responseFlags: response,
    });

    expect(resolved.effects.some((effect) => effect.type === "triggerDeath")).toBe(true);
    expect(resolved.effects.some((effect) => effect.type === "breakthroughHint")).toBe(true);
  });

  it("ignores premature AI world objective completion flags", () => {
    const fixture = createNarrativeFixture();
    const response = createAiResponse({
      shouldCompleteWorldObjective: true,
    });
    const resolved = resolveAiSuggestedEffects({
      aiEffects: [],
      player: fixture.player,
      lifeState: fixture.life,
      metaProgress: fixture.meta,
      worldConfig: fixture.world,
      responseFlags: response,
    });

    expect(resolved.effects.some((effect) => effect.type === "completeWorldObjective")).toBe(false);
    expect(resolved.balanceWarnings).toContain("天機誤判已校正：尚未達到世界目標境界");
  });

  it("allows AI world objective completion only after the target realm is reached", () => {
    const fixture = createNarrativeFixture();
    const response = createAiResponse({
      shouldCompleteWorldObjective: true,
    });
    const resolved = resolveAiSuggestedEffects({
      aiEffects: [],
      player: {
        ...fixture.player,
        realmId: "realm_foundation_early",
        highestRealmId: "realm_foundation_early",
      },
      lifeState: {
        ...fixture.life,
        highestRealmId: "realm_foundation_early",
      },
      metaProgress: fixture.meta,
      worldConfig: fixture.world,
      responseFlags: response,
    });

    expect(resolved.effects.some((effect) => effect.type === "completeWorldObjective")).toBe(true);
  });
});
