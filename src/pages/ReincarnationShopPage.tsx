import { calculateShopItemCost } from "../core/balance";
import { getShopItemEffectText } from "../core/reincarnation";
import { reincarnationShopItems } from "../data/reincarnationShop";
import { useGameStore } from "../stores/gameStore";

export function ReincarnationShopPage() {
  const meta = useGameStore((state) => state.meta);
  const buyShopItem = useGameStore((state) => state.buyShopItem);
  const navigate = useGameStore((state) => state.navigate);

  return (
    <main className="page-grid">
      <section className="panel intro-panel">
        <p className="eyebrow">輪迴商店</p>
        <h1>把死亡變成下一世的起點</h1>
        <p>目前輪迴點：{meta.reincarnationPoints}</p>
      </section>

      <section className="shop-grid">
        {reincarnationShopItems.map((item) => {
          const level = meta.shopLevels[item.id] ?? 0;
          const capped = level >= item.maxLevel;
          const cost = calculateShopItemCost(item, level);

          return (
            <article className="panel shop-item" key={item.id}>
              <div className="section-heading">
                <div>
                  <h2>{item.name}</h2>
                  <p>{item.description}</p>
                </div>
                <span className="badge">
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
                {capped ? "已滿級" : `升級：${cost} 輪迴點`}
              </button>
            </article>
          );
        })}
      </section>

      <section className="panel">
        <button type="button" onClick={() => navigate("start")}>
          前往下一世選擇
        </button>
      </section>
    </main>
  );
}
