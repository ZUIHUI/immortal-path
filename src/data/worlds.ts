import type { World, WorldType } from "../types";

function createWorld(config: {
  worldId: string;
  name: string;
  type: WorldType;
  era: World["era"];
  difficulty: World["difficulty"];
  tone: string[];
  coreRule: string;
  mainObjective: string;
  clearCondition: string;
  timeLimit: number;
  specialTerms: string[];
  possibleThemes: string[];
  narrativeConstraints: string[];
  deathRisks: string[];
  legacyRelics: string[];
  forbiddenRules?: string[];
  objectiveRealmId?: string;
  cultivationMultiplier?: number;
  eventRiskMultiplier?: number;
  breakthroughRateModifier?: number;
  lifespanLimit?: number;
  eventPool?: string[];
}): World {
  return {
    ...config,
    worldName: config.name,
    worldType: config.type,
    entryRequirement: "輪迴池自動抽取",
    objectiveRealmId: config.objectiveRealmId,
    worldRules: {
      cultivationMultiplier: config.cultivationMultiplier ?? 1,
      eventRiskMultiplier: config.eventRiskMultiplier ?? 1,
      breakthroughRateModifier: config.breakthroughRateModifier ?? 0,
      lifespanLimit: config.lifespanLimit ?? 120,
    },
    eventPool: config.eventPool ?? [],
    rewardPool: config.legacyRelics,
    deathPenalty: "本世可見資源歸零，神魂記憶與世界遺物可能沉入輪迴。",
    clearReward: "保留一項世界遺物或能力鉤子，影響下一世開局與劇情選項。",
    unlockCondition: "初始輪迴池",
    isMvp: true,
  };
}

export const qingyunEventPool = Array.from(
  { length: 30 },
  (_, index) => `event_qingyun_${String(index + 1).padStart(3, "0")}`,
);

export const worlds: World[] = [
  createWorld({
    worldId: "world_qingyun",
    name: "青雲小界",
    type: "ancient_xianxia",
    era: "ancient",
    difficulty: "low",
    tone: ["傳統修仙", "凡人入道", "築基試煉", "雲海山門"],
    coreRule: "靈氣稀薄但穩定，適合初入輪迴者，所有機緣都會留下微弱因果。",
    mainObjective: "在壽元耗盡前築基。",
    clearCondition: "踏入築基初期，或找到足以替代築基的青雲道基。",
    timeLimit: 120,
    specialTerms: ["青雲山門", "外門", "築基", "前世玉符", "輪迴長河"],
    possibleThemes: ["凡骨逆仙", "前世追殺", "飛升者都是騙局"],
    narrativeConstraints: ["可以使用宗門、洞府、秘境，但常見機緣必須帶反轉。"],
    deathRisks: ["壽元耗盡", "心魔反噬", "築基失敗", "宗門暗算"],
    legacyRelics: ["relic_broken_jade_talisman", "relic_half_step_shadow"],
    objectiveRealmId: "realm_foundation_early",
    eventPool: qingyunEventPool,
  }),
  createWorld({
    worldId: "world_modern_reiki_city",
    name: "靈氣復甦都市",
    type: "modern_reiki",
    era: "modern",
    difficulty: "medium",
    tone: ["現代城市", "異能覺醒", "靈氣污染", "官方管制"],
    coreRule: "靈氣重新降臨現代社會，城市中出現秘境裂縫與覺醒者。",
    mainObjective: "在城市靈災爆發前找到自己的覺醒源頭。",
    clearCondition: "查明覺醒源頭，並在靈災中保住自身神魂完整。",
    timeLimit: 90,
    specialTerms: ["靈縫", "異常管理局", "覺醒者", "靈災", "前世終點站"],
    possibleThemes: ["AI 天道判定你不該存在", "手機收到來自前世的簡訊", "因果錯位"],
    narrativeConstraints: ["現代物件要和修行衝突結合，不要寫成普通都市異能。"],
    deathRisks: ["靈氣污染", "官方抹除", "覺醒失控", "秘境裂縫吞噬"],
    legacyRelics: ["relic_reiki_station_ticket", "relic_bureau_black_badge"],
    cultivationMultiplier: 1.05,
    eventRiskMultiplier: 1.12,
  }),
  createWorld({
    worldId: "world_cyber_immortal_city",
    name: "賽博仙城",
    type: "cyber_cultivation",
    era: "future",
    difficulty: "high",
    tone: ["義體", "晶片", "神識網路", "仙道科技", "資本宗門"],
    coreRule: "經脈可以被改造成義體，功法可以被下載，但天道會監控所有突破行為。",
    mainObjective: "逃離天道監控，完成第一次非法築基。",
    clearCondition: "在天道防火牆鎖定前完成非法築基或取得合法身份覆寫碼。",
    timeLimit: 70,
    specialTerms: ["非法丹田核心", "黑市功法插件", "天道防火牆", "神識接口", "資本宗門"],
    possibleThemes: ["你在未來世界下載了前世功法", "天道錯誤碼", "命格被篡改"],
    narrativeConstraints: ["科技名詞必須服務修行與輪迴，不要變成純科幻任務。"],
    deathRisks: ["核心過載", "神識格式化", "天道封鎖", "義體排斥"],
    legacyRelics: ["relic_heaven_error_code", "relic_illegal_core_fragment"],
    cultivationMultiplier: 1.18,
    eventRiskMultiplier: 1.35,
    breakthroughRateModifier: -0.05,
  }),
  createWorld({
    worldId: "world_stellar_immortal_dynasty",
    name: "星海仙朝",
    type: "future_stellar",
    era: "future",
    difficulty: "medium",
    tone: ["星艦", "洞天殖民", "仙道文明", "星域戰爭"],
    coreRule: "宗門以星艦為山門，洞天被改造成移動殖民地。",
    mainObjective: "在星艦墜毀前取得傳承核心。",
    clearCondition: "帶著傳承核心逃出墜毀星艦，或讓宗門山門重新點火。",
    timeLimit: 60,
    specialTerms: ["宗門星艦", "洞天殖民艙", "星門", "元神導航", "傳承核心"],
    possibleThemes: ["破界之人", "AI 觀測到你的輪迴異常", "星門污染神識"],
    narrativeConstraints: ["星際尺度要和修仙境界互相映照。"],
    deathRisks: ["星艦墜毀", "星門污染", "元神迷航", "戰爭波及"],
    legacyRelics: ["relic_stellar_inheritance_core"],
    cultivationMultiplier: 1.08,
    eventRiskMultiplier: 1.2,
  }),
  createWorld({
    worldId: "world_shadowless_city",
    name: "無影城",
    type: "weird_city",
    era: "unknown",
    difficulty: "high",
    tone: ["詭異城市", "規則怪談", "名字污染", "影子失控"],
    coreRule: "城中所有人的影子都不屬於自己，名字被念出三次就會被替換。",
    mainObjective: "找回自己的名字與影子。",
    clearCondition: "在名字被替換前找回影子，或承認影子才是真正的自己。",
    timeLimit: 49,
    specialTerms: ["無影城", "失名告示", "午夜神像", "借影修行", "替名者"],
    possibleThemes: ["影子先成仙", "你的名字被另一個自己占用", "我是自己的心魔"],
    narrativeConstraints: ["詭異規則要前後一致，選項要像規則漏洞。"],
    deathRisks: ["失去名字", "影子反噬", "神像替答", "死亡告示成真"],
    legacyRelics: ["relic_half_step_shadow", "relic_false_name_thread"],
    cultivationMultiplier: 0.95,
    eventRiskMultiplier: 1.55,
  }),
  createWorld({
    worldId: "world_dharma_wasteland",
    name: "末法廢土",
    type: "apocalypse",
    era: "future",
    difficulty: "high",
    tone: ["末日", "靈氣枯竭", "宗門遺跡", "生存基地"],
    coreRule: "世界靈氣已經枯竭，修煉會消耗不可再生的生命力。",
    mainObjective: "在靈氣完全歸零前找到世界火種。",
    clearCondition: "取得世界火種，並決定救基地、救自己，或救下一世。",
    timeLimit: 50,
    specialTerms: ["世界火種", "末法基地", "壽元水票", "枯竭靈泉", "飛升者警告"],
    possibleThemes: ["長生代價", "世界其實已經死了", "飛升者留下的不是傳承"],
    narrativeConstraints: ["每次獲得力量都應有生存代價。"],
    deathRisks: ["壽元耗盡", "基地背叛", "異獸吞丹", "靈氣歸零"],
    legacyRelics: ["relic_world_tinder_ash"],
    cultivationMultiplier: 0.82,
    eventRiskMultiplier: 1.45,
    breakthroughRateModifier: -0.08,
  }),
  createWorld({
    worldId: "world_seventh_day_loop",
    name: "第七日輪迴",
    type: "time_loop",
    era: "mixed",
    difficulty: "medium",
    tone: ["時間循環", "死亡回溯", "因果債務"],
    coreRule: "每七日世界重置一次，但死亡記憶會殘留在神魂上。",
    mainObjective: "在第七日到來前打破時間封鎖。",
    clearCondition: "找到重置源頭，讓第八日真正到來。",
    timeLimit: 7,
    lifespanLimit: 120,
    specialTerms: ["第七日", "回溯傷痕", "牆上警告", "第八日", "因果債務"],
    possibleThemes: ["某個 NPC 記得所有輪迴", "你發現自己曾殺死現在的自己", "前世警告"],
    narrativeConstraints: ["重複場景每次都要露出不同真相。"],
    deathRisks: ["記憶過載", "時間提前崩壞", "回溯失敗", "因果債務清算"],
    legacyRelics: ["relic_seventh_day_mark"],
    cultivationMultiplier: 1.1,
    eventRiskMultiplier: 1.25,
  }),
  createWorld({
    worldId: "world_dream_ruins",
    name: "夢墟",
    type: "dream_realm",
    era: "unknown",
    difficulty: "medium",
    tone: ["夢境", "意識", "虛實顛倒", "心魔"],
    coreRule: "夢中死亡不會立刻死，但會失去一段記憶。修為越高，越難分清夢與現實。",
    mainObjective: "醒來，或者成為夢境的主人。",
    clearCondition: "辨認真正的醒來之門，或奪取夢墟主權。",
    timeLimit: 88,
    specialTerms: ["夢墟", "童年記憶", "假師父", "醒來之門", "夢中飛升"],
    possibleThemes: ["我是自己的心魔", "一座宗門只存在於夢裡", "夢見自己已經飛升"],
    narrativeConstraints: ["夢境可以跳躍，但每段都要留下可追蹤的情緒線。"],
    deathRisks: ["記憶剝落", "心魔奪形", "夢醒即死", "現實遺忘"],
    legacyRelics: ["relic_dream_scar"],
    cultivationMultiplier: 1.15,
    eventRiskMultiplier: 1.18,
  }),
];

export function getWorldById(worldId: string): World {
  const world = worlds.find((item) => item.worldId === worldId);

  if (!world) {
    throw new Error(`World not found: ${worldId}`);
  }

  return world;
}
