import { create } from "zustand";
import { attemptBreakthrough as runBreakthrough } from "../core/breakthrough";
import { createId } from "../core/balance";
import { cultivate } from "../core/cultivation";
import {
  drawWeightedEvent,
  getAvailableEvents,
  resolveEventOption,
  summarizeEventResultChanges,
} from "../core/eventEngine";
import {
  applyReincarnationResult,
  createInitialMeta,
  createNewLife,
  createReincarnationResult,
  getNextLifeBonusSummary,
  purchaseShopItem,
} from "../core/reincarnation";
import { events } from "../data/events";
import { getFateById } from "../data/fates";
import { getIdentityById } from "../data/identities";
import { getHigherRealmId } from "../data/realms";
import { getShopItemById } from "../data/reincarnationShop";
import { getWorldById } from "../data/worlds";
import { SAVE_VERSION } from "../constants/game";
import { saveService } from "../services/saveService";
import type {
  EventId,
  FateId,
  GameEvent,
  GameLog,
  GameLogType,
  GamePage,
  IdentityId,
  LifeState,
  Player,
  BreakthroughMethodId,
  ReincarnationEndType,
  ReincarnationResult,
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
  }) => void;
  cultivateOnce: () => void;
  attemptBreakthrough: (methodId?: BreakthroughMethodId) => void;
  drawEvent: () => void;
  chooseEventOption: (eventId: EventId, optionId: string) => void;
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
    currentPage: state.currentPage,
  };
}

function persist(state: GameStateData): void {
  saveService.save(toSaveData(state));
}

function getInitialState(): GameStateData {
  const loaded = saveService.load();

  if (loaded) {
    return {
      player: loaded.player,
      life: loaded.life,
      meta: loaded.meta,
      logs: loaded.logs,
      currentEvent: loaded.currentEvent,
      latestResult: loaded.latestResult,
      currentPage: loaded.player ? loaded.currentPage : "start",
    };
  }

  return {
    meta: createInitialMeta(),
    logs: [],
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
    currentPage: "result",
    lastActionMessage: summaryLog.message,
  };
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...getInitialState(),

  navigate(page) {
    set({ currentPage: page });
    persist(get());
  },

  startLife({ name, worldId, identityId, fateId }) {
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
    const log = createLog(
      player.generation,
      "life",
      `第 ${player.generation} 世開始：${world.worldName}，${identity.name}，命格「${fate.name}」。`,
    );
    const nextState: GameStateData = {
      ...state,
      player,
      life,
      meta,
      currentEvent: undefined,
      latestResult: undefined,
      currentPage: "main",
      logs: appendLogs(state.logs, [log]),
      lastActionMessage: log.message,
    };

    set(nextState);
    persist(nextState);
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

    if (outcome.objectiveCompleted) {
      const nextState = finalizeLife(
        state,
        outcome.player,
        life,
        "完成青雲小界目標：成功築基",
        "objective",
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
      logs: appendLogs(state.logs, [breakthroughLog]),
      lastActionMessage: outcome.message,
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

    if (resolved.life.objectiveCompleted && !state.life.objectiveCompleted) {
      const nextState = finalizeLife(
        state,
        resolved.player,
        resolved.life,
        "完成世界目標，主動歸入輪迴",
        "objective",
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
      logs: appendLogs(state.logs, [resultLog]),
      lastActionMessage: message,
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
      currentPage: "start",
      lastActionMessage: undefined,
    });
  },
}));
