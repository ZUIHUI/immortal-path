const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const NARRATIVE_MODEL = "gpt-4.1-nano";
const OPENAI_TIMEOUT_MS = 24_000;
const MAX_OUTPUT_TOKENS = 750;
const TEMPERATURE = 0.55;

const REALM_NAMES: Record<string, string> = {
  realm_mortal: "凡人",
  realm_qi_refining_early: "練氣初期",
  realm_qi_refining_middle: "練氣中期",
  realm_qi_refining_late: "練氣後期",
  realm_qi_refining_perfect: "練氣圓滿",
  realm_foundation_early: "築基初期",
};

const TEXT_REPLACEMENTS: Record<string, string> = {
  ...REALM_NAMES,
  world_qingyun: "青雲小界",
  identity_orphan: "山村孤兒",
  identity_outer_disciple: "宗門外門弟子",
  identity_fallen_clan: "沒落世家子弟",
  fate_deep_fortune: "福緣深厚",
  fate_past_wisdom: "前世宿慧",
  fate_ordinary_bones: "凡骨不凡",
  fate_short_lived: "短命之相",
  fate_natural_dao_body: "天生道體",
  common: "普通",
  rare: "稀有",
  epic: "史詩",
  legendary: "傳說",
  mythic: "神話",
  calm: "靜謐",
  mysterious: "詭秘",
  danger: "危機",
  breakthrough: "道機",
  death: "死劫",
  safe: "穩妥",
  low: "低風險",
  medium: "中風險",
  high: "高風險",
  fatal: "死劫",
  cautious: "謹慎",
  greedy: "貪念",
  kind: "仁善",
  ruthless: "狠絕",
  reckless: "莽撞",
  wise: "明悟",
  spiritStones: "靈石",
  aura: "靈氣",
  pills: "丹藥",
  herbs: "靈草",
  artifacts: "法器",
  destiny: "天命",
  karma: "因果",
  pastLifeMemory: "前世記憶",
  spiritualRoot: "靈根",
  maxHp: "氣血上限",
  divineSense: "神識",
  attack: "攻擊",
  defense: "防禦",
  comprehension: "悟性",
  luck: "福緣",
  daoHeart: "道心",
  lifespan: "壽元",
  injured: "受傷",
  weak: "虛弱",
  heart_demon: "心魔",
};

const AI_NARRATIVE_RESPONSE_JSON_SCHEMA = {
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
    content: { type: "string", minLength: 40, maxLength: 180 },
    mood: {
      type: "string",
      enum: ["calm", "mysterious", "danger", "epic", "breakthrough", "death"],
    },
    rarity: {
      type: "string",
      enum: ["common", "rare", "epic", "legendary", "mythic"],
    },
    choices: {
      type: "array",
      minItems: 2,
      maxItems: 2,
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
          riskLevel: {
            type: "string",
            enum: ["safe", "low", "medium", "high", "fatal"],
          },
          choiceType: {
            type: "string",
            enum: ["cautious", "greedy", "kind", "ruthless", "reckless", "wise"],
          },
          requirementHint: { type: ["string", "null"], maxLength: 80 },
        },
      },
    },
    suggestedEffects: {
      type: "array",
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["type", "target", "intensity", "reason"],
        properties: {
          type: {
            type: "string",
            enum: [
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
            ],
          },
          target: { type: ["string", "null"], maxLength: 48 },
          intensity: {
            type: "string",
            enum: ["tiny", "small", "medium", "large", "huge"],
          },
          reason: { type: "string", minLength: 2, maxLength: 80 },
        },
      },
    },
    settlementTags: {
      type: "array",
      maxItems: 6,
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

function parseBody(request: { body?: unknown }) {
  return typeof request.body === "string" ? JSON.parse(request.body) : request.body;
}

function displayName(map: Record<string, string>, id: unknown, fallback: string): string {
  return typeof id === "string" ? (map[id] ?? id) : fallback;
}

function getOpenAiApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  return apiKey;
}

function toApiErrorPayload(error: unknown, fallback: string) {
  if (!(error instanceof Error)) {
    return { error: fallback };
  }

  const apiError = error as Error & {
    code?: string | number;
    type?: string;
  };

  return {
    error: error.message,
    code: apiError.code,
    type: apiError.type,
  };
}

function extractOutputText(payload: any): string | undefined {
  if (payload.output_text) {
    return payload.output_text;
  }

  return payload.output
    ?.flatMap((item: any) => item.content ?? [])
    .find((content: any) => content.type === "output_text" && content.text)
    ?.text;
}

function sanitizeText(value: unknown, fallback = ""): string {
  if (typeof value !== "string") {
    return fallback;
  }

  let text = value;

  for (const [from, to] of Object.entries(TEXT_REPLACEMENTS)) {
    text = text.replaceAll(from, to);
  }

  text = text
    .replace(/\b[a-zA-Z][a-zA-Z0-9_]*\b/g, "")
    .replace(/_+/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return text || fallback;
}

function sanitizeNarrativeResponse(value: any) {
  return {
    ...value,
    title: sanitizeText(value.title, "青雲奇遇"),
    content: sanitizeText(value.content, "雲霧深處靈機浮動，一場抉擇悄然降臨。"),
    logText: sanitizeText(value.logText, "你經歷了一場奇遇。"),
    deathReason:
      value.deathReason === null || value.deathReason === undefined
        ? value.deathReason
        : sanitizeText(value.deathReason),
    settlementTags: Array.isArray(value.settlementTags)
      ? value.settlementTags.map((tag: unknown) => sanitizeText(tag, "奇遇"))
      : [],
    choices: Array.isArray(value.choices)
      ? value.choices.map((choice: any) => ({
          ...choice,
          text: sanitizeText(choice.text, "謹慎前行"),
          previewText: sanitizeText(choice.previewText, "可能帶來機緣，也暗藏風險。"),
          requirementHint:
            choice.requirementHint === null || choice.requirementHint === undefined
              ? choice.requirementHint
              : sanitizeText(choice.requirementHint),
        }))
      : value.choices,
    suggestedEffects: Array.isArray(value.suggestedEffects)
      ? value.suggestedEffects.map((effect: any) => ({
          ...effect,
          reason: sanitizeText(effect.reason, "機緣牽引"),
        }))
      : value.suggestedEffects,
  };
}

function buildSystemPrompt(): string {
  return [
    "你是文字修仙遊戲的小說式敘事引擎，只輸出符合 JSON schema 的 JSON。",
    "content 用繁中修仙小說語氣，約 80 到 140 字，有事件延續、結果與下一步張力。",
    "不要提到 AI、模型、prompt、JSON、系統提示；正文不要寫精確數值獎勵。",
    "title、content、choices.text、previewText、logText、settlementTags、reason 必須全中文，不得出現英文字母、底線、ID、enum 值。",
    "choices 固定 2 個；suggestedEffects 最多 3 個，只能用 tiny/small/medium/large/huge。",
    "AI 只能建議 suggestedEffects，實際數值由遊戲核心計算。",
  ].join("\n");
}

function buildContinuePrompt(payload: any): string {
  const player = payload?.playerSnapshot ?? {};
  const scene = payload?.currentNarrativeState ?? {};
  const choice = payload?.selectedChoice ?? {};
  const recentLogs = Array.isArray(payload?.recentLogs)
    ? payload.recentLogs.slice(0, 5)
    : [];

  return [
    "任務：根據玩家上一個選擇，生成下一段修仙小說式事件結果或延續。",
    `境界：${displayName(REALM_NAMES, player.realmId, "未知境界")}，修為 ${player.cultivation ?? 0}`,
    `悟性/福緣/道心：${player.comprehension ?? 0}/${player.luck ?? 0}/${player.daoHeart ?? 0}`,
    `上一段事件：${scene.title ?? ""} ${scene.content ?? ""}`,
    `玩家選擇：${sanitizeText(choice.text ?? "", "未知選擇")}，風險 ${sanitizeText(choice.riskLevel ?? "", "未知")}`,
    `最近修仙日誌：${JSON.stringify(recentLogs)}`,
    "安全選擇低風險小收益；貪婪/莽撞可提高 rarity 或風險。",
    "內部 target 白名單只可用於 JSON 欄位，不可寫進任何玩家看見的文字。",
  ].join("\n");
}

async function callOpenAi(prompt: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

  try {
    const response = await fetch(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getOpenAiApiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: NARRATIVE_MODEL,
        instructions: buildSystemPrompt(),
        input: prompt,
        max_output_tokens: MAX_OUTPUT_TOKENS,
        temperature: TEMPERATURE,
        store: false,
        text: {
          format: {
            type: "json_schema",
            name: "ai_narrative_scene",
            strict: true,
            schema: AI_NARRATIVE_RESPONSE_JSON_SCHEMA,
          },
        },
      }),
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = payload.error?.message ?? response.statusText;
      throw new Error(
        [`status=${response.status}`, payload.error?.code, payload.error?.type, message]
          .filter(Boolean)
          .join(" "),
      );
    }

    const outputText = extractOutputText(payload);

    if (!outputText) {
      throw new Error("OpenAI response did not include output_text");
    }

    return sanitizeNarrativeResponse(JSON.parse(outputText));
  } finally {
    clearTimeout(timeoutId);
  }
}

export default async function handler(request: any, response: any) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    response.status(200).json(await callOpenAi(buildContinuePrompt(parseBody(request))));
  } catch (error) {
    console.error("[narrative] continue route failed", error);
    response
      .status(500)
      .json(toApiErrorPayload(error, "Failed to continue AI narrative scene"));
  }
}
