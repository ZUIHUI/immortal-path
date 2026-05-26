import { getRealmById } from "../data/realms";
import {
  BALANCE,
  addStatuses,
  applyAttributeDelta,
  applyResourceDelta,
  clamp,
  removeStatuses,
} from "./balance";
import { checkDeath } from "./death";
import type {
  EventOption,
  EventRequirement,
  EventResult,
  EventRarity,
  GameEvent,
  LifeState,
  Player,
  ResourceMap,
} from "../types";

export const EVENT_RARITY_LABELS: Record<EventRarity, string> = {
  common: "普通",
  rare: "稀有",
  epic: "史詩",
  legendary: "傳說",
  mythic: "神話",
};

export function getEventRarityMultiplier(rarity: EventRarity): number {
  switch (rarity) {
    case "common":
      return 1;
    case "rare":
      return 2;
    case "epic":
      return 4;
    case "legendary":
      return 8;
    case "mythic":
      return 16;
  }
}

function scalePositive(value: number | undefined, multiplier: number): number | undefined {
  if (value === undefined || value <= 0) {
    return value;
  }

  return Math.ceil(value * multiplier);
}

function scalePositiveRecord<T extends Record<string, number | undefined>>(
  record: T | undefined,
  multiplier: number,
): T | undefined {
  if (!record) {
    return undefined;
  }

  const scaled = { ...record };

  for (const [key, value] of Object.entries(record)) {
    if (typeof value === "number" && value > 0) {
      scaled[key as keyof T] = Math.ceil(value * multiplier) as T[keyof T];
    }
  }

  return scaled;
}

export function applyEventRarityMultiplier(
  result: EventResult,
  rarity: EventRarity,
): EventResult {
  const multiplier = getEventRarityMultiplier(rarity);

  return {
    ...result,
    cultivationDelta: scalePositive(result.cultivationDelta, multiplier),
    hpDelta: scalePositive(result.hpDelta, rarity === "common" ? 1 : Math.min(2, multiplier)),
    maxHpDelta: scalePositive(result.maxHpDelta, multiplier),
    lifespanDelta: scalePositive(result.lifespanDelta, multiplier),
    resourcesDelta: scalePositiveRecord(result.resourcesDelta, multiplier),
    attributeDelta: scalePositiveRecord(
      result.attributeDelta,
      rarity === "legendary" || rarity === "mythic" ? Math.min(4, multiplier) : Math.min(2, multiplier),
    ),
    markImportant: result.markImportant || rarity !== "common",
    rareEvent: result.rareEvent || rarity !== "common",
  };
}

export function meetsEventRequirement(
  player: Player,
  requirement?: EventRequirement,
): boolean {
  if (!requirement) {
    return true;
  }

  const realmOrder = getRealmById(player.realmId).order;

  if (requirement.minRealmOrder !== undefined && realmOrder < requirement.minRealmOrder) {
    return false;
  }

  if (requirement.minHp !== undefined && player.hp < requirement.minHp) {
    return false;
  }

  if (requirement.minLuck !== undefined && player.luck < requirement.minLuck) {
    return false;
  }

  if (
    requirement.minComprehension !== undefined &&
    player.comprehension < requirement.minComprehension
  ) {
    return false;
  }

  if (requirement.minDaoHeart !== undefined && player.daoHeart < requirement.minDaoHeart) {
    return false;
  }

  if (requirement.statusNot?.some((status) => player.status.includes(status))) {
    return false;
  }

  if (requirement.minResource) {
    for (const [key, value] of Object.entries(requirement.minResource) as [
      keyof ResourceMap,
      number,
    ][]) {
      if ((player.resources[key] ?? 0) < value) {
        return false;
      }
    }
  }

  return true;
}

export function getAvailableEvents(
  allEvents: GameEvent[],
  eventPool: string[],
  player: Player,
  life: LifeState,
): GameEvent[] {
  return allEvents.filter((event) => {
    if (!eventPool.includes(event.eventId)) {
      return false;
    }

    if (event.worldId !== life.worldId) {
      return false;
    }

    if (event.requiredIdentity && event.requiredIdentity !== player.identityId) {
      return false;
    }

    if (event.requiredFate && event.requiredFate !== player.fateId) {
      return false;
    }

    if (event.requiredRealm) {
      const required = getRealmById(event.requiredRealm).order;
      const current = getRealmById(player.realmId).order;

      if (current < required) {
        return false;
      }
    }

    if (event.triggerCondition?.minAge !== undefined && player.age < event.triggerCondition.minAge) {
      return false;
    }

    if (event.triggerCondition?.maxAge !== undefined && player.age > event.triggerCondition.maxAge) {
      return false;
    }

    if (
      event.triggerCondition?.minCultivation !== undefined &&
      player.cultivation < event.triggerCondition.minCultivation
    ) {
      return false;
    }

    if (
      event.triggerCondition?.maxCultivation !== undefined &&
      player.cultivation > event.triggerCondition.maxCultivation
    ) {
      return false;
    }

    if (
      event.triggerCondition?.objectiveIncomplete &&
      life.objectiveCompleted
    ) {
      return false;
    }

    return !life.completedEventIds.includes(event.eventId) || event.tags.includes("resource");
  });
}

export function drawWeightedEvent(
  events: GameEvent[],
  random = Math.random,
  player?: Player,
): GameEvent | undefined {
  const getWeight = (event: GameEvent) => {
    const luck = player?.luck ?? 0;
    const rarityBoost =
      event.rarity === "common"
        ? 1
        : event.rarity === "rare"
          ? 1 + luck / 90
          : event.rarity === "epic"
            ? 1 + luck / 70
            : event.rarity === "legendary"
              ? 1 + luck / 55
              : 1 + luck / 42;
    return event.weight * rarityBoost;
  };
  const totalWeight = events.reduce((sum, event) => sum + getWeight(event), 0);

  if (totalWeight <= 0) {
    return events[0];
  }

  let cursor = random() * totalWeight;

  for (const event of events) {
    cursor -= getWeight(event);

    if (cursor <= 0) {
      return event;
    }
  }

  return events.at(-1);
}

function applyEventResult(
  player: Player,
  life: LifeState,
  event: GameEvent,
  result: EventResult,
): { player: Player; life: LifeState; deathReason?: string } {
  const scaledResult = applyEventRarityMultiplier(result, event.rarity);
  let nextPlayer = {
    ...player,
    cultivation: Math.max(0, player.cultivation + (scaledResult.cultivationDelta ?? 0)),
    age: player.age + (scaledResult.ageDelta ?? 0),
    hp: clamp(player.hp + (scaledResult.hpDelta ?? 0), 0, player.maxHp),
    maxHp: Math.max(1, player.maxHp + (scaledResult.maxHpDelta ?? 0)),
    lifespan: Math.max(1, player.lifespan + (scaledResult.lifespanDelta ?? 0)),
  };

  nextPlayer = applyAttributeDelta(nextPlayer, scaledResult.attributeDelta);
  nextPlayer = applyResourceDelta(nextPlayer, scaledResult.resourcesDelta);

  if (scaledResult.statusRemove) {
    nextPlayer = {
      ...nextPlayer,
      status: removeStatuses(nextPlayer.status, scaledResult.statusRemove),
    };
  }

  if (scaledResult.statusAdd) {
    nextPlayer = {
      ...nextPlayer,
      status: addStatuses(nextPlayer.status, scaledResult.statusAdd),
    };
  }

  const death = checkDeath(
    nextPlayer,
    scaledResult.deathReason ??
      (nextPlayer.hp <= 0 ? `${event.title}中傷勢過重而亡` : undefined),
  );

  if (death.isDead) {
    nextPlayer = {
      ...nextPlayer,
      hp: 0,
      status: ["dead"],
    };
  }

  const completedEventIds = Array.from(
    new Set([...life.completedEventIds, event.eventId]),
  );
  const importantEventIds = scaledResult.markImportant
    ? Array.from(new Set([...life.importantEventIds, event.eventId]))
    : life.importantEventIds;

  const rareEventIncrement = scaledResult.rareEvent ? 1 : 0;
  return {
    player: {
      ...nextPlayer,
      completedEventIds,
      importantEventIds,
    },
    life: {
      ...life,
      objectiveCompleted: life.objectiveCompleted || Boolean(scaledResult.completeObjective),
      completedEventIds,
      importantEventIds,
      rareEventsCompleted: life.rareEventsCompleted + rareEventIncrement,
      epicEventsCompleted:
        life.epicEventsCompleted + (event.rarity === "epic" ? 1 : 0),
      legendaryEventsCompleted:
        life.legendaryEventsCompleted + (event.rarity === "legendary" ? 1 : 0),
      mythicEventsCompleted:
        life.mythicEventsCompleted + (event.rarity === "mythic" ? 1 : 0),
      reincarnationPointMultiplier:
        life.reincarnationPointMultiplier +
        (scaledResult.reincarnationPointMultiplierDelta ?? 0),
      yearsSurvived: Math.max(0, nextPlayer.age - life.startingAge),
    },
    deathReason: death.reason,
  };
}

export interface ResolvedEventOption {
  player: Player;
  life: LifeState;
  success: boolean;
  result: EventResult;
  effectiveRate: number;
  deathReason?: string;
}

export function resolveEventOption(
  player: Player,
  life: LifeState,
  event: GameEvent,
  option: EventOption,
  random = Math.random,
): ResolvedEventOption {
  if (!meetsEventRequirement(player, option.requirement)) {
    const result: EventResult = {
      description: "條件不足，你只能暫時放棄這個選擇。",
    };
    const applied = applyEventResult(player, life, event, result);

    return {
      ...applied,
      success: false,
      result,
      effectiveRate: 0,
    };
  }

  const effectiveRate = clamp(
    option.successRate + player.luck * 0.001 + player.comprehension * 0.0005,
    BALANCE.minEventSuccessRate,
    BALANCE.maxEventSuccessRate,
  );
  const success = random() < effectiveRate;
  const result =
    success || !option.failureResult
      ? option.successResult
      : option.failureResult;
  const scaledResult = applyEventRarityMultiplier(result, event.rarity);
  const applied = applyEventResult(player, life, event, result);

  return {
    ...applied,
    success,
    result: scaledResult,
    effectiveRate,
  };
}

export function summarizeEventResultChanges(result: EventResult): string[] {
  const changes: string[] = [];

  if (result.cultivationDelta) changes.push(`修為 ${result.cultivationDelta > 0 ? "+" : ""}${result.cultivationDelta}`);
  if (result.ageDelta) changes.push(`時間 ${result.ageDelta > 0 ? "+" : ""}${result.ageDelta} 年`);
  if (result.hpDelta) changes.push(`氣血 ${result.hpDelta > 0 ? "+" : ""}${result.hpDelta}`);
  if (result.maxHpDelta) changes.push(`氣血上限 ${result.maxHpDelta > 0 ? "+" : ""}${result.maxHpDelta}`);
  if (result.lifespanDelta) changes.push(`壽元 ${result.lifespanDelta > 0 ? "+" : ""}${result.lifespanDelta}`);

  if (result.resourcesDelta) {
    for (const [key, value] of Object.entries(result.resourcesDelta)) {
      if (value) changes.push(`${key} ${value > 0 ? "+" : ""}${value}`);
    }
  }

  if (result.attributeDelta) {
    for (const [key, value] of Object.entries(result.attributeDelta)) {
      if (value) changes.push(`${key} ${value > 0 ? "+" : ""}${value}`);
    }
  }

  if (result.statusAdd?.length) changes.push(`新增狀態：${result.statusAdd.join("、")}`);
  if (result.statusRemove?.length) changes.push(`移除狀態：${result.statusRemove.join("、")}`);
  if (result.deathReason) changes.push(`死亡：${result.deathReason}`);
  if (result.completeObjective) changes.push("完成世界目標");

  return changes.length > 0 ? changes : ["無直接數值變化"];
}
