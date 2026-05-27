import { getHigherRealmId, getRealmById } from "../data/realms";
import { reincarnationShopItems } from "../data/reincarnationShop";
import { getWorldLegacyForOutcome } from "../data/worldLegacies";
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
  ReincarnationRewardBreakdown,
  ReincarnationShopItem,
  World,
} from "../types";

const BASE_ATTRIBUTES = {
  lifespan: 88,
  spiritualRoot: 14,
  hp: 120,
  maxHp: 120,
  divineSense: 10,
  attack: 10,
  defense: 8,
  comprehension: 14,
  luck: 12,
  daoHeart: 12,
};

export function createInitialMeta(): MetaProgress {
  return {
    totalLives: 0,
    reincarnationPoints: 0,
    totalEarnedReincarnationPoints: 0,
    pastLifeMemories: 0,
    unlockedWorldIds: ["world_qingyun"],
    unlockedIdentityIds: [
      "identity_orphan",
      "identity_outer_disciple",
      "identity_fallen_clan",
    ],
    unlockedFateIds: [
      "fate_deep_fortune",
      "fate_past_wisdom",
      "fate_ordinary_bones",
      "fate_short_lived",
      "fate_natural_dao_body",
    ],
    completedWorldIds: [],
    worldLegacyIds: [],
    shopLevels: {},
    bestRealmId: "realm_mortal",
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
  const modifiers = mergeModifiers(identity.statModifiers, fate.effects);
  const lifespan = Math.min(
    world.worldRules.lifespanLimit + metaBonuses.initialLifespan,
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
        spiritStones: 18,
        pills: 1,
      },
      identity.initialResources,
    ),
    fate.id === "fate_past_wisdom"
      ? {
          pastLifeMemory: 1,
          destiny: 1,
        }
      : undefined,
  );
  const hasDeathCoin = meta.worldLegacyIds?.includes("legacy_qingyun_death_coin");
  const hasFoundationSeed = meta.worldLegacyIds?.includes("legacy_qingyun_foundation_seed");
  const hasCoreFlame = meta.worldLegacyIds?.includes("legacy_qingyun_core_flame");
  const legacyMaxHpBonus = hasDeathCoin ? 12 : 0;
  const legacyDaoHeartBonus = hasFoundationSeed ? 2 : 0;
  const legacyComprehensionBonus = hasFoundationSeed ? 2 : 0;
  const legacyDestinyBonus = hasCoreFlame ? 2 : 0;
  const legacyMemoryBonus = hasDeathCoin ? 1 : 0;
  const resourcesWithLegacies = mergeResources(resources, {
    destiny: legacyDestinyBonus,
    pastLifeMemory: legacyMemoryBonus,
  });

  return {
    id: createId("player"),
    name: name.trim() || `第${generation}世修士`,
    generation,
    currentWorldId: world.worldId,
    identityId: identity.id,
    fateId: fate.id,
    realmId: "realm_mortal",
    cultivation: 0,
    age: identity.initialAge,
    lifespan,
    spiritualRoot:
      BASE_ATTRIBUTES.spiritualRoot + (modifiers.spiritualRoot ?? 0),
    hp: maxHp + legacyMaxHpBonus,
    maxHp: maxHp + legacyMaxHpBonus,
    divineSense: BASE_ATTRIBUTES.divineSense + (modifiers.divineSense ?? 0),
    attack: BASE_ATTRIBUTES.attack + (modifiers.attack ?? 0),
    defense: BASE_ATTRIBUTES.defense + (modifiers.defense ?? 0),
    comprehension:
      BASE_ATTRIBUTES.comprehension +
      (modifiers.comprehension ?? 0) +
      metaBonuses.initialComprehension +
      legacyComprehensionBonus,
    luck: BASE_ATTRIBUTES.luck + (modifiers.luck ?? 0) + metaBonuses.initialLuck,
    daoHeart:
      BASE_ATTRIBUTES.daoHeart + (modifiers.daoHeart ?? 0) + legacyDaoHeartBonus,
    karma: resourcesWithLegacies.karma,
    destiny: resourcesWithLegacies.destiny,
    status: ["normal"],
    resources: resourcesWithLegacies,
    completedEventIds: [],
    importantEventIds: [],
    unlockedWorldIds: meta.unlockedWorldIds,
    unlockedIdentityIds: meta.unlockedIdentityIds,
    unlockedFateIds: meta.unlockedFateIds,
    highestRealmId: "realm_mortal",
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
    worldId: world.worldId,
    identityId: identity.id,
    fateId: fate.id,
    startedAt: new Date().toISOString(),
    startingAge: identity.initialAge,
    isAlive: true,
    objectiveCompleted: false,
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
    reincarnationPointMultiplier: 1,
    enemiesDefeated: 0,
  };
}

export function calculateWorldEvaluation(score: number): string {
  if (score >= 220) return "萬古留名";
  if (score >= 180) return "半步飛升";
  if (score >= 145) return "名震一界";
  if (score >= 112) return "逆天改命";
  if (score >= 82) return "一方強者";
  if (score >= 52) return "小有所成";
  if (score >= 26) return "初窺仙途";
  return "凡塵過客";
}

export function calculateLifeTitle(life: LifeState, score: number): string {
  if (life.mythicEventsCompleted > 0) return "天命異數";
  if (life.defyingBreakthroughCount > 0) return "逆天破關者";
  if (life.objectiveCompleted) return "青雲築基者";
  if (life.enlightenmentCount > 0) return "頓悟修士";
  if (score >= 52) return "小界英才";
  return "輪迴初醒";
}

export function calculateRewardBreakdown(
  player: Player,
  life: LifeState,
): ReincarnationRewardBreakdown {
  const highestRealm = getRealmById(player.highestRealmId);
  const realmReward = highestRealm.order * 8 + 8;
  const survivalReward = Math.min(18, Math.floor(life.yearsSurvived * 0.8));
  const eventReward =
    life.rareEventsCompleted * 3 +
    life.epicEventsCompleted * 5 +
    life.legendaryEventsCompleted * 12 +
    life.mythicEventsCompleted * 24;
  const breakthroughReward =
    highestRealm.order * 4 + life.defyingBreakthroughCount * 18;
  const objectiveReward = life.objectiveCompleted ? 28 : 0;
  const deathModifier = player.status.includes("dead") ? 4 : 0;
  const achievementBonus =
    life.enlightenmentCount * 4 +
    Math.floor(life.maxSingleCultivationGain / 120) +
    Math.min(player.resources.destiny * 2, 18);
  const multiplier = Math.max(1, life.reincarnationPointMultiplier);

  return {
    realmReward,
    survivalReward,
    eventReward,
    breakthroughReward,
    objectiveReward,
    deathModifier,
    achievementBonus,
    multiplier,
  };
}

export function calculateReincarnationPoints(
  breakdownOrScore: ReincarnationRewardBreakdown | number,
  objectiveCompleted = false,
): number {
  if (typeof breakdownOrScore === "number") {
    return Math.max(12, Math.floor(breakdownOrScore / 5) + (objectiveCompleted ? 28 : 0));
  }

  const base =
    breakdownOrScore.realmReward +
    breakdownOrScore.survivalReward +
    breakdownOrScore.eventReward +
    breakdownOrScore.breakthroughReward +
    breakdownOrScore.objectiveReward +
    breakdownOrScore.deathModifier +
    breakdownOrScore.achievementBonus;

  return Math.max(12, Math.ceil(base * breakdownOrScore.multiplier));
}

export function createReincarnationResult(
  player: Player,
  life: LifeState,
  world: World,
  deathReason: string,
  endType: ReincarnationEndType,
): ReincarnationResult {
  const highestRealm = getRealmById(player.highestRealmId);
  const breakdown = calculateRewardBreakdown(player, life);
  const earnedReincarnationPoints = calculateReincarnationPoints(breakdown);
  const worldLegacy = getWorldLegacyForOutcome({
    worldId: world.worldId,
    endType,
    objectiveCompleted: life.objectiveCompleted,
    highestRealmId: player.highestRealmId,
  });
  const score = Math.round(
    highestRealm.order * 22 +
      life.yearsSurvived * 0.8 +
      (life.objectiveCompleted ? 50 : 0) +
      breakdown.eventReward +
      breakdown.achievementBonus,
  );

  return {
    id: createId("result"),
    generation: player.generation,
    identityId: player.identityId,
    fateId: player.fateId,
    worldId: world.worldId,
    yearsSurvived: life.yearsSurvived,
    highestRealmId: player.highestRealmId,
    objectiveCompleted: life.objectiveCompleted,
    importantEventIds: life.importantEventIds,
    deathReason,
    endType,
    worldRating: calculateWorldEvaluation(score),
    lifeTitle: calculateLifeTitle(life, score),
    score,
    earnedReincarnationPoints,
    rewardBreakdown: breakdown,
    maxSingleCultivationGain: life.maxSingleCultivationGain,
    rareEventCount: life.rareEventsCompleted,
    enlightenmentCount: life.enlightenmentCount,
    defyingBreakthroughCount: life.defyingBreakthroughCount,
    nextLifeBonusSummary: getNextLifeBonusSummaryFromMeta(
      applyReincarnationResultPreview(player, life, earnedReincarnationPoints),
    ),
    worldLegacyId: worldLegacy?.id,
    unlockedContent: life.objectiveCompleted
      ? ["青雲小界通關記憶", "築基感悟"]
      : [],
    retainedBonuses: [
      "輪迴點",
      "前世記憶",
      "已解鎖選項",
      "輪迴商店等級",
      ...(worldLegacy ? [worldLegacy.name] : []),
    ],
    createdAt: new Date().toISOString(),
  };
}

function applyReincarnationResultPreview(
  player: Player,
  life: LifeState,
  earnedReincarnationPoints: number,
): MetaProgress {
  return {
    ...createInitialMeta(),
    totalLives: player.generation,
    reincarnationPoints: earnedReincarnationPoints,
    totalEarnedReincarnationPoints: earnedReincarnationPoints,
    pastLifeMemories: 1 + (life.objectiveCompleted ? 1 : 0),
  };
}

export const calculateReincarnationResult = createReincarnationResult;

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
    worldLegacyIds: result.worldLegacyId
      ? Array.from(new Set([...(meta.worldLegacyIds ?? []), result.worldLegacyId]))
      : (meta.worldLegacyIds ?? []),
    history: [result, ...meta.history].slice(0, 20),
  };
}

export interface ShopPurchaseResult {
  meta: MetaProgress;
  success: boolean;
  message: string;
}

export function applyShopUpgrade(
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
    message: `${item.name}提升至 ${currentLevel + 1} 級，下一世會明顯更強。`,
  };
}

export const purchaseShopItem = applyShopUpgrade;

export function createNewLife(params: {
  name: string;
  world: World;
  identity: Identity;
  fate: Fate;
  meta: MetaProgress;
}): {
  meta: MetaProgress;
  player: Player;
  life: LifeState;
} {
  const generation = params.meta.totalLives + 1;
  const meta: MetaProgress = {
    ...params.meta,
    totalLives: generation,
  };

  return {
    meta,
    player: createPlayerForLife(
      params.name,
      generation,
      params.world,
      params.identity,
      params.fate,
      meta,
    ),
    life: createLifeState(generation, params.world, params.identity, params.fate),
  };
}

export function getShopItemEffectText(item: ReincarnationShopItem): string {
  if (item.effectKey === "cultivationEfficiency" || item.effectKey === "breakthroughRate") {
    return `每級 +${Math.round(item.effectPerLevel * 100)}%`;
  }

  return `每級 +${item.effectPerLevel}`;
}

export function getNextLifeBonusSummary(meta: MetaProgress): string[] {
  return getNextLifeBonusSummaryFromMeta(meta);
}

function getNextLifeBonusSummaryFromMeta(meta: MetaProgress): string[] {
  const bonuses = getMetaBonuses(meta);

  return [
    `初始悟性 +${bonuses.initialComprehension}`,
    `初始福緣 +${bonuses.initialLuck}`,
    `修煉效率 +${Math.round(bonuses.cultivationEfficiencyBonus * 100)}%`,
    `突破成功率 +${Math.round(bonuses.breakthroughRateBonus * 100)}%`,
    `初始壽元 +${bonuses.initialLifespan}`,
  ];
}

export function getAllShopItems(): ReincarnationShopItem[] {
  return reincarnationShopItems;
}
