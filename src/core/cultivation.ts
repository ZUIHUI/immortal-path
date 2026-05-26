import { BALANCE, clamp, getMetaBonuses, getStatusCultivationMultiplier } from "./balance";
import type { Fate, Identity, MetaProgress, Player, World } from "../types";

export interface CultivationInput {
  player: Player;
  meta: MetaProgress;
  world: World;
  identity: Identity;
  fate: Fate;
  random?: () => number;
}

export interface CultivationOutcome {
  player: Player;
  gain: number;
  eventTriggered: boolean;
  deathReason?: string;
}

export function calculateCultivationGain({
  player,
  meta,
  world,
  identity,
  fate,
}: Omit<CultivationInput, "random">): number {
  const metaBonuses = getMetaBonuses(meta);
  const spiritualRootFactor = 1 + player.spiritualRoot / 120;
  const comprehensionFactor = 1 + player.comprehension / 160;
  const luckFactor = 1 + player.luck / 500;
  const identityBonus = identity.effects.cultivationEfficiencyBonus ?? 0;
  const fateBonus = fate.effects.cultivationEfficiencyBonus ?? 0;
  const auraBonus = player.resources.aura > 0 ? 0.08 : 0;
  const statusMultiplier = getStatusCultivationMultiplier(player.status);

  const gain =
    BALANCE.baseCultivationGain *
    spiritualRootFactor *
    comprehensionFactor *
    luckFactor *
    (1 + identityBonus + fateBonus + metaBonuses.cultivationEfficiencyBonus + auraBonus) *
    world.worldRules.cultivationMultiplier *
    statusMultiplier;

  return Math.max(1, Math.floor(gain));
}

export function cultivate(input: CultivationInput): CultivationOutcome {
  const random = input.random ?? Math.random;
  const gain = calculateCultivationGain(input);
  const eventChance =
    BALANCE.eventChanceAfterCultivation +
    (input.identity.effects.eventChanceBonus ?? 0) +
    (input.fate.effects.eventChanceBonus ?? 0);

  const nextAge = input.player.age + BALANCE.yearsPerCultivation;
  const nextHp = clamp(input.player.hp + 3, 0, input.player.maxHp);
  const auraSpent = input.player.resources.aura > 0 ? 1 : 0;

  const player: Player = {
    ...input.player,
    age: nextAge,
    hp: nextHp,
    cultivation: input.player.cultivation + gain,
    resources: {
      ...input.player.resources,
      aura: Math.max(0, input.player.resources.aura - auraSpent),
    },
  };

  const deathReason =
    player.age >= player.lifespan ? "壽元耗盡，坐化於修煉之中" : undefined;

  return {
    player,
    gain,
    eventTriggered: random() < eventChance,
    deathReason,
  };
}
