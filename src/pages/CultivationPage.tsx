import { calculateCultivationGain } from "../core/cultivation";
import { useCurrentGameData } from "../hooks/useCurrentGameData";
import { useGameStore } from "../stores/gameStore";

export function CultivationPage() {
  const { player, life, meta, world, identity, fate, nextRealm } = useCurrentGameData();
  const cultivateOnce = useGameStore((state) => state.cultivateOnce);
  const lastActionMessage = useGameStore((state) => state.lastActionMessage);

  if (!player || !life || !world || !identity || !fate) {
    return null;
  }

  const gain = calculateCultivationGain({ player, meta, world, identity, fate });
  const remainingToBreakthrough = nextRealm
    ? Math.max(0, nextRealm.requiredCultivation - player.cultivation)
    : 0;
  const gained = lastActionMessage?.match(/\+(\d+)/)?.[1];
  const isRareInsight =
    Boolean(lastActionMessage?.includes("頓悟")) ||
    Boolean(lastActionMessage?.includes("天道")) ||
    Boolean(lastActionMessage?.includes("逆天"));

  return (
    <main className="page-grid two-column page-cultivation">
      <section className="panel hero-panel cultivation-card">
        <p className="eyebrow">洞府修煉</p>
        <h1>盤膝入定，靈氣入體</h1>
        <p>
          靈氣沿經脈流轉，功法在識海中一遍遍運行。每一次修煉，都可能只是積累，也可能撞見一線天機。
        </p>
        <div className="status-grid">
          <div className="stat-tile">
            <span>預估修為</span>
            <strong>+{gain}</strong>
          </div>
          <div className="stat-tile">
            <span>目前修為</span>
            <strong>{player.cultivation}</strong>
          </div>
          <div className="stat-tile">
            <span>突破門檻</span>
            <strong>{nextRealm?.requiredCultivation ?? "MVP 上限"}</strong>
          </div>
          <div className="stat-tile">
            <span>剩餘壽元</span>
            <strong>{Math.max(0, player.lifespan - player.age)}</strong>
          </div>
          <div className="stat-tile">
            <span>距離突破</span>
            <strong>{nextRealm ? remainingToBreakthrough : "已抵上限"}</strong>
          </div>
        </div>
        {lastActionMessage && (
          <div className={`cultivation-result-card ${isRareInsight ? "pulse-gold" : ""}`}>
            {gained && <span className="floating-gain">+{gained}</span>}
            <p>{lastActionMessage}</p>
          </div>
        )}
        <button className="primary-action" type="button" onClick={cultivateOnce}>
          運轉周天
        </button>
      </section>

      <section className="panel scene-panel">
        <h2>修煉回饋</h2>
        <ul className="plain-list">
          <li>普通修煉會穩定累積修為。</li>
          <li>小有所悟、心有所感會讓修為成倍暴漲。</li>
          <li>頓悟大道以上會進入修仙日誌，成為本世亮點。</li>
          <li>逆天頓悟會直接把你推向當前境界突破門檻。</li>
          <li>修為已滿時，主畫面與進度條會提示可以突破。</li>
        </ul>
      </section>
    </main>
  );
}
