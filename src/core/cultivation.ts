import { getNextRealm } from "../data/realms";
import {
  BALANCE,
  applyAttributeDelta,
  applyResourceDelta,
  clamp,
  getMetaBonuses,
  getStatusCultivationMultiplier,
} from "./balance";
import { checkDeath } from "./death";
import type {
  CultivationCriticalTier,
  Fate,
  Identity,
  MetaProgress,
  Player,
  World,
} from "../types";

export interface CultivationInput {
  player: Player;
  meta: MetaProgress;
  world: World;
  identity: Identity;
  fate: Fate;
  random?: () => number;
}

export interface CultivationCriticalResult {
  tier: CultivationCriticalTier;
  multiplier: number;
  label: string;
  text: string;
  important: boolean;
}

export interface CultivationOutcome {
  player: Player;
  baseGain: number;
  gain: number;
  critical: CultivationCriticalResult;
  eventTriggered: boolean;
  deathReason?: string;
}

const CULTIVATION_TEXT: Record<CultivationCriticalTier, Omit<CultivationCriticalResult, "tier">> = {
  normal: {
    multiplier: 1,
    label: "普通修煉",
    text: "你盤膝吐納，靈氣緩緩入體。",
    important: false,
  },
  minor_insight: {
    multiplier: 2,
    label: "小有所悟",
    text: "你心頭一震，似乎摸到了一絲修行門徑。",
    important: false,
  },
  deep_insight: {
    multiplier: 5,
    label: "心有所感",
    text: "周身靈氣流轉加快，你對功法的理解更深了一層。",
    important: true,
  },
  dao_enlightenment: {
    multiplier: 20,
    label: "頓悟大道",
    text: "天地驟然寂靜，萬般法理於心中流轉，你陷入難得的頓悟。",
    important: true,
  },
  heaven_resonance: {
    multiplier: 50,
    label: "天道共鳴",
    text: "雲海翻湧，天光垂落，你的神魂似與大道產生共鳴。",
    important: true,
  },
  defying_enlightenment: {
    multiplier: 0,
    label: "逆天頓悟",
    text: "一瞬之間，你看見無數前世殘影，修為如洪流般衝破桎梏！",
    important: true,
  },
};

function getCriticalByTier(tier: CultivationCriticalTier): CultivationCriticalResult {
  return {
    tier,
    ...CULTIVATION_TEXT[tier],
  };
}

export function calculateCultivationGain({
  player,
  meta,
  world,
  identity,
  fate,
}: Omit<CultivationInput, "random">): number {
  const metaBonuses = getMetaBonuses(meta);
  const spiritualRootFactor = 1 + player.spiritualRoot / 90;
  const comprehensionFactor = 1 + player.comprehension / 120;
  const luckFactor = 1 + player.luck / 360;
  const identityBonus = identity.statModifiers.cultivationEfficiencyBonus ?? 0;
  const fateBonus = fate.effects.cultivationEfficiencyBonus ?? 0;
  const auraBonus = player.resources.aura > 0 ? 0.12 : 0;
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

export function calculateCultivationCritical(
  input: Omit<CultivationInput, "random">,
  random = Math.random,
): CultivationCriticalResult {
  const metaBonuses = getMetaBonuses(input.meta);
  const insightPower =
    input.player.comprehension * 0.0025 +
    input.player.luck * 0.0018 +
    (input.identity.statModifiers.eventChanceBonus ?? 0) +
    (input.fate.effects.eventChanceBonus ?? 0) +
    metaBonuses.cultivationEfficiencyBonus * 0.2 +
    input.world.worldRules.cultivationMultiplier * 0.025;
  const defying = clamp(0.006 + insightPower * 0.01, 0.006, 0.03);
  const heaven = defying + clamp(0.012 + insightPower * 0.018, 0.012, 0.05);
  const dao = heaven + clamp(0.028 + insightPower * 0.03, 0.028, 0.09);
  const deep = dao + clamp(0.07 + insightPower * 0.05, 0.07, 0.18);
  const minor = deep + clamp(0.2 + insightPower * 0.08, 0.2, 0.38);
  const roll = random();

  if (roll < defying) return getCriticalByTier("defying_enlightenment");
  if (roll < heaven) return getCriticalByTier("heaven_resonance");
  if (roll < dao) return getCriticalByTier("dao_enlightenment");
  if (roll < deep) return getCriticalByTier("deep_insight");
  if (roll < minor) return getCriticalByTier("minor_insight");
  return getCriticalByTier("normal");
}

export function applyCultivationGain(
  player: Player,
  baseGain: number,
  critical: CultivationCriticalResult,
): { player: Player; gain: number } {
  const nextRealm = getNextRealm(player.realmId);
  const gain =
    critical.tier === "defying_enlightenment" && nextRealm
      ? Math.max(baseGain, nextRealm.requiredCultivation - player.cultivation)
      : Math.ceil(baseGain * critical.multiplier);
  let nextPlayer: Player = {
    ...player,
    cultivation: player.cultivation + gain,
  };

  if (critical.tier === "dao_enlightenment") {
    nextPlayer = applyAttributeDelta(nextPlayer, {
      comprehension: 1,
      daoHeart: 1,
    });
  }

  if (critical.tier === "heaven_resonance") {
    nextPlayer = applyResourceDelta(nextPlayer, {
      pastLifeMemory: 1,
      destiny: 2,
    });
  }

  if (critical.tier === "defying_enlightenment") {
    nextPlayer = applyResourceDelta(
      applyAttributeDelta(nextPlayer, {
        comprehension: 2,
        daoHeart: 2,
      }),
      {
        pastLifeMemory: 2,
        destiny: 3,
      },
    );
  }

  return {
    player: nextPlayer,
    gain,
  };
}

export function getCultivationResultText(result: CultivationCriticalResult): string {
  return `${result.label}：${result.text}`;
}

export function cultivate(input: CultivationInput): CultivationOutcome {
  const random = input.random ?? Math.random;
  const baseGain = calculateCultivationGain(input);
  const critical = calculateCultivationCritical(input, random);
  const applied = applyCultivationGain(input.player, baseGain, critical);
  const eventChance =
    BALANCE.eventChanceAfterCultivation +
    (input.identity.statModifiers.eventChanceBonus ?? 0) +
    (input.fate.effects.eventChanceBonus ?? 0) +
    (critical.important ? 0.18 : 0);

  const nextAge = applied.player.age + BALANCE.yearsPerCultivation;
  const nextHp = clamp(applied.player.hp + 5, 0, applied.player.maxHp);
  const auraSpent = applied.player.resources.aura > 0 ? 1 : 0;

  const player: Player = {
    ...applied.player,
    age: nextAge,
    hp: nextHp,
    resources: {
      ...applied.player.resources,
      aura: Math.max(0, applied.player.resources.aura - auraSpent),
    },
  };

  const death = checkDeath(
    player,
    player.age >= player.lifespan ? "壽元耗盡，坐化於修煉之中" : undefined,
  );

  return {
    player,
    baseGain,
    gain: applied.gain,
    critical,
    eventTriggered: random() < eventChance,
    deathReason: death.reason,
  };
}
