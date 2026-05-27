import type { AiNovelChoice } from "../../types";
import { NovelChoiceButton } from "./NovelChoiceButton";

interface NovelChoiceListProps {
  choices: AiNovelChoice[];
  disabled: boolean;
  onChoose: (choiceId: string) => void;
}

export function NovelChoiceList({ choices, disabled, onChoose }: NovelChoiceListProps) {
  if (choices.length === 0) {
    return null;
  }

  return (
    <div className="novel-choice-list">
      {choices.map((choice) => (
        <NovelChoiceButton
          choice={choice}
          disabled={disabled}
          key={choice.choiceId}
          onChoose={onChoose}
        />
      ))}
    </div>
  );
}
