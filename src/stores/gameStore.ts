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
import { getHigherRealmId, getNextRealm } from "../data/realms";
import { getShopItemById } from "../data/reincarnationShop";
import { getWorldById } from "../data/worlds";
import { SAVE_VERSION } from "../constants/game";
import {
  continueNarrativeScene,
  generateNarrativeScene,
} from "../services/narrativeApiClient";
import { saveService } from "../services/saveService";
import type {
  AiNarrativeResponse,
  AiNarrativeState,
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
      },
      logs: loaded.logs,
      currentEvent: loaded.currentEvent,
      latestResult: loaded.latestResult,
      aiNarrativeState: loaded.aiNarrativeState ?? createEmptyAiNarrativeState(),
      currentPage: loaded.player ? loaded.currentPage : "start",
    };
  }

  return {
    meta: createInitialMeta(),
    logs: [],
    aiNarrativeState: createEmptyAiNarrativeState(),
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
    return "OpenAI 額度不足或帳單尚未啟用，已改由既有事件推進";
  }

  if (message.includes("OPENAI_API_KEY") || message.includes("api key")) {
    return "後端尚未正確設定 OPENAI_API_KEY，已改由既有事件推進";
  }

  if (message.includes("schema") || message.includes("Invalid AI narrative response")) {
    return "AI 回傳格式不合規，已改由既有事件推進";
  }

  if (message.includes("abort") || message.includes("timeout")) {
    return "天機推演逾時，已改由既有事件推進";
  }

  if (message.includes("404")) {
    return "找不到後端 API route，請確認 Vercel 已部署 /api/narrative，已改由既有事件推進";
  }

  if (message.includes("500")) {
    return `後端 AI route 執行失敗：${message.slice(0, 160)}`;
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

  startLife({ name, worldId, identityId, fateId, storyPremiseId, storySeed }) {
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
      currentPage: "start",
      lastActionMessage: undefined,
    });
  },
}));
