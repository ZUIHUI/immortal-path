import { getRealmById } from "../data/realms";
import type { Player, World } from "../types";

export function hasMetWorldObjective(player: Player, world: World): boolean {
  if (!world.objectiveRealmId) {
    return false;
  }

  const objectiveOrder = getRealmById(world.objectiveRealmId).order;
  const currentOrder = getRealmById(player.realmId).order;
  const highestOrder = getRealmById(player.highestRealmId).order;

  return Math.max(currentOrder, highestOrder) >= objectiveOrder;
}
