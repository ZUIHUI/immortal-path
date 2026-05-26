import { AI_CONFIG } from "../config/aiConfig";
import { getFateById } from "../data/fates";
import { getIdentityById } from "../data/identities";
import { getRealmById, getNextRealm } from "../data/realms";
import { getWorldById } from "../data/worlds";
import type {
  ContinueNarrativeScenePayload,
  GenerateNarrativeScenePayload,
  NarrativeLogSummary,
  NarrativePlayerSnapshot,
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
  const cultivationProgress = nextRealm
    ? `${player.cultivation}/${nextRealm.requiredCultivation}`
    : `${player.cultivation}/MVP上限`;

  return [
    `姓名：${player.name}`,
    `世代：第 ${player.generation} 世`,
    `境界：${realm.name}${realm.stageName}`,
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
  ].join("\n");
}

export function buildNarrativeSystemPrompt(): string {
  return [
    "你是文字修仙、無限流、轉生重生遊戲的小說式敘事引擎。",
    "請只輸出符合 JSON schema 的 JSON，不要輸出 Markdown，不要解釋。",
    "正文風格必須像東方修仙小說，含場景描寫、修仙氛圍與選擇張力。",
    "content 約 120 到 250 個中文字，不要白話流水帳，不要現代詞，不要提到 AI、模型、prompt、JSON、系統提示。",
    "小說正文不可直接寫出精確數值，例如不要寫「修為 +50」。數值變化只能放入 suggestedEffects。",
    "AI 只能建議 suggestedEffects，不能決定精確數字。",
    "一次只生成一段場景，不要生成整世故事。",
    "choices 必須 2 到 4 個，且每個選項要有 previewText 與 riskLevel。",
    "suggestedEffects 最多 6 個，強度只能用 tiny/small/medium/large/huge。",
    "死亡、突破、完成世界目標只能透過布林欄位提示，由遊戲核心再判斷套用。",
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
    `輪迴資訊：總世代 ${payload.metaProgress.totalLives}，可用輪迴點 ${payload.metaProgress.reincarnationPoints}，前世記憶 ${payload.metaProgress.pastLifeMemories}。`,
    `觸發來源：${payload.triggerType}`,
    "",
    "最近修仙日誌：",
    JSON.stringify(safeLogs(payload.recentLogs), null, 2),
    "",
    "平衡限制：",
    "target 欄位若用於 resourceGain/resourceLoss，僅可使用：spiritStones、aura、pills、herbs、artifacts、destiny、karma、pastLifeMemory。",
    "target 欄位若用於 statGain/statLoss，僅可使用：spiritualRoot、maxHp、divineSense、attack、defense、comprehension、luck、daoHeart、lifespan。",
    "target 欄位若用於 statusGain，僅可使用：injured、weak、heart_demon。",
    "common/rare 應以小到中等收益為主；epic 可以大收益；legendary/mythic 必須稀有且伴隨風險或代價。",
    "不要讓凡人直接完成築基，除非 rarity 是 mythic 且 shouldTriggerBreakthrough=true。",
    "不要在 content 中寫數字獎勵，請用 suggestedEffects 表示。",
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
    "target 欄位若用於 resourceGain/resourceLoss，僅可使用：spiritStones、aura、pills、herbs、artifacts、destiny、karma、pastLifeMemory。",
    "target 欄位若用於 statGain/statLoss，僅可使用：spiritualRoot、maxHp、divineSense、attack、defense、comprehension、luck、daoHeart、lifespan。",
    "target 欄位若用於 statusGain，僅可使用：injured、weak、heart_demon。",
    "若選擇安全，應有較低風險與較小收益；若選擇貪婪或莽撞，可以提高 rarity 或風險。",
    "若 shouldEndEvent=true，請讓內容形成一段明確收束，並給出結算式 logText。",
    "若 shouldTriggerDeath=true，deathReason 必須是修仙小說式死因。",
  ].join("\n");
}
