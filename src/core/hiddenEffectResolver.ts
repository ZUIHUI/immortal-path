import { getFateById } from "../data/fates";
import { getIdentityById } from "../data/identities";
import { getNextRealm } from "../data/realms";
import { calculateCultivationGain } from "./cultivation";
import { clamp, getMetaBonuses } from "./balance";
import type {
  AiHiddenEffect,
  GameEffect,
  LifeState,
  MetaProgress,
  Player,
  ResourceMap,
  World,
} from "../types";

const intensityMultiplier = {
  tiny: 1,
  small: 2,
  medium: 5,
  large: 10,
  huge: 18,
} as const;

const hpLossRatio = {
  tiny: 0.04,
  small: 0.09,
  medium: 0.18,
  large: 0.32,
  huge: 0.52,
} as const;

const lifespanLoss = {
  tiny: 1,
  small: 2,
  medium: 4,
  large: 8,
  huge: 13,
} as const;

const resourceTargets: Array<keyof ResourceMap> = [
  "spiritStones",
  "aura",
  "pills",
  "herbs",
  "artifacts",
  "destiny",
  "karma",
  "pastLifeMemory",
];

export interface ResolveHiddenEffectsInput {
  hiddenEffects: AiHiddenEffect[];
  player: Player;
  lifeState: LifeState;
  metaProgress: MetaProgress;
  worldConfig: World;
}

export interface ResolvedHiddenEffects {
  effects: GameEffect[];
  balanceWarnings: string[];
}

function resolveResourceTarget(effect: AiHiddenEffect): keyof ResourceMap {
  if (effect.type === "karmaGain") return "karma";
  if (effect.type === "destinyGain") return "destiny";
  if (effect.type === "memoryGain") return "pastLifeMemory";
  return resourceTargets.find((target) => target === effect.target) ?? "aura";
}

export function resolveHiddenEffects({
  hiddenEffects,
  player,
  lifeState,
  metaProgress,
  worldConfig,
}: ResolveHiddenEffectsInput): ResolvedHiddenEffects {
  const nextRealm = getNextRealm(player.realmId);
  const metaBonuses = getMetaBonuses(metaProgress);
  const baseGain = calculateCultivationGain({
    player,
    meta: metaProgress,
    world: worldConfig,
    identity: getIdentityById(lifeState.identityId),
    fate: getFateById(lifeState.fateId),
  });
  const worldFlavorMultiplier =
    worldConfig.type === "cyber_cultivation"
      ? 1.12
      : worldConfig.type === "apocalypse"
        ? 0.72
        : worldConfig.type === "dream_realm"
          ? 1.08
          : 1;
  const maxCultivationGain = nextRealm
    ? Math.max(baseGain * 4, Math.ceil(nextRealm.requiredCultivation * 0.78))
    : baseGain * 24;
  const fortuneMultiplier = clamp(
    1 + player.comprehension / 260 + player.luck / 240 + metaBonuses.cultivationEfficiencyBonus,
    0.8,
    2.1,
  );
  const effects: GameEffect[] = [];
  const balanceWarnings: string[] = [];

  for (const effect of hiddenEffects) {
    switch (effect.type) {
      case "cultivationGain":
      case "realmProgress": {
        const raw = Math.ceil(
          baseGain * intensityMultiplier[effect.intensity] * fortuneMultiplier * worldFlavorMultiplier,
        );
        const value = Math.min(raw, maxCultivationGain);
        if (value < raw) {
          balanceWarnings.push("天機收益已被壓回當前境界可承受範圍");
        }
        effects.push({ type: "cultivationDelta", value, reason: effect.reason });
        break;
      }
      case "resourceGain":
      case "resourceLoss":
      case "karmaGain":
      case "destinyGain":
      case "memoryGain": {
        const target = resolveResourceTarget(effect);
        const sign = effect.type === "resourceLoss" ? -1 : 1;
        const value = sign * Math.min(intensityMultiplier[effect.intensity] * 2, 36);
        effects.push({ type: "resourceDelta", target, value, reason: effect.reason });
        break;
      }
      case "hpLoss":
        effects.push({
          type: "hpDelta",
          value: -Math.ceil(player.maxHp * hpLossRatio[effect.intensity]),
          reason: effect.reason,
        });
        break;
      case "lifespanLoss":
        effects.push({
          type: "lifespanDelta",
          value: -lifespanLoss[effect.intensity],
          reason: effect.reason,
        });
        break;
      case "legacyRelicGain":
        effects.push({
          type: "legacyRelicGain",
          target: effect.target,
          reason: effect.reason,
        });
        break;
      case "statusGain":
        effects.push({
          type: "statusAdd",
          target: effect.target ?? "weak",
          reason: effect.reason,
        });
        break;
      case "breakthroughOpportunity":
        effects.push({
          type: "breakthroughHint",
          reason: effect.reason,
        });
        break;
      case "death":
        effects.push({
          type: "triggerDeath",
          reason: effect.reason,
        });
        break;
      case "worldClear":
        effects.push({
          type: "worldClear",
          reason: effect.reason,
        });
        break;
      case "settlementBonus":
        effects.push({
          type: "reincarnationPointMultiplierDelta",
          value: Math.min(0.18, intensityMultiplier[effect.intensity] / 100),
          reason: effect.reason,
        });
        break;
    }
  }

  if (player.age >= player.lifespan || lifeState.yearsSurvived >= worldConfig.timeLimit) {
    effects.push({
      type: "triggerDeath",
      reason: "壽元與世界時限走到盡頭，輪迴長河開始回收此世。",
    });
  }

  return {
    effects,
    balanceWarnings,
  };
}
