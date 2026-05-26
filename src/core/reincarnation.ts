import { getRealmById, getHigherRealmId } from "../data/realms";
import { reincarnationShopItems } from "../data/reincarnationShop";
import {
  calculateShopItemCost,
  createId,
  defaultResources,
  getMetaBonuses,
  mergeModifiers,
  mergeResources,
} from "./balance";
import type {
  Fate,
  Identity,
  LifeState,
  MetaProgress,
  Player,
  ReincarnationEndType,
  ReincarnationResult,
  ReincarnationShopItem,
  World,
} from "../types";

const BASE_ATTRIBUTES = {
  lifespan: 82,
  spiritualRoot: 12,
  hp: 100,
  maxHp: 100,
  divineSense: 8,
  attack: 8,
  defense: 6,
  comprehension: 12,
  luck: 10,
  daoHeart: 10,
};

export function createInitialMeta(): MetaProgress {
  return {
    totalLives: 0,
    reincarnationPoints: 0,
    totalEarnedReincarnationPoints: 0,
    pastLifeMemories: 0,
    unlockedWorldIds: ["qingyun_little_world"],
    unlockedIdentityIds: [
      "village_orphan",
      "outer_disciple",
      "fallen_clan_heir",
    ],
    unlockedFateIds: [
      "deep_fortune",
      "past_wisdom",
      "ordinary_bones",
      "short_lived",
      "natural_dao_body",
    ],
    completedWorldIds: [],
    shopLevels: {},
    bestRealmId: "mortal",
    history: [],
  };
}

export function createPlayerForLife(
  name: string,
  generation: number,
  world: World,
  identity: Identity,
  fate: Fate,
  meta: MetaProgress,
): Player {
  const metaBonuses = getMetaBonuses(meta);
  const modifiers = mergeModifiers(identity.effects, fate.effects);
  const lifespan = Math.min(
    world.worldRules.lifespanLimit,
    BASE_ATTRIBUTES.lifespan +
      (modifiers.lifespan ?? 0) +
      metaBonuses.initialLifespan,
  );
  const maxHp =
    BASE_ATTRIBUTES.maxHp + (modifiers.maxHp ?? 0) + (modifiers.hp ?? 0);
  const resources = mergeResources(
    mergeResources(
      {
        ...defaultResources(),
        spiritStones: 10,
      },
      identity.initialResources,
    ),
    fate.id === "past_wisdom"
      ? {
          pastLifeMemory: 1,
        }
      : undefined,
  );

  return {
    id: createId("player"),
    name: name.trim() || `第${generation}世修士`,
    generation,
    currentWorldId: world.id,
    identityId: identity.id,
    fateId: fate.id,
    realmId: "mortal",
    cultivation: 0,
    age: identity.initialAge,
    lifespan,
    spiritualRoot:
      BASE_ATTRIBUTES.spiritualRoot + (modifiers.spiritualRoot ?? 0),
    hp: maxHp,
    maxHp,
    divineSense: BASE_ATTRIBUTES.divineSense + (modifiers.divineSense ?? 0),
    attack: BASE_ATTRIBUTES.attack + (modifiers.attack ?? 0),
    defense: BASE_ATTRIBUTES.defense + (modifiers.defense ?? 0),
    comprehension:
      BASE_ATTRIBUTES.comprehension +
      (modifiers.comprehension ?? 0) +
      metaBonuses.initialComprehension,
    luck: BASE_ATTRIBUTES.luck + (modifiers.luck ?? 0) + metaBonuses.initialLuck,
    daoHeart: BASE_ATTRIBUTES.daoHeart + (modifiers.daoHeart ?? 0),
    karma: resources.karma,
    destiny: resources.destiny,
    status: ["normal"],
    resources,
    completedEventIds: [],
    importantEventIds: [],
    unlockedWorldIds: meta.unlockedWorldIds,
    unlockedIdentityIds: meta.unlockedIdentityIds,
    unlockedFateIds: meta.unlockedFateIds,
    highestRealmId: "mortal",
  };
}

export function createLifeState(
  generation: number,
  world: World,
  identity: Identity,
  fate: Fate,
): LifeState {
  return {
    generation,
    worldId: world.id,
    identityId: identity.id,
    fateId: fate.id,
    startedAt: new Date().toISOString(),
    isAlive: true,
    objectiveCompleted: false,
    yearsSurvived: identity.initialAge,
    highestRealmId: "mortal",
    completedEventIds: [],
    importantEventIds: [],
    rareEventsCompleted: 0,
    enemiesDefeated: 0,
  };
}

function getWorldRating(score: number): string {
  if (score >= 150) return "萬古留名";
  if (score >= 125) return "半步飛升";
  if (score >= 105) return "名震一界";
  if (score >= 84) return "逆天改命";
  if (score >= 66) return "一方強者";
  if (score >= 48) return "小有所成";
  if (score >= 28) return "初窺仙途";
  return "凡塵過客";
}

export function calculateReincarnationResult(
  player: Player,
  life: LifeState,
  world: World,
  deathReason: string,
  endType: ReincarnationEndType,
): ReincarnationResult {
  const highestRealm = getRealmById(player.highestRealmId);
  const yearsScore = Math.min(24, Math.max(0, player.age - 12) * 0.35);
  const score = Math.round(
    highestRealm.order * 18 +
      yearsScore +
      (life.objectiveCompleted ? 48 : 0) +
      life.importantEventIds.length * 5 +
      life.rareEventsCompleted * 8 +
      Math.min(player.resources.destiny * 2, 14) -
      Math.min(player.resources.karma, 10),
  );
  const earnedReincarnationPoints = Math.max(
    3,
    Math.floor(score / 8) + (life.objectiveCompleted ? 8 : 0),
  );

  return {
    id: createId("result"),
    generation: player.generation,
    identityId: player.identityId,
    fateId: player.fateId,
    worldId: world.id,
    yearsSurvived: Math.max(0, player.age - life.yearsSurvived + life.yearsSurvived),
    highestRealmId: player.highestRealmId,
    objectiveCompleted: life.objectiveCompleted,
    importantEventIds: life.importantEventIds,
    deathReason,
    endType,
    worldRating: getWorldRating(score),
    score,
    earnedReincarnationPoints,
    unlockedContent: life.objectiveCompleted
      ? ["青雲小界通關記憶", "築基感悟"]
      : [],
    retainedBonuses: ["輪迴點", "前世記憶", "已解鎖選項", "輪迴商店等級"],
    createdAt: new Date().toISOString(),
  };
}

export function applyReincarnationResult(
  meta: MetaProgress,
  result: ReincarnationResult,
): MetaProgress {
  return {
    ...meta,
    reincarnationPoints:
      meta.reincarnationPoints + result.earnedReincarnationPoints,
    totalEarnedReincarnationPoints:
      meta.totalEarnedReincarnationPoints + result.earnedReincarnationPoints,
    pastLifeMemories:
      meta.pastLifeMemories + 1 + (result.objectiveCompleted ? 1 : 0),
    completedWorldIds: result.objectiveCompleted
      ? Array.from(new Set([...meta.completedWorldIds, result.worldId]))
      : meta.completedWorldIds,
    bestRealmId: getHigherRealmId(meta.bestRealmId, result.highestRealmId),
    history: [result, ...meta.history].slice(0, 20),
  };
}

export interface ShopPurchaseResult {
  meta: MetaProgress;
  success: boolean;
  message: string;
}

export function purchaseShopItem(
  meta: MetaProgress,
  item: ReincarnationShopItem,
): ShopPurchaseResult {
  const currentLevel = meta.shopLevels[item.id] ?? 0;

  if (currentLevel >= item.maxLevel) {
    return {
      meta,
      success: false,
      message: "此項目已達等級上限。",
    };
  }

  const cost = calculateShopItemCost(item, currentLevel);

  if (meta.reincarnationPoints < cost) {
    return {
      meta,
      success: false,
      message: "輪迴點不足。",
    };
  }

  return {
    meta: {
      ...meta,
      reincarnationPoints: meta.reincarnationPoints - cost,
      shopLevels: {
        ...meta.shopLevels,
        [item.id]: currentLevel + 1,
      },
    },
    success: true,
    message: `${item.name}提升至 ${currentLevel + 1} 級。`,
  };
}

export function getShopItemEffectText(item: ReincarnationShopItem): string {
  if (item.effectKey === "cultivationEfficiency" || item.effectKey === "breakthroughRate") {
    return `每級 +${Math.round(item.effectPerLevel * 100)}%`;
  }

  return `每級 +${item.effectPerLevel}`;
}

export function getAllShopItems(): ReincarnationShopItem[] {
  return reincarnationShopItems;
}
