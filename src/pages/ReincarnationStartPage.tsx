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
  const [worldId, setWorldId] = useState<WorldId>("world_qingyun");
  const [identityId, setIdentityId] = useState<IdentityId>("identity_orphan");
  const [fateId, setFateId] = useState<FateId>("fate_deep_fortune");

  const selectedWorld = useMemo(
    () => worlds.find((world) => world.worldId === worldId),
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
    <main className="page-grid page-start">
      <section className="panel intro-panel hero-panel">
        <div>
          <p className="eyebrow">輪迴之門</p>
          <h1>神魂歸位，重入青雲</h1>
          <p>
            星河轉動，命盤重開。選定世界、身份與命格，讓這一世從輪迴長河中浮現。
          </p>
          <label className="field">
            <span>角色名稱</span>
            <input
              value={name}
              placeholder={`第 ${meta.totalLives + 1} 世修士`}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
        </div>
        <div className="destiny-wheel" aria-hidden="true" />
      </section>

      <section className="panel">
        <h2>選擇世界</h2>
        <div className="choice-grid">
          {worlds
            .filter((world) => world.isMvp)
            .map((world) => {
              const unlocked = meta.unlockedWorldIds.includes(world.worldId);

              return (
                <button
                  className={`choice-card ${worldId === world.worldId ? "selected" : ""}`}
                  disabled={!unlocked}
                  key={world.worldId}
                  type="button"
                  onClick={() => setWorldId(world.worldId)}
                >
                  <strong>{world.worldName}</strong>
                  <span>{world.worldType}</span>
                  <small>{unlocked ? world.mainObjective : world.unlockCondition}</small>
                </button>
              );
            })}
        </div>
      </section>

      <section className="panel">
        <h2>選擇身份</h2>
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
        <h2>選擇命格</h2>
        <div className="choice-grid">
          {fates
            .filter((fate) => fate.isMvp)
            .map((fate) => {
              const unlocked = meta.unlockedFateIds.includes(fate.id);

              return (
                <button
                  className={`choice-card rarity-card rarity-rare ${
                    fateId === fate.id ? "selected" : ""
                  }`}
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
        <h2>本世命盤</h2>
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
          <p>{selectedFate?.downside.join("、")}</p>
        </div>
        <button
          className="primary-action pulse-gold"
          type="button"
          onClick={() => startLife({ name, worldId, identityId, fateId })}
        >
          踏入輪迴
        </button>
      </section>
    </main>
  );
}
