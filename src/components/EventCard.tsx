import { EVENT_RARITY_LABELS } from "../core/eventEngine";
import { formatPercent } from "../utils/format";
import type { GameEvent } from "../types";

interface EventCardProps {
  event: GameEvent;
  onChoose: (optionId: string) => void;
}

export function EventCard({ event, onChoose }: EventCardProps) {
  return (
    <section className={`panel event-card rarity-card rarity-${event.rarity}`}>
      <p className="eyebrow">奇遇降臨</p>
      <span className={`rarity-badge rarity-badge-${event.rarity}`}>
        {EVENT_RARITY_LABELS[event.rarity]}
      </span>
      <h2>{event.title}</h2>
      <p>{event.description}</p>
      <div className="pill-row">
        {event.tags.map((tag) => (
          <span className="pill" key={tag}>
            {tag}
          </span>
        ))}
      </div>
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
