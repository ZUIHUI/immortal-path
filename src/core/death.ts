import type { Player } from "../types";

export interface DeathCheckResult {
  isDead: boolean;
  reason?: string;
}

export function checkDeath(
  player: Player,
  explicitReason?: string,
): DeathCheckResult {
  if (explicitReason) {
    return {
      isDead: true,
      reason: explicitReason,
    };
  }

  if (player.status.includes("dead")) {
    return {
      isDead: true,
      reason: "身死道消，魂歸輪迴",
    };
  }

  if (player.hp <= 0) {
    return {
      isDead: true,
      reason: "氣血耗盡，傷勢過重而亡",
    };
  }

  if (player.age >= player.lifespan) {
    return {
      isDead: true,
      reason: "壽元耗盡，魂歸輪迴",
    };
  }

  return {
    isDead: false,
  };
}
