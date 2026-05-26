import type { VisibleChange } from "../types";

interface AiNarrativeResultPreviewProps {
  changes: VisibleChange[];
  warnings?: string[];
}

export function AiNarrativeResultPreview({
  changes,
  warnings = [],
}: AiNarrativeResultPreviewProps) {
  if (changes.length === 0 && warnings.length === 0) {
    return null;
  }

  return (
    <div className="summary-grid">
      {changes.map((change) => (
        <div className={`stat-tile change-${change.tone}`} key={`${change.label}-${change.value}`}>
          <span>{change.label}</span>
          <strong>{change.value}</strong>
        </div>
      ))}
      {warnings.map((warning) => (
        <div className="stat-tile change-neutral" key={warning}>
          <span>平衡保護</span>
          <strong>{warning}</strong>
        </div>
      ))}
    </div>
  );
}
