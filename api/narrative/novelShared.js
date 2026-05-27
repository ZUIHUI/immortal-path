const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";

function normalizeOpenAiModelSlug(value, fallback) {
  const model = String(value ?? "").trim();
  if (!model) return fallback;

  const aliases = {
    "gpt-5.5-thinking": "gpt-5.5",
    "gpt-5.5-pro": "gpt-5.5",
    "gpt-5.5-instant": "gpt-5.4-mini",
    "gpt-5.5-mini": "gpt-5.4-mini",
  };

  return aliases[model.toLowerCase()] ?? model;
}

const MAIN_MODEL =
  normalizeOpenAiModelSlug(process.env.OPENAI_NOVEL_MODEL ?? process.env.OPENAI_MODEL, "gpt-5.5");
const QUICK_MODEL =
  normalizeOpenAiModelSlug(process.env.OPENAI_NOVEL_QUICK_MODEL ?? process.env.OPENAI_MODEL, "gpt-5.4-mini");
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
    "除必要世界名詞如「AI 天道」外，請使用自然繁體中文，不要突然插入 unknown、status、risk、debug、JSON、system 這類出戲字樣。",
    "displayLines 必須由 storyText 拆成適合閱讀器逐行顯示的短行。",
  ].join("\n");
}

const FEW_SHOTS = [
  [
    "不要寫：你在山洞中撿到一本功法。",
    "改成：你在山洞中看見一本功法，可翻開第一頁後，紙上寫的不是法訣，而是你上一世死前留下的遺言。更詭異的是，最後一行墨跡未乾，像是剛剛才有人替你寫下。",
  ],
  [
    "不要寫：外門弟子欺負你。",
    "改成：外門弟子堵住你時，為首那人卻突然叫出一個你從未聽過的名字。那不是你的名字，卻讓胸口的前世玉符微微發燙。",
  ],
  [
    "不要寫：你修為滿了，可以突破。",
    "改成：這一夜你沒有修煉，丹田中的靈氣卻自行運轉。內視時，你看見另一個自己盤坐其中，已先你一步踏入下一層境界。",
  ],
  [
    "不要寫：你在城市中覺醒了靈力。",
    "改成：你在捷運末班車上醒來，車廂裡所有乘客都低頭看著手機。螢幕同時顯示：「請勿在本節車廂內修煉。」窗外站名亮起，卻是「前世終點」。",
  ],
  [
    "不要寫：你獲得了修真晶片。",
    "改成：義體診所的燈忽明忽暗。醫師替你打開胸腔時忽然沉默，因為你的丹田早被植入黑色核心，表面寫著：「此人已於三百年前飛升失敗，禁止再次築基。」",
  ],
  [
    "不要寫：你被怪物追殺。",
    "改成：追你的不是怪物，而是你上一世沒來得及完成的承諾。它披著人形，手裡捧著你下一世才會出生時的命牌。",
  ],
];

function buildFewShot(index = 0) {
  const first = FEW_SHOTS[index % FEW_SHOTS.length];
  const second = FEW_SHOTS[(index + 3) % FEW_SHOTS.length];
  return ["反套路範例：", ...first, ...second].join("\n");
}

function buildPrompt(kind, payload) {
  const player = payload?.playerSnapshot ?? {};
  const life = payload?.lifeState ?? {};
  const meta = payload?.metaProgress ?? {};
  const novel = payload?.novelState ?? {};
  const directives = payload?.narrativeDirectives ?? {};
  const recipe = directives.sceneRecipe ?? {};
  const richLifeTheme = directives.lifeTheme;
  const richWorld = directives.worldDirectives;
  const storyThemes = Array.isArray(directives.storyThemes) ? directives.storyThemes : [];
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
    "本段劇情配方（必須遵守）：",
    `場景類型：${recipe.sceneKind ?? kind}`,
    `主題組合：${recipe.primaryTheme?.category ?? "無限流"} / ${recipe.primaryTheme?.name ?? "跨世反轉"}；${recipe.secondaryTheme?.category ?? "因果"} / ${recipe.secondaryTheme?.name ?? "輪迴回收"}`,
    `本段必須反轉：${recipe.requiredTwist ?? "讓常見機緣露出前世或世界規則異常。"}`,
    `本段必須新元素：${recipe.requiredNewElement ?? "一件能改變選擇含義的異常物件。"}`,
    `延續鉤子：${recipe.continuityHook ?? "承接上一段選擇造成的後果。"}`,
    `選項設計：${recipe.choiceDesignRule ?? "選項要是具體命運分歧，不能像功能按鈕。"}`,
    `新奇度目標：${recipe.noveltyTarget ?? "至少一個反轉、一個異常物件、一個跨世伏筆。"}`,
    `嚴禁重複：${[...(recipe.forbiddenMotifs ?? []), ...(recipe.doNotRepeat ?? [])].slice(0, 28).join("、") || "採藥、老者、殘卷、山洞、普通突破"}`,
    "",
    "世界設定：",
    `世界：${richWorld?.name ?? world.name}`,
    `類型：${richWorld?.type ?? world.type}`,
    `時代：${richWorld?.era ?? world.era}`,
    `氛圍：${(richWorld?.tone ?? world.tones).join("、")}`,
    `核心規則：${world.coreRule}`,
    `主目標：${world.mainObjective}`,
    `通關條件：${world.clearCondition}`,
    `特殊名詞：${(richWorld?.specialTerms ?? world.terms).join("、")}`,
    `世界敘事限制：${richWorld?.narrativeConstraints?.join("、") ?? "遵守世界規則，避免模板化事件。"}`,
    `可能主題：${richWorld?.possibleThemes?.join("、") ?? "輪迴、因果、突破、遺物"}`,
    `死亡風險：${richWorld?.deathRisks?.join("、") ?? "心魔、代價、世界規則反噬"}`,
    "",
    "玩家底層狀態：",
    `身份：${IDENTITIES[player.identityId] ?? "異世旅人"}`,
    `命格：${FATES[player.fateId] ?? "命格未明"}`,
    `本世主題：${richLifeTheme?.name ?? LIFE_THEMES[life.lifeThemeId] ?? "命盤自生"}`,
    `主題說明：${richLifeTheme?.description ?? "此世因果尚未完全顯形。"}`,
    `主題母題：${richLifeTheme?.motifs?.join("、") ?? "輪迴、抉擇、遺物"}`,
    `主題升級節點：${richLifeTheme?.escalationBeats?.join(" -> ") ?? "異常出現 -> 代價加深 -> 抉擇成形"}`,
    `最終選擇暗示：${richLifeTheme?.finalChoiceHints?.join("、") ?? "保留、犧牲、逆命"}`,
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
    "本段可用 StoryTheme：",
    storyThemes
      .map((theme) => `- ${theme.category} / ${theme.name}：${theme.prompts?.join("、")}。反套路：${theme.antiClicheTwist}`)
      .join("\n") || "- 無限流 / 輪迴分歧：讓世界規則與前世因果同時推動劇情。",
    "",
    buildFewShot(recipe.fewShotIndex ?? 0),
    "",
    "輸出要求：",
    kind === "start" ? "開篇約 800 到 1500 字。" : "一般接續約 600 到 1200 字；死亡或結算約 800 到 1500 字。",
    "每段必須包含場景、行動、心境、衝突、結果或懸念。",
    "不得使用 unknown、undefined、status、risk、debug、JSON、prompt、system 等英文介面詞。",
    "不得重複最近劇情的主要地點、主要道具、核心衝突與選項句型。",
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

const staleMotifs = ["採藥", "采藥", "殘卷", "老者", "山洞", "靈泉", "普通突破", "普通心魔", "撿到功法", "神秘老人"];
const twistMotifs = ["時間錯位", "輪迴記憶", "前世", "世界規則", "身份反轉", "遺物", "因果代價", "詭異", "天道", "科技", "AI", "系統", "下一世", "名字", "影子", "錯誤碼", "站台", "防火牆", "夢", "不存在", "告示", "裂縫", "代價"];
const genericChoiceWords = ["接受", "拒絕", "攻擊", "離開", "查看", "調查", "前進", "等待"];

function noveltyScore(scene, payload = {}) {
  const directives = payload?.narrativeDirectives ?? {};
  const recipe = directives.sceneRecipe ?? {};
  const recentMotifs = payload?.novelState?.hiddenState?.recentMotifs ?? [];
  const doNotRepeat = [...(recipe.doNotRepeat ?? []), ...(recipe.forbiddenMotifs ?? []), ...recentMotifs]
    .filter((word) => typeof word === "string" && word.length >= 2);
  const text = `${scene.chapterTitle}\n${scene.storyText}\n${scene.choices?.map((choice) => choice.text).join(" ") ?? ""}\n${scene.noveltyHints.join(" ")}`;
  const stale = staleMotifs.filter((word) => text.includes(word)).length;
  const twist = twistMotifs.filter((word) => text.includes(word)).length;
  const repeated = doNotRepeat.filter((word) => text.includes(word)).slice(0, 8).length;
  const genericChoices = (scene.choices ?? []).filter((choice) =>
    genericChoiceWords.some((word) => choice.text.trim() === word || choice.text.trim().startsWith(`${word}。`)),
  ).length;
  const hasTwist = /不是|卻|竟|原來|其實|上一世|下一世|不存在|三百年|反而|早已|替你|另一個你/.test(text);
  const hasDilemma = /代價|救|犧牲|背叛|立誓|吞噬|放棄|奪|斬斷|承認|欺瞞/.test(text);
  const hasEnglishNoise = /\b(unknown|undefined|status|risk|debug|prompt|json|system)\b/i.test(text);
  const lengthBonus = scene.storyText.length >= 600 ? 8 : scene.storyText.length >= 380 ? 3 : -8;
  let score = 52 + twist * 5 - stale * 9 - repeated * 7 - genericChoices * 9 + lengthBonus;
  if (hasTwist) score += 9;
  if (hasDilemma) score += 7;
  if (hasEnglishNoise) score -= 22;
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    reasons: [
      stale ? `含有 ${stale} 個常見套路元素` : "",
      twist ? `含有 ${twist} 個反套路或跨世界元素` : "",
      repeated ? `重複了 ${repeated} 個近期母題或禁用元素` : "",
      genericChoices ? `有 ${genericChoices} 個選項太像功能按鈕` : "",
      hasTwist ? "有明確反轉語氣" : "",
      hasDilemma ? "有具體抉擇代價" : "",
      hasEnglishNoise ? "含有出戲英文介面詞" : "",
    ].filter(Boolean),
    shouldRegenerate: score < 66,
  };
}

async function callOpenAi(prompt, maxOutputTokens, model = MAIN_MODEL) {
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
        model,
        instructions: buildSystemPrompt(),
        input: prompt,
        max_output_tokens: maxOutputTokens,
        reasoning: {
          effort: model === QUICK_MODEL ? "low" : "medium",
        },
        store: false,
        text: {
          verbosity: "medium",
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
  let novelty = noveltyScore(scene, payload);

  if (novelty.shouldRegenerate && kind !== "settlement") {
    scene = await callOpenAi(
      `${prompt}\n\n上一版新奇度不足：${novelty.reasons.join("、")}。請重寫，避開剛才重複元素，加入世界規則異常、前世衝突、因果代價或跨世界反轉。不要使用 unknown、status、risk、debug 等英文介面詞。`,
      maxOutputTokens,
      QUICK_MODEL,
    );
    novelty = noveltyScore(scene, payload);
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
