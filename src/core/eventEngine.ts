import { getRealmById } from "../data/realms";
import {
  BALANCE,
  addStatuses,
  applyAttributeDelta,
  applyResourceDelta,
  clamp,
  removeStatuses,
} from "./balance";
import type {
  EventOption,
  EventRequirement,
  EventResult,
  GameEvent,
  LifeState,
  Player,
  ResourceMap,
} from "../types";

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
): GameEvent | undefined {
  const totalWeight = events.reduce((sum, event) => sum + event.weight, 0);

  if (totalWeight <= 0) {
    return events[0];
  }

  let cursor = random() * totalWeight;

  for (const event of events) {
    cursor -= event.weight;

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
  let nextPlayer = {
    ...player,
    cultivation: Math.max(0, player.cultivation + (result.cultivationDelta ?? 0)),
    age: player.age + (result.ageDelta ?? 0),
    hp: clamp(player.hp + (result.hpDelta ?? 0), 0, player.maxHp),
    maxHp: Math.max(1, player.maxHp + (result.maxHpDelta ?? 0)),
    lifespan: Math.max(1, player.lifespan + (result.lifespanDelta ?? 0)),
  };

  nextPlayer = applyAttributeDelta(nextPlayer, result.attributeDelta);
  nextPlayer = applyResourceDelta(nextPlayer, result.resourcesDelta);

  if (result.statusRemove) {
    nextPlayer = {
      ...nextPlayer,
      status: removeStatuses(nextPlayer.status, result.statusRemove),
    };
  }

  if (result.statusAdd) {
    nextPlayer = {
      ...nextPlayer,
      status: addStatuses(nextPlayer.status, result.statusAdd),
    };
  }

  const deathReason =
    result.deathReason ??
    (nextPlayer.hp <= 0
      ? `${event.title}中傷勢過重而亡`
      : nextPlayer.age >= nextPlayer.lifespan
        ? "壽元耗盡，魂歸輪迴"
        : undefined);

  if (deathReason) {
    nextPlayer = {
      ...nextPlayer,
      hp: 0,
      status: ["dead"],
    };
  }

  const completedEventIds = Array.from(
    new Set([...life.completedEventIds, event.eventId]),
  );
  const importantEventIds = result.markImportant
    ? Array.from(new Set([...life.importantEventIds, event.eventId]))
    : life.importantEventIds;

  return {
    player: {
      ...nextPlayer,
      completedEventIds,
      importantEventIds,
    },
    life: {
      ...life,
      objectiveCompleted: life.objectiveCompleted || Boolean(result.completeObjective),
      completedEventIds,
      importantEventIds,
      rareEventsCompleted: life.rareEventsCompleted + (result.rareEvent ? 1 : 0),
      yearsSurvived: nextPlayer.age,
    },
    deathReason,
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
  const applied = applyEventResult(player, life, event, result);

  return {
    ...applied,
    success,
    result,
    effectiveRate,
  };
}
