const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-nano";
const OPENAI_TIMEOUT_MS = 28_000;

const WORLDS = {
  world_qingyun: {
    name: "青雲小界",
    type: "ancient_xianxia",
    era: "ancient",
    coreRule: "靈氣稀薄但穩定，適合初入輪迴者，所有機緣都會留下微弱因果。",
    mainObjective: "在壽元耗盡前築基。",
    clearCondition: "踏入築基初期，或找到足以替代築基的青雲道基。",
    terms: ["青雲山門", "外門", "築基", "前世玉符", "輪迴長河"],
    tones: ["傳統修仙", "凡人入道", "築基試煉"],
  },
  world_modern_reiki_city: {
    name: "靈氣復甦都市",
    type: "modern_reiki",
    era: "modern",
    coreRule: "靈氣重新降臨現代社會，城市中出現秘境裂縫與覺醒者。",
    mainObjective: "在城市靈災爆發前找到自己的覺醒源頭。",
    clearCondition: "查明覺醒源頭，並在靈災中保住自身神魂完整。",
    terms: ["靈縫", "異常管理局", "覺醒者", "靈災", "前世終點站"],
    tones: ["現代城市", "異能覺醒", "靈氣污染", "官方管制"],
  },
  world_cyber_immortal_city: {
    name: "賽博仙城",
    type: "cyber_cultivation",
    era: "future",
    coreRule: "經脈可以被改造成義體，功法可以被下載，但天道會監控所有突破行為。",
    mainObjective: "逃離天道監控，完成第一次非法築基。",
    clearCondition: "在天道防火牆鎖定前完成非法築基或取得合法身份覆寫碼。",
    terms: ["非法丹田核心", "黑市功法插件", "天道防火牆", "神識接口", "資本宗門"],
    tones: ["義體", "晶片", "神識網路", "仙道科技"],
  },
  world_stellar_immortal_dynasty: {
    name: "星海仙朝",
    type: "future_stellar",
    era: "future",
    coreRule: "宗門以星艦為山門，洞天被改造成移動殖民地。",
    mainObjective: "在星艦墜毀前取得傳承核心。",
    clearCondition: "帶著傳承核心逃出墜毀星艦，或讓宗門山門重新點火。",
    terms: ["宗門星艦", "洞天殖民艙", "星門", "元神導航", "傳承核心"],
    tones: ["星艦", "洞天殖民", "仙道文明", "星域戰爭"],
  },
  world_shadowless_city: {
    name: "無影城",
    type: "weird_city",
    era: "unknown",
    coreRule: "城中所有人的影子都不屬於自己，名字被念出三次就會被替換。",
    mainObjective: "找回自己的名字與影子。",
    clearCondition: "在名字被替換前找回影子，或承認影子才是真正的自己。",
    terms: ["無影城", "失名告示", "午夜神像", "借影修行", "替名者"],
    tones: ["詭異城市", "規則怪談", "名字污染", "影子失控"],
  },
  world_dharma_wasteland: {
    name: "末法廢土",
    type: "apocalypse",
    era: "future",
    coreRule: "世界靈氣已經枯竭，修煉會消耗不可再生的生命力。",
    mainObjective: "在靈氣完全歸零前找到世界火種。",
    clearCondition: "取得世界火種，並決定救基地、救自己，或救下一世。",
    terms: ["世界火種", "末法基地", "壽元水票", "枯竭靈泉", "飛升者警告"],
    tones: ["末日", "靈氣枯竭", "宗門遺跡", "生存基地"],
  },
  world_seventh_day_loop: {
    name: "第七日輪迴",
    type: "time_loop",
    era: "mixed",
    coreRule: "每七日世界重置一次，但死亡記憶會殘留在神魂上。",
    mainObjective: "在第七日到來前打破時間封鎖。",
    clearCondition: "找到重置源頭，讓第八日真正到來。",
    terms: ["第七日", "回溯傷痕", "牆上警告", "第八日", "因果債務"],
    tones: ["時間循環", "死亡回溯", "因果債務"],
  },
  world_dream_ruins: {
    name: "夢墟",
    type: "dream_realm",
    era: "unknown",
    coreRule: "夢中死亡不會立刻死，但會失去一段記憶。修為越高，越難分清夢與現實。",
    mainObjective: "醒來，或者成為夢境的主人。",
    clearCondition: "辨認真正的醒來之門，或奪取夢墟主權。",
    terms: ["夢墟", "童年記憶", "假師父", "醒來之門", "夢中飛升"],
    tones: ["夢境", "意識", "虛實顛倒", "心魔"],
  },
};

const IDENTITIES = {
  identity_orphan: "山村孤兒",
  identity_outer_disciple: "宗門外門弟子",
  identity_fallen_clan: "沒落世家子弟",
  identity_demonic_reborn: "魔修轉世",
  identity_heavenly_root_genius: "天靈根天才",
  identity_five_root_mortal: "五靈根凡人",
  identity_loose_cultivator_child: "散修之子",
};

const FATES = {
  fate_deep_fortune: "福緣深厚",
  fate_past_wisdom: "前世宿慧",
  fate_ordinary_bones: "凡骨不凡",
  fate_short_lived: "短命之相",
  fate_natural_dao_body: "天生道體",
};

const LIFE_THEMES = {
  life_theme_mortal_bone_defies_immortal: "凡骨逆仙",
  life_theme_demonic_thought_wakes: "魔念初醒",
  life_theme_causality_misaligned: "因果錯位",
  life_theme_destiny_thief: "天命竊賊",
  life_theme_shadow_ascends_first: "影子先成仙",
  life_theme_ai_heaven_rejects_you: "AI 天道判定你不該存在",
  life_theme_world_already_dead: "世界其實已經死了",
  life_theme_future_downloads_past_art: "你在未來世界下載了前世功法",
};

const STAGE_LABELS = {
  early: "初期",
  middle: "中期",
  late: "後期",
  perfect: "圓滿",
};

const REALM_TRACKS = {
  qi_refining: "練氣",
  foundation: "築基",
  core_formation: "金丹",
  nascent_soul: "元嬰",
  spirit_transformation: "化神",
  void_refinement: "煉虛",
  integration: "合體",
  mahayana: "大乘",
  tribulation: "渡劫",
  true_immortal: "真仙",
};

const AI_NOVEL_SCENE_JSON_SCHEMA = {
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
};

function getOpenAiApiKey() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");
  return apiKey;
}

export function parseBody(request) {
  return typeof request.body === "string" ? JSON.parse(request.body) : request.body;
}

export function toApiErrorPayload(error, fallback) {
  if (!(error instanceof Error)) return { error: fallback };
  return {
    error: error.message || fallback,
    code: error.code,
    type: error.type,
  };
}

function realmName(realmId) {
  if (!realmId || realmId === "realm_mortal") return "凡人";
  const match = String(realmId).match(/^realm_(.+)_(early|middle|late|perfect)$/);
  if (!match) return "未知境界";
  return `${REALM_TRACKS[match[1]] ?? "未知境界"}${STAGE_LABELS[match[2]] ?? ""}`;
}

function buildSystemPrompt() {
  return [
    "你是跨世界輪迴互動小說生成器。",
    "你生成的是完整小說片段，不是事件卡；玩家看到的只有小說內容與選項。",
    "不要輸出系統提示、數值、收益預覽、debug 訊息，也不要提到 JSON 或 prompt。",
    "所有遊戲效果必須放入 hiddenEffects，正文不得寫修為 +100、氣血 -20 這類數字。",
    "storyText 必須自然、連續、有情緒、有懸念；除死亡或結算外，最後必須自然停在抉擇點。",
    "劇情可跨古代、現代、未來、詭異、末日、夢境、時間循環，但必須符合當前世界規則與 LifeTheme。",
    "避免重複採藥、老者、殘卷、山洞、普通心魔；若使用常見修仙元素，必須加入反轉。",
    "玩家選擇必須像命運分歧，不是功能按鈕；每個選項具體、有代價、有畫面。",
    "displayLines 必須由 storyText 拆成適合閱讀器逐行顯示的短行。",
  ].join("\n");
}

function buildFewShot() {
  return [
    "反套路範例：",
    "不要寫：你在山洞中撿到一本功法。",
    "改成：你在山洞中看見一本功法，可翻開第一頁後，紙上寫的不是法訣，而是你上一世死前留下的遺言。更詭異的是，最後一行墨跡未乾，像是剛剛才有人替你寫下。",
    "不要寫：你在城市中覺醒了靈力。",
    "改成：你在捷運末班車上醒來，車廂裡所有乘客都低頭看著手機。螢幕上顯示著同一句話：「請勿在本節車廂內修煉。」下一秒，窗外站名亮起，卻不是任何一個你熟悉的站，而是「前世終點」。",
    "不要寫：你獲得了修真晶片。",
    "改成：義體診所的燈忽明忽暗。醫師替你打開胸腔時，忽然沉默下來。你的丹田位置早已被人植入一枚黑色核心，核心表面浮現出一行細小字跡：「此人已於三百年前飛升失敗，禁止再次築基。」",
  ].join("\n");
}

function buildPrompt(kind, payload) {
  const player = payload?.playerSnapshot ?? {};
  const life = payload?.lifeState ?? {};
  const meta = payload?.metaProgress ?? {};
  const novel = payload?.novelState ?? {};
  const world = WORLDS[life.worldId] ?? WORLDS[player.currentWorldId] ?? WORLDS.world_qingyun;
  const resources = player.resources ?? {};
  const recentStory = Array.isArray(novel.visibleStory)
    ? novel.visibleStory.slice(-3).map((block) => `${block.chapterTitle}：${String(block.storyText ?? "").slice(0, 180)}`).join("\n")
    : "尚無前文。";
  const selectedChoice = payload?.selectedChoice?.text
    ? `玩家上一個選擇：${payload.selectedChoice.text}（${payload.selectedChoice.tone}）`
    : "玩家上一個選擇：無。";
  const task =
    kind === "start"
      ? "生成本世開篇小說，展現世界、身份、命格與 LifeTheme，結尾停在第一個命運抉擇點。"
      : kind === "death"
        ? "生成死亡小說，不要直接說你死了，要描寫此世崩落與輪迴長河接近。"
        : kind === "settlement"
          ? "生成輪迴結算小說，清算本世因果、遺物、輪迴點與下一世影響。"
          : "根據玩家選擇續寫下一段完整小說，選擇後果自然進入劇情。";

  return [
    `任務：${task}`,
    "",
    "世界設定：",
    `世界：${world.name}`,
    `類型：${world.type}`,
    `時代：${world.era}`,
    `氛圍：${world.tones.join("、")}`,
    `核心規則：${world.coreRule}`,
    `主目標：${world.mainObjective}`,
    `通關條件：${world.clearCondition}`,
    `特殊名詞：${world.terms.join("、")}`,
    "",
    "玩家底層狀態：",
    `身份：${IDENTITIES[player.identityId] ?? "異世旅人"}`,
    `命格：${FATES[player.fateId] ?? "命格未明"}`,
    `本世主題：${LIFE_THEMES[life.lifeThemeId] ?? "命盤自生"}`,
    `境界 / 生命層級：${realmName(player.realmId)}`,
    `年齡 / 壽元：${player.age ?? 0}/${player.lifespan ?? 0}`,
    `氣血：${player.hp ?? 0}/${player.maxHp ?? 0}`,
    `因果 / 天命 / 前世記憶：${resources.karma ?? 0}/${resources.destiny ?? 0}/${resources.pastLifeMemory ?? 0}`,
    `已持有遺物：${[...(meta.legacyRelicIds ?? []), ...(meta.worldLegacyIds ?? [])].slice(0, 8).join("、") || "無"}`,
    "",
    "本世敘事狀態：",
    `當前篇章：${novel.currentArc || "開篇"}`,
    `劇情摘要：${novel.storySoFarSummary || "尚未展開"}`,
    `張力：${novel.hiddenState?.tensionLevel ?? "low"}`,
    `未解謎團：${novel.hiddenState?.unresolvedMysteries?.join("、") || "無"}`,
    `近期母題：${novel.hiddenState?.recentMotifs?.join("、") || "無"}`,
    "",
    "最近劇情：",
    recentStory,
    "",
    selectedChoice,
    "",
    buildFewShot(),
    "",
    "輸出要求：",
    kind === "start" ? "開篇約 800 到 1500 字。" : "一般接續約 600 到 1200 字；死亡或結算約 800 到 1500 字。",
    "每段必須包含場景、行動、心境、衝突、結果或懸念。",
    "非死亡/結算場景 choices 必須 2 到 4 個；死亡/結算場景 choices 可為空。",
    "hiddenEffects 只能用 intensity，不可給具體數字。",
    "internalSummary 用 120 字內摘要本段關鍵因果，供下一段續寫。",
    "noveltyHints 寫出本段的新奇點、反轉或跨世界元素。",
  ].join("\n");
}

function extractOutputText(payload) {
  if (typeof payload.output_text === "string") return payload.output_text;
  return payload.output
    ?.flatMap((item) => item.content ?? [])
    .find((content) => content.type === "output_text" && content.text)
    ?.text;
}

function validateScene(value) {
  return (
    value &&
    typeof value.sceneId === "string" &&
    typeof value.chapterTitle === "string" &&
    typeof value.storyText === "string" &&
    Array.isArray(value.displayLines) &&
    Array.isArray(value.choices) &&
    Array.isArray(value.hiddenEffects) &&
    value.storyState &&
    typeof value.internalSummary === "string" &&
    Array.isArray(value.noveltyHints)
  );
}

const staleMotifs = ["採藥", "采藥", "殘卷", "老者", "山洞", "靈泉", "普通突破", "普通心魔"];
const twistMotifs = ["時間錯位", "輪迴記憶", "前世", "世界規則", "身份反轉", "遺物", "因果代價", "詭異", "天道", "科技", "AI", "系統", "下一世", "名字", "影子", "錯誤碼", "站台", "防火牆", "夢"];

function noveltyScore(scene) {
  const text = `${scene.chapterTitle}\n${scene.storyText}\n${scene.noveltyHints.join(" ")}`;
  const stale = staleMotifs.filter((word) => text.includes(word)).length;
  const twist = twistMotifs.filter((word) => text.includes(word)).length;
  const hasTwist = /不是|卻|竟|原來|其實|上一世|下一世|不存在|三百年/.test(text);
  const score = Math.max(0, Math.min(100, 48 + twist * 8 - stale * 9 + (hasTwist ? 10 : 0)));
  return {
    score,
    reasons: [
      stale ? `含有 ${stale} 個常見套路元素` : "",
      twist ? `含有 ${twist} 個反套路或跨世界元素` : "",
      hasTwist ? "有明確反轉語氣" : "",
    ].filter(Boolean),
    shouldRegenerate: score < 55,
  };
}

async function callOpenAi(prompt, maxOutputTokens) {
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
        model: MODEL,
        instructions: buildSystemPrompt(),
        input: prompt,
        max_output_tokens: maxOutputTokens,
        temperature: 0.72,
        store: false,
        text: {
          format: {
            type: "json_schema",
            name: "novel_scene",
            strict: true,
            schema: AI_NOVEL_SCENE_JSON_SCHEMA,
          },
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
    const scene = JSON.parse(outputText);
    if (!validateScene(scene)) throw new Error("Invalid novel scene schema");
    return scene;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function generateNovelScene(kind, payload) {
  const maxOutputTokens = kind === "settlement" || kind === "death" ? 1800 : 2400;
  const prompt = buildPrompt(kind, payload);
  let scene = await callOpenAi(prompt, maxOutputTokens);
  let novelty = noveltyScore(scene);

  if (novelty.shouldRegenerate && kind !== "settlement") {
    scene = await callOpenAi(
      `${prompt}\n\n上一版新奇度不足：${novelty.reasons.join("、")}。請重寫，加入世界規則異常、前世衝突、因果代價或跨世界反轉。`,
      maxOutputTokens,
    );
    novelty = noveltyScore(scene);
  }

  return {
    ...scene,
    noveltyHints: Array.from(new Set([...(scene.noveltyHints ?? []), ...novelty.reasons])).slice(0, 8),
  };
}

export default function handler(_request, response) {
  response.status(404).json({
    ok: false,
    error: "This helper module is not a public narrative endpoint.",
  });
}
