import { useMemo } from "react";
import { getFateById } from "../data/fates";
import { getIdentityById } from "../data/identities";
import { getRealmById, getNextRealm } from "../data/realms";
import { getWorldById } from "../data/worlds";
import { useGameStore } from "../stores/gameStore";

export function useCurrentGameData() {
  const player = useGameStore((state) => state.player);
  const life = useGameStore((state) => state.life);
  const meta = useGameStore((state) => state.meta);

  return useMemo(() => {
    if (!player || !life) {
      return {
        player,
        life,
        meta,
        world: undefined,
        identity: undefined,
        fate: undefined,
        realm: undefined,
        nextRealm: undefined,
      };
    }

    const realm = getRealmById(player.realmId);

    return {
      player,
      life,
      meta,
      world: getWorldById(life.worldId),
      identity: getIdentityById(life.identityId),
      fate: getFateById(life.fateId),
      realm,
      nextRealm: getNextRealm(player.realmId),
    };
  }, [player, life, meta]);
}
