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

const statusLabels: Record<string, string> = {
  normal: "氣息平穩",
  injured: "經脈受傷",
  weak: "氣血虛弱",
  heart_demon: "心魔纏身",
  dead: "身死道消",
};

export function PlayerStatusCard({
  player,
  life,
  world,
  identity,
  fate,
  realm,
  nextRealm,
}: PlayerStatusCardProps) {
  const lifespanLeft = Math.max(0, player.lifespan - player.age);
  const hpRatio = player.maxHp > 0 ? player.hp / player.maxHp : 0;
  const danger = lifespanLeft <= 10 || hpRatio <= 0.35;
  const objectiveText = life.objectiveCompleted
    ? nextRealm
      ? `青雲目標已成，下一境界：${formatRealmName(nextRealm.name, nextRealm.stageName)}`
      : "青雲目標已成，可主動入輪迴"
    : world.mainObjective;

  return (
    <section className="panel status-card scene-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">第 {player.generation} 世</p>
          <h2>{player.name}</h2>
        </div>
        <span className={`badge ${life.isAlive ? "badge-gold" : "badge-danger"}`}>
          {life.isAlive ? "神魂未滅" : "入輪迴"}
        </span>
      </div>

      <div className="status-grid">
        <div className="stat-tile">
          <span>世界</span>
          <strong>{world.worldName}</strong>
        </div>
        <div className="stat-tile">
          <span>身份</span>
          <strong>{identity.name}</strong>
        </div>
        <div className="stat-tile">
          <span>命格</span>
          <strong>{fate.name}</strong>
        </div>
        <div className="stat-tile">
          <span>境界</span>
          <strong>{formatRealmName(realm.name, realm.stageName)}</strong>
        </div>
        <div className={`stat-tile ${danger ? "shake-danger" : ""}`}>
          <span>年齡 / 壽元</span>
          <strong>
            {player.age} / {player.lifespan}
          </strong>
        </div>
        <div className={`stat-tile ${hpRatio <= 0.35 ? "shake-danger" : ""}`}>
          <span>氣血</span>
          <strong>
            {player.hp} / {player.maxHp}
          </strong>
        </div>
        <div className="stat-tile">
          <span>狀態</span>
          <strong>{player.status.map((status) => statusLabels[status] ?? status).join("、")}</strong>
        </div>
        <div className="stat-tile">
          <span>目前目標</span>
          <strong>{objectiveText}</strong>
        </div>
      </div>

      <RealmProgressBar player={player} realm={realm} nextRealm={nextRealm} />
    </section>
  );
}
