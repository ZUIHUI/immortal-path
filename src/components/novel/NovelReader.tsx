import { getFateById } from "../../data/fates";
import { getIdentityById } from "../../data/identities";
import { getLifeThemeById } from "../../data/lifeThemes";
import { getRealmById } from "../../data/realms";
import { getWorldById } from "../../data/worlds";
import { useGameStore } from "../../stores/gameStore";
import { NovelChoiceList } from "./NovelChoiceList";
import { NovelMainButton } from "./NovelMainButton";
import { NovelSettlementView } from "./NovelSettlementView";
import { NovelTypewriter } from "./NovelTypewriter";

function getLoadingText(hasStarted: boolean): string {
  return hasStarted ? "天機正在展開……" : "命數流轉中……";
}

export function NovelReader() {
  const player = useGameStore((state) => state.player);
  const life = useGameStore((state) => state.life);
  const meta = useGameStore((state) => state.meta);
  const result = useGameStore((state) => state.latestResult);
  const novelState = useGameStore((state) => state.novelState);
  const startNewReincarnation = useGameStore((state) => state.startNewReincarnation);
  const selectNovelChoice = useGameStore((state) => state.selectNovelChoice);
  const generateSettlementScene = useGameStore((state) => state.generateSettlementScene);
  const enterNextLife = useGameStore((state) => state.enterNextLife);
  const skipTypewriter = useGameStore((state) => state.skipTypewriter);
  const setNovelTyping = useGameStore((state) => state.setNovelTyping);
  const clearNovelError = useGameStore((state) => state.clearNovelError);
  const resetSave = useGameStore((state) => state.resetSave);

  const world = life ? getWorldById(life.worldId) : undefined;
  const identity = life ? getIdentityById(life.identityId) : undefined;
  const fate = life ? getFateById(life.fateId) : undefined;
  const theme = getLifeThemeById(life?.lifeThemeId);
  const realm = player ? getRealmById(player.realmId) : undefined;
  const waitingForChoice =
    novelState.hasStarted &&
    !novelState.isGenerating &&
    !novelState.isTyping &&
    novelState.pendingChoices.length > 0;
  const shouldShowSettlement =
    (novelState.isSettlementReady || result) && !novelState.isTyping && !novelState.isGenerating;
  const mainLabel = !novelState.hasStarted
    ? "開始輪迴"
    : novelState.isGenerating
      ? getLoadingText(novelState.hasStarted)
      : shouldShowSettlement && !result
        ? "查看本世結算"
        : shouldShowSettlement && result
          ? "再入輪迴"
          : novelState.error
            ? "重試天機"
            : "";

  function handleMainClick() {
    if (!novelState.hasStarted || result) {
      void enterNextLife();
      return;
    }

    if (novelState.error) {
      clearNovelError();
      if (novelState.visibleStory.length === 0) {
        void startNewReincarnation();
      }
      return;
    }

    if (shouldShowSettlement) {
      void generateSettlementScene();
    }
  }

  return (
    <main className={`novel-shell novel-world-${world?.type ?? "mixed_realm"}`}>
      <div className="novel-bg" />
      <section className="novel-reader">
        <header className="novel-header">
          <p className="novel-kicker">AI 跨世界輪迴互動小說</p>
          <h1>萬世歧路</h1>
          <p>每一世都是新的世界，每一次選擇都會沉入下一次輪迴。</p>
        </header>

        {novelState.visibleStory.length > 0 ? (
          <NovelTypewriter
            blocks={novelState.visibleStory}
            isTyping={novelState.isTyping}
            activeBlockId={novelState.typingBlockId}
            onSkip={skipTypewriter}
            onTypingDone={() => setNovelTyping(false)}
          />
        ) : (
          <div className="novel-empty">
            <p>輪迴長河尚未掀起波紋。</p>
          </div>
        )}

        {novelState.error && <p className="novel-error">{novelState.error}</p>}

        {waitingForChoice && (
          <NovelChoiceList
            choices={novelState.pendingChoices}
            disabled={novelState.isGenerating}
            onChoose={(choiceId) => void selectNovelChoice(choiceId)}
          />
        )}

        {shouldShowSettlement && result && (
          <NovelSettlementView life={life} meta={meta} result={result} />
        )}

        {mainLabel && !waitingForChoice && !novelState.isTyping && (
          <NovelMainButton
            disabled={novelState.isGenerating}
            label={mainLabel}
            onClick={handleMainClick}
          />
        )}

        {life && (
          <details className="fate-panel">
            <summary>命數</summary>
            <div className="fate-panel-grid">
              <span>世界</span>
              <strong>{world?.name}</strong>
              <span>身份</span>
              <strong>{identity?.name}</strong>
              <span>命格</span>
              <strong>{fate?.name}</strong>
              <span>本世主題</span>
              <strong>{theme?.name ?? "命盤自生"}</strong>
              <span>生命層級</span>
              <strong>{realm ? `${realm.name}${realm.stageName}` : "凡塵"}</strong>
            </div>
          </details>
        )}

        <button
          className="novel-reset"
          type="button"
          onClick={() => {
            if (window.confirm("確定要清除目前輪迴存檔？")) {
              resetSave();
            }
          }}
        >
          重置輪迴
        </button>
      </section>
    </main>
  );
}
