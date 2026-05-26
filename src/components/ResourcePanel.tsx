import type { ResourceMap } from "../types";

interface ResourcePanelProps {
  resources: ResourceMap;
  reincarnationPoints: number;
}

const resourceLabels: Array<[keyof ResourceMap, string]> = [
  ["spiritStones", "靈石"],
  ["aura", "靈氣"],
  ["pills", "丹藥"],
  ["herbs", "藥草"],
  ["artifacts", "法寶"],
  ["destiny", "天命"],
  ["karma", "因果"],
  ["pastLifeMemory", "前世記憶"],
];

export function ResourcePanel({ resources, reincarnationPoints }: ResourcePanelProps) {
  return (
    <section className="panel">
      <h2>資源</h2>
      <div className="resource-grid">
        {resourceLabels.map(([key, label]) => (
          <div className="resource-item" key={key}>
            <span>{label}</span>
            <strong>{resources[key]}</strong>
          </div>
        ))}
        <div className="resource-item highlight">
          <span>輪迴點</span>
          <strong>{reincarnationPoints}</strong>
        </div>
      </div>
    </section>
  );
}
