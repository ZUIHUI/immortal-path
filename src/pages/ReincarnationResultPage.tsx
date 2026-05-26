import { ReincarnationSummaryCard } from "../components/ReincarnationSummaryCard";
import { useGameStore } from "../stores/gameStore";

export function ReincarnationResultPage() {
  const result = useGameStore((state) => state.latestResult);
  const navigate = useGameStore((state) => state.navigate);
  const meta = useGameStore((state) => state.meta);

  if (!result) {
    return (
      <main className="panel">
        <h1>尚無本世結算</h1>
        <button type="button" onClick={() => navigate("main")}>
          返回洞府
        </button>
      </main>
    );
  }

  return (
    <main className="page-grid page-result">
      <ReincarnationSummaryCard result={result} />
      <section className="panel scene-panel">
        <h2>輪迴之前</h2>
        <p className="notice">
          目前可用輪迴點：{meta.reincarnationPoints}。死亡不是結束，這些因果會化作下一世的根基。
        </p>
        <div className="action-grid">
          <button className="glow-button" type="button" onClick={() => navigate("shop")}>
            進入輪迴商店
          </button>
          <button type="button" onClick={() => navigate("start")}>
            開啟下一世
          </button>
        </div>
      </section>
    </main>
  );
}
