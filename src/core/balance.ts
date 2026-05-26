import { reincarnationShopItems } from "../data/reincarnationShop";
import type {
  AttributeMap,
  GameModifier,
  MetaProgress,
  Player,
  PlayerStatus,
  ReincarnationShopItem,
  ResourceMap,
} from "../types";

export const BALANCE = {
  baseCultivationGain: 38,
  yearsPerCultivation: 1,
  yearsPerBreakthroughAttempt: 1,
  eventChanceAfterCultivation: 0.38,
  minBreakthroughRate: 0.05,
  maxBreakthroughRate: 0.97,
  maxEventSuccessRate: 0.97,
  minEventSuccessRate: 0.03,
};

export function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function randomChance(rate: number, random = Math.random): boolean {
  return random() < clamp(rate, 0, 1);
}

export function defaultResources(): ResourceMap {
  return {
    spiritStones: 0,
    aura: 0,
    pills: 0,
    herbs: 0,
    artifacts: 0,
    destiny: 0,
    karma: 0,
    pastLifeMemory: 0,
  };
}

export function mergeResources(
  base: ResourceMap,
  delta?: Partial<ResourceMap>,
): ResourceMap {
  const next = { ...base };

  if (!delta) {
    return next;
  }

  for (const [key, value] of Object.entries(delta) as [
    keyof ResourceMap,
    number,
  ][]) {
    next[key] = Math.max(0, Math.round((next[key] ?? 0) + value));
  }

  return next;
}

export function mergeModifiers(...modifiers: (GameModifier | undefined)[]) {
  return modifiers.reduce<GameModifier>((merged, modifier) => {
    if (!modifier) {
      return merged;
    }

    for (const [key, value] of Object.entries(modifier) as [
      keyof GameModifier,
      number,
    ][]) {
      merged[key] = (merged[key] ?? 0) + value;
    }

    return merged;
  }, {});
}

export function normalizeStatuses(statuses: PlayerStatus[]): PlayerStatus[] {
  const unique = Array.from(new Set(statuses));

  if (unique.includes("dead")) {
    return ["dead"];
  }

  const active = unique.filter((status) => status !== "normal");
  return active.length > 0 ? active : ["normal"];
}

export function addStatuses(
  statuses: PlayerStatus[],
  additions: PlayerStatus[] = [],
): PlayerStatus[] {
  return normalizeStatuses([...statuses, ...additions]);
}

export function removeStatuses(
  statuses: PlayerStatus[],
  removals: PlayerStatus[] = [],
): PlayerStatus[] {
  return normalizeStatuses(statuses.filter((status) => !removals.includes(status)));
}

export function applyAttributeDelta(
  player: Player,
  delta?: Partial<AttributeMap>,
): Player {
  if (!delta) {
    return player;
  }

  const next = { ...player };

  for (const [key, value] of Object.entries(delta) as [
    keyof AttributeMap,
    number,
  ][]) {
    next[key] = Math.max(0, Math.round((next[key] ?? 0) + value));
  }

  next.hp = clamp(next.hp, 0, next.maxHp);
  return next;
}

export function applyResourceDelta(
  player: Player,
  delta?: Partial<ResourceMap>,
): Player {
  const resources = mergeResources(player.resources, delta);

  return {
    ...player,
    resources,
    destiny: resources.destiny,
    karma: resources.karma,
  };
}

export interface MetaBonuses {
  initialComprehension: number;
  initialLuck: number;
  cultivationEfficiencyBonus: number;
  breakthroughRateBonus: number;
  initialLifespan: number;
}

export function getMetaBonuses(meta: MetaProgress): MetaBonuses {
  return reincarnationShopItems.reduce<MetaBonuses>(
    (bonuses, item) => {
      const level = meta.shopLevels[item.id] ?? 0;
      const value = level * item.effectPerLevel;

      switch (item.effectKey) {
        case "initialComprehension":
          bonuses.initialComprehension += value;
          break;
        case "initialLuck":
          bonuses.initialLuck += value;
          break;
        case "cultivationEfficiency":
          bonuses.cultivationEfficiencyBonus += value;
          break;
        case "breakthroughRate":
          bonuses.breakthroughRateBonus += value;
          break;
        case "initialLifespan":
          bonuses.initialLifespan += value;
          break;
      }

      return bonuses;
    },
    {
      initialComprehension: 0,
      initialLuck: 0,
      cultivationEfficiencyBonus: 0,
      breakthroughRateBonus: 0,
      initialLifespan: 0,
    },
  );
}

export function calculateShopItemCost(
  item: ReincarnationShopItem,
  currentLevel: number,
): number {
  return Math.ceil(item.baseCost * item.costMultiplier ** currentLevel);
}

export function getStatusCultivationMultiplier(statuses: PlayerStatus[]): number {
  let multiplier = 1;

  if (statuses.includes("injured")) {
    multiplier *= 0.78;
  }

  if (statuses.includes("weak")) {
    multiplier *= 0.86;
  }

  if (statuses.includes("heart_demon")) {
    multiplier *= 0.9;
  }

  return multiplier;
}

export function getStatusBreakthroughModifier(statuses: PlayerStatus[]): number {
  let modifier = 0;

  if (statuses.includes("injured")) {
    modifier -= 0.08;
  }

  if (statuses.includes("weak")) {
    modifier -= 0.05;
  }

  if (statuses.includes("heart_demon")) {
    modifier -= 0.1;
  }

  return modifier;
}
