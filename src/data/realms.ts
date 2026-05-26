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
    unlocks: ["完成青雲小界目標"],
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
