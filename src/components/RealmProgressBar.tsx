import { formatRealmName } from "../utils/format";
import type { Player, Realm } from "../types";

interface RealmProgressBarProps {
  player: Player;
  realm: Realm;
  nextRealm?: Realm;
}

export function RealmProgressBar({
  player,
  realm,
  nextRealm,
}: RealmProgressBarProps) {
  const progress = nextRealm
    ? Math.min(100, Math.floor((player.cultivation / nextRealm.requiredCultivation) * 100))
    : 100;
  const ready = progress >= 100;

  return (
    <div className="progress-block">
      <div className="progress-row">
        <span className="realm-badge">{formatRealmName(realm.name, realm.stageName)}</span>
        <span>
          {nextRealm
            ? `${player.cultivation} / ${nextRealm.requiredCultivation}`
            : "目前上限"}
        </span>
      </div>
      <div
        className={`progress-track ${ready ? "ready" : ""}`}
        aria-label="修為進度"
      >
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      {nextRealm ? (
        <p className="muted">
          下一境界：{formatRealmName(nextRealm.name, nextRealm.stageName)}
          {ready ? "，靈氣已滿，可嘗試突破。" : ""}
        </p>
      ) : (
        <p className="muted">你已抵達目前版本的修行盡頭。</p>
      )}
    </div>
  );
}
