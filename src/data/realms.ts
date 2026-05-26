import type { Realm } from "../types";

export const realms: Realm[] = [
  {
    id: "mortal",
    name: "凡人",
    stageName: "凡胎肉身",
    order: 0,
    cultivationRequired: 0,
    baseBreakthroughRate: 0.95,
    attributeBonus: {},
    lifespanBonus: 0,
    unlocks: ["基礎修煉"],
  },
  {
    id: "qi_early",
    name: "練氣",
    stageName: "初期",
    order: 1,
    cultivationRequired: 80,
    baseBreakthroughRate: 0.86,
    attributeBonus: {
      maxHp: 18,
      attack: 3,
      defense: 2,
      divineSense: 2,
    },
    lifespanBonus: 10,
    unlocks: ["歷練事件"],
  },
  {
    id: "qi_middle",
    name: "練氣",
    stageName: "中期",
    order: 2,
    cultivationRequired: 220,
    baseBreakthroughRate: 0.76,
    attributeBonus: {
      maxHp: 22,
      attack: 4,
      defense: 3,
      divineSense: 3,
    },
    lifespanBonus: 10,
    unlocks: ["宗門事件"],
  },
  {
    id: "qi_late",
    name: "練氣",
    stageName: "後期",
    order: 3,
    cultivationRequired: 480,
    baseBreakthroughRate: 0.66,
    attributeBonus: {
      maxHp: 28,
      attack: 5,
      defense: 4,
      divineSense: 4,
    },
    lifespanBonus: 12,
    unlocks: ["高風險歷練"],
  },
  {
    id: "qi_perfect",
    name: "練氣",
    stageName: "圓滿",
    order: 4,
    cultivationRequired: 850,
    baseBreakthroughRate: 0.55,
    attributeBonus: {
      maxHp: 36,
      attack: 7,
      defense: 5,
      divineSense: 6,
    },
    lifespanBonus: 15,
    unlocks: ["築基準備"],
  },
  {
    id: "foundation_early",
    name: "築基",
    stageName: "初期",
    order: 5,
    cultivationRequired: 1400,
    baseBreakthroughRate: 0.42,
    attributeBonus: {
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
  return realms.find((realm) => realm.order === current.order + 1);
}

export function getHigherRealmId(a: string, b: string): string {
  return getRealmById(a).order >= getRealmById(b).order ? a : b;
}
