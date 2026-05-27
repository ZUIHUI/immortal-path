import { describe, expect, it } from "vitest";
import { resolveHiddenEffects } from "./hiddenEffectResolver";
import { calculateNoveltyScore } from "./noveltyCore";
import { createInitialMeta, createNewLife } from "./reincarnation";
import { getFateById } from "../data/fates";
import { getIdentityById } from "../data/identities";
import { getWorldById } from "../data/worlds";
import { parseAiNovelScene, validateAiNovelScene } from "../services/novelSchema";
import type { AiNovelScene } from "../types";

function createFixture() {
  const world = getWorldById("world_qingyun");
  return {
    world,
    ...createNewLife({
      name: "測試者",
      world,
      identity: getIdentityById("identity_orphan"),
      fate: getFateById("fate_deep_fortune"),
      meta: createInitialMeta(),
    }),
  };
}

function createNovelScene(overrides: Partial<AiNovelScene> = {}): AiNovelScene {
  return {
    sceneId: "novel_scene_test",
    chapterTitle: "前世終點",
    storyText:
      "你在末班車上醒來，所有乘客都低頭看著同一句警告。車窗外不是熟悉的站名，而是前世終點。更詭異的是，玻璃倒影中的你正穿著青雲外門弟子服，袖口沾著尚未乾透的血。手機忽然亮起，傳來一封三百年前寄出的訊息，訊息末尾寫著：不要在這一站築基。車門即將打開，你知道這不是普通醒覺，而是某段輪迴因果提前找上了你。",
    displayLines: [
      "你在末班車上醒來，所有乘客都低頭看著同一句警告。",
      "車窗外不是熟悉的站名，而是前世終點。",
      "手機忽然亮起，傳來一封三百年前寄出的訊息。",
    ],
    choices: [
      {
        choiceId: "leave_train",
        text: "在車門打開前強行下車，賭前世警告是真的",
        tone: "defy_fate",
      },
      {
        choiceId: "read_message",
        text: "查看訊息下一行，弄清三百年前的自己想阻止什麼",
        tone: "wise",
      },
    ],
    hiddenEffects: [
      { type: "memoryGain", intensity: "small", reason: "前世訊息甦醒" },
    ],
    storyState: {
      shouldContinue: true,
      isDeathScene: false,
      isSettlementScene: false,
      isWorldClearScene: false,
      currentArc: "前世終點站",
      tensionLevel: "medium",
    },
    internalSummary: "主角在現代異常站台看見前世警告。",
    noveltyHints: ["現代交通與前世因果衝突"],
    ...overrides,
  };
}

describe("novel flow core", () => {
  it("validates and parses AiNovelScene schema", () => {
    const scene = createNovelScene();

    expect(validateAiNovelScene(scene)).toBe(true);
    expect(parseAiNovelScene({ ...scene, hiddenEffects: [{ ...scene.hiddenEffects[0], target: null }] }).hiddenEffects[0].target).toBeUndefined();
    expect(validateAiNovelScene({ ...scene, choices: [{ text: "太短" }] })).toBe(false);
  });

  it("converts hiddenEffects into game effects and clamps huge rewards", () => {
    const fixture = createFixture();
    const resolved = resolveHiddenEffects({
      hiddenEffects: [
        { type: "cultivationGain", intensity: "huge", reason: "異常靈潮" },
        { type: "hpLoss", intensity: "medium", reason: "靈壓撕裂經脈" },
      ],
      player: {
        ...fixture.player,
        realmId: "realm_qi_refining_early",
        highestRealmId: "realm_qi_refining_early",
      },
      lifeState: fixture.life,
      metaProgress: fixture.meta,
      worldConfig: fixture.world,
    });

    expect(resolved.effects.some((effect) => effect.type === "cultivationDelta")).toBe(true);
    expect(resolved.effects.some((effect) => effect.type === "hpDelta")).toBe(true);
    expect(resolved.balanceWarnings).toContain("天機收益已被壓回當前境界可承受範圍");
  });

  it("marks low novelty scenes for regeneration", () => {
    const low = calculateNoveltyScore({
      chapterTitle: "山洞靈泉",
      storyText: "你在山洞採藥，遇見老者，撿到殘卷，找到靈泉，開始普通突破。",
      noveltyHints: [],
    });
    const high = calculateNoveltyScore(createNovelScene());

    expect(low.shouldRegenerate).toBe(true);
    expect(high.score).toBeGreaterThan(low.score);
  });

  it("turns death and worldClear hidden effects into control effects", () => {
    const fixture = createFixture();
    const resolved = resolveHiddenEffects({
      hiddenEffects: [
        { type: "death", intensity: "huge", reason: "名字被替換" },
        { type: "worldClear", intensity: "large", reason: "找回影子" },
      ],
      player: fixture.player,
      lifeState: fixture.life,
      metaProgress: fixture.meta,
      worldConfig: fixture.world,
    });

    expect(resolved.effects.some((effect) => effect.type === "triggerDeath")).toBe(true);
    expect(resolved.effects.some((effect) => effect.type === "worldClear")).toBe(true);
  });
});
