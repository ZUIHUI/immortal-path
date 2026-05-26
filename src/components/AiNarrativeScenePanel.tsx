import { EVENT_RARITY_LABELS } from "../core/eventEngine";
import type { AiNarrativeResponse } from "../types";

interface AiNarrativeScenePanelProps {
  scene: AiNarrativeResponse;
}

const moodLabels: Record<AiNarrativeResponse["mood"], string> = {
  calm: "靜謐",
  mysterious: "詭秘",
  danger: "危機",
  epic: "壯闊",
  breakthrough: "道機",
  death: "死劫",
};

export function AiNarrativeScenePanel({ scene }: AiNarrativeScenePanelProps) {
  return (
    <section className={`panel event-card rarity-card rarity-${scene.rarity}`}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">AI 奇遇</p>
          <h2>{scene.title}</h2>
        </div>
        <span className={`rarity-badge rarity-badge-${scene.rarity}`}>
          {EVENT_RARITY_LABELS[scene.rarity]} · {moodLabels[scene.mood]}
        </span>
      </div>
      <p>{scene.content}</p>
      {scene.settlementTags.length > 0 && (
        <div className="pill-row">
          {scene.settlementTags.map((tag) => (
            <span className="pill" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
