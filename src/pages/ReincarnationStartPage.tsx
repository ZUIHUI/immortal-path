import { infiniteStoryPremises } from "../data/infiniteFlow";
import { getWorldLegacyById } from "../data/worldLegacies";
import { useGameStore } from "../stores/gameStore";

export function ReincarnationStartPage() {
  const meta = useGameStore((state) => state.meta);
  const startInfiniteLife = useGameStore((state) => state.startInfiniteLife);
  const legacies = meta.worldLegacyIds
    .map((legacyId) => getWorldLegacyById(legacyId))
    .filter((legacy): legacy is NonNullable<typeof legacy> => Boolean(legacy));

  return (
    <main className="page-grid page-start">
      <section className="panel intro-panel hero-panel">
        <div>
          <p className="eyebrow">無限流觸發</p>
          <h1>不選命，不選身，只踏入下一場未知</h1>
          <p>
            輪迴長河會自行安排你的身份、命格與開局。你唯一要做的，是按下進入，然後在每個劇情抉擇點決定此世的方向。
          </p>
          <button className="primary-action pulse-gold" type="button" onClick={startInfiniteLife}>
            進入無限流
          </button>
        </div>
        <div className="destiny-wheel" aria-hidden="true" />
      </section>

      <section className="panel scene-panel">
        <h2>可能開局</h2>
        <div className="choice-grid compact-choice">
          {infiniteStoryPremises.map((premise) => (
            <article className="choice-card" key={premise.id}>
              <strong>{premise.title}</strong>
              <span>{premise.tone}</span>
              <small>{premise.surpriseHook}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>輪迴留存</h2>
        {legacies.length > 0 ? (
          <div className="choice-grid compact-choice">
            {legacies.map((legacy) => (
              <article className={`choice-card rarity-card rarity-${legacy.rarity}`} key={legacy.id}>
                <strong>{legacy.name}</strong>
                <span>{legacy.effectSummary}</span>
                <small>{legacy.description}</small>
              </article>
            ))}
          </div>
        ) : (
          <p className="muted">尚未保留任何世界遺物。死亡、完成目標或抵達更高境界後，輪迴會留下可帶入下一世的痕跡。</p>
        )}
      </section>
    </main>
  );
}
