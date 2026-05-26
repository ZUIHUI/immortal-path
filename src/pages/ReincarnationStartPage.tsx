import { useMemo, useState } from "react";
import { fates } from "../data/fates";
import { identities } from "../data/identities";
import { worlds } from "../data/worlds";
import { useGameStore } from "../stores/gameStore";
import type { FateId, IdentityId, WorldId } from "../types";

export function ReincarnationStartPage() {
  const meta = useGameStore((state) => state.meta);
  const startLife = useGameStore((state) => state.startLife);
  const [name, setName] = useState("");
  const [worldId, setWorldId] = useState<WorldId>("qingyun_little_world");
  const [identityId, setIdentityId] = useState<IdentityId>("village_orphan");
  const [fateId, setFateId] = useState<FateId>("deep_fortune");

  const selectedWorld = useMemo(
    () => worlds.find((world) => world.id === worldId),
    [worldId],
  );
  const selectedIdentity = useMemo(
    () => identities.find((identity) => identity.id === identityId),
    [identityId],
  );
  const selectedFate = useMemo(
    () => fates.find((fate) => fate.id === fateId),
    [fateId],
  );

  return (
    <main className="page-grid">
      <section className="panel intro-panel">
        <p className="eyebrow">開局轉生</p>
        <h1>選擇這一世的起點</h1>
        <p>
          MVP 先開放青雲小界與三種身份、五種命格。資料都放在 data 目錄，
          後續可直接擴充世界、身份、命格與事件池。
        </p>
        <label className="field">
          <span>角色名稱</span>
          <input
            value={name}
            placeholder={`第 ${meta.totalLives + 1} 世修士`}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
      </section>

      <section className="panel">
        <h2>世界</h2>
        <div className="choice-grid">
          {worlds.map((world) => {
            const unlocked = meta.unlockedWorldIds.includes(world.id);

            return (
              <button
                className={`choice-card ${worldId === world.id ? "selected" : ""}`}
                disabled={!unlocked}
                key={world.id}
                type="button"
                onClick={() => setWorldId(world.id)}
              >
                <strong>{world.name}</strong>
                <span>{world.worldType}</span>
                <small>{unlocked ? world.mainObjective : world.unlockCondition}</small>
              </button>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <h2>身份</h2>
        <div className="choice-grid">
          {identities
            .filter((identity) => identity.isMvp)
            .map((identity) => {
              const unlocked = meta.unlockedIdentityIds.includes(identity.id);

              return (
                <button
                  className={`choice-card ${identityId === identity.id ? "selected" : ""}`}
                  disabled={!unlocked}
                  key={identity.id}
                  type="button"
                  onClick={() => setIdentityId(identity.id)}
                >
                  <strong>{identity.name}</strong>
                  <span>{identity.playstyle}</span>
                  <small>{identity.description}</small>
                </button>
              );
            })}
        </div>
      </section>

      <section className="panel">
        <h2>命格</h2>
        <div className="choice-grid">
          {fates
            .filter((fate) => fate.isMvp)
            .map((fate) => {
              const unlocked = meta.unlockedFateIds.includes(fate.id);

              return (
                <button
                  className={`choice-card ${fateId === fate.id ? "selected" : ""}`}
                  disabled={!unlocked}
                  key={fate.id}
                  type="button"
                  onClick={() => setFateId(fate.id)}
                >
                  <strong>{fate.name}</strong>
                  <span>{fate.advantages.join("、")}</span>
                  <small>{fate.description}</small>
                </button>
              );
            })}
        </div>
      </section>

      <section className="panel start-summary">
        <h2>本世預覽</h2>
        <div className="summary-reason">
          <span>世界目標</span>
          <p>{selectedWorld?.mainObjective}</p>
        </div>
        <div className="summary-reason">
          <span>身份特性</span>
          <p>{selectedIdentity?.advantages.join("、")}</p>
        </div>
        <div className="summary-reason">
          <span>命格代價</span>
          <p>{selectedFate?.costs.join("、")}</p>
        </div>
        <button
          className="primary-action"
          type="button"
          onClick={() => startLife({ name, worldId, identityId, fateId })}
        >
          建立本世角色
        </button>
      </section>
    </main>
  );
}
