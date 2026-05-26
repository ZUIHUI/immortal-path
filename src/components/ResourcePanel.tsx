import { resourceVisuals } from "../constants/ui";
import type { ResourceMap } from "../types";

interface ResourcePanelProps {
  resources: ResourceMap;
  reincarnationPoints: number;
}

const resourceKeys: Array<keyof ResourceMap> = [
  "spiritStones",
  "aura",
  "pills",
  "herbs",
  "artifacts",
  "destiny",
  "karma",
  "pastLifeMemory",
];

export function ResourcePanel({ resources, reincarnationPoints }: ResourcePanelProps) {
  return (
    <section className="panel">
      <h2>資源命盤</h2>
      <div className="resource-grid">
        {resourceKeys.map((key) => {
          const visual = resourceVisuals[key];

          return (
            <div className="resource-item resource-chip" key={key}>
              <span className={`resource-icon tone-${visual.tone}`}>{visual.icon}</span>
              <span className="resource-value">
                <span>{visual.label}</span>
                <strong>{resources[key]}</strong>
              </span>
            </div>
          );
        })}
        <div className="resource-item resource-chip highlight">
          <span className={`resource-icon tone-${resourceVisuals.reincarnationPoints.tone}`}>
            {resourceVisuals.reincarnationPoints.icon}
          </span>
          <span className="resource-value">
            <span>{resourceVisuals.reincarnationPoints.label}</span>
            <strong>{reincarnationPoints}</strong>
          </span>
        </div>
      </div>
    </section>
  );
}
