import { AI_CONFIG } from "../config/aiConfig";
import { getFateById } from "../data/fates";
import { getIdentityById } from "../data/identities";
import { getInfiniteStoryPremise } from "../data/infiniteFlow";
import { getLegacyRelicById } from "../data/legacyRelics";
import { getLifeThemeById } from "../data/lifeThemes";
import { getRealmById, getNextRealm } from "../data/realms";
import { getStoryChapterByRealmId } from "../data/storyChapters";
import { pickStoryThemes } from "../data/storyThemes";
import { getWorldById } from "../data/worlds";
import type {
  AiNovelChoice,
  LifeState,
  MetaProgress,
  NovelState,
  ContinueNarrativeScenePayload,
  GenerateNarrativeScenePayload,
  NarrativeLogSummary,
  NarrativePlayerSnapshot,
  World,
} from "../types";

function safeLogs(logs: NarrativeLogSummary[]): NarrativeLogSummary[] {
  return logs.slice(0, AI_CONFIG.maxRecentLogs).map((log) => ({
    type: log.type,
    message: log.message.slice(0, 160),
  }));
}

function buildPlayerSummary(player: NarrativePlayerSnapshot): string {
  const realm = getRealmById(player.realmId);
  const nextRealm = getNextRealm(player.realmId);
  const storyChapter = getStoryChapterByRealmId(player.realmId);
  const cultivationProgress = nextRealm
    ? `${player.cultivation}/${nextRealm.requiredCultivation}`
    : `${player.cultivation}/目前上限`;

  return [
    `姓名：${player.name}`,
    `世代：第 ${player.generation} 世`,
    `境界：${realm.name}${realm.stageName}`,
    `主線章節：${storyChapter.title}`,
    `主線目標：${storyChapter.currentObjective}`,
    `最高境界：${getRealmById(player.highestRealmId).name}${getRealmById(player.highestRealmId).stageName}`,
    `年齡/壽元：${player.age}/${player.lifespan}`,
    `氣血：${player.hp}/${player.maxHp}`,
    `修為進度：${cultivationProgress}`,
    `靈根/悟性/福緣/道心：${player.spiritualRoot}/${player.comprehension}/${player.luck}/${player.daoHeart}`,
    `攻擊/防禦/神識：${player.attack}/${player.defense}/${player.divineSense}`,
    `狀態：${player.status.join("、")}`,
    `資源：靈石 ${player.resources.spiritStones}、丹藥 ${player.resources.pills}、靈氣 ${player.resources.aura}、天命 ${player.resources.destiny}、因果 ${player.resources.karma}、前世記憶 ${player.resources.pastLifeMemory}`,
  ].join("\n");
}

function buildWorldSummary(worldId: string, player: NarrativePlayerSnapshot): string {
  const world = getWorldById(worldId);
  const identity = getIdentityById(player.identityId);
  const fate = getFateById(player.fateId);
  const storyChapter = getStoryChapterByRealmId(player.realmId);

  return [
    `世界：${world.worldName}`,
    `類型：${world.worldType}`,
    `難度：${world.difficulty}`,
    `主目標：${world.mainObjective}`,
    `時限：${world.timeLimit} 年`,
    `世界規則：修煉倍率 ${world.worldRules.cultivationMultiplier}，事件風險 ${world.worldRules.eventRiskMultiplier}，突破修正 ${world.worldRules.breakthroughRateModifier}`,
    `身份：${identity.name}。${identity.description}`,
    `身份優勢：${identity.advantages.join("、")}`,
    `身份劣勢：${identity.disadvantages.join("、")}`,
    `命格：${fate.name}。${fate.description}`,
    `命格優勢：${fate.advantages.join("、")}`,
    `命格代價：${fate.downside.join("、")}`,
    `當前劇情：${storyChapter.title}。${storyChapter.summary}`,
    `劇情地點：${storyChapter.locations.join("、")}`,
    `劇情語氣：${storyChapter.aiGuidance}`,
  ].join("\n");
}

function getPremiseTitle(premiseId: string | undefined): string {
  return getInfiniteStoryPremise(premiseId)?.title ?? "命盤自生";
}

export function buildNarrativeSystemPrompt(): string {
  return [
    "你是文字修仙遊戲的小說式敘事引擎，只輸出符合 JSON schema 的 JSON。",
    "content 用繁中修仙小說語氣，約 80 到 140 字，有場景、機緣與抉擇張力。",
    "不要提到 AI、模型、prompt、JSON、系統提示；正文不要寫精確數值獎勵。",
    "choices 固定 2 個；suggestedEffects 最多 3 個，只能用 tiny/small/medium/large/huge。",
    "AI 只能建議 suggestedEffects，實際數值由遊戲核心計算。",
    "玩家不手動修煉；劇情應透過 suggestedEffects 推動修為、資源、狀態與破境契機。",
    "shouldCompleteWorldObjective 只有玩家實際達到世界目標境界時才可為 true；奇遇不能直接宣告通關。",
  ].join("\n");
}

export function buildGenerateNarrativePrompt(payload: GenerateNarrativeScenePayload): string {
  return [
    "任務：生成玩家進入歷練後的第一段修仙小說式事件。",
    "",
    "世界與命格設定：",
    buildWorldSummary(payload.worldId, payload.playerSnapshot),
    "",
    "當前玩家狀態：",
    buildPlayerSummary(payload.playerSnapshot),
    "",
    `本世狀態：已存活 ${payload.lifeState.yearsSurvived} 年，最高境界 ${getRealmById(payload.lifeState.highestRealmId).name}${getRealmById(payload.lifeState.highestRealmId).stageName}，世界目標${payload.lifeState.objectiveCompleted ? "已完成" : "未完成"}。`,
    `無限流開局：${getPremiseTitle(payload.lifeState.storyPremiseId)}，第 ${payload.playerSnapshot.generation} 世變奏。`,
    `輪迴資訊：總世代 ${payload.metaProgress.totalLives}，可用輪迴點 ${payload.metaProgress.reincarnationPoints}，前世記憶 ${payload.metaProgress.pastLifeMemories}。`,
    `觸發來源：${payload.triggerType}`,
    "",
    "最近修仙日誌：",
    JSON.stringify(safeLogs(payload.recentLogs), null, 2),
    "",
    "平衡限制：",
    "target 欄位白名單：",
    "resource: spiritStones,aura,pills,herbs,artifacts,destiny,karma,pastLifeMemory。",
    "stat: spiritualRoot,maxHp,divineSense,attack,defense,comprehension,luck,daoHeart,lifespan。",
    "status: injured,weak,heart_demon。",
    "common/rare 小中收益；epic 可大收益；legendary/mythic 必須稀有且有風險。",
  ].join("\n");
}

export function buildContinueNarrativePrompt(payload: ContinueNarrativeScenePayload): string {
  return [
    "任務：根據玩家上一個選擇，生成下一段修仙小說式事件結果或延續。",
    "",
    "世界與命格設定：",
    buildWorldSummary(payload.lifeState.worldId, payload.playerSnapshot),
    "",
    "當前玩家狀態：",
    buildPlayerSummary(payload.playerSnapshot),
    "",
    "上一段事件：",
    JSON.stringify(
      {
        sceneId: payload.currentNarrativeState.sceneId,
        title: payload.currentNarrativeState.title,
        content: payload.currentNarrativeState.content,
        mood: payload.currentNarrativeState.mood,
        rarity: payload.currentNarrativeState.rarity,
      },
      null,
      2,
    ),
    "",
    "玩家選擇：",
    JSON.stringify(payload.selectedChoice, null, 2),
    "",
    "最近修仙日誌：",
    JSON.stringify(safeLogs(payload.recentLogs), null, 2),
    "",
    "延續要求：",
    `無限流開局：${getPremiseTitle(payload.lifeState.storyPremiseId)}，第 ${payload.playerSnapshot.generation} 世變奏。`,
    "安全選擇低風險小收益；貪婪/莽撞可提高 rarity 或風險。",
    "target 範圍同前：resource/stat/status 僅使用白名單欄位。",
    "shouldEndEvent=true 時內容要收束；shouldTriggerDeath=true 時 deathReason 要像修仙死因。",
  ].join("\n");
}

export interface NovelPromptPayload {
  lifeState: LifeState;
  metaProgress: MetaProgress;
  playerSnapshot: NarrativePlayerSnapshot;
  novelState: NovelState;
  recentStoryBlocks?: Array<{ chapterTitle: string; internalSummary?: string; storyText?: string }>;
  selectedChoice?: AiNovelChoice | null;
  generationGoal?: "opening" | "continue" | "death" | "settlement";
}

function summarizeRelics(meta: MetaProgress): string {
  const ids = [...(meta.legacyRelicIds ?? []), ...(meta.worldLegacyIds ?? [])];
  const names = ids
    .map((id) => getLegacyRelicById(id)?.name ?? id)
    .slice(0, 8);
  return names.length ? names.join("、") : "無";
}

function buildNovelWorldSummary(world: World): string {
  return [
    `世界：${world.name}`,
    `世界類型：${world.type}`,
    `時代：${world.era}`,
    `氛圍：${world.tone.join("、")}`,
    `核心規則：${world.coreRule}`,
    `主目標：${world.mainObjective}`,
    `通關條件：${world.clearCondition}`,
    `特殊名詞：${world.specialTerms.join("、")}`,
    `可用主題：${world.possibleThemes.join("、")}`,
    `敘事限制：${world.narrativeConstraints.join("；")}`,
    `死亡風險：${world.deathRisks.join("、")}`,
    `可能遺物：${world.legacyRelics.join("、")}`,
  ].join("\n");
}

function buildNovelPlayerSummary(payload: NovelPromptPayload): string {
  const player = payload.playerSnapshot;
  const identity = getIdentityById(player.identityId);
  const fate = getFateById(player.fateId);
  const realm = getRealmById(player.realmId);
  const nextRealm = getNextRealm(player.realmId);
  const lifeTheme = getLifeThemeById(payload.lifeState.lifeThemeId);

  return [
    `身份：${identity.name}。${identity.description}`,
    `命格：${fate.name}。${fate.description}`,
    `本世主題：${lifeTheme?.name ?? "命盤自生"}。${lifeTheme?.description ?? "此世因果尚未完全顯形。"}`,
    `主題母題：${lifeTheme?.motifs.join("、") ?? "輪迴、抉擇、遺物"}`,
    `境界 / 生命層級：${realm.name}${realm.stageName}`,
    `下一境界：${nextRealm ? `${nextRealm.name}${nextRealm.stageName}` : "未知上限"}`,
    `年齡 / 壽元：${player.age}/${player.lifespan}`,
    `氣血狀態：${player.hp}/${player.maxHp}`,
    `修為進度：${player.cultivation}${nextRealm ? `/${nextRealm.requiredCultivation}` : ""}`,
    `因果 / 天命 / 前世記憶：${player.resources.karma}/${player.resources.destiny}/${player.resources.pastLifeMemory}`,
    `已持有遺物：${summarizeRelics(payload.metaProgress)}`,
  ].join("\n");
}

function buildRecentStoryContext(payload: NovelPromptPayload): string {
  const blocks = payload.recentStoryBlocks ?? payload.novelState.visibleStory.slice(-3);
  const summaries = blocks.map((block) => {
    const summary =
      "internalSummary" in block && block.internalSummary
        ? block.internalSummary
        : block.storyText?.slice(0, 180) ?? "";
    return `${block.chapterTitle}：${summary}`;
  });

  return summaries.length ? summaries.join("\n") : "尚無前文。";
}

function buildHiddenStateContext(state: NovelState): string {
  return [
    `當前篇章：${state.currentArc || "開篇"}`,
    `劇情摘要：${state.storySoFarSummary || "尚未展開"}`,
    `張力：${state.hiddenState.tensionLevel}`,
    `未解謎團：${state.hiddenState.unresolvedMysteries.join("、") || "無"}`,
    `近期母題：${state.hiddenState.recentMotifs.join("、") || "無"}`,
    `已得遺物：${state.hiddenState.obtainedRelics.join("、") || "無"}`,
  ].join("\n");
}

function buildStoryThemeContext(): string {
  const selected = pickStoryThemes(undefined, 2);
  return selected
    .map(
      (theme) =>
        `${theme.category} / ${theme.name}：${theme.prompts.join("、")}。反套路方向：${theme.antiClicheTwist}`,
    )
    .join("\n");
}

export function buildNovelSystemPrompt(): string {
  return [
    "你是跨世界輪迴互動小說生成器。",
    "你生成的是完整小說片段，不是事件卡；玩家看到的只有小說內容與選項。",
    "不要輸出系統提示、數值、收益預覽、debug 訊息，也不要提到 JSON 或 prompt。",
    "所有遊戲效果必須放入 hiddenEffects，正文不得寫修為 +100、氣血 -20 這類數字。",
    "storyText 必須自然、連續、有情緒、有懸念；除死亡或結算外，最後必須自然停在抉擇點。",
    "劇情可跨古代、現代、未來、詭異、末日、夢境、時間循環，但必須符合當前世界規則與 LifeTheme。",
    "避免重複採藥、老者、殘卷、山洞、普通心魔；若使用常見修仙元素，必須加入反轉。",
    "玩家選擇必須像命運分歧，不是功能按鈕；每個選項 12 到 36 字，具體、有代價、有畫面。",
    "displayLines 必須由 storyText 拆成適合閱讀器逐行顯示的短行。",
  ].join("\n");
}

function buildFewShotAntiCliche(): string {
  return [
    "反套路範例：",
    "不要寫：你在山洞中撿到一本功法。",
    "改成：你在山洞中看見一本功法，可翻開第一頁後，紙上寫的不是法訣，而是你上一世死前留下的遺言。更詭異的是，最後一行墨跡未乾，像是剛剛才有人替你寫下。",
    "選項：繼續翻閱，確認自己究竟死於何人之手 / 將功法焚毀，不讓前世干涉今生 / 割破指尖，在空白處寫下此世第一個問題",
    "不要寫：你在城市中覺醒了靈力。",
    "改成：你在捷運末班車上醒來，車廂裡所有乘客都低頭看著手機。螢幕上顯示著同一句話：「請勿在本節車廂內修煉。」下一秒，窗外站名亮起，卻不是任何一個你熟悉的站，而是「前世終點」。",
    "不要寫：你獲得了修真晶片。",
    "改成：義體診所的燈忽明忽暗。醫師替你打開胸腔時，忽然沉默下來。你的丹田位置早已被人植入一枚黑色核心，核心表面浮現出一行細小字跡：「此人已於三百年前飛升失敗，禁止再次築基。」",
  ].join("\n");
}

function buildNovelPrompt(payload: NovelPromptPayload, task: string): string {
  const world = getWorldById(payload.lifeState.worldId);

  return [
    `任務：${task}`,
    "",
    "世界設定：",
    buildNovelWorldSummary(world),
    "",
    "玩家底層狀態：",
    buildNovelPlayerSummary(payload),
    "",
    "本世敘事狀態：",
    buildHiddenStateContext(payload.novelState),
    "",
    "最近劇情：",
    buildRecentStoryContext(payload),
    "",
    payload.selectedChoice
      ? `玩家上一個選擇：${payload.selectedChoice.text}（語氣 ${payload.selectedChoice.tone}）`
      : "玩家上一個選擇：無，這是本世開篇。",
    "",
    "本次可混合的 StoryThemePool：",
    buildStoryThemeContext(),
    "",
    buildFewShotAntiCliche(),
    "",
    "輸出要求：",
    "開篇約 800 到 1500 字；一般接續約 600 到 1200 字；死亡或結算約 800 到 1500 字。",
    "每段必須包含場景、行動、心境、衝突、結果或懸念。",
    "非死亡/結算場景 choices 必須 2 到 4 個；死亡/結算場景 choices 可為空。",
    "hiddenEffects 只能用 intensity，不可給具體數字。",
    "internalSummary 用 120 字內摘要本段關鍵因果，供下一段續寫。",
    "noveltyHints 寫出本段的新奇點、反轉或跨世界元素。",
  ].join("\n");
}

export function buildOpeningPrompt(payload: NovelPromptPayload): string {
  return buildNovelPrompt(
    payload,
    "生成本世開篇小說。必須先展現此世世界、身份、命格與 LifeTheme 的驚喜鉤子，結尾停在第一個命運抉擇點。",
  );
}

export function buildContinuePrompt(payload: NovelPromptPayload): string {
  return buildNovelPrompt(
    payload,
    "根據玩家選擇續寫下一段完整小說。選擇後果要自然進入劇情，底層成長與風險放入 hiddenEffects。",
  );
}

export function buildDeathPrompt(payload: NovelPromptPayload): string {
  return buildNovelPrompt(
    payload,
    "生成死亡小說。不要直接說你死了，要描寫此世崩落、神魂回望、輪迴長河接近，結尾引向本世結算。",
  );
}

export function buildSettlementPrompt(payload: NovelPromptPayload): string {
  return buildNovelPrompt(
    payload,
    "生成輪迴結算小說。先以小說清算本世因果，再點出保留遺物、輪迴點與下一世影響，不要寫成報表。",
  );
}
