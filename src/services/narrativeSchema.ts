import { AI_CONFIG } from "../config/aiConfig";
import type {
  AiNarrativeChoice,
  AiNarrativeChoiceType,
  AiNarrativeMood,
  AiNarrativeResponse,
  AiNarrativeRiskLevel,
  AiSuggestedEffect,
  AiSuggestedEffectIntensity,
  AiSuggestedEffectType,
  EventRarity,
} from "../types";

const moods: AiNarrativeMood[] = [
  "calm",
  "mysterious",
  "danger",
  "epic",
  "breakthrough",
  "death",
];
const rarities: EventRarity[] = ["common", "rare", "epic", "legendary", "mythic"];
const riskLevels: AiNarrativeRiskLevel[] = ["safe", "low", "medium", "high", "fatal"];
const choiceTypes: AiNarrativeChoiceType[] = [
  "cautious",
  "greedy",
  "kind",
  "ruthless",
  "reckless",
  "wise",
];
const effectTypes: AiSuggestedEffectType[] = [
  "cultivationGain",
  "resourceGain",
  "resourceLoss",
  "statGain",
  "statLoss",
  "hpLoss",
  "lifespanLoss",
  "karmaGain",
  "destinyGain",
  "memoryGain",
  "statusGain",
  "eventFlag",
  "reincarnationBonus",
];
const intensities: AiSuggestedEffectIntensity[] = [
  "tiny",
  "small",
  "medium",
  "large",
  "huge",
];

export const AI_NARRATIVE_RESPONSE_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "sceneId",
    "title",
    "content",
    "mood",
    "rarity",
    "choices",
    "suggestedEffects",
    "settlementTags",
    "logText",
    "shouldEndEvent",
    "shouldTriggerDeath",
    "deathReason",
    "shouldTriggerBreakthrough",
    "shouldCompleteWorldObjective",
  ],
  properties: {
    sceneId: { type: "string", minLength: 4, maxLength: 80 },
    title: { type: "string", minLength: 2, maxLength: 40 },
    content: { type: "string", minLength: 60, maxLength: AI_CONFIG.maxContentChars },
    mood: { type: "string", enum: moods },
    rarity: { type: "string", enum: rarities },
    choices: {
      type: "array",
      minItems: 2,
      maxItems: AI_CONFIG.maxChoices,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "choiceId",
          "text",
          "previewText",
          "riskLevel",
          "choiceType",
          "requirementHint",
        ],
        properties: {
          choiceId: { type: "string", minLength: 2, maxLength: 48 },
          text: { type: "string", minLength: 2, maxLength: 44 },
          previewText: { type: "string", minLength: 4, maxLength: 80 },
          riskLevel: { type: "string", enum: riskLevels },
          choiceType: { type: "string", enum: choiceTypes },
          requirementHint: { type: ["string", "null"], maxLength: 80 },
        },
      },
    },
    suggestedEffects: {
      type: "array",
      maxItems: AI_CONFIG.maxSuggestedEffects,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["type", "target", "intensity", "reason"],
        properties: {
          type: { type: "string", enum: effectTypes },
          target: { type: ["string", "null"], maxLength: 48 },
          intensity: { type: "string", enum: intensities },
          reason: { type: "string", minLength: 2, maxLength: 80 },
        },
      },
    },
    settlementTags: {
      type: "array",
      maxItems: 8,
      items: { type: "string", minLength: 1, maxLength: 24 },
    },
    logText: { type: "string", minLength: 4, maxLength: 120 },
    shouldEndEvent: { type: "boolean" },
    shouldTriggerDeath: { type: "boolean" },
    deathReason: { type: ["string", "null"], maxLength: 120 },
    shouldTriggerBreakthrough: { type: "boolean" },
    shouldCompleteWorldObjective: { type: "boolean" },
  },
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isEnumValue<T extends string>(value: unknown, values: readonly T[]): value is T {
  return typeof value === "string" && values.includes(value as T);
}

function validateChoice(value: unknown): value is AiNarrativeChoice {
  if (!isRecord(value)) return false;
  return (
    typeof value.choiceId === "string" &&
    typeof value.text === "string" &&
    typeof value.previewText === "string" &&
    isEnumValue(value.riskLevel, riskLevels) &&
    isEnumValue(value.choiceType, choiceTypes) &&
    (value.requirementHint === undefined ||
      value.requirementHint === null ||
      typeof value.requirementHint === "string")
  );
}

function validateSuggestedEffect(value: unknown): value is AiSuggestedEffect {
  if (!isRecord(value)) return false;
  return (
    isEnumValue(value.type, effectTypes) &&
    isEnumValue(value.intensity, intensities) &&
    typeof value.reason === "string" &&
    (value.target === undefined || value.target === null || typeof value.target === "string")
  );
}

export function validateAiNarrativeResponse(value: unknown): value is AiNarrativeResponse {
  if (!isRecord(value)) return false;
  if (
    typeof value.sceneId !== "string" ||
    typeof value.title !== "string" ||
    typeof value.content !== "string" ||
    value.content.length > AI_CONFIG.maxContentChars ||
    !isEnumValue(value.mood, moods) ||
    !isEnumValue(value.rarity, rarities) ||
    !Array.isArray(value.choices) ||
    value.choices.length < 2 ||
    value.choices.length > AI_CONFIG.maxChoices ||
    !value.choices.every(validateChoice) ||
    !Array.isArray(value.suggestedEffects) ||
    value.suggestedEffects.length > AI_CONFIG.maxSuggestedEffects ||
    !value.suggestedEffects.every(validateSuggestedEffect) ||
    !Array.isArray(value.settlementTags) ||
    !value.settlementTags.every((tag) => typeof tag === "string") ||
    typeof value.logText !== "string" ||
    typeof value.shouldEndEvent !== "boolean" ||
    typeof value.shouldTriggerDeath !== "boolean" ||
    typeof value.shouldTriggerBreakthrough !== "boolean" ||
    typeof value.shouldCompleteWorldObjective !== "boolean"
  ) {
    return false;
  }

  return (
    value.deathReason === undefined ||
    value.deathReason === null ||
    typeof value.deathReason === "string"
  );
}

export function parseAiNarrativeResponse(value: unknown): AiNarrativeResponse {
  if (!validateAiNarrativeResponse(value)) {
    throw new Error("Invalid AI narrative response schema");
  }

  return {
    ...value,
    deathReason: value.deathReason ?? undefined,
    choices: value.choices.map((choice) => ({
      ...choice,
      requirementHint: choice.requirementHint ?? undefined,
    })),
    suggestedEffects: value.suggestedEffects.map((effect) => ({
      ...effect,
      target: effect.target ?? undefined,
    })),
  };
}
