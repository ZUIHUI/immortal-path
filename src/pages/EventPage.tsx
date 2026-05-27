import { useEffect } from "react";
import { AiNarrativeErrorFallback } from "../components/AiNarrativeErrorFallback";
import { AiNarrativeEventView } from "../components/AiNarrativeEventView";
import { EventCard } from "../components/EventCard";
import { GameLogPanel } from "../components/GameLogPanel";
import { useGameStore } from "../stores/gameStore";

export function EventPage() {
  const currentEvent = useGameStore((state) => state.currentEvent);
  const logs = useGameStore((state) => state.logs);
  const lastActionMessage = useGameStore((state) => state.lastActionMessage);
  const generateAiNarrativeEvent = useGameStore((state) => state.generateAiNarrativeEvent);
  const chooseAiNarrativeChoice = useGameStore((state) => state.chooseAiNarrativeChoice);
  const endAiNarrativeEvent = useGameStore((state) => state.endAiNarrativeEvent);
  const chooseEventOption = useGameStore((state) => state.chooseEventOption);
  const aiNarrativeState = useGameStore((state) => state.aiNarrativeState);
  const player = useGameStore((state) => state.player);
  const life = useGameStore((state) => state.life);

  useEffect(() => {
    if (
      player &&
      life?.isAlive &&
      !currentEvent &&
      !aiNarrativeState.active &&
      !aiNarrativeState.currentScene &&
      !aiNarrativeState.isLoading
    ) {
      void generateAiNarrativeEvent();
    }
  }, [
    aiNarrativeState.active,
    aiNarrativeState.currentScene,
    aiNarrativeState.isLoading,
    currentEvent,
    generateAiNarrativeEvent,
    life?.isAlive,
    player,
  ]);

  return (
    <main className="page-grid two-column page-event">
      <section className="stack">
        {(aiNarrativeState.active || aiNarrativeState.currentScene || aiNarrativeState.isLoading) ? (
          <AiNarrativeEventView
            state={aiNarrativeState}
            onChoose={chooseAiNarrativeChoice}
            onEnd={endAiNarrativeEvent}
          />
        ) : currentEvent ? (
          <>
            {aiNarrativeState.error && (
              <AiNarrativeErrorFallback error={aiNarrativeState.error} />
            )}
          <EventCard
            event={currentEvent}
            onChoose={(optionId) =>
              chooseEventOption(currentEvent.eventId, optionId)
            }
          />
          </>
        ) : (
          <section className="panel hero-panel scene-panel">
            <p className="eyebrow">山海奇遇</p>
            <h1>雲霧翻湧，機緣將現</h1>
            <p>
              無限流已經開始推進。你不需要手動修煉，只需在命運給出的抉擇點選擇方向。
            </p>
            {lastActionMessage && <p className="notice">{lastActionMessage}</p>}
            <p className="notice">天機正在自行展開下一幕……</p>
          </section>
        )}
      </section>
      <GameLogPanel logs={logs} />
    </main>
  );
}
