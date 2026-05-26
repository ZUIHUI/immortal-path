import {
  calculateBreakthroughRate,
  canBreakthrough,
} from "../core/breakthrough";
import { useCurrentGameData } from "../hooks/useCurrentGameData";
import { useGameStore } from "../stores/gameStore";
import { formatPercent, formatRealmName } from "../utils/format";

export function BreakthroughPage() {
  const { player, meta, world, identity, fate, realm, nextRealm } = useCurrentGameData();
  const attemptBreakthrough = useGameStore((state) => state.attemptBreakthrough);

  if (!player || !world || !identity || !fate || !realm) {
    return null;
  }

  const rate = calculateBreakthroughRate({ player, meta, world, identity, fate });
  const ready = canBreakthrough(player);

  return (
    <main className="page-grid two-column">
      <section className="panel">
        <p className="eyebrow">突破</p>
        <h1>
          {nextRealm
            ? `${formatRealmName(realm.name, realm.stageName)} → ${formatRealmName(
                nextRealm.name,
                nextRealm.stageName,
              )}`
            : "已達 MVP 上限"}
        </h1>
        <div className="status-grid">
          <div>
            <span>成功率</span>
            <strong>{formatPercent(rate)}</strong>
          </div>
          <div>
            <span>修為門檻</span>
            <strong>{nextRealm?.cultivationRequired ?? "無"}</strong>
          </div>
          <div>
            <span>目前修為</span>
            <strong>{player.cultivation}</strong>
          </div>
          <div>
            <span>輔助丹藥</span>
            <strong>{player.resources.pills}</strong>
          </div>
        </div>
        <button
          className="primary-action"
          disabled={!ready || !nextRealm}
          type="button"
          onClick={attemptBreakthrough}
        >
          嘗試突破
        </button>
      </section>

      <section className="panel">
        <h2>失敗風險</h2>
        <ul className="plain-list">
          <li>失敗會扣除部分修為。</li>
          <li>可能受傷、虛弱或氣血大幅下降。</li>
          <li>高嚴重度失敗會直接死亡並進入本世結算。</li>
          <li>丹藥、法寶、天命值、悟性、道心與輪迴商店都會提高成功率。</li>
        </ul>
      </section>
    </main>
  );
}
