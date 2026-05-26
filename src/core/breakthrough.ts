import { getNextRealm, getRealmById, getHigherRealmId } from "../data/realms";
import {
  BALANCE,
  addStatuses,
  applyAttributeDelta,
  applyResourceDelta,
  clamp,
  getMetaBonuses,
  getStatusBreakthroughModifier,
  removeStatuses,
} from "./balance";
import type { Fate, Identity, MetaProgress, Player, World } from "../types";

export interface BreakthroughInput {
  player: Player;
  meta: MetaProgress;
  world: World;
  identity: Identity;
  fate: Fate;
  random?: () => number;
}

export interface BreakthroughOutcome {
  player: Player;
  success: boolean;
  rate: number;
  message: string;
  objectiveCompleted: boolean;
  deathReason?: string;
}

export function canBreakthrough(player: Player): boolean {
  const nextRealm = getNextRealm(player.realmId);
  return Boolean(nextRealm && player.cultivation >= nextRealm.cultivationRequired);
}

export function calculateBreakthroughRate({
  player,
  meta,
  world,
  identity,
  fate,
}: Omit<BreakthroughInput, "random">): number {
  const nextRealm = getNextRealm(player.realmId);

  if (!nextRealm) {
    return 0;
  }

  const hpRatio = player.maxHp > 0 ? player.hp / player.maxHp : 0;
  const metaBonuses = getMetaBonuses(meta);
  const resourcePreparation =
    Math.min(player.resources.pills, 2) * 0.035 +
    Math.min(player.resources.artifacts, 2) * 0.02 +
    Math.min(player.resources.destiny, 5) * 0.006;
  const statBonus =
    player.comprehension * 0.0011 + player.daoHeart * 0.0014 + player.luck * 0.0007;
  const woundedPenalty = hpRatio < 0.55 ? -0.12 : 0;

  const rate =
    nextRealm.baseBreakthroughRate +
    (identity.effects.breakthroughRateBonus ?? 0) +
    (fate.effects.breakthroughRateBonus ?? 0) +
    metaBonuses.breakthroughRateBonus +
    world.worldRules.breakthroughRateModifier +
    resourcePreparation +
    statBonus +
    woundedPenalty +
    getStatusBreakthroughModifier(player.status);

  return clamp(rate, BALANCE.minBreakthroughRate, BALANCE.maxBreakthroughRate);
}

export function attemptBreakthrough(input: BreakthroughInput): BreakthroughOutcome {
  const random = input.random ?? Math.random;
  const nextRealm = getNextRealm(input.player.realmId);

  if (!nextRealm) {
    return {
      player: input.player,
      success: false,
      rate: 0,
      message: "目前已達 MVP 境界上限。",
      objectiveCompleted: false,
    };
  }

  if (input.player.cultivation < nextRealm.cultivationRequired) {
    return {
      player: input.player,
      success: false,
      rate: calculateBreakthroughRate(input),
      message: "修為尚未達到突破門檻。",
      objectiveCompleted: false,
    };
  }

  const rate = calculateBreakthroughRate(input);
  const consumedPill = input.player.resources.pills > 0 ? 1 : 0;
  const playerAfterCost = applyResourceDelta(input.player, {
    pills: -consumedPill,
  });

  if (random() < rate) {
    const afterRealmBonus = applyAttributeDelta(
      {
        ...playerAfterCost,
        realmId: nextRealm.id,
        highestRealmId: getHigherRealmId(playerAfterCost.highestRealmId, nextRealm.id),
        cultivation: Math.max(
          0,
          playerAfterCost.cultivation - nextRealm.cultivationRequired,
        ),
        age: playerAfterCost.age + BALANCE.yearsPerBreakthroughAttempt,
        lifespan: playerAfterCost.lifespan + nextRealm.lifespanBonus,
      },
      nextRealm.attributeBonus,
    );
    const player: Player = {
      ...afterRealmBonus,
      hp: afterRealmBonus.maxHp,
      status: removeStatuses(afterRealmBonus.status, [
        "injured",
        "weak",
        "heart_demon",
      ]),
    };

    return {
      player,
      success: true,
      rate,
      message: `突破成功，踏入${nextRealm.name}${nextRealm.stageName}。`,
      objectiveCompleted: input.world.objectiveRealmId === nextRealm.id,
    };
  }

  const currentRealm = getRealmById(input.player.realmId);
  const severity = random();
  const deathRiskMultiplier =
    (input.identity.effects.deathRiskMultiplier ?? 1) *
    (input.fate.effects.deathRiskMultiplier ?? 1) *
    input.world.worldRules.eventRiskMultiplier;
  const cultivationLoss = Math.ceil(nextRealm.cultivationRequired * (0.12 + severity * 0.18));
  const hpDamage = Math.ceil((16 + currentRealm.order * 7 + severity * 28) * deathRiskMultiplier);
  const nextHp = playerAfterCost.hp - hpDamage;
  const deathReason =
    nextHp <= 0 || severity * deathRiskMultiplier > 0.94
      ? "突破失敗，靈氣逆衝而亡"
      : undefined;

  const player: Player = {
    ...playerAfterCost,
    cultivation: Math.max(0, playerAfterCost.cultivation - cultivationLoss),
    age: playerAfterCost.age + BALANCE.yearsPerBreakthroughAttempt,
    hp: Math.max(0, nextHp),
    status: deathReason
      ? ["dead"]
      : addStatuses(playerAfterCost.status, severity > 0.55 ? ["injured"] : ["weak"]),
  };

  return {
    player,
    success: false,
    rate,
    message: deathReason
      ? "突破失敗，經脈盡碎，這一世到此為止。"
      : "突破失敗，修為倒退，身體也留下暗傷。",
    objectiveCompleted: false,
    deathReason:
      deathReason ??
      (player.age >= player.lifespan ? "壽元耗盡，無力再續仙途" : undefined),
  };
}
