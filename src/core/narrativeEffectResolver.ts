import { getFateById } from "../data/fates";
import { getIdentityById } from "../data/identities";
import { getNextRealm } from "../data/realms";
import { calculateCultivationGain } from "./cultivation";
import { clamp, getMetaBonuses } from "./balance";
import type {
  AiNarrativeResponse,
  AiSuggestedEffect,
  AttributeMap,
  GameEffect,
  LifeState,
  MetaProgress,
  Player,
  PlayerStatus,
  ResolvedNarrativeEffects,
  ResourceMap,
  VisibleChange,
  World,
} from "../types";

const cultivationIntensityMultiplier = {
  tiny: 1,
  small: 2,
  medium: 5,
  large: 12,
  huge: 25,
} as const;

const resourceIntensityValue = {
  tiny: 1,
  small: 2,
  medium: 5,
  large: 10,
  huge: 18,
} as const;

const statIntensityValue = {
  tiny: 1,
  small: 1,
  medium: 2,
  large: 4,
  huge: 6,
} as const;

const hpLossRatio = {
  tiny: 0.05,
  small: 0.1,
  medium: 0.22,
  large: 0.38,
  huge: 0.58,
} as const;

const lifespanLossValue = {
  tiny: 1,
  small: 2,
  medium: 5,
  large: 9,
  huge: 14,
} as const;

const reincarnationBonusValue = {
  tiny: 0.01,
  small: 0.02,
  medium: 0.04,
  large: 0.08,
  huge: 0.12,
} as const;

const resourceKeys: Array<keyof ResourceMap> = [
  "spiritStones",
  "aura",
  "pills",
  "herbs",
  "artifacts",
  "destiny",
  "karma",
  "pastLifeMemory",
];

const attributeKeys: Array<keyof AttributeMap> = [
  "spiritualRoot",
  "hp",
  "maxHp",
  "divineSense",
  "attack",
  "defense",
  "comprehension",
  "luck",
  "daoHeart",
  "lifespan",
];

const statusKeys: PlayerStatus[] = ["injured", "weak", "heart_demon"];

export interface ResolveAiSuggestedEffectsInput {
  aiEffects: AiSuggestedEffect[];
  player: Player;
  lifeState: LifeState;
  metaProgress: MetaProgress;
  worldConfig: World;
  responseFlags?: Pick<
    AiNarrativeResponse,
    | "shouldTriggerDeath"
    | "deathReason"
    | "shouldTriggerBreakthrough"
    | "shouldCompleteWorldObjective"
    | "rarity"
    | "logText"
  >;
}

function pushVisibleChange(
  visibleChanges: VisibleChange[],
  label: string,
  value: string,
  tone: VisibleChange["tone"],
) {
  visibleChanges.push({ label, value, tone });
}

function resolveResourceTarget(target: string | undefined): keyof ResourceMap | undefined {
  return resourceKeys.find((key) => key === target);
}

function resolveAttributeTarget(target: string | undefined): keyof AttributeMap | undefined {
  return attributeKeys.find((key) => key === target);
}

function resolveStatusTarget(target: string | undefined): PlayerStatus {
  return statusKeys.find((status) => status === target) ?? "weak";
}

export function resolveAiSuggestedEffects({
  aiEffects,
  player,
  lifeState,
  metaProgress,
  worldConfig,
  responseFlags,
}: ResolveAiSuggestedEffectsInput): ResolvedNarrativeEffects {
  const identity = getIdentityById(lifeState.identityId);
  const fate = getFateById(lifeState.fateId);
  const baseGain = calculateCultivationGain({
    player,
    meta: metaProgress,
    world: worldConfig,
    identity,
    fate,
  });
  const metaBonuses = getMetaBonuses(metaProgress);
  const nextRealm = getNextRealm(player.realmId);
  const fortuneMultiplier = clamp(
    1 + player.luck / 180 + player.comprehension / 260 + metaBonuses.cultivationEfficiencyBonus * 0.35,
    1,
    2.2,
  );
  const maxCultivationGain = nextRealm
    ? Math.max(baseGain * 4, Math.ceil(nextRealm.requiredCultivation * 0.85))
    : baseGain * 30;
  const effects: GameEffect[] = [];
  const visibleChanges: VisibleChange[] = [];
  const balanceWarnings: string[] = [];

  for (const aiEffect of aiEffects) {
    switch (aiEffect.type) {
      case "cultivationGain": {
        const raw = Math.ceil(
          baseGain * cultivationIntensityMultiplier[aiEffect.intensity] * fortuneMultiplier,
        );
        const value = Math.min(raw, maxCultivationGain);
        if (value < raw) {
          balanceWarnings.push("cultivationGain clamped to realm-safe maximum");
        }
        effects.push({
          type: "cultivationDelta",
          value,
          reason: aiEffect.reason,
        });
        pushVisibleChange(visibleChanges, "修為", `+${value}`, "positive");
        break;
      }
      case "resourceGain":
      case "resourceLoss": {
        const target = resolveResourceTarget(aiEffect.target);
        if (!target) {
          balanceWarnings.push(`Unknown resource target: ${aiEffect.target ?? "none"}`);
          break;
        }
        const sign = aiEffect.type === "resourceGain" ? 1 : -1;
        const value =
          sign *
          Math.min(
            Math.ceil(resourceIntensityValue[aiEffect.intensity] * fortuneMultiplier),
            30,
          );
        effects.push({
          type: "resourceDelta",
          target,
          value,
          reason: aiEffect.reason,
        });
        pushVisibleChange(
          visibleChanges,
          target,
          `${value > 0 ? "+" : ""}${value}`,
          value > 0 ? "positive" : "negative",
        );
        break;
      }
      case "statGain":
      case "statLoss": {
        const target = resolveAttributeTarget(aiEffect.target);
        if (!target) {
          balanceWarnings.push(`Unknown stat target: ${aiEffect.target ?? "none"}`);
          break;
        }
        const sign = aiEffect.type === "statGain" ? 1 : -1;
        const value = sign * Math.min(statIntensityValue[aiEffect.intensity], 8);
        effects.push({
          type: "attributeDelta",
          target,
          value,
          reason: aiEffect.reason,
        });
        pushVisibleChange(
          visibleChanges,
          target,
          `${value > 0 ? "+" : ""}${value}`,
          value > 0 ? "positive" : "negative",
        );
        break;
      }
      case "hpLoss": {
        const value = -Math.ceil(player.maxHp * hpLossRatio[aiEffect.intensity]);
        effects.push({
          type: "hpDelta",
          value,
          reason: aiEffect.reason,
        });
        pushVisibleChange(visibleChanges, "氣血", `${value}`, "danger");
        break;
      }
      case "lifespanLoss": {
        const value = -lifespanLossValue[aiEffect.intensity];
        effects.push({
          type: "lifespanDelta",
          value,
          reason: aiEffect.reason,
        });
        pushVisibleChange(visibleChanges, "壽元", `${value}`, "danger");
        break;
      }
      case "karmaGain":
      case "destinyGain":
      case "memoryGain": {
        const target: keyof ResourceMap =
          aiEffect.type === "karmaGain"
            ? "karma"
            : aiEffect.type === "destinyGain"
              ? "destiny"
              : "pastLifeMemory";
        const value = Math.min(resourceIntensityValue[aiEffect.intensity], 18);
        effects.push({
          type: "resourceDelta",
          target,
          value,
          reason: aiEffect.reason,
        });
        pushVisibleChange(visibleChanges, target, `+${value}`, "positive");
        break;
      }
      case "statusGain": {
        const target = resolveStatusTarget(aiEffect.target);
        effects.push({
          type: "statusAdd",
          target,
          reason: aiEffect.reason,
        });
        pushVisibleChange(visibleChanges, "狀態", target, "negative");
        break;
      }
      case "eventFlag": {
        effects.push({
          type: "eventFlag",
          target: aiEffect.target ?? responseFlags?.rarity,
          reason: aiEffect.reason,
        });
        pushVisibleChange(visibleChanges, "事件標記", aiEffect.target ?? "奇遇", "neutral");
        break;
      }
      case "reincarnationBonus": {
        const value = Math.min(reincarnationBonusValue[aiEffect.intensity], 0.12);
        effects.push({
          type: "reincarnationPointMultiplierDelta",
          value,
          reason: aiEffect.reason,
        });
        pushVisibleChange(visibleChanges, "輪迴倍率", `+${Math.round(value * 100)}%`, "positive");
        break;
      }
    }
  }

  if (responseFlags?.shouldTriggerDeath) {
    effects.push({
      type: "triggerDeath",
      reason: responseFlags.deathReason ?? responseFlags.logText ?? "此世因 AI 劇情而終結",
    });
    pushVisibleChange(visibleChanges, "死亡", "觸發", "danger");
  }

  if (responseFlags?.shouldTriggerBreakthrough) {
    effects.push({
      type: "breakthroughHint",
      reason: responseFlags.logText ?? "道機已至，可以嘗試突破",
    });
    pushVisibleChange(visibleChanges, "突破", "可嘗試", "positive");
  }

  if (responseFlags?.shouldCompleteWorldObjective) {
    effects.push({
      type: "completeWorldObjective",
      reason: responseFlags.logText ?? "世界目標完成",
    });
    pushVisibleChange(visibleChanges, "世界目標", "完成", "positive");
  }

  return {
    effects,
    visibleChanges,
    balanceWarnings,
  };
}
