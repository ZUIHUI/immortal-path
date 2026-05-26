import { ReincarnationSummaryCard } from "../components/ReincarnationSummaryCard";
import { useGameStore } from "../stores/gameStore";

export function ReincarnationResultPage() {
  const result = useGameStore((state) => state.latestResult);
  const navigate = useGameStore((state) => state.navigate);

  if (!result) {
    return (
      <main className="panel">
        <h1>尚無本世結算</h1>
        <button type="button" onClick={() => navigate("main")}>
          返回主畫面
        </button>
      </main>
    );
  }

  return (
    <main className="page-grid">
      <ReincarnationSummaryCard result={result} />
      <section className="panel">
        <h2>下一步</h2>
        <div className="action-grid">
          <button type="button" onClick={() => navigate("shop")}>
            使用輪迴點
          </button>
          <button type="button" onClick={() => navigate("start")}>
            開始下一世
          </button>
        </div>
      </section>
    </main>
  );
}
