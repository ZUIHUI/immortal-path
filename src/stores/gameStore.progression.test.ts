import { beforeEach, describe, expect, it, vi } from "vitest";

const { useGameStore } = await import("./gameStore");

function startLife() {
  useGameStore.getState().resetSave();
  useGameStore.getState().startLife({
    name: "測試修士",
    worldId: "world_qingyun",
    identityId: "identity_orphan",
    fateId: "fate_deep_fortune",
  });
}

describe("gameStore progression milestones", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    startLife();
  });

  it("keeps the current life active after reaching the Qingyun objective realm", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    const state = useGameStore.getState();
    const player = state.player;
    const life = state.life;

    if (!player || !life) {
      throw new Error("Expected a started life");
    }

    useGameStore.setState({
      player: {
        ...player,
        realmId: "realm_qi_refining_perfect",
        highestRealmId: "realm_qi_refining_perfect",
        cultivation: 2000,
        hp: 200,
        maxHp: 200,
        resources: {
          ...player.resources,
          pills: 0,
        },
      },
      life: {
        ...life,
        highestRealmId: "realm_qi_refining_perfect",
      },
      currentPage: "breakthrough",
    });

    useGameStore.getState().attemptBreakthrough("stable");

    const after = useGameStore.getState();
    expect(after.player?.realmId).toBe("realm_foundation_early");
    expect(after.life?.objectiveCompleted).toBe(true);
    expect(after.life?.isAlive).toBe(true);
    expect(after.currentPage).toBe("breakthrough");
    expect(after.latestResult).toBeUndefined();
    expect(after.lastActionMessage).toContain("繼續衝擊築基中期");
  });

  it("starts an infinite-flow life with generated identity, fate, and premise", async () => {
    const generateAiNarrativeEvent = vi
      .spyOn(useGameStore.getState(), "generateAiNarrativeEvent")
      .mockResolvedValue(undefined);

    useGameStore.getState().resetSave();
    await useGameStore.getState().startInfiniteLife();

    const state = useGameStore.getState();
    expect(state.player).toBeDefined();
    expect(state.life?.storySeed).toBeDefined();
    expect(state.life?.storyPremiseId).toMatch(/^premise_/);
    expect(state.currentPage).toBe("event");
    expect(generateAiNarrativeEvent).toHaveBeenCalledOnce();
  });
});
