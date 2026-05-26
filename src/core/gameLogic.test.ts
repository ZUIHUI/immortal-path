import { describe, expect, it } from "vitest";
import { calculateShopItemCost } from "./balance";
import {
  applyBreakthroughFailure,
  applyBreakthroughSuccess,
  calculateBreakthroughRate,
  getBreakthroughMethod,
} from "./breakthrough";
import {
  calculateCultivationCritical,
  calculateCultivationGain,
  cultivate,
} from "./cultivation";
import { checkDeath } from "./death";
import { getEventRarityMultiplier } from "./eventEngine";
import {
  calculateReincarnationPoints,
  createInitialMeta,
  createNewLife,
  createReincarnationResult,
} from "./reincarnation";
import { getFateById } from "../data/fates";
import { getIdentityById } from "../data/identities";
import { getRealmById } from "../data/realms";
import { reincarnationShopItems } from "../data/reincarnationShop";
import { getWorldById } from "../data/worlds";
import { events } from "../data/events";
import type { LifeState, Player } from "../types";

function createFixture() {
  const world = getWorldById("world_qingyun");
  const identity = getIdentityById("identity_outer_disciple");
  const fate = getFateById("fate_past_wisdom");
  const meta = createInitialMeta();
  const life = createNewLife({
    name: "測試修士",
    world,
    identity,
    fate,
    meta,
  });

  return {
    world,
    identity,
    fate,
    meta: life.meta,
    player: life.player,
    life: life.life,
  };
}

describe("core game logic", () => {
  it("calculates cultivation gain from player, world, identity, fate, and meta", () => {
    const fixture = createFixture();
    const gain = calculateCultivationGain(fixture);

    expect(gain).toBeGreaterThan(12);
  });

  it("can trigger defying enlightenment and push cultivation to breakthrough threshold", () => {
    const fixture = createFixture();
    const outcome = cultivate({
      ...fixture,
      random: () => 0,
    });

    expect(outcome.critical.tier).toBe("defying_enlightenment");
    expect(outcome.gain).toBeGreaterThanOrEqual(45);
    expect(outcome.player.cultivation).toBeGreaterThanOrEqual(45);
  });

  it("calculates cultivation critical tier from comprehension and luck", () => {
    const fixture = createFixture();
    const critical = calculateCultivationCritical(fixture, () => 0.08);

    expect(["dao_enlightenment", "deep_insight", "minor_insight"]).toContain(
      critical.tier,
    );
    expect(critical.multiplier).toBeGreaterThanOrEqual(2);
  });

  it("calculates breakthrough rate within the configured bounds", () => {
    const fixture = createFixture();
    const rate = calculateBreakthroughRate({
      ...fixture,
      player: {
        ...fixture.player,
        cultivation: 80,
        resources: {
          ...fixture.player.resources,
          pills: 1,
        },
      },
    });

    expect(rate).toBeGreaterThan(0.05);
    expect(rate).toBeLessThanOrEqual(0.97);
  });

  it("stable breakthrough is safer than defying breakthrough", () => {
    const fixture = createFixture();
    const stable = calculateBreakthroughRate({
      ...fixture,
      player: {
        ...fixture.player,
        cultivation: 45,
      },
      methodId: "stable",
    });
    const defy = calculateBreakthroughRate({
      ...fixture,
      player: {
        ...fixture.player,
        cultivation: 45,
      },
      methodId: "defy_heaven",
    });

    expect(stable).toBeGreaterThan(defy);
  });

  it("raises realm and applies bonuses after breakthrough success", () => {
    const fixture = createFixture();
    const player: Player = {
      ...fixture.player,
      realmId: "realm_qi_refining_perfect",
      highestRealmId: "realm_qi_refining_perfect",
      cultivation: 1400,
    };
    const nextRealm = getRealmById("realm_foundation_early");
    const result = applyBreakthroughSuccess({
      player,
      nextRealm,
      world: fixture.world,
      method: getBreakthroughMethod("force"),
    });

    expect(result.player.realmId).toBe("realm_foundation_early");
    expect(result.player.highestRealmId).toBe("realm_foundation_early");
    expect(result.player.maxHp).toBeGreaterThan(player.maxHp);
    expect(result.objectiveCompleted).toBe(true);
  });

  it("reduces cultivation and hp after breakthrough failure", () => {
    const fixture = createFixture();
    const currentRealm = getRealmById("realm_qi_refining_perfect");
    const nextRealm = getRealmById("realm_foundation_early");
    const player: Player = {
      ...fixture.player,
      realmId: currentRealm.id,
      highestRealmId: currentRealm.id,
      cultivation: 1400,
      hp: 100,
      lifespan: 120,
    };
    const result = applyBreakthroughFailure({
      player,
      currentRealm,
      nextRealm,
      world: fixture.world,
      identity: fixture.identity,
      fate: fixture.fate,
      method: getBreakthroughMethod("stable"),
      severity: 0.25,
    });

    expect(result.player.cultivation).toBeLessThan(player.cultivation);
    expect(result.player.hp).toBeLessThan(player.hp);
    expect(result.player.age).toBe(player.age + 1);
    expect(result.player.lifespan).toBe(player.lifespan - 1);
  });

  it("detects death when lifespan is exhausted", () => {
    const fixture = createFixture();
    const result = checkDeath({
      ...fixture.player,
      age: 120,
      lifespan: 120,
    });

    expect(result.isDead).toBe(true);
    expect(result.reason).toContain("壽元");
  });

  it("creates reincarnation result after successful foundation establishment", () => {
    const fixture = createFixture();
    const life: LifeState = {
      ...fixture.life,
      objectiveCompleted: true,
      yearsSurvived: 12,
      highestRealmId: "realm_foundation_early",
      importantEventIds: ["event_qingyun_020"],
    };
    const player: Player = {
      ...fixture.player,
      realmId: "realm_foundation_early",
      highestRealmId: "realm_foundation_early",
      age: fixture.life.startingAge + 12,
    };
    const result = createReincarnationResult(
      player,
      life,
      fixture.world,
      "完成青雲小界目標：成功築基",
      "objective",
    );

    expect(result.objectiveCompleted).toBe(true);
    expect(result.earnedReincarnationPoints).toBeGreaterThan(8);
    expect(result.worldRating).not.toBe("凡塵過客");
  });

  it("adds objective completion bonus to reincarnation points", () => {
    expect(calculateReincarnationPoints(80, true)).toBe(
      calculateReincarnationPoints(80, false) + 28,
    );
  });

  it("calculates reincarnation shop upgrade cost", () => {
    const item = reincarnationShopItems[0];

    expect(calculateShopItemCost(item, 0)).toBe(item.baseCost);
    expect(calculateShopItemCost(item, 2)).toBeGreaterThan(
      calculateShopItemCost(item, 1),
    );
  });

  it("keeps Qingyun event rarity distribution punchy", () => {
    const counts = events.reduce<Record<string, number>>((acc, event) => {
      acc[event.rarity] = (acc[event.rarity] ?? 0) + 1;
      return acc;
    }, {});

    expect(counts.common).toBeGreaterThanOrEqual(10);
    expect(counts.rare).toBeGreaterThanOrEqual(5);
    expect(counts.epic).toBeGreaterThanOrEqual(3);
    expect(counts.legendary).toBeGreaterThanOrEqual(1);
    expect(counts.mythic).toBeGreaterThanOrEqual(1);
    expect(getEventRarityMultiplier("mythic")).toBeGreaterThan(
      getEventRarityMultiplier("common"),
    );
  });
});
