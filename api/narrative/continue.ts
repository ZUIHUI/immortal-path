const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const NARRATIVE_MODEL = "gpt-4.1-nano";
const OPENAI_TIMEOUT_MS = 20_000;
const MAX_OUTPUT_TOKENS = 520;
const TEMPERATURE = 0.5;

const STAGES = [
  ["early", "初期"],
  ["middle", "中期"],
  ["late", "後期"],
  ["perfect", "圓滿"],
] as const;
const REALM_TRACKS = [
  ["qi_refining", "練氣"],
  ["foundation", "築基"],
  ["core_formation", "金丹"],
  ["nascent_soul", "元嬰"],
  ["spirit_transformation", "化神"],
  ["void_refinement", "煉虛"],
  ["integration", "合體"],
  ["mahayana", "大乘"],
  ["tribulation", "渡劫"],
  ["true_immortal", "真仙"],
] as const;
const REALM_NAMES: Record<string, string> = {
  realm_mortal: "凡人",
  ...Object.fromEntries(
    REALM_TRACKS.flatMap(([track, name]) =>
      STAGES.map(([stage, label]) => [`realm_${track}_${stage}`, `${name}${label}`]),
    ),
  ),
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

const COMPACT_NARRATIVE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["id", "t", "c", "m", "r", "ch", "e", "tags", "log", "end", "dead", "dr", "bt", "done"],
  properties: {
    id: { type: "string", minLength: 3, maxLength: 36 },
    t: { type: "string", minLength: 2, maxLength: 24 },
    c: { type: "string", minLength: 36, maxLength: 150 },
    m: { type: "string", enum: ["calm", "mysterious", "danger", "epic", "breakthrough", "death"] },
    r: { type: "string", enum: ["common", "rare", "epic", "legendary", "mythic"] },
    ch: {
      type: "array",
      minItems: 2,
      maxItems: 2,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "tx", "pv", "risk", "type", "req"],
        properties: {
          id: { type: "string", minLength: 2, maxLength: 24 },
          tx: { type: "string", minLength: 2, maxLength: 28 },
          pv: { type: "string", minLength: 4, maxLength: 44 },
          risk: { type: "string", enum: ["safe", "low", "medium", "high", "fatal"] },
          type: { type: "string", enum: ["cautious", "greedy", "kind", "ruthless", "reckless", "wise"] },
          req: { type: ["string", "null"], maxLength: 28 },
        },
      },
    },
    e: {
      type: "array",
      maxItems: 2,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["k", "tgt", "in", "why"],
        properties: {
          k: {
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
          tgt: { type: ["string", "null"], maxLength: 32 },
          in: { type: "string", enum: ["tiny", "small", "medium", "large", "huge"] },
          why: { type: "string", minLength: 2, maxLength: 36 },
        },
      },
    },
    tags: { type: "array", maxItems: 3, items: { type: "string", minLength: 1, maxLength: 12 } },
    log: { type: "string", minLength: 4, maxLength: 60 },
    end: { type: "boolean" },
    dead: { type: "boolean" },
    dr: { type: ["string", "null"], maxLength: 60 },
    bt: { type: "boolean" },
    done: { type: "boolean" },
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
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  return apiKey;
}

function toApiErrorPayload(error: unknown, fallback: string) {
  if (!(error instanceof Error)) return { error: fallback };
  const apiError = error as Error & { code?: string | number; type?: string };
  return { error: error.message, code: apiError.code, type: apiError.type };
}

function sanitizeText(value: unknown, fallback = ""): string {
  if (typeof value !== "string") return fallback;
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

function expandCompactNarrative(value: any) {
  return {
    sceneId: String(value.id ?? `scene_${Date.now()}`),
    title: sanitizeText(value.t, "青雲奇遇"),
    content: sanitizeText(value.c, "雲霧深處靈機浮動，一場抉擇悄然降臨。"),
    mood: value.m ?? "mysterious",
    rarity: value.r ?? "common",
    choices: Array.isArray(value.ch)
      ? value.ch.map((choice: any) => ({
          choiceId: String(choice.id ?? `choice_${Math.random().toString(36).slice(2, 8)}`),
          text: sanitizeText(choice.tx, "謹慎前行"),
          previewText: sanitizeText(choice.pv, "可能帶來機緣，也暗藏風險。"),
          riskLevel: choice.risk ?? "low",
          choiceType: choice.type ?? "wise",
          requirementHint:
            choice.req === null || choice.req === undefined ? undefined : sanitizeText(choice.req),
        }))
      : [],
    suggestedEffects: Array.isArray(value.e)
      ? value.e.map((effect: any) => ({
          type: effect.k ?? "cultivationGain",
          target: effect.tgt ?? undefined,
          intensity: effect.in ?? "small",
          reason: sanitizeText(effect.why, "機緣牽引"),
        }))
      : [],
    settlementTags: Array.isArray(value.tags)
      ? value.tags.map((tag: unknown) => sanitizeText(tag, "奇遇"))
      : [],
    logText: sanitizeText(value.log, "你經歷了一場奇遇。"),
    shouldEndEvent: Boolean(value.end),
    shouldTriggerDeath: Boolean(value.dead),
    deathReason: value.dr === null || value.dr === undefined ? undefined : sanitizeText(value.dr),
    shouldTriggerBreakthrough: Boolean(value.bt),
    shouldCompleteWorldObjective: Boolean(value.done),
  };
}

function extractOutputText(payload: any): string | undefined {
  if (payload.output_text) return payload.output_text;
  return payload.output
    ?.flatMap((item: any) => item.content ?? [])
    .find((content: any) => content.type === "output_text" && content.text)
    ?.text;
}

function buildSystemPrompt(): string {
  return "繁中修仙續寫，只回短鍵JSON。可見文字全中文無英文/底線/ID。c約70-110字，ch兩個，e最多兩個。數值只放e。修為達門檻可bt=true自動破境。done僅已達築基初期才true。";
}

function getStoryCue(realmId: string | undefined): string {
  if (!realmId || realmId === "realm_mortal" || realmId.includes("qi_refining")) return "青雲入道，凡骨逆命，目標築基";
  if (realmId.includes("foundation")) return "道基山河，內門爭鋒，目標金丹";
  if (realmId.includes("core_formation")) return "金丹立誓，丹火淬道，目標元嬰";
  if (realmId.includes("nascent_soul")) return "元嬰出竅，前世殘影，目標化神";
  if (realmId.includes("spirit_transformation")) return "化神問道，界壁裂隙，目標煉虛";
  if (realmId.includes("void_refinement")) return "煉虛觀界，因果界河，目標合體";
  if (realmId.includes("integration")) return "合體鎮界，法相守門，目標大乘";
  if (realmId.includes("mahayana")) return "大乘立道，眾生命數，目標渡劫";
  if (realmId.includes("tribulation")) return "渡劫飛升，雷海清算，目標真仙";
  return "真仙命盤，補天古卷，追尋輪迴源頭";
}

function buildContinuePrompt(payload: any): string {
  const player = payload?.playerSnapshot ?? {};
  const scene = payload?.currentNarrativeState ?? {};
  const choice = payload?.selectedChoice ?? {};
  const recentLogs = Array.isArray(payload?.recentLogs)
    ? payload.recentLogs.slice(0, 2).map((log: any) => String(log.message ?? log).slice(0, 48))
    : [];

  return [
    "續寫",
    `境:${displayName(REALM_NAMES, player.realmId, "未知境界")} 修:${player.cultivation ?? 0}`,
    `篇:${getStoryCue(player.realmId)}`,
    `輪:${payload?.lifeState?.storySeed ?? "未知"} 開:${payload?.lifeState?.storyPremiseId ?? "未知"}`,
    `目標:達築基初期；未達則done=false`,
    `悟福心:${player.comprehension ?? 0}/${player.luck ?? 0}/${player.daoHeart ?? 0}`,
    `前:${sanitizeText(`${scene.title ?? ""} ${scene.content ?? ""}`).slice(0, 110)}`,
    `選:${sanitizeText(choice.text ?? "", "未知選擇")} 風:${sanitizeText(choice.riskLevel ?? "", "未知")}`,
    recentLogs.length ? `近:${recentLogs.join("；")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
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
          format: { type: "json_schema", name: "n", strict: true, schema: COMPACT_NARRATIVE_SCHEMA },
        },
      }),
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = payload.error?.message ?? response.statusText;
      throw new Error([`status=${response.status}`, payload.error?.code, payload.error?.type, message].filter(Boolean).join(" "));
    }
    const outputText = extractOutputText(payload);
    if (!outputText) throw new Error("OpenAI response did not include output_text");
    return expandCompactNarrative(JSON.parse(outputText));
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
