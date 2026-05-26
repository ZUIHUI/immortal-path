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
  startedAt: string;
  endedAt?: string;
  isAlive: boolean;
  objectiveCompleted: boolean;
  deathReason?: string;
  yearsSurvived: number;
  highestRealmId: RealmId;
  completedEventIds: EventId[];
  importantEventIds: EventId[];
  rareEventsCompleted: number;
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
  shopLevels: Record<ShopItemId, number>;
  bestRealmId: RealmId;
  history: ReincarnationResult[];
}

export interface Realm {
  id: RealmId;
  name: string;
  stageName: string;
  order: number;
  cultivationRequired: number;
  baseBreakthroughRate: number;
  attributeBonus: Partial<AttributeMap>;
  lifespanBonus: number;
  unlocks: string[];
}

export interface Identity {
  id: IdentityId;
  name: string;
  description: string;
  initialAge: number;
  effects: GameModifier;
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
  costs: string[];
  suitableIdentityIds: IdentityId[];
  upgradable: boolean;
  isMvp: boolean;
}

export interface WorldRule {
  cultivationMultiplier: number;
  eventRiskMultiplier: number;
  breakthroughRateModifier: number;
  lifespanLimit: number;
}

export interface World {
  id: WorldId;
  name: string;
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
  score: number;
  earnedReincarnationPoints: number;
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
  currentPage: GamePage;
}

export interface GameLog {
  id: string;
  generation: number;
  type: GameLogType;
  message: string;
  createdAt: string;
}
