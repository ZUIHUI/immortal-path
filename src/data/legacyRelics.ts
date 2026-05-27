import type { LegacyRelic } from "../types";

export const legacyRelics: LegacyRelic[] = [
  {
    relicId: "relic_broken_jade_talisman",
    name: "殘破玉符",
    description: "青雲山脈深處留下的前世玉符，靠近未了因果時會微微發燙。",
    sourceWorldId: "world_qingyun",
    rarity: "rare",
    effects: [
      {
        type: "rareEventWeight",
        target: "pastLifeMemory",
        value: 1,
        description: "提高前世記憶與因果追索類劇情權重。",
      },
    ],
    narrativeHooks: ["玉符在接近前世因果時發燙", "玉符偶爾浮現未乾的墨字"],
  },
  {
    relicId: "relic_half_step_shadow",
    name: "半步仙影",
    description: "一截比主人更早踏上仙路的影子，月光下會自行吐納。",
    sourceWorldId: "world_shadowless_city",
    rarity: "epic",
    effects: [
      {
        type: "breakthroughHook",
        target: "shadow_breakthrough",
        value: 1,
        description: "突破時可能出現借影成道選項。",
      },
    ],
    narrativeHooks: ["影子偶爾先你一步行動", "危急時影子會替你擋下一劫"],
  },
  {
    relicId: "relic_heaven_error_code",
    name: "天道錯誤碼",
    description: "一串烙在神魂邊緣的錯誤碼，某些機械天道會把你識別為異常資料。",
    sourceWorldId: "world_cyber_immortal_city",
    rarity: "legendary",
    effects: [
      {
        type: "narrativeHook",
        target: "ai_heaven_anomaly",
        value: 1,
        description: "未來科技與 AI 天道世界更容易觸發系統異常劇情。",
      },
    ],
    narrativeHooks: ["天道防火牆偶爾把你列為錯誤資料", "金屬神像會對你讀出錯誤碼"],
  },
  {
    relicId: "relic_reiki_station_ticket",
    name: "前世終點站票根",
    description: "一張無法撕碎的末班車票根，背面站名會隨世界改變。",
    sourceWorldId: "world_modern_reiki_city",
    rarity: "rare",
    effects: [
      {
        type: "worldWeight",
        target: "modern_reiki",
        value: 1,
        description: "提高現代異常與交通節點類開局權重。",
      },
    ],
    narrativeHooks: ["票根在靠近不存在的站台時滲出冷光"],
  },
  {
    relicId: "relic_world_tinder_ash",
    name: "世界火種灰",
    description: "末法廢土最後火種留下的灰燼，像一顆尚未決定是否復燃的心。",
    sourceWorldId: "world_dharma_wasteland",
    rarity: "epic",
    effects: [
      {
        type: "deathProtection",
        target: "lifespan",
        value: 1,
        description: "瀕死時可能以火種灰換取一次延遲結算。",
      },
    ],
    narrativeHooks: ["火種灰在絕境中亮起", "乾枯世界會把你誤認成最後生機"],
  },
  {
    relicId: "relic_seventh_day_mark",
    name: "第七日刻痕",
    description: "一道每逢清晨都會變深的刻痕，記得你曾死在第幾次輪迴。",
    sourceWorldId: "world_seventh_day_loop",
    rarity: "epic",
    effects: [
      {
        type: "narrativeHook",
        target: "time_loop_memory",
        value: 1,
        description: "時間循環與前世警告類劇情更容易出現。",
      },
    ],
    narrativeHooks: ["牆上的字跡會認出你的刻痕", "某些 NPC 會因此記得你"],
  },
  {
    relicId: "relic_dream_scar",
    name: "夢痕",
    description: "夢中受傷後留在現實神魂上的疤，能證明某些夢從未結束。",
    sourceWorldId: "world_dream_ruins",
    rarity: "rare",
    effects: [
      {
        type: "narrativeHook",
        target: "dream_realm",
        value: 1,
        description: "夢境與心魔選項更容易保留前世資訊。",
      },
    ],
    narrativeHooks: ["醒來後夢痕仍在滲光", "假師父會避開你的夢痕"],
  },
  {
    relicId: "relic_stellar_inheritance_core",
    name: "星艦傳承核心",
    description: "宗門星艦墜毀前彈出的核心，內部封存一段元神導航圖。",
    sourceWorldId: "world_stellar_immortal_dynasty",
    rarity: "legendary",
    effects: [
      {
        type: "initialAttribute",
        target: "divineSense",
        value: 2,
        description: "下一世神識略有提升，星海類劇情更容易識破迷航。",
      },
    ],
    narrativeHooks: ["星圖會在夜空中自行校準", "古老星艦殘骸會回應你的神識"],
  },
];

export function getLegacyRelicById(relicId: string | undefined): LegacyRelic | undefined {
  return legacyRelics.find((relic) => relic.relicId === relicId);
}

export function getRelicsForWorld(worldId: string): LegacyRelic[] {
  return legacyRelics.filter((relic) => relic.sourceWorldId === worldId);
}
