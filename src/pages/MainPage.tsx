import { GameLogPanel } from "../components/GameLogPanel";
import { PlayerStatusCard } from "../components/PlayerStatusCard";
import { ResourcePanel } from "../components/ResourcePanel";
import { calculateBreakthroughPreview } from "../core/breakthrough";
import { calculateCultivationGain } from "../core/cultivation";
import { getRealmById } from "../data/realms";
import { useCurrentGameData } from "../hooks/useCurrentGameData";
import { useGameStore } from "../stores/gameStore";
import { formatRealmName } from "../utils/format";

export function MainPage() {
  const { player, life, meta, world, identity, fate, realm, nextRealm } =
    useCurrentGameData();
  const logs = useGameStore((state) => state.logs);
  const navigate = useGameStore((state) => state.navigate);
  const generateAiNarrativeEvent = useGameStore((state) => state.generateAiNarrativeEvent);
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
  const cultivationGain = calculateCultivationGain({ player, meta, world, identity, fate });
  const breakthroughPreview = calculateBreakthroughPreview({
    player,
    meta,
    world,
    identity,
    fate,
    methodId: "stable",
  });
  const remainingCultivation = nextRealm
    ? Math.max(0, nextRealm.requiredCultivation - player.cultivation)
    : 0;
  const canBreak = nextRealm && remainingCultivation <= 0;
  const recommendation = canBreak
    ? "修為已滿，建議準備突破。"
    : remainingCultivation <= cultivationGain * 2
      ? "距離突破很近，再修煉一兩次即可衝關。"
      : "先在洞府修煉，等待奇遇與頓悟。";

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
        <section className="panel scene-panel">
          <h2>洞府指引</h2>
          {lastActionMessage && <p className="notice">{lastActionMessage}</p>}
          <div className="status-grid compact">
            <div className="stat-tile">
              <span>距離下個境界</span>
              <strong>{nextRealm ? remainingCultivation : "MVP 上限"}</strong>
            </div>
            <div className="stat-tile">
              <span>目前修煉效率</span>
              <strong>約 +{cultivationGain} / 次</strong>
            </div>
            <div className="stat-tile">
              <span>穩固突破率</span>
              <strong>{Math.round(breakthroughPreview.finalRate * 100)}%</strong>
            </div>
            <div className="stat-tile">
              <span>推薦操作</span>
              <strong>{recommendation}</strong>
            </div>
          </div>
          <div className="action-grid">
            <button className="glow-button" type="button" onClick={() => navigate("cultivation")}>
              入定修煉
            </button>
            <button
              className={canBreak ? "glow-button breakthrough-ready" : ""}
              type="button"
              onClick={() => navigate("breakthrough")}
            >
              嘗試突破
            </button>
            <button type="button" onClick={generateAiNarrativeEvent}>
              天機歷練
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
                settleCurrentLife("已完成青雲小界目標，神魂帶著築基道韻歸入輪迴。", "objective")
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
