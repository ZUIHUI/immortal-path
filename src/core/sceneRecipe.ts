import { storyThemes } from "../data/storyThemes";
import type {
  AiNovelChoice,
  LifeState,
  NovelNarrativeDirectives,
  NovelSceneKind,
  NovelState,
  SceneRecipe,
  SceneRecipeTheme,
  StoryTheme,
  World,
  LifeTheme,
} from "../types";

interface CreateSceneRecipeInput {
  lifeState: LifeState;
  novelState: NovelState;
  world: World;
  lifeTheme?: LifeTheme;
  selectedChoice?: AiNovelChoice | null;
  generationGoal?: "death" | "settlement";
}

const DEFAULT_STALE_MOTIFS = [
  "採藥",
  "老者",
  "殘卷",
  "山洞",
  "靈泉",
  "普通心魔",
  "普通突破",
  "撿到功法",
  "神秘老人送寶",
];

const REQUIRED_TWISTS = [
  "常見機緣必須暴露成上一世留下的陷阱或留言",
  "讓一個看似幫助玩家的人物說出不屬於此世的記憶",
  "讓世界規則本身出現裂縫，而不是只出現敵人",
  "讓玩家的遺物或前世記憶改寫當下場景",
  "把成功的代價延後到下一世回收",
  "讓一個現代或科技物件承載修行規則",
  "讓選擇同時牽動因果與生存，不要只有打或逃",
  "讓玩家發現自己並不是第一次經歷這一幕",
  "讓敵人、恩人或影子持有玩家不知道的前世身份",
  "讓世界目標看起來可達成，但通關條件暗中改變",
];

const REQUIRED_ELEMENTS_BY_WORLD_TYPE: Record<string, string[]> = {
  ancient_xianxia: ["前世玉符發燙", "山門規矩出現漏洞", "築基契機反過來審問玩家", "宗門石階浮出上一世血字"],
  modern_reiki: ["手機收到來自前世的訊息", "城市監控拍到不存在的自己", "地鐵站牌顯示前世死因", "官方封鎖線內有修行禁令"],
  cyber_cultivation: ["天道防火牆標記神魂", "非法丹田核心回放死因", "功法插件要求代價授權", "義體視野跳出前世錯誤碼"],
  future_stellar: ["星艦山門聽見輪迴警報", "元神導航指向死星道場", "傳承核心辨認出前世權限", "星門污染帶來未來記憶"],
  weird_city: ["影子比本體先做選擇", "牆上告示寫著玩家另一個名字", "神像替玩家回答問題", "路燈下的影子拒絕回到腳邊"],
  apocalypse: ["壽元被當成水票交易", "枯竭靈泉只回應死者", "基地廣播播出玩家未來死訊", "世界火種要求有人留下"],
  time_loop: ["同一場景多出前六次失敗痕跡", "NPC 記得玩家還沒做的選擇", "第七日提前到來", "牆上警告被新血覆蓋"],
  dream_realm: ["醒來之門反而通向更深的夢", "夢中傷口在現實滲血", "心魔假扮成可靠之人", "童年記憶被明碼標價"],
  mixed_realm: ["兩套世界規則互相衝突", "前世遺物違反此世常識", "命盤顯示不存在的分支", "輪迴長河短暫倒流"],
};

const CHOICE_RULES = [
  "選項要像命運分歧，每個選項都要牽動不同代價：救人、奪物、欺瞞、逆天或放棄。",
  "選項不得使用接受、拒絕、攻擊、離開這類功能按鈕語氣，要寫成具體小說行動。",
  "至少一個選項要利用本世 LifeTheme，至少一個選項要利用世界特殊規則。",
  "至少一個選項看似保守但埋下長線代價，至少一個選項看似危險但可能帶來爆發。",
];

function hashText(text: string): number {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pickBySeed<T>(items: T[], seed: string, offset = 0): T {
  if (items.length === 0) {
    throw new Error("Cannot pick from an empty list");
  }
  return items[(hashText(`${seed}:${offset}`) + offset) % items.length];
}

function toRecipeTheme(theme: StoryTheme): SceneRecipeTheme {
  return {
    category: theme.category,
    name: theme.name,
    prompts: theme.prompts,
    antiClicheTwist: theme.antiClicheTwist,
  };
}

function resolveSceneKind(input: CreateSceneRecipeInput): NovelSceneKind {
  if (input.generationGoal === "death" || input.novelState.isDead) return "death";
  if (input.generationGoal === "settlement" || input.novelState.isSettlementReady) return "settlement";
  if (input.novelState.visibleStory.length === 0) return "opening";
  if (input.novelState.hiddenState.tensionLevel === "climax") return "breakthrough";
  if (input.novelState.hiddenState.tensionLevel === "high") return "escalation";
  return "choice_consequence";
}

function extractRecentMotifs(novelState: NovelState): string[] {
  const recentText = novelState.visibleStory
    .slice(-4)
    .map((block) => `${block.chapterTitle} ${block.storyText}`)
    .join(" ");
  const motifCandidates = [
    ...novelState.hiddenState.recentMotifs,
    ...novelState.hiddenState.unresolvedMysteries,
    ...DEFAULT_STALE_MOTIFS,
    "前世玉符",
    "天道防火牆",
    "地鐵",
    "神像",
    "影子",
    "手機",
    "星艦",
    "世界火種",
    "醒來之門",
  ];

  return Array.from(
    new Set(motifCandidates.filter((motif) => motif && recentText.includes(motif))),
  ).slice(0, 14);
}

function selectStoryThemes(seed: string, world: World, recentMotifs: string[]): SceneRecipeTheme[] {
  const worldThemeText = `${world.type} ${world.tone.join(" ")} ${world.possibleThemes.join(" ")}`;
  const weighted = storyThemes.filter((theme) => {
    const haystack = `${theme.category} ${theme.name} ${theme.prompts.join(" ")}`;
    return (
      worldThemeText.includes(theme.category) ||
      theme.prompts.some((prompt) => worldThemeText.includes(prompt)) ||
      !recentMotifs.some((motif) => haystack.includes(motif))
    );
  });
  const pool = weighted.length >= 2 ? weighted : storyThemes;
  const first = pickBySeed(pool, seed, 1);
  const secondPool = pool.filter((theme) => theme.id !== first.id);
  const second = pickBySeed(secondPool.length ? secondPool : pool, seed, 2);
  return [toRecipeTheme(first), toRecipeTheme(second)];
}

export function createSceneRecipe(input: CreateSceneRecipeInput): NovelNarrativeDirectives {
  const sceneKind = resolveSceneKind(input);
  const blockCount = input.novelState.visibleStory.length;
  const seed = [
    input.lifeState.storySeed,
    input.lifeState.worldId,
    input.lifeState.lifeThemeId,
    input.selectedChoice?.choiceId,
    sceneKind,
    blockCount,
  ].join(":");
  const recentMotifs = extractRecentMotifs(input.novelState);
  const themes = selectStoryThemes(seed, input.world, recentMotifs);
  const elementPool =
    REQUIRED_ELEMENTS_BY_WORLD_TYPE[input.world.type] ??
    REQUIRED_ELEMENTS_BY_WORLD_TYPE.mixed_realm;
  const requiredNewElement = pickBySeed(elementPool, seed, 3);
  const requiredTwist = pickBySeed(
    REQUIRED_TWISTS.filter((twist) => !recentMotifs.some((motif) => twist.includes(motif))),
    seed,
    4,
  );
  const choiceDesignRule = pickBySeed(CHOICE_RULES, seed, 5);
  const escalationBeats = input.lifeTheme?.escalationBeats ?? [];
  const fallbackEscalationBeat =
    escalationBeats[Math.min(blockCount, Math.max(0, escalationBeats.length - 1))];
  const doNotRepeat = Array.from(
    new Set([
      ...recentMotifs,
      ...input.novelState.visibleStory.slice(-3).map((block) => block.chapterTitle),
      ...(input.novelState.hiddenState.recentSceneTypes ?? []),
    ].filter(Boolean)),
  ).slice(0, 16);

  const sceneRecipe: SceneRecipe = {
    recipeId: `recipe_${hashText(seed).toString(36)}`,
    sceneKind,
    primaryTheme: themes[0],
    secondaryTheme: themes[1],
    requiredTwist,
    requiredNewElement,
    continuityHook:
      input.selectedChoice?.text ??
      input.novelState.hiddenState.unresolvedMysteries[0] ??
      fallbackEscalationBeat ??
      "讓輪迴長河在本段留下新的痕跡。",
    choiceDesignRule,
    forbiddenMotifs: Array.from(new Set([...DEFAULT_STALE_MOTIFS, ...doNotRepeat])).slice(0, 24),
    doNotRepeat,
    fewShotIndex: hashText(seed) % 6,
    noveltyTarget:
      "本段至少要有一個反轉、一個具體異常物件、一個跨世伏筆，並避免重複上一段的場景與選項句型。",
  };

  return {
    sceneRecipe,
    lifeTheme: input.lifeTheme
      ? {
          name: input.lifeTheme.name,
          description: input.lifeTheme.description,
          motifs: input.lifeTheme.motifs,
          escalationBeats: input.lifeTheme.escalationBeats,
          finalChoiceHints: input.lifeTheme.finalChoiceHints,
        }
      : undefined,
    storyThemes: themes,
    worldDirectives: {
      name: input.world.name,
      type: input.world.type,
      era: input.world.era,
      tone: input.world.tone,
      specialTerms: input.world.specialTerms,
      possibleThemes: input.world.possibleThemes,
      narrativeConstraints: input.world.narrativeConstraints,
      deathRisks: input.world.deathRisks,
    },
  };
}
