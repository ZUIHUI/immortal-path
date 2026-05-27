import { getRealmById } from "./realms";
import type { ReincarnationEndType, RealmId, WorldId, WorldLegacy } from "../types";

export const worldLegacies: WorldLegacy[] = [
  {
    id: "legacy_qingyun_death_coin",
    worldId: "world_qingyun",
    name: "青雲死劫銅錢",
    description: "你曾在青雲小界死裡逃生，殘留的一枚銅錢替下一世擋下一縷死氣。",
    effectSummary: "下一世開局獲得少量氣血與前世記憶。",
    rarity: "rare",
  },
  {
    id: "legacy_qingyun_foundation_seed",
    worldId: "world_qingyun",
    name: "青雲築基道種",
    description: "你在青雲小界築成第一座道基，道韻沉入輪迴，成為往後每一世的根。",
    effectSummary: "下一世悟性、道心與修煉爆發感提升。",
    rarity: "epic",
  },
  {
    id: "legacy_qingyun_core_flame",
    worldId: "world_qingyun",
    name: "青雲金丹火",
    description: "你曾以金丹照亮青雲山河，丹火雖滅，其意仍藏於神魂深處。",
    effectSummary: "下一世初始天命與突破底氣提升。",
    rarity: "legendary",
  },
];

export function getWorldLegacyById(legacyId: string): WorldLegacy | undefined {
  return worldLegacies.find((legacy) => legacy.id === legacyId);
}

export function getWorldLegacyForOutcome({
  worldId,
  endType,
  objectiveCompleted,
  highestRealmId,
}: {
  worldId: WorldId;
  endType: ReincarnationEndType;
  objectiveCompleted: boolean;
  highestRealmId: RealmId;
}): WorldLegacy | undefined {
  if (worldId !== "world_qingyun") {
    return undefined;
  }

  if (getRealmById(highestRealmId).order >= getRealmById("realm_core_formation_early").order) {
    return getWorldLegacyById("legacy_qingyun_core_flame");
  }

  if (objectiveCompleted || endType === "objective") {
    return getWorldLegacyById("legacy_qingyun_foundation_seed");
  }

  return getWorldLegacyById("legacy_qingyun_death_coin");
}
