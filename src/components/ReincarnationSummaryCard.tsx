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
    <section className="panel summary-card reincarnation-summary">
      <p className="eyebrow">第 {result.generation} 世清算</p>
      <h2>{result.lifeTitle} · {result.worldRating}</h2>
      <div className="summary-grid">
        <div>
          <span>世界</span>
          <strong>{world.worldName}</strong>
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
          <strong>{result.objectiveCompleted ? "已完成" : "未完成"}</strong>
        </div>
        <div>
          <span>獲得輪迴點</span>
          <strong className="reincarnation-points count-up">+{result.earnedReincarnationPoints}</strong>
        </div>
        <div>
          <span>世界評分</span>
          <strong>{result.score}</strong>
        </div>
      </div>
      <div className="summary-reason">
        <span>此世終局</span>
        <p>{result.deathReason}</p>
      </div>
      <div className="summary-grid">
        <div>
          <span>最大單次修為爆發</span>
          <strong>+{result.maxSingleCultivationGain}</strong>
        </div>
        <div>
          <span>稀有事件數</span>
          <strong>{result.rareEventCount}</strong>
        </div>
        <div>
          <span>頓悟次數</span>
          <strong>{result.enlightenmentCount}</strong>
        </div>
        <div>
          <span>逆天突破</span>
          <strong>{result.defyingBreakthroughCount}</strong>
        </div>
      </div>
      <div className="reward-breakdown">
        <h3>輪迴點拆分</h3>
        <div className="summary-grid">
          <div><span>境界獎勵</span><strong>+{result.rewardBreakdown.realmReward}</strong></div>
          <div><span>存活獎勵</span><strong>+{result.rewardBreakdown.survivalReward}</strong></div>
          <div><span>事件獎勵</span><strong>+{result.rewardBreakdown.eventReward}</strong></div>
          <div><span>突破獎勵</span><strong>+{result.rewardBreakdown.breakthroughReward}</strong></div>
          <div><span>世界任務</span><strong>+{result.rewardBreakdown.objectiveReward}</strong></div>
          <div><span>死亡修正</span><strong>+{result.rewardBreakdown.deathModifier}</strong></div>
          <div><span>稀有成就</span><strong>+{result.rewardBreakdown.achievementBonus}</strong></div>
          <div><span>額外倍率</span><strong>x{result.rewardBreakdown.multiplier.toFixed(2)}</strong></div>
        </div>
      </div>
      <div className="summary-reason">
        <span>下一世加成</span>
        <p>{result.nextLifeBonusSummary.join("、")}</p>
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
