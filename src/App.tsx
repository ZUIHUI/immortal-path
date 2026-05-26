import { APP_NAME } from "./constants/game";
import { BreakthroughPage } from "./pages/BreakthroughPage";
import { CultivationPage } from "./pages/CultivationPage";
import { EventPage } from "./pages/EventPage";
import { MainPage } from "./pages/MainPage";
import { ReincarnationResultPage } from "./pages/ReincarnationResultPage";
import { ReincarnationShopPage } from "./pages/ReincarnationShopPage";
import { ReincarnationStartPage } from "./pages/ReincarnationStartPage";
import { useGameStore } from "./stores/gameStore";
import type { GamePage } from "./types";

const navItems: Array<{ page: GamePage; label: string }> = [
  { page: "main", label: "洞府" },
  { page: "cultivation", label: "修煉" },
  { page: "breakthrough", label: "突破" },
  { page: "event", label: "奇遇" },
  { page: "shop", label: "輪迴商店" },
];

function renderPage(page: GamePage) {
  switch (page) {
    case "start":
      return <ReincarnationStartPage />;
    case "main":
      return <MainPage />;
    case "cultivation":
      return <CultivationPage />;
    case "breakthrough":
      return <BreakthroughPage />;
    case "event":
      return <EventPage />;
    case "result":
      return <ReincarnationResultPage />;
    case "shop":
      return <ReincarnationShopPage />;
  }
}

export default function App() {
  const currentPage = useGameStore((state) => state.currentPage);
  const player = useGameStore((state) => state.player);
  const life = useGameStore((state) => state.life);
  const navigate = useGameStore((state) => state.navigate);
  const resetSave = useGameStore((state) => state.resetSave);

  const page = !player && currentPage !== "shop" ? "start" : currentPage;

  return (
    <div className="app-shell game-shell immortal-bg">
      <header className="app-header">
        <button className="brand-button" type="button" onClick={() => navigate("main")}>
          <span>{APP_NAME}</span>
          <small>文字修仙 MVP</small>
        </button>
        <nav className="top-nav">
          {player && life?.isAlive ? (
            navItems.map((item) => (
              <button
                className={page === item.page ? "active" : ""}
                key={item.page}
                type="button"
                onClick={() => navigate(item.page)}
              >
                {item.label}
              </button>
            ))
          ) : (
            <>
              <button
                className={page === "start" ? "active" : ""}
                type="button"
                onClick={() => navigate("start")}
              >
                轉生
              </button>
              <button
                className={page === "shop" ? "active" : ""}
                type="button"
                onClick={() => navigate("shop")}
              >
                輪迴商店
              </button>
            </>
          )}
          {player && !life?.isAlive && (
            <button
              className={page === "result" ? "active" : ""}
              type="button"
              onClick={() => navigate("result")}
            >
              本世結算
            </button>
          )}
        </nav>
        <button
          className="ghost-button"
          type="button"
          onClick={() => {
            if (window.confirm("確定要清除目前存檔，重入輪迴嗎？")) {
              resetSave();
            }
          }}
        >
          重置
        </button>
      </header>
      {renderPage(page)}
    </div>
  );
}
