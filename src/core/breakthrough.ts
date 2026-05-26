import { getHigherRealmId, getNextRealm, getRealmById } from "../data/realms";
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
import { checkDeath } from "./death";
import type {
  AttributeMap,
  BreakthroughMethodId,
  Fate,
  Identity,
  MetaProgress,
  Player,
  Realm,
  World,
} from "../types";

export interface BreakthroughMethod {
  id: BreakthroughMethodId;
  name: string;
  rateModifier: number;
  successText: string;
  failureText: string;
  successBonus: Partial<AttributeMap>;
  failurePenaltyMultiplier: number;
  deathRiskBonus: number;
  reincarnationPointMultiplierDelta: number;
  successPreview: string;
  failurePreview: string;
}

export const BREAKTHROUGH_METHODS: BreakthroughMethod[] = [
  {
    id: "stable",
    name: "穩固突破",
    rateModifier: 0.15,
    successText: "丹田轟鳴，靈氣倒灌，你成功踏入新的境界。",
    failureText: "靈氣逆亂，經脈劇痛，你的突破失敗了，但根基尚未崩毀。",
    successBonus: {},
    failurePenaltyMultiplier: 0.65,
    deathRiskBonus: -0.12,
    reincarnationPointMultiplierDelta: 0,
    successPreview: "成功率 +15%，成功後只獲得基礎境界提升。",
    failurePreview: "失敗懲罰較低，死亡風險很低。",
  },
  {
    id: "force",
    name: "強行突破",
    rateModifier: 0,
    successText: "靈氣倒灌，丹田轟鳴，你一舉踏入新的境界！",
    failureText: "靈氣逆亂，經脈劇痛，你的突破失敗了。",
    successBonus: {
      attack: 3,
      defense: 2,
      daoHeart: 1,
    },
    failurePenaltyMultiplier: 1,
    deathRiskBonus: 0,
    reincarnationPointMultiplierDelta: 0.05,
    successPreview: "成功後額外增加攻擊、防禦、道心。",
    failurePreview: "失敗懲罰中等，可能重傷。",
  },
  {
    id: "defy_heaven",
    name: "逆天突破",
    rateModifier: -0.2,
    successText: "天雷未落，道基已成。你硬生生從死路中踏出一條仙途！",
    failureText: "心魔反噬，靈台崩碎。此世修行，到此為止。",
    successBonus: {
      maxHp: 18,
      attack: 8,
      defense: 6,
      daoHeart: 4,
      comprehension: 2,
    },
    failurePenaltyMultiplier: 1.7,
    deathRiskBonus: 0.22,
    reincarnationPointMultiplierDelta: 0.25,
    successPreview: "成功後大量屬性、世界評價與輪迴點倍率提升。",
    failurePreview: "失敗可能重傷、壽元大減，甚至死亡。",
  },
];

export function getBreakthroughMethod(methodId: BreakthroughMethodId): BreakthroughMethod {
  return BREAKTHROUGH_METHODS.find((method) => method.id === methodId) ?? BREAKTHROUGH_METHODS[0];
}

export interface BreakthroughInput {
  player: Player;
  meta: MetaProgress;
  world: World;
  identity: Identity;
  fate: Fate;
  methodId?: BreakthroughMethodId;
  random?: () => number;
}

export interface BreakthroughOutcome {
  player: Player;
  success: boolean;
  rate: number;
  baseRate: number;
  method: BreakthroughMethod;
  message: string;
  objectiveCompleted: boolean;
  reincarnationPointMultiplierDelta: number;
  important: boolean;
  deathReason?: string;
}

export interface BreakthroughSuccessInput {
  player: Player;
  nextRealm: Realm;
  world: World;
  method: BreakthroughMethod;
}

export interface BreakthroughFailureInput {
  player: Player;
  currentRealm: Realm;
  nextRealm: Realm;
  world: World;
  identity: Identity;
  fate: Fate;
  method: BreakthroughMethod;
  severity: number;
}

export function canBreakthrough(player: Player): boolean {
  const nextRealm = getNextRealm(player.realmId);
  return Boolean(nextRealm && player.cultivation >= nextRealm.requiredCultivation);
}

function calculateBaseBreakthroughRate({
  player,
  meta,
  world,
  identity,
  fate,
}: Omit<BreakthroughInput, "random" | "methodId">): number {
  const nextRealm = getNextRealm(player.realmId);

  if (!nextRealm) {
    return 0;
  }

  const hpRatio = player.maxHp > 0 ? player.hp / player.maxHp : 0;
  const metaBonuses = getMetaBonuses(meta);
  const resourcePreparation =
    Math.min(player.resources.pills, 2) * 0.04 +
    Math.min(player.resources.artifacts, 2) * 0.025 +
    Math.min(player.resources.destiny, 8) * 0.01;
  const statBonus =
    player.comprehension * 0.0014 + player.daoHeart * 0.0018 + player.luck * 0.001;
  const woundedPenalty = hpRatio < 0.55 ? -0.12 : 0;

  return (
    nextRealm.baseBreakthroughRate +
    (identity.statModifiers.breakthroughRateBonus ?? 0) +
    (fate.effects.breakthroughRateBonus ?? 0) +
    metaBonuses.breakthroughRateBonus +
    world.worldRules.breakthroughRateModifier +
    resourcePreparation +
    statBonus +
    woundedPenalty +
    getStatusBreakthroughModifier(player.status)
  );
}

export function calculateBreakthroughRate(input: Omit<BreakthroughInput, "random">): number {
  const method = getBreakthroughMethod(input.methodId ?? "stable");
  const rate = calculateBaseBreakthroughRate(input) + method.rateModifier;
  return clamp(rate, BALANCE.minBreakthroughRate, BALANCE.maxBreakthroughRate);
}

export function calculateBreakthroughPreview(input: Omit<BreakthroughInput, "random">) {
  const method = getBreakthroughMethod(input.methodId ?? "stable");
  const baseRate = clamp(
    calculateBaseBreakthroughRate(input),
    BALANCE.minBreakthroughRate,
    BALANCE.maxBreakthroughRate,
  );
  const finalRate = calculateBreakthroughRate(input);

  return {
    method,
    baseRate,
    finalRate,
    canDie: method.id === "defy_heaven" || input.player.hp / input.player.maxHp < 0.4,
  };
}

export function applyBreakthroughSuccess({
  player,
  nextRealm,
  world,
  method,
}: BreakthroughSuccessInput): Pick<
  BreakthroughOutcome,
  | "player"
  | "message"
  | "objectiveCompleted"
  | "deathReason"
  | "reincarnationPointMultiplierDelta"
  | "important"
> {
  const afterRealmBonus = applyAttributeDelta(
    {
      ...player,
      realmId: nextRealm.id,
      highestRealmId: getHigherRealmId(player.highestRealmId, nextRealm.id),
      cultivation: Math.max(0, player.cultivation - nextRealm.requiredCultivation),
      age: player.age + BALANCE.yearsPerBreakthroughAttempt,
      lifespan: player.lifespan + nextRealm.lifespanBonus,
    },
    nextRealm.statBonus,
  );
  const afterMethodBonus = applyAttributeDelta(afterRealmBonus, method.successBonus);
  const nextPlayer: Player = {
    ...afterMethodBonus,
    hp: afterMethodBonus.maxHp,
    status: removeStatuses(afterMethodBonus.status, [
      "injured",
      "weak",
      "heart_demon",
    ]),
  };
  const death = checkDeath(nextPlayer);

  return {
    player: nextPlayer,
    message:
      method.id === "defy_heaven"
        ? method.successText
        : `${method.successText} 你成功踏入${nextRealm.name}${nextRealm.stageName}！`,
    objectiveCompleted: world.objectiveRealmId === nextRealm.id,
    deathReason: death.reason,
    reincarnationPointMultiplierDelta: method.reincarnationPointMultiplierDelta,
    important: method.id !== "stable",
  };
}

export function applyBreakthroughFailure({
  player,
  currentRealm,
  nextRealm,
  world,
  identity,
  fate,
  method,
  severity,
}: BreakthroughFailureInput): Pick<
  BreakthroughOutcome,
  | "player"
  | "message"
  | "objectiveCompleted"
  | "deathReason"
  | "reincarnationPointMultiplierDelta"
  | "important"
> {
  const deathRiskMultiplier =
    (identity.statModifiers.deathRiskMultiplier ?? 1) *
    (fate.effects.deathRiskMultiplier ?? 1) *
    world.worldRules.eventRiskMultiplier;
  const totalSeverity = clamp(severity + method.deathRiskBonus, 0, 1.25);
  const cultivationLoss = Math.ceil(
    nextRealm.requiredCultivation * (0.1 + severity * 0.2) * method.failurePenaltyMultiplier,
  );
  const hpDamage = Math.ceil(
    (18 + currentRealm.order * 8 + severity * 34) *
      deathRiskMultiplier *
      method.failurePenaltyMultiplier,
  );
  const lifespanDamage =
    method.id === "defy_heaven" ? Math.ceil(8 + severity * 14) : Math.ceil(severity * 2);
  const explicitDeathReason =
    totalSeverity > 0.98 ? "心魔反噬，靈台崩碎。此世修行，到此為止。" : undefined;
  const nextPlayer: Player = {
    ...player,
    cultivation: Math.max(0, player.cultivation - cultivationLoss),
    age: player.age + BALANCE.yearsPerBreakthroughAttempt,
    hp: Math.max(0, player.hp - hpDamage),
    lifespan: Math.max(player.age + 1, player.lifespan - lifespanDamage),
    status: addStatuses(player.status, severity > 0.5 ? ["injured"] : ["weak"]),
  };
  const death = checkDeath(nextPlayer, explicitDeathReason);
  const finalPlayer: Player = death.isDead
    ? {
        ...nextPlayer,
        hp: 0,
        status: ["dead"],
      }
    : nextPlayer;

  return {
    player: finalPlayer,
    message: death.isDead ? method.failureText : `${method.failureText} 修為倒退，氣血翻湧。`,
    objectiveCompleted: false,
    deathReason: death.reason,
    reincarnationPointMultiplierDelta: 0,
    important: method.id === "defy_heaven",
  };
}

export function attemptBreakthrough(input: BreakthroughInput): BreakthroughOutcome {
  const random = input.random ?? Math.random;
  const method = getBreakthroughMethod(input.methodId ?? "stable");
  const nextRealm = getNextRealm(input.player.realmId);
  const baseRate = clamp(
    calculateBaseBreakthroughRate(input),
    BALANCE.minBreakthroughRate,
    BALANCE.maxBreakthroughRate,
  );

  if (!nextRealm) {
    return {
      player: input.player,
      success: false,
      rate: 0,
      baseRate: 0,
      method,
      message: "目前已達 MVP 境界上限。",
      objectiveCompleted: false,
      reincarnationPointMultiplierDelta: 0,
      important: false,
    };
  }

  if (input.player.cultivation < nextRealm.requiredCultivation) {
    return {
      player: input.player,
      success: false,
      rate: calculateBreakthroughRate(input),
      baseRate,
      method,
      message: "修為尚未達到突破門檻。",
      objectiveCompleted: false,
      reincarnationPointMultiplierDelta: 0,
      important: false,
    };
  }

  const rate = calculateBreakthroughRate(input);
  const consumedPill = input.player.resources.pills > 0 ? 1 : 0;
  const playerAfterCost = applyResourceDelta(input.player, {
    pills: -consumedPill,
  });

  if (random() < rate) {
    const success = applyBreakthroughSuccess({
      player: playerAfterCost,
      nextRealm,
      world: input.world,
      method,
    });

    return {
      player: success.player,
      success: true,
      rate,
      baseRate,
      method,
      message: success.message,
      objectiveCompleted: success.objectiveCompleted,
      reincarnationPointMultiplierDelta: success.reincarnationPointMultiplierDelta,
      important: success.important,
      deathReason: success.deathReason,
    };
  }

  const currentRealm = getRealmById(input.player.realmId);
  const severity = random();
  const failure = applyBreakthroughFailure({
    player: playerAfterCost,
    currentRealm,
    nextRealm,
    world: input.world,
    identity: input.identity,
    fate: input.fate,
    method,
    severity,
  });

  return {
    player: failure.player,
    success: false,
    rate,
    baseRate,
    method,
    message: failure.message,
    objectiveCompleted: failure.objectiveCompleted,
    reincarnationPointMultiplierDelta: failure.reincarnationPointMultiplierDelta,
    important: failure.important,
    deathReason: failure.deathReason,
  };
}
