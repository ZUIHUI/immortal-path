import { getFateById } from "../data/fates";
import { getIdentityById } from "../data/identities";
import { getRealmById } from "../data/realms";
import { getWorldById } from "../data/worlds";
import { formatRealmName } from "../utils/format";
import type { ReincarnationResult } from "../types";

interface ReincarnationSummaryCardProps {
  result: ReincarnationResult;
}

export function ReincarnationSummaryCard({ result }: ReincarnationSummaryCardProps) {
  const world = getWorldById(result.worldId);
  const identity = getIdentityById(result.identityId);
  const fate = getFateById(result.fateId);
  const realm = getRealmById(result.highestRealmId);

  return (
    <section className="panel summary-card">
      <p className="eyebrow">第 {result.generation} 世結算</p>
      <h2>{result.worldRating}</h2>
      <div className="summary-grid">
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
          <span>最高境界</span>
          <strong>{formatRealmName(realm.name, realm.stageName)}</strong>
        </div>
        <div>
          <span>存活年數</span>
          <strong>{result.yearsSurvived}</strong>
        </div>
        <div>
          <span>世界目標</span>
          <strong>{result.objectiveCompleted ? "完成" : "未完成"}</strong>
        </div>
        <div>
          <span>輪迴點</span>
          <strong>+{result.earnedReincarnationPoints}</strong>
        </div>
        <div>
          <span>評分</span>
          <strong>{result.score}</strong>
        </div>
      </div>
      <div className="summary-reason">
        <span>終局原因</span>
        <p>{result.deathReason}</p>
      </div>
      {result.unlockedContent.length > 0 && (
        <div className="pill-row">
          {result.unlockedContent.map((item) => (
            <span className="pill" key={item}>
              {item}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
