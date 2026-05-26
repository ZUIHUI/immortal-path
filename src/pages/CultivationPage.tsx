import { calculateCultivationGain } from "../core/cultivation";
import { useCurrentGameData } from "../hooks/useCurrentGameData";
import { useGameStore } from "../stores/gameStore";

export function CultivationPage() {
  const { player, life, meta, world, identity, fate, nextRealm } = useCurrentGameData();
  const cultivateOnce = useGameStore((state) => state.cultivateOnce);

  if (!player || !life || !world || !identity || !fate) {
    return null;
  }

  const gain = calculateCultivationGain({ player, meta, world, identity, fate });

  return (
    <main className="page-grid two-column">
      <section className="panel">
        <p className="eyebrow">修煉</p>
        <h1>閉關運轉周天</h1>
        <p>
          修煉一次消耗一年壽元，增加修為並有機率觸發事件。受傷、虛弱或心魔會降低效率。
        </p>
        <div className="status-grid">
          <div>
            <span>預估修為</span>
            <strong>+{gain}</strong>
          </div>
          <div>
            <span>目前修為</span>
            <strong>{player.cultivation}</strong>
          </div>
          <div>
            <span>下一門檻</span>
            <strong>{nextRealm?.cultivationRequired ?? "上限"}</strong>
          </div>
          <div>
            <span>剩餘壽元</span>
            <strong>{Math.max(0, player.lifespan - player.age)}</strong>
          </div>
        </div>
        <button className="primary-action" type="button" onClick={cultivateOnce}>
          修煉一年
        </button>
      </section>

      <section className="panel">
        <h2>加成來源</h2>
        <ul className="plain-list">
          <li>世界規則：{world.worldRules.cultivationMultiplier}x</li>
          <li>身份：{identity.name}</li>
          <li>命格：{fate.name}</li>
          <li>靈根、悟性、福緣共同影響修煉收益。</li>
          <li>輪迴商店的修煉效率會套用到下一世。</li>
        </ul>
      </section>
    </main>
  );
}
