import { GameLogPanel } from "../components/GameLogPanel";
import { PlayerStatusCard } from "../components/PlayerStatusCard";
import { ResourcePanel } from "../components/ResourcePanel";
import { getRealmById } from "../data/realms";
import { useCurrentGameData } from "../hooks/useCurrentGameData";
import { useGameStore } from "../stores/gameStore";
import { formatRealmName } from "../utils/format";

export function MainPage() {
  const { player, life, meta, world, identity, fate, realm, nextRealm } =
    useCurrentGameData();
  const logs = useGameStore((state) => state.logs);
  const navigate = useGameStore((state) => state.navigate);
  const drawEvent = useGameStore((state) => state.drawEvent);
  const settleCurrentLife = useGameStore((state) => state.settleCurrentLife);

  if (!player || !life || !world || !identity || !fate || !realm) {
    return (
      <main className="panel">
        <h1>尚未開始本世</h1>
        <button type="button" onClick={() => navigate("start")}>
          前往轉生
        </button>
      </main>
    );
  }

  const highestRealm = getRealmById(player.highestRealmId);

  return (
    <main className="page-grid two-column">
      <div className="stack">
        <PlayerStatusCard
          player={player}
          life={life}
          world={world}
          identity={identity}
          fate={fate}
          realm={realm}
          nextRealm={nextRealm}
        />
        <section className="panel">
          <h2>行動</h2>
          <div className="action-grid">
            <button type="button" onClick={() => navigate("cultivation")}>
              前往修煉
            </button>
            <button type="button" onClick={() => navigate("breakthrough")}>
              嘗試突破
            </button>
            <button type="button" onClick={drawEvent}>
              歷練事件
            </button>
            <button type="button" onClick={() => navigate("shop")}>
              輪迴商店
            </button>
          </div>
          {life.objectiveCompleted && life.isAlive && (
            <button
              className="primary-action"
              type="button"
              onClick={() =>
                settleCurrentLife("完成世界目標後主動結算", "objective")
              }
            >
              完成本世結算
            </button>
          )}
        </section>
      </div>
      <div className="stack">
        <ResourcePanel
          resources={player.resources}
          reincarnationPoints={meta.reincarnationPoints}
        />
        <section className="panel">
          <h2>角色屬性</h2>
          <div className="status-grid compact">
            <div>
              <span>靈根</span>
              <strong>{player.spiritualRoot}</strong>
            </div>
            <div>
              <span>悟性</span>
              <strong>{player.comprehension}</strong>
            </div>
            <div>
              <span>福緣</span>
              <strong>{player.luck}</strong>
            </div>
            <div>
              <span>道心</span>
              <strong>{player.daoHeart}</strong>
            </div>
            <div>
              <span>攻擊</span>
              <strong>{player.attack}</strong>
            </div>
            <div>
              <span>防禦</span>
              <strong>{player.defense}</strong>
            </div>
            <div>
              <span>神識</span>
              <strong>{player.divineSense}</strong>
            </div>
            <div>
              <span>最高境界</span>
              <strong>{formatRealmName(highestRealm.name, highestRealm.stageName)}</strong>
            </div>
          </div>
        </section>
        <GameLogPanel logs={logs} />
      </div>
    </main>
  );
}
