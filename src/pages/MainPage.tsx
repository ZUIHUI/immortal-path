import { GameLogPanel } from "../components/GameLogPanel";
import { PlayerStatusCard } from "../components/PlayerStatusCard";
import { ResourcePanel } from "../components/ResourcePanel";
import { StoryChapterPanel } from "../components/StoryChapterPanel";
import { getRealmById } from "../data/realms";
import { getInfiniteStoryPremise } from "../data/infiniteFlow";
import { useCurrentGameData } from "../hooks/useCurrentGameData";
import { useGameStore } from "../stores/gameStore";
import { formatRealmName } from "../utils/format";

export function MainPage() {
  const { player, life, meta, world, identity, fate, realm, nextRealm } =
    useCurrentGameData();
  const logs = useGameStore((state) => state.logs);
  const navigate = useGameStore((state) => state.navigate);
  const settleCurrentLife = useGameStore((state) => state.settleCurrentLife);
  const lastActionMessage = useGameStore((state) => state.lastActionMessage);

  if (!player || !life || !world || !identity || !fate || !realm) {
    return (
      <main className="panel">
        <h1>尚未轉生</h1>
        <button type="button" onClick={() => navigate("start")}>
          前往輪迴之門
        </button>
      </main>
    );
  }

  const highestRealm = getRealmById(player.highestRealmId);
  const premise = getInfiniteStoryPremise(life.storyPremiseId);
  const remainingCultivation = nextRealm
    ? Math.max(0, nextRealm.requiredCultivation - player.cultivation)
    : 0;
  const recommendation = life.objectiveCompleted
    ? nextRealm
      ? `青雲目標已成，可繼續衝擊${formatRealmName(nextRealm.name, nextRealm.stageName)}。`
      : "青雲目標已成，已抵達目前境界上限，可主動輪迴結算。"
    : "跟隨劇情推進，在抉擇點選擇方向，修為與境界會由事件結果帶動。";

  return (
    <main className="page-grid two-column page-main">
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
        <StoryChapterPanel player={player} />
        <section className="panel scene-panel">
          <h2>洞府指引</h2>
          {lastActionMessage && <p className="notice">{lastActionMessage}</p>}
          <div className="status-grid compact">
            <div className="stat-tile">
              <span>距離下個境界</span>
              <strong>{nextRealm ? remainingCultivation : "目前上限"}</strong>
            </div>
            <div className="stat-tile">
              <span>本世開局</span>
              <strong>{premise?.title ?? "未知開局"}</strong>
            </div>
            <div className="stat-tile">
              <span>劇情種子</span>
              <strong>{life.storySeed?.slice(-6) ?? "未定"}</strong>
            </div>
            <div className="stat-tile">
              <span>推薦操作</span>
              <strong>{recommendation}</strong>
            </div>
          </div>
          <div className="action-grid">
            <button className="glow-button" type="button" onClick={() => navigate("event")}>
              跟隨劇情
            </button>
            <button type="button" onClick={() => navigate("shop")}>
              輪迴商店
            </button>
          </div>
          {life.objectiveCompleted && life.isAlive && (
            <div className="notice">
              <p>
                青雲小界目標已完成。你可以繼續修煉突破，也可以主動入輪迴，把本世成果結算成輪迴點。
              </p>
              <button
                className="primary-action"
                type="button"
                onClick={() =>
                  settleCurrentLife("已完成青雲小界目標，主動攜築基道韻歸入輪迴。", "objective")
                }
              >
                主動入輪迴結算
              </button>
            </div>
          )}
        </section>
      </div>
      <div className="stack">
        <ResourcePanel
          resources={player.resources}
          reincarnationPoints={meta.reincarnationPoints}
        />
        <section className="panel">
          <h2>修士根基</h2>
          <div className="status-grid compact">
            <div className="stat-tile">
              <span>靈根</span>
              <strong>{player.spiritualRoot}</strong>
            </div>
            <div className="stat-tile">
              <span>悟性</span>
              <strong>{player.comprehension}</strong>
            </div>
            <div className="stat-tile">
              <span>福緣</span>
              <strong>{player.luck}</strong>
            </div>
            <div className="stat-tile">
              <span>道心</span>
              <strong>{player.daoHeart}</strong>
            </div>
            <div className="stat-tile">
              <span>攻擊</span>
              <strong>{player.attack}</strong>
            </div>
            <div className="stat-tile">
              <span>防禦</span>
              <strong>{player.defense}</strong>
            </div>
            <div className="stat-tile">
              <span>神識</span>
              <strong>{player.divineSense}</strong>
            </div>
            <div className="stat-tile">
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
