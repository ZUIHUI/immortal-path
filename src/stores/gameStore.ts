import { create } from "zustand";
import {
  attemptBreakthrough as runBreakthrough,
  canBreakthrough,
} from "../core/breakthrough";
import {
  addStatuses,
  applyAttributeDelta,
  applyResourceDelta,
  clamp,
  createId,
} from "../core/balance";
import { cultivate } from "../core/cultivation";
import { checkDeath } from "../core/death";
import {
  drawWeightedEvent,
  getAvailableEvents,
  resolveEventOption,
  summarizeEventResultChanges,
} from "../core/eventEngine";
import { resolveHiddenEffects } from "../core/hiddenEffectResolver";
import { resolveAiSuggestedEffects } from "../core/narrativeEffectResolver";
import {
  applyReincarnationResult,
  createInitialMeta,
  createNewLife,
  createReincarnationResult,
  getNextLifeBonusSummary,
  purchaseShopItem,
} from "../core/reincarnation";
import { hasMetWorldObjective } from "../core/worldObjective";
import { events } from "../data/events";
import { getFateById } from "../data/fates";
import { getIdentityById } from "../data/identities";
import { createInfiniteLifeSelection } from "../data/infiniteFlow";
import { getLegacyRelicById, getRelicsForWorld } from "../data/legacyRelics";
import { getHigherRealmId, getNextRealm } from "../data/realms";
import { getShopItemById } from "../data/reincarnationShop";
import { getWorldById } from "../data/worlds";
import { SAVE_VERSION } from "../constants/game";
import {
  continueNarrativeScene,
  generateNarrativeScene,
} from "../services/narrativeApiClient";
import {
  continueNovelScene,
  generateSettlementScene as requestSettlementScene,
  startNovelLife,
} from "../services/novelApiClient";
import { saveService } from "../services/saveService";
import type {
  AiNarrativeResponse,
  AiNarrativeState,
  AiHiddenEffect,
  AiNovelChoice,
  AiNovelScene,
  AttributeMap,
  EventId,
  FateId,
  GameEffect,
  GameEvent,
  GameLog,
  GameLogType,
  GamePage,
  IdentityId,
  LifeState,
  NarrativeLogSummary,
  NarrativePlayerSnapshot,
  NovelState,
  NovelStoryBlock,
  Player,
  BreakthroughMethodId,
  ReincarnationEndType,
  ReincarnationResult,
  ResourceMap,
  SaveData,
  ShopItemId,
  WorldId,
} from "../types";

interface GameStateData {
  player?: Player;
  life?: LifeState;
  meta: ReturnType<typeof createInitialMeta>;
  logs: GameLog[];
  currentEvent?: GameEvent;
  latestResult?: ReincarnationResult;
  aiNarrativeState: AiNarrativeState;
  novelState: NovelState;
  currentPage: GamePage;
  lastActionMessage?: string;
}

interface GameActions {
  navigate: (page: GamePage) => void;
  startLife: (params: {
    name: string;
    worldId: WorldId;
    identityId: IdentityId;
    fateId: FateId;
    storyPremiseId?: string;
    storySeed?: string;
    lifeThemeId?: string;
  }) => void;
  startInfiniteLife: () => Promise<void>;
  cultivateOnce: () => void;
  attemptBreakthrough: (methodId?: BreakthroughMethodId) => void;
  drawEvent: () => void;
  chooseEventOption: (eventId: EventId, optionId: string) => void;
  generateAiNarrativeEvent: () => Promise<void>;
  chooseAiNarrativeChoice: (choiceId: string) => Promise<void>;
  applyAiNarrativeResult: (response: AiNarrativeResponse) => void;
  endAiNarrativeEvent: () => void;
  startNewReincarnation: () => Promise<void>;
  generateOpeningScene: () => Promise<void>;
  selectNovelChoice: (choiceId: string) => Promise<void>;
  continueNovelAfterChoice: (choiceId: string) => Promise<void>;
  applyHiddenEffects: (hiddenEffects: AiHiddenEffect[]) => void;
  generateDeathScene: () => Promise<void>;
  generateSettlementScene: () => Promise<void>;
  enterNextLife: () => Promise<void>;
  skipTypewriter: () => void;
  setNovelTyping: (isTyping: boolean) => void;
  clearNovelError: () => void;
  settleCurrentLife: (reason?: string, endType?: ReincarnationEndType) => void;
  buyShopItem: (itemId: ShopItemId) => void;
  resetSave: () => void;
}

export type GameStore = GameStateData & GameActions;

function createLog(
  generation: number,
  type: GameLogType,
  message: string,
): GameLog {
  return {
    id: createId("log"),
    generation,
    type,
    message,
    createdAt: new Date().toISOString(),
  };
}

function appendLogs(logs: GameLog[], additions: GameLog[]): GameLog[] {
  return [...additions, ...logs].slice(0, 100);
}

function createObjectiveCompletionLog(player: Player, message?: string): GameLog {
  return createLog(
    player.generation,
    "breakthrough",
    message ??
      "青雲小界目標已完成。這只是此世仙途的一道門檻，你仍可繼續突破，或自行選擇輪迴結算。",
  );
}

function getObjectiveCompletionMessage(player: Player): string {
  const nextRealm = getNextRealm(player.realmId);

  if (!nextRealm) {
    return "青雲小界目標已完成。你已抵達目前可修行的最高境界，可自行選擇輪迴結算。";
  }

  return `青雲小界目標已完成。下一步可繼續衝擊${nextRealm.name}${nextRealm.stageName}，也可自行選擇輪迴結算。`;
}

function createEmptyAiNarrativeState(): AiNarrativeState {
  return {
    isLoading: false,
    active: false,
    currentScene: null,
    history: [],
    error: null,
  };
}

function createEmptyNovelState(): NovelState {
  return {
    currentLifeId: null,
    currentWorldId: null,
    currentLifeThemeId: null,
    currentArc: "",
    storySoFarSummary: "",
    visibleStory: [],
    pendingChoices: [],
    lastSelectedChoice: null,
    internalFlags: [],
    hiddenState: {
      tensionLevel: "low",
      relationshipHints: [],
      unresolvedMysteries: [],
      obtainedRelics: [],
      recentSceneTypes: [],
      recentMotifs: [],
    },
    isGenerating: false,
    isTyping: false,
    hasStarted: false,
    isDead: false,
    isSettlementReady: false,
    error: null,
  };
}

function calculateYearsSurvived(player: Player, life: LifeState): number {
  return Math.max(0, player.age - life.startingAge);
}

function toSaveData(state: GameStateData): SaveData {
  return {
    version: SAVE_VERSION,
    savedAt: new Date().toISOString(),
    player: state.player,
    life: state.life,
    meta: state.meta,
    logs: state.logs,
    currentEvent: state.currentEvent,
    latestResult: state.latestResult,
    aiNarrativeState: state.aiNarrativeState,
    novelState: state.novelState,
    currentPage: state.currentPage,
  };
}

function persist(state: GameStateData): void {
  saveService.save(toSaveData(state));
}

function getInitialState(): GameStateData {
  const loaded = saveService.load();

  if (loaded) {
    const fallbackMeta = createInitialMeta();
    return {
      player: loaded.player,
      life: loaded.life,
      meta: {
        ...fallbackMeta,
        ...loaded.meta,
        worldLegacyIds: loaded.meta.worldLegacyIds ?? [],
        legacyRelicIds: loaded.meta.legacyRelicIds ?? [],
      },
      logs: loaded.logs,
      currentEvent: loaded.currentEvent,
      latestResult: loaded.latestResult,
      aiNarrativeState: loaded.aiNarrativeState ?? createEmptyAiNarrativeState(),
      novelState: loaded.novelState ?? createEmptyNovelState(),
      currentPage: loaded.player ? loaded.currentPage : "start",
    };
  }

  return {
    meta: createInitialMeta(),
    logs: [],
    aiNarrativeState: createEmptyAiNarrativeState(),
    novelState: createEmptyNovelState(),
    currentPage: "start",
  };
}

function finalizeLife(
  state: GameStateData,
  player: Player,
  life: LifeState,
  reason: string,
  endType: ReincarnationEndType,
  extraLogs: GameLog[] = [],
): GameStateData {
  const world = getWorldById(life.worldId);
  const endedLife: LifeState = {
    ...life,
    endedAt: new Date().toISOString(),
    isAlive: false,
    deathReason: reason,
    yearsSurvived: calculateYearsSurvived(player, life),
    highestRealmId: getHigherRealmId(life.highestRealmId, player.highestRealmId),
  };
  const finalPlayer: Player = {
    ...player,
    status: endType === "death" ? ["dead"] : player.status,
  };
  const result = createReincarnationResult(
    finalPlayer,
    endedLife,
    world,
    reason,
    endType,
  );
  const meta = applyReincarnationResult(state.meta, result);
  const resultWithBonuses: ReincarnationResult = {
    ...result,
    nextLifeBonusSummary: getNextLifeBonusSummary(meta),
  };
  const summaryLog = createLog(
    player.generation,
    endType === "death" ? "death" : "reincarnation",
    `本世結算：${resultWithBonuses.worldRating}，獲得 ${resultWithBonuses.earnedReincarnationPoints} 輪迴點。`,
  );

  return {
    ...state,
    player: finalPlayer,
    life: endedLife,
    meta,
    logs: appendLogs(state.logs, [summaryLog, ...extraLogs]),
    currentEvent: undefined,
    latestResult: resultWithBonuses,
    aiNarrativeState: createEmptyAiNarrativeState(),
    currentPage: "result",
    lastActionMessage: summaryLog.message,
  };
}

function createNarrativePlayerSnapshot(player: Player): NarrativePlayerSnapshot {
  return {
    name: player.name,
    generation: player.generation,
    currentWorldId: player.currentWorldId,
    identityId: player.identityId,
    fateId: player.fateId,
    realmId: player.realmId,
    highestRealmId: player.highestRealmId,
    cultivation: player.cultivation,
    age: player.age,
    lifespan: player.lifespan,
    hp: player.hp,
    maxHp: player.maxHp,
    spiritualRoot: player.spiritualRoot,
    divineSense: player.divineSense,
    attack: player.attack,
    defense: player.defense,
    comprehension: player.comprehension,
    luck: player.luck,
    daoHeart: player.daoHeart,
    status: player.status,
    resources: player.resources,
  };
}

function recentLogSummaries(logs: GameLog[]): NarrativeLogSummary[] {
  return logs.slice(0, 5).map((log) => ({
    type: log.type,
    message: log.message,
  }));
}

function createNovelStoryBlock(
  scene: AiNovelScene,
  sceneType: NovelStoryBlock["sceneType"],
): NovelStoryBlock {
  return {
    id: scene.sceneId,
    chapterTitle: scene.chapterTitle,
    storyText: scene.storyText,
    displayLines: scene.displayLines.length ? scene.displayLines : [scene.storyText],
    sceneType,
    createdAt: new Date().toISOString(),
  };
}

function appendNovelScene(
  novelState: NovelState,
  scene: AiNovelScene,
  sceneType: NovelStoryBlock["sceneType"],
): NovelState {
  const block = createNovelStoryBlock(scene, sceneType);
  const nextSummary = [novelState.storySoFarSummary, scene.internalSummary]
    .filter(Boolean)
    .join(" ")
    .slice(-1800);

  return {
    ...novelState,
    currentArc: scene.storyState.currentArc,
    storySoFarSummary: nextSummary,
    visibleStory: [...novelState.visibleStory, block].slice(-24),
    pendingChoices:
      scene.storyState.isDeathScene || scene.storyState.isSettlementScene
        ? []
        : scene.choices,
    hiddenState: {
      ...novelState.hiddenState,
      tensionLevel: scene.storyState.tensionLevel,
      recentSceneTypes: [sceneType, ...novelState.hiddenState.recentSceneTypes].slice(0, 6),
      recentMotifs: Array.from(
        new Set([...scene.noveltyHints, ...novelState.hiddenState.recentMotifs]),
      ).slice(0, 12),
      unresolvedMysteries: Array.from(
        new Set([
          ...novelState.hiddenState.unresolvedMysteries,
          ...scene.noveltyHints.filter((hint) => /謎|未知|未解|反轉|伏筆|錯位/.test(hint)),
        ]),
      ).slice(0, 8),
    },
    isGenerating: false,
    isTyping: true,
    hasStarted: true,
    isDead: novelState.isDead || scene.storyState.isDeathScene,
    isSettlementReady:
      novelState.isSettlementReady ||
      scene.storyState.isDeathScene ||
      scene.storyState.isSettlementScene ||
      scene.storyState.isWorldClearScene,
    error: null,
  };
}

function createNovelApiPayload(state: GameStateData) {
  if (!state.player || !state.life) {
    throw new Error("尚未開始輪迴");
  }

  return {
    lifeState: state.life,
    metaProgress: state.meta,
    playerSnapshot: createNarrativePlayerSnapshot(state.player),
    novelState: state.novelState,
    selectedChoice: state.novelState.lastSelectedChoice,
  };
}

function drawStaticEventState(
  state: GameStateData,
  reason?: string,
): GameStateData {
  if (!state.player || !state.life || !state.life.isAlive) {
    return state;
  }

  const world = getWorldById(state.life.worldId);
  const availableEvents = getAvailableEvents(
    events,
    world.eventPool,
    state.player,
    state.life,
  );
  const currentEvent = drawWeightedEvent(availableEvents, Math.random, state.player);
  const log = currentEvent
    ? createLog(
        state.player.generation,
        "event",
        reason
          ? `${reason} 改由既有事件推進：${currentEvent.title}。`
          : `歷練觸發事件：${currentEvent.title}。`,
      )
    : undefined;

  return {
    ...state,
    currentEvent,
    currentPage: "event",
    logs: log ? appendLogs(state.logs, [log]) : state.logs,
    aiNarrativeState: {
      ...state.aiNarrativeState,
      isLoading: false,
      active: false,
      error: reason ?? state.aiNarrativeState.error,
    },
    lastActionMessage: log?.message ?? reason,
  };
}

function getAiNarrativeFallbackReason(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error ?? "");

  if (message.includes("insufficient_quota") || message.includes("quota")) {
    return "天機額度不足或帳單尚未啟用，已改由既有事件推進";
  }

  if (message.includes("OPENAI_API_KEY") || message.includes("api key")) {
    return "後端尚未正確設定天機金鑰，已改由既有事件推進";
  }

  if (message.includes("schema") || message.includes("Invalid AI narrative response")) {
    return "天機回應格式不合規，已改由既有事件推進";
  }

  if (message.includes("abort") || message.includes("timeout")) {
    return "天機推演逾時，已改由既有事件推進";
  }

  if (message.includes("404")) {
    return "找不到後端天機入口，請確認 Vercel 已部署 /api/narrative，已改由既有事件推進";
  }

  if (message.includes("500")) {
    return "後端天機推演暫時失靈，已改由既有事件推進";
  }

  if (message.includes("今日天機推演次數已達上限")) {
    return "今日天機推演次數已達上限，已改由既有事件推進";
  }

  return "天機混沌，改由既有事件推進";
}

function applyNarrativeGameEffects(
  player: Player,
  life: LifeState,
  effects: GameEffect[],
): {
  player: Player;
  life: LifeState;
  deathReason?: string;
  breakthroughHint?: string;
} {
  let nextPlayer = player;
  let nextLife = life;
  let deathReason: string | undefined;
  let breakthroughHint: string | undefined;

  for (const effect of effects) {
    switch (effect.type) {
      case "cultivationDelta":
        nextPlayer = {
          ...nextPlayer,
          cultivation: Math.max(0, nextPlayer.cultivation + (effect.value ?? 0)),
        };
        nextLife = {
          ...nextLife,
          maxSingleCultivationGain: Math.max(
            nextLife.maxSingleCultivationGain,
            Math.max(0, effect.value ?? 0),
          ),
        };
        break;
      case "resourceDelta":
        nextPlayer = applyResourceDelta(nextPlayer, {
          [effect.target as keyof ResourceMap]: effect.value ?? 0,
        });
        break;
      case "attributeDelta":
        nextPlayer = applyAttributeDelta(nextPlayer, {
          [effect.target as keyof AttributeMap]: effect.value ?? 0,
        });
        break;
      case "hpDelta":
        nextPlayer = {
          ...nextPlayer,
          hp: clamp(nextPlayer.hp + (effect.value ?? 0), 0, nextPlayer.maxHp),
        };
        break;
      case "lifespanDelta":
        nextPlayer = {
          ...nextPlayer,
          lifespan: Math.max(nextPlayer.age + 1, nextPlayer.lifespan + (effect.value ?? 0)),
        };
        break;
      case "statusAdd":
        nextPlayer = {
          ...nextPlayer,
          status: addStatuses(nextPlayer.status, [effect.target as Player["status"][number]]),
        };
        break;
      case "eventFlag":
        nextLife = {
          ...nextLife,
          importantEventIds: Array.from(
            new Set([...nextLife.importantEventIds, effect.target ?? createId("ai-flag")]),
          ),
        };
        break;
      case "legacyRelicGain":
        nextLife = {
          ...nextLife,
          importantEventIds: Array.from(
            new Set([...nextLife.importantEventIds, effect.target ?? createId("relic")]),
          ),
        };
        break;
      case "reincarnationPointMultiplierDelta":
        nextLife = {
          ...nextLife,
          reincarnationPointMultiplier:
            nextLife.reincarnationPointMultiplier + (effect.value ?? 0),
        };
        break;
      case "triggerDeath":
        deathReason = effect.reason;
        break;
      case "breakthroughHint":
        breakthroughHint = effect.reason;
        break;
      case "completeWorldObjective":
      case "worldClear":
        if (hasMetWorldObjective(nextPlayer, getWorldById(nextLife.worldId))) {
          nextLife = {
            ...nextLife,
            objectiveCompleted: true,
          };
        }
        break;
    }
  }

  const death = checkDeath(nextPlayer, deathReason);

  if (death.isDead) {
    nextPlayer = {
      ...nextPlayer,
      hp: 0,
      status: ["dead"],
    };
  }

  return {
    player: nextPlayer,
    life: {
      ...nextLife,
      yearsSurvived: calculateYearsSurvived(nextPlayer, nextLife),
      highestRealmId: getHigherRealmId(nextLife.highestRealmId, nextPlayer.highestRealmId),
    },
    deathReason: death.reason,
    breakthroughHint,
  };
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...getInitialState(),

  navigate(page) {
    set({ currentPage: page });
    persist(get());
  },

  startLife({ name, worldId, identityId, fateId, storyPremiseId, storySeed, lifeThemeId }) {
    const state = get();
    const world = getWorldById(worldId);
    const identity = getIdentityById(identityId);
    const fate = getFateById(fateId);
    const { meta, player, life } = createNewLife({
      name,
      world,
      identity,
      fate,
      meta: state.meta,
    });
    const lifeWithStory: LifeState = {
      ...life,
      storyPremiseId,
      storySeed: storySeed ?? createId("story"),
      lifeThemeId,
    };
    const log = createLog(
      player.generation,
      "life",
      `第 ${player.generation} 世墜入無限流：${world.worldName}，身份與命格已由輪迴自定。`,
    );
    const nextState: GameStateData = {
      ...state,
      player,
      life: lifeWithStory,
      meta,
      currentEvent: undefined,
      latestResult: undefined,
      aiNarrativeState: createEmptyAiNarrativeState(),
      novelState: {
        ...createEmptyNovelState(),
        currentLifeId: life.startedAt,
        currentWorldId: worldId,
        currentLifeThemeId: lifeThemeId ?? null,
        currentArc: "開篇",
      },
      currentPage: "main",
      logs: appendLogs(state.logs, [log]),
      lastActionMessage: log.message,
    };

    set(nextState);
    persist(nextState);
  },

  async startInfiniteLife() {
    const state = get();
    const selection = createInfiniteLifeSelection(state.meta);

    get().startLife({
      name: selection.name,
      worldId: selection.worldId,
      identityId: selection.identityId,
      fateId: selection.fateId,
      storyPremiseId: selection.premise.id,
      storySeed: createId("seed"),
      lifeThemeId: selection.lifeTheme.id,
    });

    const nextState: GameStateData = {
      ...get(),
      currentPage: "event",
      lastActionMessage: `${selection.premise.title}：${selection.premise.openingText}`,
    };

    set(nextState);
    persist(nextState);
    await get().generateAiNarrativeEvent();
  },

  cultivateOnce() {
    const state = get();

    if (!state.player || !state.life || !state.life.isAlive) {
      return;
    }

    const world = getWorldById(state.life.worldId);
    const identity = getIdentityById(state.life.identityId);
    const fate = getFateById(state.life.fateId);
    const outcome = cultivate({
      player: state.player,
      meta: state.meta,
      world,
      identity,
      fate,
    });
    const life: LifeState = {
      ...state.life,
      yearsSurvived: calculateYearsSurvived(outcome.player, state.life),
      highestRealmId: getHigherRealmId(
        state.life.highestRealmId,
        outcome.player.highestRealmId,
      ),
      maxSingleCultivationGain: Math.max(
        state.life.maxSingleCultivationGain,
        outcome.gain,
      ),
      enlightenmentCount:
        state.life.enlightenmentCount + (outcome.critical.important ? 1 : 0),
      importantEventIds: outcome.critical.important
        ? Array.from(
            new Set([
              ...state.life.importantEventIds,
              `cultivation_${outcome.critical.tier}_${Date.now()}`,
            ]),
          )
        : state.life.importantEventIds,
    };
    const availableEvents = getAvailableEvents(
      events,
      world.eventPool,
      outcome.player,
      life,
    );
    const currentEvent = outcome.eventTriggered
      ? drawWeightedEvent(availableEvents, Math.random, outcome.player)
      : undefined;
    const message = currentEvent
      ? `${outcome.critical.label}，修為 +${outcome.gain}（${outcome.critical.multiplier || "推滿"} 倍）。${outcome.critical.text} 並觸發事件「${currentEvent.title}」。`
      : `${outcome.critical.label}，修為 +${outcome.gain}（${outcome.critical.multiplier || "推滿"} 倍）。${outcome.critical.text}`;
    const cultivationLog = createLog(outcome.player.generation, "cultivation", message);

    if (outcome.deathReason) {
      const nextState = finalizeLife(
        state,
        outcome.player,
        life,
        outcome.deathReason,
        "death",
        [cultivationLog],
      );
      set(nextState);
      persist(nextState);
      return;
    }

    const nextState: GameStateData = {
      ...state,
      player: outcome.player,
      life,
      logs: appendLogs(state.logs, [cultivationLog]),
      currentEvent,
      currentPage: currentEvent ? "event" : state.currentPage,
      lastActionMessage: message,
    };

    set(nextState);
    persist(nextState);
  },

  attemptBreakthrough(methodId = "stable") {
    const state = get();

    if (!state.player || !state.life || !state.life.isAlive) {
      return;
    }

    const world = getWorldById(state.life.worldId);
    const identity = getIdentityById(state.life.identityId);
    const fate = getFateById(state.life.fateId);
    const outcome = runBreakthrough({
      player: state.player,
      meta: state.meta,
      world,
      identity,
      fate,
      methodId,
    });
    const life: LifeState = {
      ...state.life,
      objectiveCompleted:
        state.life.objectiveCompleted || outcome.objectiveCompleted,
      yearsSurvived: calculateYearsSurvived(outcome.player, state.life),
      highestRealmId: getHigherRealmId(
        state.life.highestRealmId,
        outcome.player.highestRealmId,
      ),
      defyingBreakthroughCount:
        state.life.defyingBreakthroughCount +
        (outcome.success && outcome.method.id === "defy_heaven" ? 1 : 0),
      reincarnationPointMultiplier:
        state.life.reincarnationPointMultiplier +
        outcome.reincarnationPointMultiplierDelta,
      importantEventIds: outcome.important
        ? Array.from(
            new Set([
              ...state.life.importantEventIds,
              `breakthrough_${outcome.method.id}_${Date.now()}`,
            ]),
          )
        : state.life.importantEventIds,
    };
    const breakthroughLog = createLog(
      outcome.player.generation,
      "breakthrough",
      outcome.message,
    );
    const completedObjectiveNow =
      outcome.objectiveCompleted && !state.life.objectiveCompleted;
    const objectiveLog = completedObjectiveNow
      ? createObjectiveCompletionLog(outcome.player)
      : undefined;

    if (outcome.deathReason) {
      const nextState = finalizeLife(
        state,
        outcome.player,
        life,
        outcome.deathReason,
        "death",
        [breakthroughLog],
      );
      set(nextState);
      persist(nextState);
      return;
    }

    const nextState: GameStateData = {
      ...state,
      player: outcome.player,
      life,
      logs: appendLogs(
        state.logs,
        objectiveLog ? [objectiveLog, breakthroughLog] : [breakthroughLog],
      ),
      lastActionMessage: completedObjectiveNow
        ? `${outcome.message} ${getObjectiveCompletionMessage(outcome.player)}`
        : outcome.message,
    };

    set(nextState);
    persist(nextState);
  },

  drawEvent() {
    const state = get();

    if (!state.player || !state.life || !state.life.isAlive) {
      return;
    }

    const world = getWorldById(state.life.worldId);
    const availableEvents = getAvailableEvents(
      events,
      world.eventPool,
      state.player,
      state.life,
    );
    const currentEvent = drawWeightedEvent(availableEvents, Math.random, state.player);
    const log = currentEvent
      ? createLog(
          state.player.generation,
          "event",
          `歷練觸發事件：${currentEvent.title}。`,
        )
      : undefined;
    const nextState: GameStateData = {
      ...state,
      currentEvent,
      currentPage: "event",
      aiNarrativeState: createEmptyAiNarrativeState(),
      logs: log ? appendLogs(state.logs, [log]) : state.logs,
      lastActionMessage: log?.message,
    };

    set(nextState);
    persist(nextState);
  },

  chooseEventOption(eventId, optionId) {
    const state = get();

    if (!state.player || !state.life || !state.currentEvent) {
      return;
    }

    if (state.currentEvent.eventId !== eventId) {
      return;
    }

    const option = state.currentEvent.options.find(
      (item) => item.optionId === optionId,
    );

    if (!option) {
      return;
    }

    const resolved = resolveEventOption(
      state.player,
      state.life,
      state.currentEvent,
      option,
    );
    const changeSummary = summarizeEventResultChanges(resolved.result).join("、");
    const message = `${state.currentEvent.title}：選擇「${option.text}」，${
      resolved.success ? "成功" : "失敗"
    }。${resolved.result.description} 變化：${changeSummary}。`;
    const resultLog = createLog(resolved.player.generation, "event", message);
    const completedObjectiveNow =
      resolved.life.objectiveCompleted && !state.life.objectiveCompleted;
    const objectiveLog = completedObjectiveNow
      ? createObjectiveCompletionLog(
          resolved.player,
          "青雲小界目標已完成。奇遇只是推開了門，此世修行仍可繼續向上。",
        )
      : undefined;

    if (resolved.deathReason) {
      const nextState = finalizeLife(
        state,
        resolved.player,
        resolved.life,
        resolved.deathReason,
        "death",
        [resultLog],
      );
      set(nextState);
      persist(nextState);
      return;
    }

    const nextState: GameStateData = {
      ...state,
      player: resolved.player,
      life: resolved.life,
      currentEvent: undefined,
      currentPage: "event",
      logs: appendLogs(state.logs, objectiveLog ? [objectiveLog, resultLog] : [resultLog]),
      lastActionMessage: completedObjectiveNow
        ? `${message} ${getObjectiveCompletionMessage(resolved.player)}`
        : message,
    };

    set(nextState);
    persist(nextState);
  },

  async generateAiNarrativeEvent() {
    const state = get();

    if (
      state.aiNarrativeState.isLoading ||
      !state.player ||
      !state.life ||
      !state.life.isAlive
    ) {
      return;
    }

    const loadingState: GameStateData = {
      ...state,
      currentEvent: undefined,
      currentPage: "event",
      aiNarrativeState: {
        ...state.aiNarrativeState,
        isLoading: true,
        active: true,
        error: null,
      },
      lastActionMessage: "天機推演中……",
    };

    set(loadingState);
    persist(loadingState);

    try {
      const response = await generateNarrativeScene({
        lifeState: state.life,
        metaProgress: state.meta,
        worldId: state.life.worldId,
        playerSnapshot: createNarrativePlayerSnapshot(state.player),
        recentLogs: recentLogSummaries(state.logs),
        triggerType: "manual_explore",
      });

      get().applyAiNarrativeResult(response);
    } catch (error) {
      const fallbackState = drawStaticEventState(
        get(),
        getAiNarrativeFallbackReason(error),
      );
      set(fallbackState);
      persist(fallbackState);
    }
  },

  async chooseAiNarrativeChoice(choiceId) {
    const state = get();
    const scene = state.aiNarrativeState.currentScene;
    const selectedChoice = scene?.choices.find((choice) => choice.choiceId === choiceId);

    if (
      state.aiNarrativeState.isLoading ||
      !state.player ||
      !state.life ||
      !state.life.isAlive ||
      !scene ||
      !selectedChoice
    ) {
      return;
    }

    const loadingState: GameStateData = {
      ...state,
      aiNarrativeState: {
        ...state.aiNarrativeState,
        isLoading: true,
        active: true,
        error: null,
        history: [
          {
            sceneId: scene.sceneId,
            title: scene.title,
            selectedChoiceId: choiceId,
            createdAt: new Date().toISOString(),
          },
          ...state.aiNarrativeState.history,
        ].slice(0, 20),
      },
      lastActionMessage: "天機推演中……",
    };

    set(loadingState);
    persist(loadingState);

    try {
      const response = await continueNarrativeScene({
        lifeState: state.life,
        metaProgress: state.meta,
        currentNarrativeState: scene,
        selectedChoice,
        playerSnapshot: createNarrativePlayerSnapshot(state.player),
        recentLogs: recentLogSummaries(state.logs),
      });

      get().applyAiNarrativeResult(response);
    } catch (error) {
      const fallbackState = drawStaticEventState(
        get(),
        getAiNarrativeFallbackReason(error),
      );
      set(fallbackState);
      persist(fallbackState);
    }
  },

  applyAiNarrativeResult(response) {
    const state = get();

    if (!state.player || !state.life || !state.life.isAlive) {
      return;
    }

    const world = getWorldById(state.life.worldId);
    const resolved = resolveAiSuggestedEffects({
      aiEffects: response.suggestedEffects,
      player: state.player,
      lifeState: state.life,
      metaProgress: state.meta,
      worldConfig: world,
      responseFlags: response,
    });
    const applied = applyNarrativeGameEffects(
      state.player,
      {
        ...state.life,
        completedEventIds: Array.from(
          new Set([...state.life.completedEventIds, response.sceneId]),
        ),
        importantEventIds:
          response.rarity === "common"
            ? state.life.importantEventIds
            : Array.from(new Set([...state.life.importantEventIds, response.sceneId])),
        rareEventsCompleted:
          state.life.rareEventsCompleted + (response.rarity === "common" ? 0 : 1),
        epicEventsCompleted:
          state.life.epicEventsCompleted + (response.rarity === "epic" ? 1 : 0),
        legendaryEventsCompleted:
          state.life.legendaryEventsCompleted +
          (response.rarity === "legendary" ? 1 : 0),
        mythicEventsCompleted:
          state.life.mythicEventsCompleted + (response.rarity === "mythic" ? 1 : 0),
      },
      resolved.effects,
    );
    const visibleText = resolved.visibleChanges
      .map((change) => `${change.label} ${change.value}`)
      .join("、");
    const warningsText = resolved.balanceWarnings.length
      ? `（已平衡：${resolved.balanceWarnings.join("、")}）`
      : "";
    const narrativeLog = createLog(
      applied.player.generation,
      "event",
      `${response.logText}${visibleText ? `｜${visibleText}` : ""}${warningsText}`,
    );
    let narrativePlayer = applied.player;
    let narrativeLife = applied.life;
    let breakthroughHint = applied.breakthroughHint;
    const autoBreakthroughLogs: GameLog[] = [];
    let autoBreakthroughDeathReason: string | undefined;

    if (!applied.deathReason && response.shouldTriggerBreakthrough && canBreakthrough(narrativePlayer)) {
      const identity = getIdentityById(narrativeLife.identityId);
      const fate = getFateById(narrativeLife.fateId);
      const outcome = runBreakthrough({
        player: narrativePlayer,
        meta: state.meta,
        world,
        identity,
        fate,
        methodId: "stable",
      });

      narrativePlayer = outcome.player;
      narrativeLife = {
        ...narrativeLife,
        objectiveCompleted: narrativeLife.objectiveCompleted || outcome.objectiveCompleted,
        yearsSurvived: calculateYearsSurvived(outcome.player, narrativeLife),
        highestRealmId: getHigherRealmId(
          narrativeLife.highestRealmId,
          outcome.player.highestRealmId,
        ),
        reincarnationPointMultiplier:
          narrativeLife.reincarnationPointMultiplier +
          outcome.reincarnationPointMultiplierDelta,
        importantEventIds: outcome.important
          ? Array.from(
              new Set([
                ...narrativeLife.importantEventIds,
                `story_breakthrough_${outcome.method.id}_${Date.now()}`,
              ]),
            )
          : narrativeLife.importantEventIds,
      };
      breakthroughHint = outcome.message;
      autoBreakthroughDeathReason = outcome.deathReason;
      autoBreakthroughLogs.push(
        createLog(outcome.player.generation, "breakthrough", `劇情破境：${outcome.message}`),
      );
    }

    const completedObjectiveNow =
      narrativeLife.objectiveCompleted && !state.life.objectiveCompleted;
    const objectiveLog = completedObjectiveNow
      ? createObjectiveCompletionLog(
          narrativePlayer,
          "青雲小界目標已完成。天機只是指明前路，此世仍可繼續向下一境界突破。",
        )
      : undefined;
    const extraLogs = [
      ...(objectiveLog ? [objectiveLog] : []),
      ...autoBreakthroughLogs,
      narrativeLog,
    ];

    if (applied.deathReason || autoBreakthroughDeathReason) {
      const nextState = finalizeLife(
        state,
        narrativePlayer,
        narrativeLife,
        applied.deathReason ?? autoBreakthroughDeathReason ?? "劇情破境失敗，身死道消",
        "death",
        extraLogs,
      );
      set(nextState);
      persist(nextState);
      return;
    }

    const nextState: GameStateData = {
      ...state,
      player: narrativePlayer,
      life: narrativeLife,
      currentEvent: undefined,
      currentPage: "event",
      logs: appendLogs(state.logs, extraLogs),
      aiNarrativeState: {
        isLoading: false,
        active: !response.shouldEndEvent,
        currentScene: response,
        history: [
          {
            sceneId: response.sceneId,
            title: response.title,
            createdAt: new Date().toISOString(),
          },
          ...state.aiNarrativeState.history,
        ].slice(0, 20),
        error: null,
      },
      lastActionMessage: completedObjectiveNow
        ? `${narrativeLog.message} ${getObjectiveCompletionMessage(narrativePlayer)}`
        : breakthroughHint ?? narrativeLog.message,
    };

    set(nextState);
    persist(nextState);
  },

  endAiNarrativeEvent() {
    const nextState: GameStateData = {
      ...get(),
      aiNarrativeState: createEmptyAiNarrativeState(),
      currentPage: "event",
    };

    set(nextState);
    persist(nextState);
  },

  async startNewReincarnation() {
    const state = get();

    if (state.novelState.isGenerating || state.novelState.pendingChoices.length > 0) {
      return;
    }

    const selection = createInfiniteLifeSelection(state.meta);
    get().startLife({
      name: selection.name,
      worldId: selection.worldId,
      identityId: selection.identityId,
      fateId: selection.fateId,
      storyPremiseId: selection.premise.id,
      storySeed: createId("seed"),
      lifeThemeId: selection.lifeTheme.id,
    });

    await get().generateOpeningScene();
  },

  async generateOpeningScene() {
    const state = get();

    if (
      state.novelState.isGenerating ||
      state.novelState.pendingChoices.length > 0 ||
      !state.player ||
      !state.life
    ) {
      return;
    }

    const loadingState: GameStateData = {
      ...state,
      currentPage: "event",
      novelState: {
        ...state.novelState,
        isGenerating: true,
        error: null,
      },
      lastActionMessage: "命數流轉中……",
    };

    set(loadingState);
    persist(loadingState);

    try {
      const scene = await startNovelLife(createNovelApiPayload(get()));
      const nextState: GameStateData = {
        ...get(),
        currentPage: "event",
        novelState: appendNovelScene(get().novelState, scene, "opening"),
      };
      set(nextState);
      persist(nextState);
      get().applyHiddenEffects(scene.hiddenEffects);
    } catch {
      const failed: GameStateData = {
        ...get(),
        novelState: {
          ...get().novelState,
          isGenerating: false,
          error: "輪迴長河暫時沉默，請再試一次。",
        },
        lastActionMessage: "輪迴長河暫時沉默，請再試一次。",
      };
      set(failed);
      persist(failed);
    }
  },

  async selectNovelChoice(choiceId) {
    await get().continueNovelAfterChoice(choiceId);
  },

  async continueNovelAfterChoice(choiceId) {
    const state = get();
    const selectedChoice = state.novelState.pendingChoices.find(
      (choice) => choice.choiceId === choiceId,
    );

    if (
      state.novelState.isGenerating ||
      !state.player ||
      !state.life ||
      !state.life.isAlive ||
      !selectedChoice
    ) {
      return;
    }

    const loadingState: GameStateData = {
      ...state,
      novelState: {
        ...state.novelState,
        lastSelectedChoice: selectedChoice,
        isGenerating: true,
        error: null,
      },
      lastActionMessage: "此世因果將啟……",
    };

    set(loadingState);
    persist(loadingState);

    try {
      const scene = await continueNovelScene(createNovelApiPayload(get()));
      const nextState: GameStateData = {
        ...get(),
        novelState: appendNovelScene(get().novelState, scene, "continue"),
      };
      set(nextState);
      persist(nextState);
      get().applyHiddenEffects(scene.hiddenEffects);

      const afterApply = get();
      if (afterApply.novelState.isDead && !scene.storyState.isDeathScene) {
        await get().generateDeathScene();
      }
    } catch {
      const failed: GameStateData = {
        ...get(),
        novelState: {
          ...get().novelState,
          isGenerating: false,
          error: "天機暫時斷線，選擇仍保留，可再試一次。",
        },
        lastActionMessage: "天機暫時斷線，選擇仍保留，可再試一次。",
      };
      set(failed);
      persist(failed);
    }
  },

  applyHiddenEffects(hiddenEffects) {
    const state = get();

    if (!state.player || !state.life) {
      return;
    }

    const world = getWorldById(state.life.worldId);
    const resolved = resolveHiddenEffects({
      hiddenEffects,
      player: state.player,
      lifeState: state.life,
      metaProgress: state.meta,
      worldConfig: world,
    });
    const applied = applyNarrativeGameEffects(state.player, state.life, resolved.effects);
    let nextPlayer = applied.player;
    let nextLife = applied.life;
    let nextMeta = state.meta;
    let novelState = state.novelState;
    const gainedRelics = resolved.effects
      .filter((effect) => effect.type === "legacyRelicGain" && effect.target)
      .map((effect) => effect.target as string);
    const worldClear = resolved.effects.some((effect) => effect.type === "worldClear");

    if (resolved.effects.some((effect) => effect.type === "breakthroughHint") && canBreakthrough(nextPlayer)) {
      const outcome = runBreakthrough({
        player: nextPlayer,
        meta: state.meta,
        world,
        identity: getIdentityById(nextLife.identityId),
        fate: getFateById(nextLife.fateId),
        methodId: "stable",
      });
      nextPlayer = outcome.player;
      nextLife = {
        ...nextLife,
        objectiveCompleted: nextLife.objectiveCompleted || outcome.objectiveCompleted,
        highestRealmId: getHigherRealmId(nextLife.highestRealmId, outcome.player.highestRealmId),
        yearsSurvived: calculateYearsSurvived(outcome.player, nextLife),
        reincarnationPointMultiplier:
          nextLife.reincarnationPointMultiplier + outcome.reincarnationPointMultiplierDelta,
      };
    }

    if (worldClear) {
      nextLife = {
        ...nextLife,
        objectiveCompleted: true,
      };
      novelState = {
        ...novelState,
        isSettlementReady: true,
      };
    }

    const relicPool = gainedRelics.length ? gainedRelics : worldClear ? [getRelicsForWorld(world.worldId)[0]?.relicId].filter(Boolean) : [];
    if (relicPool.length > 0) {
      nextMeta = {
        ...nextMeta,
        legacyRelicIds: Array.from(new Set([...(nextMeta.legacyRelicIds ?? []), ...relicPool])),
        worldLegacyIds: Array.from(new Set([...(nextMeta.worldLegacyIds ?? []), ...relicPool])),
      };
      novelState = {
        ...novelState,
        hiddenState: {
          ...novelState.hiddenState,
          obtainedRelics: Array.from(
            new Set([
              ...novelState.hiddenState.obtainedRelics,
              ...relicPool.map((id) => getLegacyRelicById(id)?.name ?? id),
            ]),
          ),
        },
      };
    }

    if (applied.deathReason) {
      nextPlayer = {
        ...nextPlayer,
        hp: 0,
        status: ["dead"],
      };
      nextLife = {
        ...nextLife,
        isAlive: false,
        deathReason: applied.deathReason,
        endedAt: new Date().toISOString(),
      };
      novelState = {
        ...novelState,
        isDead: true,
        isSettlementReady: true,
        pendingChoices: [],
      };
    }

    const nextState: GameStateData = {
      ...state,
      player: nextPlayer,
      life: nextLife,
      meta: nextMeta,
      novelState,
      lastActionMessage: resolved.balanceWarnings[0],
    };

    set(nextState);
    persist(nextState);
  },

  async generateDeathScene() {
    const state = get();

    if (!state.player || !state.life || state.novelState.isGenerating) {
      return;
    }

    set({
      novelState: {
        ...state.novelState,
        isGenerating: true,
        pendingChoices: [],
        error: null,
      },
    });
    persist(get());

    try {
      const scene = await requestSettlementScene({
        ...createNovelApiPayload(get()),
        generationGoal: "death",
      });
      const nextState: GameStateData = {
        ...get(),
        novelState: appendNovelScene(get().novelState, scene, "death"),
      };
      set(nextState);
      persist(nextState);
    } catch {
      const fallbackScene: AiNovelScene = {
        sceneId: createId("death_scene"),
        chapterTitle: "輪迴長河",
        storyText:
          "此世最後一縷光在識海深處熄滅時，你沒有立刻墜入黑暗。遠處有長河沉默流過，河面映出你做過的每一個選擇，也映出那些尚未回收的因果。你伸手想抓住什麼，只握住一點微弱的前世餘燼。",
        displayLines: [
          "此世最後一縷光在識海深處熄滅時，你沒有立刻墜入黑暗。",
          "遠處有長河沉默流過，河面映出你做過的每一個選擇，也映出那些尚未回收的因果。",
          "你伸手想抓住什麼，只握住一點微弱的前世餘燼。",
        ],
        choices: [],
        hiddenEffects: [],
        storyState: {
          shouldContinue: false,
          isDeathScene: true,
          isSettlementScene: false,
          isWorldClearScene: false,
          currentArc: "死亡回望",
          tensionLevel: "climax",
        },
        internalSummary: "此世死亡，神魂回到輪迴長河前。",
        noveltyHints: ["死亡小說化"],
      };
      const nextState: GameStateData = {
        ...get(),
        novelState: appendNovelScene(get().novelState, fallbackScene, "death"),
      };
      set(nextState);
      persist(nextState);
    }
  },

  async generateSettlementScene() {
    const state = get();

    if (!state.player || !state.life || state.novelState.isGenerating) {
      return;
    }

    const loadingState: GameStateData = {
      ...state,
      novelState: {
        ...state.novelState,
        isGenerating: true,
        pendingChoices: [],
        error: null,
      },
      lastActionMessage: "輪迴清算中……",
    };
    set(loadingState);
    persist(loadingState);

    try {
      const scene = await requestSettlementScene({
        ...createNovelApiPayload(get()),
        generationGoal: "settlement",
      });
      const finalized =
        !get().latestResult
          ? finalizeLife(
              get(),
              get().player!,
              get().life!,
              get().life?.deathReason ?? "此世因果清算，神魂歸入輪迴",
              get().life?.objectiveCompleted ? "objective" : "death",
            )
          : get();
      const nextState: GameStateData = {
        ...finalized,
        currentPage: "result",
        novelState: {
          ...appendNovelScene(get().novelState, scene, "settlement"),
          isSettlementReady: true,
          pendingChoices: [],
        },
      };
      set(nextState);
      persist(nextState);
    } catch {
      const nextState: GameStateData = {
        ...get(),
        novelState: {
          ...get().novelState,
          isGenerating: false,
          error: "輪迴清算暫時受阻，請再試一次。",
        },
      };
      set(nextState);
      persist(nextState);
    }
  },

  async enterNextLife() {
    await get().startNewReincarnation();
  },

  skipTypewriter() {
    const nextState: GameStateData = {
      ...get(),
      novelState: {
        ...get().novelState,
        isTyping: false,
      },
    };

    set(nextState);
    persist(nextState);
  },

  setNovelTyping(isTyping) {
    const nextState: GameStateData = {
      ...get(),
      novelState: {
        ...get().novelState,
        isTyping,
      },
    };

    set(nextState);
    persist(nextState);
  },

  clearNovelError() {
    const nextState: GameStateData = {
      ...get(),
      novelState: {
        ...get().novelState,
        error: null,
      },
    };

    set(nextState);
    persist(nextState);
  },

  settleCurrentLife(reason = "主動結束本世，歸入輪迴", endType = "manual") {
    const state = get();

    if (!state.player || !state.life || !state.life.isAlive) {
      return;
    }

    const nextState = finalizeLife(state, state.player, state.life, reason, endType, [
      createLog(state.player.generation, "reincarnation", reason),
    ]);
    set(nextState);
    persist(nextState);
  },

  buyShopItem(itemId) {
    const state = get();
    const item = getShopItemById(itemId);
    const result = purchaseShopItem(state.meta, item);
    const nextState: GameStateData = {
      ...state,
      meta: result.meta,
      logs: appendLogs(state.logs, [
        createLog(
          state.player?.generation ?? state.meta.totalLives,
          "shop",
          result.message,
        ),
      ]),
      lastActionMessage: result.message,
    };

    set(nextState);
    persist(nextState);
  },

  resetSave() {
    saveService.clear();
    set({
      meta: createInitialMeta(),
      logs: [],
      player: undefined,
      life: undefined,
      currentEvent: undefined,
      latestResult: undefined,
      aiNarrativeState: createEmptyAiNarrativeState(),
      novelState: createEmptyNovelState(),
      currentPage: "start",
      lastActionMessage: undefined,
    });
  },
}));
