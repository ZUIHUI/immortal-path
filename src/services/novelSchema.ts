import type { AiHiddenEffect, AiNovelChoice, AiNovelScene } from "../types";

export const AI_NOVEL_SCENE_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "sceneId",
    "chapterTitle",
    "storyText",
    "displayLines",
    "choices",
    "hiddenEffects",
    "storyState",
    "internalSummary",
    "noveltyHints",
  ],
  properties: {
    sceneId: { type: "string", minLength: 3, maxLength: 64 },
    chapterTitle: { type: "string", minLength: 2, maxLength: 40 },
    storyText: { type: "string", minLength: 200, maxLength: 3200 },
    displayLines: {
      type: "array",
      minItems: 3,
      maxItems: 36,
      items: { type: "string", minLength: 1, maxLength: 220 },
    },
    choices: {
      type: "array",
      minItems: 0,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["choiceId", "text", "tone"],
        properties: {
          choiceId: { type: "string", minLength: 2, maxLength: 48 },
          text: { type: "string", minLength: 6, maxLength: 80 },
          tone: {
            type: "string",
            enum: ["cautious", "greedy", "kind", "ruthless", "reckless", "wise", "defy_fate"],
          },
        },
      },
    },
    hiddenEffects: {
      type: "array",
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["type", "target", "intensity", "reason"],
        properties: {
          type: {
            type: "string",
            enum: [
              "cultivationGain",
              "realmProgress",
              "hpLoss",
              "lifespanLoss",
              "resourceGain",
              "resourceLoss",
              "karmaGain",
              "destinyGain",
              "memoryGain",
              "legacyRelicGain",
              "statusGain",
              "breakthroughOpportunity",
              "death",
              "worldClear",
              "settlementBonus",
            ],
          },
          target: { type: ["string", "null"], maxLength: 64 },
          intensity: { type: "string", enum: ["tiny", "small", "medium", "large", "huge"] },
          reason: { type: "string", minLength: 2, maxLength: 80 },
        },
      },
    },
    storyState: {
      type: "object",
      additionalProperties: false,
      required: [
        "shouldContinue",
        "isDeathScene",
        "isSettlementScene",
        "isWorldClearScene",
        "currentArc",
        "tensionLevel",
      ],
      properties: {
        shouldContinue: { type: "boolean" },
        isDeathScene: { type: "boolean" },
        isSettlementScene: { type: "boolean" },
        isWorldClearScene: { type: "boolean" },
        currentArc: { type: "string", minLength: 2, maxLength: 80 },
        tensionLevel: { type: "string", enum: ["low", "medium", "high", "climax"] },
      },
    },
    internalSummary: { type: "string", minLength: 10, maxLength: 700 },
    noveltyHints: {
      type: "array",
      maxItems: 8,
      items: { type: "string", minLength: 1, maxLength: 80 },
    },
  },
} as const;

const choiceTones = ["cautious", "greedy", "kind", "ruthless", "reckless", "wise", "defy_fate"] as const;
const hiddenEffectTypes = [
  "cultivationGain",
  "realmProgress",
  "hpLoss",
  "lifespanLoss",
  "resourceGain",
  "resourceLoss",
  "karmaGain",
  "destinyGain",
  "memoryGain",
  "legacyRelicGain",
  "statusGain",
  "breakthroughOpportunity",
  "death",
  "worldClear",
  "settlementBonus",
] as const;
const intensities = ["tiny", "small", "medium", "large", "huge"] as const;
const tensionLevels = ["low", "medium", "high", "climax"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isEnum<T extends string>(value: unknown, values: readonly T[]): value is T {
  return typeof value === "string" && values.includes(value as T);
}

function isChoice(value: unknown): value is AiNovelChoice {
  return (
    isRecord(value) &&
    typeof value.choiceId === "string" &&
    typeof value.text === "string" &&
    isEnum(value.tone, choiceTones)
  );
}

function isHiddenEffect(value: unknown): value is AiHiddenEffect {
  return (
    isRecord(value) &&
    isEnum(value.type, hiddenEffectTypes) &&
    (value.target === undefined || value.target === null || typeof value.target === "string") &&
    isEnum(value.intensity, intensities) &&
    typeof value.reason === "string"
  );
}

export function validateAiNovelScene(value: unknown): value is AiNovelScene {
  if (!isRecord(value)) return false;
  if (
    typeof value.sceneId !== "string" ||
    typeof value.chapterTitle !== "string" ||
    typeof value.storyText !== "string" ||
    !Array.isArray(value.displayLines) ||
    !Array.isArray(value.choices) ||
    !Array.isArray(value.hiddenEffects) ||
    !Array.isArray(value.noveltyHints) ||
    typeof value.internalSummary !== "string" ||
    !isRecord(value.storyState)
  ) {
    return false;
  }

  return (
    value.displayLines.every((line) => typeof line === "string") &&
    value.choices.length <= 4 &&
    value.choices.every(isChoice) &&
    value.hiddenEffects.every(isHiddenEffect) &&
    typeof value.storyState.shouldContinue === "boolean" &&
    typeof value.storyState.isDeathScene === "boolean" &&
    typeof value.storyState.isSettlementScene === "boolean" &&
    typeof value.storyState.isWorldClearScene === "boolean" &&
    typeof value.storyState.currentArc === "string" &&
    isEnum(value.storyState.tensionLevel, tensionLevels) &&
    value.noveltyHints.every((hint) => typeof hint === "string")
  );
}

export function parseAiNovelScene(value: unknown): AiNovelScene {
  if (!validateAiNovelScene(value)) {
    throw new Error("Invalid novel scene schema");
  }

  return {
    ...value,
    hiddenEffects: value.hiddenEffects.map((effect) => ({
      ...effect,
      target: effect.target ?? undefined,
    })),
  };
}
