import { EventCard } from "../components/EventCard";
import { GameLogPanel } from "../components/GameLogPanel";
import { useGameStore } from "../stores/gameStore";

export function EventPage() {
  const currentEvent = useGameStore((state) => state.currentEvent);
  const logs = useGameStore((state) => state.logs);
  const drawEvent = useGameStore((state) => state.drawEvent);
  const chooseEventOption = useGameStore((state) => state.chooseEventOption);

  return (
    <main className="page-grid two-column">
      <section className="stack">
        {currentEvent ? (
          <EventCard
            event={currentEvent}
            onChoose={(optionId) =>
              chooseEventOption(currentEvent.eventId, optionId)
            }
          />
        ) : (
          <section className="panel">
            <p className="eyebrow">歷練</p>
            <h1>外出尋找機緣</h1>
            <p>事件會從目前世界的事件池抽取，身份、命格、境界與條件會影響可觸發內容。</p>
            <button className="primary-action" type="button" onClick={drawEvent}>
              觸發事件
            </button>
          </section>
        )}
      </section>
      <GameLogPanel logs={logs} />
    </main>
  );
}
