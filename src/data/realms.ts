import type { Realm } from "../types";

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
  {
    id: "realm_qi_refining_early",
    name: "練氣",
    stageName: "初期",
    order: 1,
    requiredCultivation: 45,
    baseBreakthroughRate: 0.9,
    statBonus: {
      maxHp: 18,
      attack: 3,
      defense: 2,
      divineSense: 2,
    },
    lifespanBonus: 10,
    nextRealmId: "realm_qi_refining_middle",
    unlocks: ["歷練事件"],
  },
  {
    id: "realm_qi_refining_middle",
    name: "練氣",
    stageName: "中期",
    order: 2,
    requiredCultivation: 140,
    baseBreakthroughRate: 0.82,
    statBonus: {
      maxHp: 22,
      attack: 4,
      defense: 3,
      divineSense: 3,
    },
    lifespanBonus: 10,
    nextRealmId: "realm_qi_refining_late",
    unlocks: ["宗門事件"],
  },
  {
    id: "realm_qi_refining_late",
    name: "練氣",
    stageName: "後期",
    order: 3,
    requiredCultivation: 300,
    baseBreakthroughRate: 0.74,
    statBonus: {
      maxHp: 28,
      attack: 5,
      defense: 4,
      divineSense: 4,
    },
    lifespanBonus: 12,
    nextRealmId: "realm_qi_refining_perfect",
    unlocks: ["高風險歷練"],
  },
  {
    id: "realm_qi_refining_perfect",
    name: "練氣",
    stageName: "圓滿",
    order: 4,
    requiredCultivation: 560,
    baseBreakthroughRate: 0.64,
    statBonus: {
      maxHp: 36,
      attack: 7,
      defense: 5,
      divineSense: 6,
    },
    lifespanBonus: 15,
    nextRealmId: "realm_foundation_early",
    unlocks: ["築基準備"],
  },
  {
    id: "realm_foundation_early",
    name: "築基",
    stageName: "初期",
    order: 5,
    requiredCultivation: 900,
    baseBreakthroughRate: 0.5,
    statBonus: {
      maxHp: 60,
      attack: 12,
      defense: 9,
      divineSense: 12,
      daoHeart: 3,
    },
    lifespanBonus: 45,
    nextRealmId: "realm_foundation_middle",
    unlocks: ["完成青雲小界目標", "繼續衝擊更高境界"],
  },
  {
    id: "realm_foundation_middle",
    name: "築基",
    stageName: "中期",
    order: 6,
    requiredCultivation: 1450,
    baseBreakthroughRate: 0.46,
    statBonus: {
      maxHp: 72,
      attack: 15,
      defense: 12,
      divineSense: 14,
      daoHeart: 3,
    },
    lifespanBonus: 35,
    nextRealmId: "realm_foundation_late",
    unlocks: ["築基靈台更穩"],
  },
  {
    id: "realm_foundation_late",
    name: "築基",
    stageName: "後期",
    order: 7,
    requiredCultivation: 2300,
    baseBreakthroughRate: 0.4,
    statBonus: {
      maxHp: 86,
      attack: 18,
      defense: 15,
      divineSense: 18,
      daoHeart: 4,
    },
    lifespanBonus: 35,
    nextRealmId: "realm_foundation_perfect",
    unlocks: ["道基漸趨圓滿"],
  },
  {
    id: "realm_foundation_perfect",
    name: "築基",
    stageName: "圓滿",
    order: 8,
    requiredCultivation: 3600,
    baseBreakthroughRate: 0.34,
    statBonus: {
      maxHp: 108,
      attack: 24,
      defense: 20,
      divineSense: 24,
      daoHeart: 5,
    },
    lifespanBonus: 40,
    nextRealmId: "realm_core_formation_early",
    unlocks: ["觸及金丹門檻"],
  },
  {
    id: "realm_core_formation_early",
    name: "金丹",
    stageName: "初期",
    order: 9,
    requiredCultivation: 5600,
    baseBreakthroughRate: 0.28,
    statBonus: {
      maxHp: 150,
      attack: 36,
      defense: 30,
      divineSense: 36,
      daoHeart: 8,
    },
    lifespanBonus: 80,
    unlocks: ["一粒金丹吞入腹"],
  },
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
