import type { AiNarrativeChoice } from "../types";

interface AiNarrativeChoiceListProps {
  choices: AiNarrativeChoice[];
  disabled: boolean;
  onChoose: (choiceId: string) => void;
}

const riskLabels: Record<AiNarrativeChoice["riskLevel"], string> = {
  safe: "安全",
  low: "低風險",
  medium: "中風險",
  high: "高風險",
  fatal: "致命",
};

export function AiNarrativeChoiceList({
  choices,
  disabled,
  onChoose,
}: AiNarrativeChoiceListProps) {
  return (
    <div className="option-list">
      {choices.map((choice) => (
        <button
          className={`option-button narrative-choice risk-${choice.riskLevel}`}
          disabled={disabled}
          key={choice.choiceId}
          type="button"
          onClick={() => onChoose(choice.choiceId)}
        >
          <span>{choice.text}</span>
          <small>
            {riskLabels[choice.riskLevel]} · {choice.previewText}
          </small>
          {choice.requirementHint && <small>{choice.requirementHint}</small>}
        </button>
      ))}
    </div>
  );
}
