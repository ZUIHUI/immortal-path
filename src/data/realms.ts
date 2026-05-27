import type { AttributeMap, Realm } from "../types";

type StageKey = "early" | "middle" | "late" | "perfect";

interface RealmTrackConfig {
  baseId: string;
  name: string;
  startOrder: number;
  requiredCultivation: [number, number, number, number];
  baseBreakthroughRate: [number, number, number, number];
  lifespanBonus: [number, number, number, number];
  statBonus: Array<Partial<AttributeMap>>;
  unlocks: [string, string, string, string];
  nextBaseId?: string;
}

const stages: Array<{ key: StageKey; label: string }> = [
  { key: "early", label: "初期" },
  { key: "middle", label: "中期" },
  { key: "late", label: "後期" },
  { key: "perfect", label: "圓滿" },
];

const realmTracks: RealmTrackConfig[] = [
  {
    baseId: "qi_refining",
    name: "練氣",
    startOrder: 1,
    requiredCultivation: [45, 140, 300, 560],
    baseBreakthroughRate: [0.9, 0.82, 0.74, 0.64],
    lifespanBonus: [10, 10, 12, 15],
    statBonus: [
      { maxHp: 18, attack: 3, defense: 2, divineSense: 2 },
      { maxHp: 22, attack: 4, defense: 3, divineSense: 3 },
      { maxHp: 28, attack: 5, defense: 4, divineSense: 4 },
      { maxHp: 36, attack: 7, defense: 5, divineSense: 6 },
    ],
    unlocks: ["歷練事件", "宗門事件", "高風險歷練", "築基準備"],
    nextBaseId: "foundation",
  },
  {
    baseId: "foundation",
    name: "築基",
    startOrder: 5,
    requiredCultivation: [900, 1450, 2300, 3600],
    baseBreakthroughRate: [0.5, 0.46, 0.4, 0.34],
    lifespanBonus: [45, 35, 35, 40],
    statBonus: [
      { maxHp: 60, attack: 12, defense: 9, divineSense: 12, daoHeart: 3 },
      { maxHp: 72, attack: 15, defense: 12, divineSense: 14, daoHeart: 3 },
      { maxHp: 86, attack: 18, defense: 15, divineSense: 18, daoHeart: 4 },
      { maxHp: 108, attack: 24, defense: 20, divineSense: 24, daoHeart: 5 },
    ],
    unlocks: ["完成青雲小界目標", "築基靈台更穩", "道基漸趨圓滿", "觸及金丹門檻"],
    nextBaseId: "core_formation",
  },
  {
    baseId: "core_formation",
    name: "金丹",
    startOrder: 9,
    requiredCultivation: [5600, 8200, 11800, 16800],
    baseBreakthroughRate: [0.28, 0.25, 0.22, 0.19],
    lifespanBonus: [80, 55, 55, 65],
    statBonus: [
      { maxHp: 150, attack: 36, defense: 30, divineSense: 36, daoHeart: 8 },
      { maxHp: 180, attack: 44, defense: 36, divineSense: 44, daoHeart: 8 },
      { maxHp: 215, attack: 54, defense: 44, divineSense: 56, daoHeart: 10 },
      { maxHp: 260, attack: 68, defense: 56, divineSense: 72, daoHeart: 12 },
    ],
    unlocks: ["一粒金丹吞入腹", "金丹映照山河", "丹火淬煉法器", "元嬰胎息初現"],
    nextBaseId: "nascent_soul",
  },
  {
    baseId: "nascent_soul",
    name: "元嬰",
    startOrder: 13,
    requiredCultivation: [24000, 33500, 47000, 65000],
    baseBreakthroughRate: [0.17, 0.155, 0.14, 0.125],
    lifespanBonus: [120, 85, 85, 100],
    statBonus: [
      { maxHp: 340, attack: 86, defense: 72, divineSense: 108, daoHeart: 14 },
      { maxHp: 410, attack: 108, defense: 90, divineSense: 136, daoHeart: 16 },
      { maxHp: 500, attack: 134, defense: 112, divineSense: 170, daoHeart: 18 },
      { maxHp: 620, attack: 168, defense: 140, divineSense: 215, daoHeart: 22 },
    ],
    unlocks: ["元嬰出竅", "神魂夜遊", "嬰火護道", "化神門前聽雷"],
    nextBaseId: "spirit_transformation",
  },
  {
    baseId: "spirit_transformation",
    name: "化神",
    startOrder: 17,
    requiredCultivation: [90000, 124000, 170000, 230000],
    baseBreakthroughRate: [0.115, 0.105, 0.095, 0.085],
    lifespanBonus: [180, 130, 130, 160],
    statBonus: [
      { maxHp: 780, attack: 210, defense: 178, divineSense: 285, daoHeart: 28 },
      { maxHp: 960, attack: 265, defense: 225, divineSense: 360, daoHeart: 32 },
      { maxHp: 1180, attack: 332, defense: 285, divineSense: 455, daoHeart: 38 },
      { maxHp: 1460, attack: 420, defense: 360, divineSense: 580, daoHeart: 46 },
    ],
    unlocks: ["一念化神", "神識覆山河", "道域雛形", "煉虛觀界"],
    nextBaseId: "void_refinement",
  },
  {
    baseId: "void_refinement",
    name: "煉虛",
    startOrder: 21,
    requiredCultivation: [310000, 420000, 560000, 740000],
    baseBreakthroughRate: [0.08, 0.075, 0.07, 0.065],
    lifespanBonus: [260, 190, 190, 230],
    statBonus: [
      { maxHp: 1880, attack: 540, defense: 465, divineSense: 760, daoHeart: 58 },
      { maxHp: 2380, attack: 690, defense: 600, divineSense: 990, daoHeart: 70 },
      { maxHp: 3000, attack: 880, defense: 770, divineSense: 1280, daoHeart: 84 },
      { maxHp: 3800, attack: 1120, defense: 980, divineSense: 1660, daoHeart: 102 },
    ],
    unlocks: ["煉虛成界", "虛空行走", "借界養魂", "合體歸一"],
    nextBaseId: "integration",
  },
  {
    baseId: "integration",
    name: "合體",
    startOrder: 25,
    requiredCultivation: [980000, 1290000, 1680000, 2180000],
    baseBreakthroughRate: [0.06, 0.056, 0.052, 0.05],
    lifespanBonus: [360, 260, 260, 320],
    statBonus: [
      { maxHp: 4800, attack: 1450, defense: 1280, divineSense: 2100, daoHeart: 126 },
      { maxHp: 6100, attack: 1850, defense: 1640, divineSense: 2680, daoHeart: 152 },
      { maxHp: 7800, attack: 2380, defense: 2120, divineSense: 3450, daoHeart: 184 },
      { maxHp: 10000, attack: 3050, defense: 2740, divineSense: 4450, daoHeart: 224 },
    ],
    unlocks: ["人道合一", "法相鎮界", "萬法入身", "大乘道基"],
    nextBaseId: "mahayana",
  },
  {
    baseId: "mahayana",
    name: "大乘",
    startOrder: 29,
    requiredCultivation: [2820000, 3650000, 4700000, 6000000],
    baseBreakthroughRate: [0.048, 0.046, 0.044, 0.042],
    lifespanBonus: [520, 380, 380, 460],
    statBonus: [
      { maxHp: 12800, attack: 3950, defense: 3560, divineSense: 5800, daoHeart: 270 },
      { maxHp: 16400, attack: 5100, defense: 4620, divineSense: 7500, daoHeart: 326 },
      { maxHp: 21000, attack: 6600, defense: 6000, divineSense: 9700, daoHeart: 394 },
      { maxHp: 27000, attack: 8550, defense: 7800, divineSense: 12600, daoHeart: 478 },
    ],
    unlocks: ["大乘立道", "道音渡眾生", "一念開天門", "渡劫雷海"],
    nextBaseId: "tribulation",
  },
  {
    baseId: "tribulation",
    name: "渡劫",
    startOrder: 33,
    requiredCultivation: [7600000, 9600000, 12100000, 15000000],
    baseBreakthroughRate: [0.04, 0.038, 0.036, 0.034],
    lifespanBonus: [720, 520, 520, 640],
    statBonus: [
      { maxHp: 35000, attack: 11100, defense: 10200, divineSense: 16400, daoHeart: 580 },
      { maxHp: 45500, attack: 14400, defense: 13300, divineSense: 21400, daoHeart: 700 },
      { maxHp: 59000, attack: 18700, defense: 17400, divineSense: 28000, daoHeart: 850 },
      { maxHp: 76000, attack: 24200, defense: 22600, divineSense: 36500, daoHeart: 1040 },
    ],
    unlocks: ["九重雷劫", "雷海煉魂", "天門開隙", "飛升仙路"],
    nextBaseId: "true_immortal",
  },
  {
    baseId: "true_immortal",
    name: "真仙",
    startOrder: 37,
    requiredCultivation: [19000000, 24000000, 30000000, 38000000],
    baseBreakthroughRate: [0.032, 0.03, 0.028, 0.026],
    lifespanBonus: [1200, 900, 900, 1200],
    statBonus: [
      { maxHp: 100000, attack: 32000, defense: 30000, divineSense: 50000, daoHeart: 1300 },
      { maxHp: 132000, attack: 42000, defense: 39800, divineSense: 66000, daoHeart: 1600 },
      { maxHp: 174000, attack: 55200, defense: 52600, divineSense: 87000, daoHeart: 1960 },
      { maxHp: 230000, attack: 73000, defense: 70000, divineSense: 116000, daoHeart: 2400 },
    ],
    unlocks: ["飛升成仙", "仙元洗身", "真仙道果", "此界仙途圓滿"],
  },
];

function realmId(baseId: string, stage: StageKey): string {
  return `realm_${baseId}_${stage}`;
}

function createRealmTrack(config: RealmTrackConfig): Realm[] {
  return stages.map((stage, index) => ({
    id: realmId(config.baseId, stage.key),
    name: config.name,
    stageName: stage.label,
    order: config.startOrder + index,
    requiredCultivation: config.requiredCultivation[index],
    baseBreakthroughRate: config.baseBreakthroughRate[index],
    statBonus: config.statBonus[index],
    lifespanBonus: config.lifespanBonus[index],
    nextRealmId:
      index < stages.length - 1
        ? realmId(config.baseId, stages[index + 1].key)
        : config.nextBaseId
          ? realmId(config.nextBaseId, "early")
          : undefined,
    unlocks: [config.unlocks[index]],
  }));
}

export const realms: Realm[] = [
  {
    id: "realm_mortal",
    name: "凡人",
    stageName: "凡胎肉身",
    order: 0,
    requiredCultivation: 0,
    baseBreakthroughRate: 0.95,
    statBonus: {},
    lifespanBonus: 0,
    nextRealmId: "realm_qi_refining_early",
    unlocks: ["基礎修煉"],
  },
  ...realmTracks.flatMap(createRealmTrack),
];

export function getRealmById(realmId: string): Realm {
  const realm = realms.find((item) => item.id === realmId);

  if (!realm) {
    throw new Error(`Realm not found: ${realmId}`);
  }

  return realm;
}

export function getNextRealm(realmId: string): Realm | undefined {
  const current = getRealmById(realmId);
  return current.nextRealmId ? getRealmById(current.nextRealmId) : undefined;
}

export function getHigherRealmId(a: string, b: string): string {
  return getRealmById(a).order >= getRealmById(b).order ? a : b;
}
