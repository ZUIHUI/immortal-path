import { useState } from "react";
import {
  BREAKTHROUGH_METHODS,
  calculateBreakthroughPreview,
  canBreakthrough,
} from "../core/breakthrough";
import { useCurrentGameData } from "../hooks/useCurrentGameData";
import { useGameStore } from "../stores/gameStore";
import type { BreakthroughMethodId } from "../types";
import { formatPercent, formatRealmName } from "../utils/format";

const methodTone: Record<BreakthroughMethodId, string> = {
  stable: "rarity-rare",
  force: "rarity-epic",
  defy_heaven: "rarity-mythic danger-button",
};

export function BreakthroughPage() {
  const { player, meta, world, identity, fate, realm, nextRealm } = useCurrentGameData();
  const attemptBreakthrough = useGameStore((state) => state.attemptBreakthrough);
  const lastActionMessage = useGameStore((state) => state.lastActionMessage);
  const [methodId, setMethodId] = useState<BreakthroughMethodId>("stable");

  if (!player || !world || !identity || !fate || !realm) {
    return null;
  }

  const preview = calculateBreakthroughPreview({
    player,
    meta,
    world,
    identity,
    fate,
    methodId,
  });
  const ready = canBreakthrough(player);
  const resultIsFailure =
    Boolean(lastActionMessage?.includes("失敗")) ||
    Boolean(lastActionMessage?.includes("死亡")) ||
    Boolean(lastActionMessage?.includes("反噬"));
  const resultIsSuccess =
    Boolean(lastActionMessage?.includes("成功")) ||
    Boolean(lastActionMessage?.includes("踏入"));

  return (
    <main className="page-grid two-column page-breakthrough">
      <section
        className={`panel hero-panel breakthrough-card ${
          resultIsFailure ? "breakthrough-failure" : resultIsSuccess ? "breakthrough-success" : ""
        }`}
      >
        <p className="eyebrow">雷劫將至</p>
        <h1>
          {nextRealm
            ? `${formatRealmName(realm.name, realm.stageName)} → ${formatRealmName(
                nextRealm.name,
                nextRealm.stageName,
              )}`
            : "已達 MVP 上限"}
        </h1>
        <p>
          靈氣壓入丹田，道基在生死之間成形。選擇突破方式，決定這一世是穩紮穩打，還是逆天改命。
        </p>
        <div className="status-grid">
          <div className="stat-tile">
            <span>基礎成功率</span>
            <strong>{formatPercent(preview.baseRate)}</strong>
          </div>
          <div className="stat-tile">
            <span>最終成功率</span>
            <strong>{formatPercent(preview.finalRate)}</strong>
          </div>
          <div className="stat-tile">
            <span>修為門檻</span>
            <strong>{nextRealm?.requiredCultivation ?? "無"}</strong>
          </div>
          <div className="stat-tile">
            <span>目前修為</span>
            <strong>{player.cultivation}</strong>
          </div>
          <div className="stat-tile">
            <span>丹藥</span>
            <strong>{player.resources.pills}</strong>
          </div>
        </div>
        <div className="choice-grid compact-choice">
          {BREAKTHROUGH_METHODS.map((method) => (
            <button
              className={`choice-card breakthrough-card breakthrough-method-${method.id} ${
                methodTone[method.id]
              } ${methodId === method.id ? "selected" : ""}`}
              key={method.id}
              type="button"
              onClick={() => setMethodId(method.id)}
            >
              <strong>{method.name}</strong>
              <span>{method.successPreview}</span>
              <small>{method.failurePreview}</small>
            </button>
          ))}
        </div>
        {lastActionMessage && (
          <p className={`result-banner ${methodId === "defy_heaven" ? "important" : ""}`}>
            {lastActionMessage}
          </p>
        )}
        <button
          className={`primary-action ${methodId === "defy_heaven" ? "pulse-mythic" : ""}`}
          disabled={!ready || !nextRealm}
          type="button"
          onClick={() => attemptBreakthrough(methodId)}
        >
          以「{preview.method.name}」衝關
        </button>
      </section>

      <section className="panel scene-panel">
        <h2>突破風險</h2>
        <ul className="plain-list">
          <li>穩固突破：成功率較高，失敗損失較低。</li>
          <li>強行突破：成功後額外增加戰力，失敗懲罰中等。</li>
          <li>逆天突破：成功後爆量成長，失敗可能重傷、折壽甚至死亡。</li>
          <li>{preview.canDie ? "本次選擇存在死亡風險。" : "目前死亡風險較低，但仍可能受傷。"}</li>
          <li>丹藥會在突破時計入準備，讓衝關更穩。</li>
        </ul>
      </section>
    </main>
  );
}
