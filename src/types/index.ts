export type GamePage =
  | "start"
  | "main"
  | "cultivation"
  | "breakthrough"
  | "event"
  | "result"
  | "shop";

export type RealmId = string;
export type IdentityId = string;
export type FateId = string;
export type WorldId = string;
export type EventId = string;
export type ShopItemId = string;

export type PlayerStatus =
  | "normal"
  | "injured"
  | "weak"
  | "heart_demon"
  | "dead";

export type EventType =
  | "opportunity"
  | "combat"
  | "exploration"
  | "merchant"
  | "sect"
  | "heart_demon"
  | "encounter"
  | "npc"
  | "death"
  | "reincarnation";

export type GameLogType =
  | "system"
  | "life"
  | "cultivation"
  | "breakthrough"
  | "event"
  | "death"
  | "reincarnation"
  | "shop";

export type ReincarnationEndType = "death" | "objective" | "manual";

export type EventRarity = "common" | "rare" | "epic" | "legendary" | "mythic";

export type CultivationCriticalTier =
  | "normal"
  | "minor_insight"
  | "deep_insight"
  | "dao_enlightenment"
  | "heaven_resonance"
  | "defying_enlightenment";

export type BreakthroughMethodId = "stable" | "force" | "defy_heaven";

export type AiNarrativeMood =
  | "calm"
  | "mysterious"
  | "danger"
  | "epic"
  | "breakthrough"
  | "death";

export type AiNarrativeRiskLevel = "safe" | "low" | "medium" | "high" | "fatal";

export type AiNarrativeChoiceType =
  | "cautious"
  | "greedy"
  | "kind"
  | "ruthless"
  | "reckless"
  | "wise";

export type AiSuggestedEffectType =
  | "cultivationGain"
  | "resourceGain"
  | "resourceLoss"
  | "statGain"
  | "statLoss"
  | "hpLoss"
  | "lifespanLoss"
  | "karmaGain"
  | "destinyGain"
  | "memoryGain"
  | "statusGain"
  | "eventFlag"
  | "reincarnationBonus";

export type AiSuggestedEffectIntensity =
  | "tiny"
  | "small"
  | "medium"
  | "large"
  | "huge";

export type NarrativeTriggerType =
  | "manual_explore"
  | "cultivation_event"
  | "event_continue";

export type GameEffectType =
  | "cultivationDelta"
  | "resourceDelta"
  | "attributeDelta"
  | "hpDelta"
  | "lifespanDelta"
  | "statusAdd"
  | "eventFlag"
  | "reincarnationPointMultiplierDelta"
  | "triggerDeath"
  | "breakthroughHint"
  | "completeWorldObjective";

export type VisibleChangeTone = "positive" | "negative" | "neutral" | "danger";

export interface ResourceMap {
  spiritStones: number;
  aura: number;
  pills: number;
  herbs: number;
  artifacts: number;
  destiny: number;
  karma: number;
  pastLifeMemory: number;
}

export interface AttributeMap {
  spiritualRoot: number;
  hp: number;
  maxHp: number;
  divineSense: number;
  attack: number;
  defense: number;
  comprehension: number;
  luck: number;
  daoHeart: number;
  lifespan: number;
}

export interface GameModifier {
  spiritualRoot?: number;
  hp?: number;
  maxHp?: number;
  divineSense?: number;
  attack?: number;
  defense?: number;
  comprehension?: number;
  luck?: number;
  daoHeart?: number;
  lifespan?: number;
  cultivationEfficiencyBonus?: number;
  breakthroughRateBonus?: number;
  eventChanceBonus?: number;
  resourceGainBonus?: number;
  deathRiskMultiplier?: number;
}

export interface Player {
  id: string;
  name: string;
  generation: number;
  currentWorldId: WorldId;
  identityId: IdentityId;
  fateId: FateId;
  realmId: RealmId;
  cultivation: number;
  age: number;
  lifespan: number;
  spiritualRoot: number;
  hp: number;
  maxHp: number;
  divineSense: number;
  attack: number;
  defense: number;
  comprehension: number;
  luck: number;
  daoHeart: number;
  karma: number;
  destiny: number;
  status: PlayerStatus[];
  resources: ResourceMap;
  completedEventIds: EventId[];
  importantEventIds: EventId[];
  unlockedWorldIds: WorldId[];
  unlockedIdentityIds: IdentityId[];
  unlockedFateIds: FateId[];
  highestRealmId: RealmId;
}

export interface LifeState {
  generation: number;
  worldId: WorldId;
  identityId: IdentityId;
  fateId: FateId;
  storySeed?: string;
  storyPremiseId?: string;
  startedAt: string;
  startingAge: number;
  endedAt?: string;
  isAlive: boolean;
  objectiveCompleted: boolean;
  deathReason?: string;
  yearsSurvived: number;
  highestRealmId: RealmId;
  completedEventIds: EventId[];
  importantEventIds: EventId[];
  rareEventsCompleted: number;
  epicEventsCompleted: number;
  legendaryEventsCompleted: number;
  mythicEventsCompleted: number;
  enlightenmentCount: number;
  maxSingleCultivationGain: number;
  defyingBreakthroughCount: number;
  reincarnationPointMultiplier: number;
  enemiesDefeated: number;
}

export interface MetaProgress {
  totalLives: number;
  reincarnationPoints: number;
  totalEarnedReincarnationPoints: number;
  pastLifeMemories: number;
  unlockedWorldIds: WorldId[];
  unlockedIdentityIds: IdentityId[];
  unlockedFateIds: FateId[];
  completedWorldIds: WorldId[];
  worldLegacyIds: string[];
  shopLevels: Record<ShopItemId, number>;
  bestRealmId: RealmId;
  history: ReincarnationResult[];
}

export interface Realm {
  id: RealmId;
  name: string;
  stageName: string;
  order: number;
  requiredCultivation: number;
  baseBreakthroughRate: number;
  statBonus: Partial<AttributeMap>;
  lifespanBonus: number;
  nextRealmId?: RealmId;
  unlocks: string[];
}

export interface StoryChapter {
  id: string;
  title: string;
  realmRange: {
    minOrder: number;
    maxOrder: number;
  };
  summary: string;
  currentObjective: string;
  nextObjective: string;
  locations: string[];
  themes: string[];
  aiGuidance: string;
  milestoneRealmIds: RealmId[];
}

export interface InfiniteStoryPremise {
  id: string;
  title: string;
  openingText: string;
  tone: string;
  surpriseHook: string;
}

export interface WorldLegacy {
  id: string;
  worldId: WorldId;
  name: string;
  description: string;
  effectSummary: string;
  rarity: EventRarity;
}

export interface Identity {
  id: IdentityId;
  name: string;
  description: string;
  initialAge: number;
  statModifiers: GameModifier;
  initialResources: Partial<ResourceMap>;
  advantages: string[];
  disadvantages: string[];
  specialEventIds: EventId[];
  playstyle: string;
  unlockCondition: string;
  isMvp: boolean;
}

export interface Fate {
  id: FateId;
  name: string;
  description: string;
  effects: GameModifier;
  advantages: string[];
  downside: string[];
  suitableIdentityIds: IdentityId[];
  upgradeable: boolean;
  isMvp: boolean;
}

export interface WorldRule {
  cultivationMultiplier: number;
  eventRiskMultiplier: number;
  breakthroughRateModifier: number;
  lifespanLimit: number;
}

export interface World {
  worldId: WorldId;
  worldName: string;
  worldType: string;
  difficulty: "low" | "medium" | "high";
  entryRequirement: string;
  mainObjective: string;
  objectiveRealmId?: RealmId;
  timeLimit: number;
  worldRules: WorldRule;
  eventPool: EventId[];
  rewardPool: string[];
  deathPenalty: string;
  clearReward: string;
  unlockCondition: string;
  isMvp: boolean;
}

export interface EventRequirement {
  minRealmOrder?: number;
  minHp?: number;
  minLuck?: number;
  minComprehension?: number;
  minDaoHeart?: number;
  minResource?: Partial<ResourceMap>;
  statusNot?: PlayerStatus[];
}

export interface EventTriggerCondition {
  minAge?: number;
  maxAge?: number;
  minCultivation?: number;
  maxCultivation?: number;
  objectiveIncomplete?: boolean;
}

export interface EventResult {
  description: string;
  cultivationDelta?: number;
  ageDelta?: number;
  hpDelta?: number;
  maxHpDelta?: number;
  lifespanDelta?: number;
  resourcesDelta?: Partial<ResourceMap>;
  attributeDelta?: Partial<AttributeMap>;
  reincarnationPointMultiplierDelta?: number;
  statusAdd?: PlayerStatus[];
  statusRemove?: PlayerStatus[];
  deathReason?: string;
  completeObjective?: boolean;
  markImportant?: boolean;
  rareEvent?: boolean;
}

export interface EventOption {
  optionId: string;
  text: string;
  requirement?: EventRequirement;
  successRate: number;
  successResult: EventResult;
  failureResult?: EventResult;
  previewText: string;
}

export interface GameEvent {
  eventId: EventId;
  title: string;
  description: string;
  worldId: WorldId;
  locationId?: string;
  requiredRealm?: RealmId;
  requiredIdentity?: IdentityId;
  requiredFate?: FateId;
  triggerCondition?: EventTriggerCondition;
  options: EventOption[];
  weight: number;
  tags: string[];
  type: EventType;
  rarity: EventRarity;
}

export interface AiNarrativeChoice {
  choiceId: string;
  text: string;
  previewText: string;
  riskLevel: AiNarrativeRiskLevel;
  choiceType: AiNarrativeChoiceType;
  requirementHint?: string;
}

export interface AiSuggestedEffect {
  type: AiSuggestedEffectType;
  target?: string;
  intensity: AiSuggestedEffectIntensity;
  reason: string;
}

export interface AiNarrativeResponse {
  sceneId: string;
  title: string;
  content: string;
  mood: AiNarrativeMood;
  rarity: EventRarity;
  choices: AiNarrativeChoice[];
  suggestedEffects: AiSuggestedEffect[];
  settlementTags: string[];
  logText: string;
  shouldEndEvent: boolean;
  shouldTriggerDeath: boolean;
  deathReason?: string;
  shouldTriggerBreakthrough: boolean;
  shouldCompleteWorldObjective: boolean;
}

export interface NarrativePlayerSnapshot {
  name: string;
  generation: number;
  currentWorldId: WorldId;
  identityId: IdentityId;
  fateId: FateId;
  realmId: RealmId;
  highestRealmId: RealmId;
  cultivation: number;
  age: number;
  lifespan: number;
  hp: number;
  maxHp: number;
  spiritualRoot: number;
  divineSense: number;
  attack: number;
  defense: number;
  comprehension: number;
  luck: number;
  daoHeart: number;
  status: PlayerStatus[];
  resources: ResourceMap;
}

export interface NarrativeLogSummary {
  type: GameLogType;
  message: string;
}

export interface GenerateNarrativeScenePayload {
  lifeState: LifeState;
  metaProgress: MetaProgress;
  worldId: WorldId;
  playerSnapshot: NarrativePlayerSnapshot;
  recentLogs: NarrativeLogSummary[];
  triggerType: NarrativeTriggerType;
}

export interface ContinueNarrativeScenePayload {
  lifeState: LifeState;
  metaProgress: MetaProgress;
  currentNarrativeState: AiNarrativeResponse;
  selectedChoice: AiNarrativeChoice;
  playerSnapshot: NarrativePlayerSnapshot;
  recentLogs: NarrativeLogSummary[];
}

export interface AiNarrativeHistoryEntry {
  sceneId: string;
  title: string;
  selectedChoiceId?: string;
  createdAt: string;
}

export interface AiNarrativeState {
  isLoading: boolean;
  active: boolean;
  currentScene: AiNarrativeResponse | null;
  history: AiNarrativeHistoryEntry[];
  error: string | null;
}

export interface GameEffect {
  type: GameEffectType;
  target?: string;
  value?: number;
  reason: string;
}

export interface VisibleChange {
  label: string;
  value: string;
  tone: VisibleChangeTone;
}

export interface ResolvedNarrativeEffects {
  effects: GameEffect[];
  visibleChanges: VisibleChange[];
  balanceWarnings: string[];
}

export interface ReincarnationRewardBreakdown {
  realmReward: number;
  survivalReward: number;
  eventReward: number;
  breakthroughReward: number;
  objectiveReward: number;
  deathModifier: number;
  achievementBonus: number;
  multiplier: number;
}

export interface ReincarnationResult {
  id: string;
  generation: number;
  identityId: IdentityId;
  fateId: FateId;
  worldId: WorldId;
  yearsSurvived: number;
  highestRealmId: RealmId;
  objectiveCompleted: boolean;
  importantEventIds: EventId[];
  deathReason: string;
  endType: ReincarnationEndType;
  worldRating: string;
  lifeTitle: string;
  score: number;
  earnedReincarnationPoints: number;
  rewardBreakdown: ReincarnationRewardBreakdown;
  maxSingleCultivationGain: number;
  rareEventCount: number;
  enlightenmentCount: number;
  defyingBreakthroughCount: number;
  nextLifeBonusSummary: string[];
  worldLegacyId?: string;
  unlockedContent: string[];
  retainedBonuses: string[];
  createdAt: string;
}

export type ReincarnationShopEffectKey =
  | "initialComprehension"
  | "initialLuck"
  | "cultivationEfficiency"
  | "breakthroughRate"
  | "initialLifespan";

export interface ReincarnationShopItem {
  id: ShopItemId;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  maxLevel: number;
  effectKey: ReincarnationShopEffectKey;
  effectPerLevel: number;
  balanceNote: string;
}

export interface SaveData {
  version: number;
  savedAt: string;
  player?: Player;
  life?: LifeState;
  meta: MetaProgress;
  logs: GameLog[];
  currentEvent?: GameEvent;
  latestResult?: ReincarnationResult;
  aiNarrativeState?: AiNarrativeState;
  currentPage: GamePage;
}

export interface GameLog {
  id: string;
  generation: number;
  type: GameLogType;
  message: string;
  createdAt: string;
}
