import { getLegacyRelicById } from "../../data/legacyRelics";
import { getRealmById } from "../../data/realms";
import { getWorldById } from "../../data/worlds";
import type { LifeState, MetaProgress, ReincarnationResult } from "../../types";

interface NovelSettlementViewProps {
  life?: LifeState;
  meta: MetaProgress;
  result?: ReincarnationResult;
}

export function NovelSettlementView({ life, meta, result }: NovelSettlementViewProps) {
  if (!life && !result) {
    return null;
  }

  const world = life ? getWorldById(life.worldId) : undefined;
  const realm = result ? getRealmById(result.highestRealmId) : life ? getRealmById(life.highestRealmId) : undefined;
  const relicNames = (meta.legacyRelicIds ?? meta.worldLegacyIds ?? [])
    .map((id) => getLegacyRelicById(id)?.name)
    .filter(Boolean)
    .slice(-4);

  return (
    <section className="novel-settlement">
      <p className="novel-kicker">輪迴清算</p>
      <div className="novel-result-grid">
        <span>本世</span>
        <strong>{world?.name ?? "未知世界"}</strong>
        <span>最高境界</span>
        <strong>{realm ? `${realm.name}${realm.stageName}` : "凡塵未定"}</strong>
        <span>輪迴點</span>
        <strong>{result?.earnedReincarnationPoints ?? meta.reincarnationPoints}</strong>
        <span>保留遺物</span>
        <strong>{relicNames.length ? relicNames.join("、") : "尚無"}</strong>
      </div>
    </section>
  );
}
