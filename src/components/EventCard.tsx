import { formatPercent } from "../utils/format";
import type { GameEvent } from "../types";

interface EventCardProps {
  event: GameEvent;
  onChoose: (optionId: string) => void;
}

export function EventCard({ event, onChoose }: EventCardProps) {
  return (
    <section className="panel event-card">
      <p className="eyebrow">{event.tags.join(" / ")}</p>
      <h2>{event.title}</h2>
      <p>{event.description}</p>
      <div className="option-list">
        {event.options.map((option) => (
          <button
            className="option-button"
            key={option.optionId}
            type="button"
            onClick={() => onChoose(option.optionId)}
          >
            <span>{option.text}</span>
            <small>
              成功率 {formatPercent(option.successRate)} · {option.previewText}
            </small>
          </button>
        ))}
      </div>
    </section>
  );
}
