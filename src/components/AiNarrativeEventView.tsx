import { useCurrentGameData } from "../hooks/useCurrentGameData";
import { resolveAiSuggestedEffects } from "../core/narrativeEffectResolver";
import { AiNarrativeChoiceList } from "./AiNarrativeChoiceList";
import { AiNarrativeErrorFallback } from "./AiNarrativeErrorFallback";
import { AiNarrativeLoading } from "./AiNarrativeLoading";
import { AiNarrativeResultPreview } from "./AiNarrativeResultPreview";
import { AiNarrativeScenePanel } from "./AiNarrativeScenePanel";
import type { AiNarrativeState } from "../types";

interface AiNarrativeEventViewProps {
  state: AiNarrativeState;
  onChoose: (choiceId: string) => void;
  onEnd: () => void;
}

export function AiNarrativeEventView({
  state,
  onChoose,
  onEnd,
}: AiNarrativeEventViewProps) {
  const { player, life, meta, world } = useCurrentGameData();

  if (state.isLoading) {
    return <AiNarrativeLoading />;
  }

  if (state.error && !state.currentScene) {
    return <AiNarrativeErrorFallback error={state.error} />;
  }

  if (!state.currentScene) {
    return null;
  }

  const preview =
    player && life && world
      ? resolveAiSuggestedEffects({
          aiEffects: state.currentScene.suggestedEffects,
          player,
          lifeState: life,
          metaProgress: meta,
          worldConfig: world,
          responseFlags: state.currentScene,
        })
      : undefined;

  return (
    <section className="stack">
      <AiNarrativeScenePanel scene={state.currentScene} />
      {preview && (
        <section className="panel">
          <h2>命盤波動</h2>
          <AiNarrativeResultPreview
            changes={preview.visibleChanges}
            warnings={preview.balanceWarnings}
          />
        </section>
      )}
      {state.currentScene.shouldEndEvent ? (
        <button className="primary-action" type="button" onClick={onEnd}>
          進入下一幕
        </button>
      ) : (
        <AiNarrativeChoiceList
          choices={state.currentScene.choices}
          disabled={state.isLoading}
          onChoose={onChoose}
        />
      )}
    </section>
  );
}
