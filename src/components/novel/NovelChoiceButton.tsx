import type { AiNovelChoice } from "../../types";

interface NovelChoiceButtonProps {
  choice: AiNovelChoice;
  disabled: boolean;
  onChoose: (choiceId: string) => void;
}

export function NovelChoiceButton({ choice, disabled, onChoose }: NovelChoiceButtonProps) {
  return (
    <button
      className={`novel-choice novel-choice-${choice.tone}`}
      disabled={disabled}
      type="button"
      onClick={() => onChoose(choice.choiceId)}
    >
      {choice.text}
    </button>
  );
}
