import { EventCard } from "../components/EventCard";
import { GameLogPanel } from "../components/GameLogPanel";
import { useGameStore } from "../stores/gameStore";

export function EventPage() {
  const currentEvent = useGameStore((state) => state.currentEvent);
  const logs = useGameStore((state) => state.logs);
  const lastActionMessage = useGameStore((state) => state.lastActionMessage);
  const drawEvent = useGameStore((state) => state.drawEvent);
  const chooseEventOption = useGameStore((state) => state.chooseEventOption);

  return (
    <main className="page-grid two-column page-event">
      <section className="stack">
        {currentEvent ? (
          <EventCard
            event={currentEvent}
            onChoose={(optionId) =>
              chooseEventOption(currentEvent.eventId, optionId)
            }
          />
        ) : (
          <section className="panel hero-panel scene-panel">
            <p className="eyebrow">山海奇遇</p>
            <h1>雲霧翻湧，機緣將現</h1>
            <p>
              青雲小界處處藏著機緣與危機。踏入古洞、遭遇散修、聽聞秘辛，每一次選擇都可能改寫此世命數。
            </p>
            {lastActionMessage && <p className="notice">{lastActionMessage}</p>}
            <button className="primary-action" type="button" onClick={drawEvent}>
              探尋奇遇
            </button>
          </section>
        )}
      </section>
      <GameLogPanel logs={logs} />
    </main>
  );
}
