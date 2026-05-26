import { shopEffectVisuals } from "../constants/ui";
import { calculateShopItemCost } from "../core/balance";
import { getShopItemEffectText } from "../core/reincarnation";
import { reincarnationShopItems } from "../data/reincarnationShop";
import { useGameStore } from "../stores/gameStore";

export function ReincarnationShopPage() {
  const meta = useGameStore((state) => state.meta);
  const buyShopItem = useGameStore((state) => state.buyShopItem);
  const navigate = useGameStore((state) => state.navigate);

  return (
    <main className="page-grid page-shop">
      <section className="panel intro-panel hero-panel">
        <p className="eyebrow">天道命盤</p>
        <h1>前世不滅，皆為今生資糧</h1>
        <p>
          可用輪迴點：
          <strong className="reincarnation-points count-up">{meta.reincarnationPoints}</strong>
        </p>
      </section>

      <section className="shop-grid">
        {reincarnationShopItems.map((item) => {
          const level = meta.shopLevels[item.id] ?? 0;
          const capped = level >= item.maxLevel;
          const cost = calculateShopItemCost(item, level);
          const visual = shopEffectVisuals[item.effectKey];

          return (
            <article className="panel shop-item" key={item.id}>
              <div className="section-heading">
                <div className="shop-heading">
                  <span className={`shop-icon tone-${visual.tone}`}>{visual.icon}</span>
                  <div>
                    <h2>{item.name}</h2>
                    <p>{item.description}</p>
                  </div>
                </div>
                <span className="badge badge-gold">
                  {level} / {item.maxLevel}
                </span>
              </div>
              <p className="muted">{getShopItemEffectText(item)}</p>
              <p className="muted">{item.balanceNote}</p>
              <button
                className="primary-action"
                disabled={capped || meta.reincarnationPoints < cost}
                type="button"
                onClick={() => buyShopItem(item.id)}
              >
                {capped ? "已達上限" : `消耗 ${cost} 輪迴點升級`}
              </button>
            </article>
          );
        })}
      </section>

      <section className="panel">
        <button type="button" onClick={() => navigate("start")}>
          再入青雲小界
        </button>
      </section>
    </main>
  );
}
