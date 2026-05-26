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
    ? Math.min(100, Math.floor((player.cultivation / nextRealm.cultivationRequired) * 100))
    : 100;

  return (
    <div className="progress-block">
      <div className="progress-row">
        <span>{formatRealmName(realm.name, realm.stageName)}</span>
        <span>
          {nextRealm
            ? `${player.cultivation} / ${nextRealm.cultivationRequired}`
            : "MVP 上限"}
        </span>
      </div>
      <div className="progress-track" aria-label="修為進度">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      {nextRealm ? (
        <p className="muted">下一境界：{formatRealmName(nextRealm.name, nextRealm.stageName)}</p>
      ) : (
        <p className="muted">已抵達目前版本的最高境界。</p>
      )}
    </div>
  );
}
