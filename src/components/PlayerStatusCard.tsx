import { RealmProgressBar } from "./RealmProgressBar";
import { formatRealmName } from "../utils/format";
import type { Fate, Identity, LifeState, Player, Realm, World } from "../types";

interface PlayerStatusCardProps {
  player: Player;
  life: LifeState;
  world: World;
  identity: Identity;
  fate: Fate;
  realm: Realm;
  nextRealm?: Realm;
}

export function PlayerStatusCard({
  player,
  life,
  world,
  identity,
  fate,
  realm,
  nextRealm,
}: PlayerStatusCardProps) {
  return (
    <section className="panel status-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">第 {player.generation} 世</p>
          <h2>{player.name}</h2>
        </div>
        <span className="badge">{life.isAlive ? "本世進行中" : "已入輪迴"}</span>
      </div>

      <div className="status-grid">
        <div>
          <span>世界</span>
          <strong>{world.name}</strong>
        </div>
        <div>
          <span>身份</span>
          <strong>{identity.name}</strong>
        </div>
        <div>
          <span>命格</span>
          <strong>{fate.name}</strong>
        </div>
        <div>
          <span>境界</span>
          <strong>{formatRealmName(realm.name, realm.stageName)}</strong>
        </div>
        <div>
          <span>年齡 / 壽元</span>
          <strong>
            {player.age} / {player.lifespan}
          </strong>
        </div>
        <div>
          <span>氣血</span>
          <strong>
            {player.hp} / {player.maxHp}
          </strong>
        </div>
        <div>
          <span>狀態</span>
          <strong>{player.status.join("、")}</strong>
        </div>
        <div>
          <span>目標</span>
          <strong>{life.objectiveCompleted ? "已完成" : world.mainObjective}</strong>
        </div>
      </div>

      <RealmProgressBar player={player} realm={realm} nextRealm={nextRealm} />
    </section>
  );
}
