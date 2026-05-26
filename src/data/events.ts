import type { GameEvent } from "../types";

export const events: GameEvent[] = [
  {
    eventId: "event_qingyun_001",
    title: "山澗靈泉",
    description: "你在霧氣深處找到一口微弱靈泉，泉邊留有新近妖獸足跡。",
    worldId: "world_qingyun",
    locationId: "mountain_stream",
    type: "opportunity",
    rarity: "common",
    triggerCondition: {},
    weight: 10,
    tags: ["resource", "opportunity"],
    options: [
      {
        optionId: "absorb",
        text: "汲取靈氣",
        requirement: {},
        successRate: 0.86,
        previewText: "獲得靈氣與修為，但可能驚動妖獸。",
        successResult: {
          description: "靈泉入體，經脈微熱，修為穩穩上漲。",
          cultivationDelta: 35,
          resourcesDelta: {
            aura: 18,
          },
          markImportant: true,
        },
        failureResult: {
          description: "妖獸被靈氣波動驚動，你勉強脫身。",
          hpDelta: -16,
          resourcesDelta: {
            aura: 6,
          },
        },
      },
      {
        optionId: "leave_mark",
        text: "記下位置",
        requirement: {},
        successRate: 1,
        previewText: "保守行動，只取得少量收益。",
        successResult: {
          description: "你避開妖獸，只帶走幾滴靈泉。",
          cultivationDelta: 12,
          resourcesDelta: {
            aura: 8,
          },
        },
      },
    ],
  },
  {
    eventId: "event_qingyun_002",
    title: "老獵人的警告",
    description: "山村老獵人告訴你，北坡夜裡常有青光出沒。",
    worldId: "world_qingyun",
    requiredIdentity: "identity_orphan",
    locationId: "village",
    type: "npc",
    rarity: "common",
    triggerCondition: {},
    weight: 8,
    tags: ["identity", "npc"],
    options: [
      {
        optionId: "follow_hint",
        text: "循線探查",
        requirement: {},
        successRate: 0.75,
        previewText: "可能找到資源，也可能遇險。",
        successResult: {
          description: "你在北坡石縫中找到幾株凝露草。",
          resourcesDelta: {
            herbs: 4,
          },
          cultivationDelta: 10,
          markImportant: true,
        },
        failureResult: {
          description: "青光只是毒蟲，你被咬傷後倉促返村。",
          hpDelta: -14,
          statusAdd: ["injured"],
        },
      },
    ],
  },
  {
    eventId: "event_qingyun_003",
    title: "外門採藥任務",
    description: "宗門發布採藥任務，獎勵不高，但勝在安全。",
    worldId: "world_qingyun",
    requiredIdentity: "identity_outer_disciple",
    locationId: "outer_sect",
    type: "sect",
    rarity: "common",
    triggerCondition: {},
    weight: 8,
    tags: ["identity", "sect"],
    options: [
      {
        optionId: "take_task",
        text: "接下任務",
        requirement: {},
        successRate: 0.9,
        previewText: "獲得靈石與藥草。",
        successResult: {
          description: "你按時交付藥草，管事記下了你的名字。",
          resourcesDelta: {
            spiritStones: 12,
            herbs: 3,
          },
          cultivationDelta: 8,
          markImportant: true,
        },
        failureResult: {
          description: "山路濕滑，你摔傷了腿，只交回一半藥草。",
          hpDelta: -10,
          resourcesDelta: {
            spiritStones: 4,
          },
        },
      },
    ],
  },
  {
    eventId: "event_qingyun_004",
    title: "半卷家傳殘法",
    description: "夜深時，你想起祖宅密格中那半卷無名心法。",
    worldId: "world_qingyun",
    requiredIdentity: "identity_fallen_clan",
    locationId: "old_house",
    type: "opportunity",
    rarity: "epic",
    triggerCondition: {},
    weight: 8,
    tags: ["identity", "comprehension"],
    options: [
      {
        optionId: "study",
        text: "參悟殘法",
        requirement: {
          minComprehension: 18,
        },
        successRate: 0.78,
        previewText: "悟性足夠時收益更高。",
        successResult: {
          description: "殘法雖缺，你仍悟出一段調息訣。",
          cultivationDelta: 42,
          attributeDelta: {
            divineSense: 1,
          },
          markImportant: true,
          rareEvent: true,
        },
        failureResult: {
          description: "殘法缺字太多，你強行推演，反傷神識。",
          hpDelta: -8,
          statusAdd: ["weak"],
        },
      },
      {
        optionId: "sell_copy",
        text: "抄錄殘頁換靈石",
        requirement: {},
        successRate: 1,
        previewText: "立即獲得靈石。",
        successResult: {
          description: "坊市散修收下殘頁拓本，付了些靈石。",
          resourcesDelta: {
            spiritStones: 18,
          },
        },
      },
    ],
  },
  {
    eventId: "event_qingyun_005",
    title: "山魈攔路",
    description: "一頭受靈氣侵染的山魈擋在路中，眼中凶光畢露。",
    worldId: "world_qingyun",
    locationId: "forest",
    type: "combat",
    rarity: "common",
    triggerCondition: {},
    weight: 9,
    tags: ["combat", "risk"],
    options: [
      {
        optionId: "fight",
        text: "正面迎戰",
        requirement: {},
        successRate: 0.68,
        previewText: "勝利可獲得資源，失敗會重傷。",
        successResult: {
          description: "你抓住破綻擊退山魈，取走牠守著的靈草。",
          resourcesDelta: {
            herbs: 3,
            spiritStones: 6,
          },
          cultivationDelta: 18,
        },
        failureResult: {
          description: "山魈力大，你被撞飛在石壁上。",
          hpDelta: -28,
          statusAdd: ["injured"],
        },
      },
      {
        optionId: "avoid",
        text: "繞路避開",
        requirement: {},
        successRate: 0.92,
        previewText: "消耗時間，降低風險。",
        successResult: {
          description: "你多走半日山路，避開了衝突。",
          ageDelta: 1,
          cultivationDelta: 4,
        },
        failureResult: {
          description: "山魈嗅到你的氣息，仍追了上來。",
          hpDelta: -12,
        },
      },
    ],
  },
  {
    eventId: "event_qingyun_006",
    title: "荒廢藥田",
    description: "山腰一處舊藥田無人看守，土中仍有靈氣未散。",
    worldId: "world_qingyun",
    locationId: "old_field",
    type: "exploration",
    rarity: "common",
    triggerCondition: {},
    weight: 10,
    tags: ["resource"],
    options: [
      {
        optionId: "harvest",
        text: "採收藥草",
        requirement: {},
        successRate: 0.84,
        previewText: "取得藥草，有機率被毒藤所傷。",
        successResult: {
          description: "你辨明藥性，收穫不少凝氣草。",
          resourcesDelta: {
            herbs: 5,
          },
        },
        failureResult: {
          description: "你誤碰毒藤，氣血翻湧。",
          hpDelta: -12,
          resourcesDelta: {
            herbs: 2,
          },
        },
      },
    ],
  },
  {
    eventId: "event_qingyun_007",
    title: "坊市開集",
    description: "青雲山腳坊市開集，散修與小商販擠滿長街。",
    worldId: "world_qingyun",
    locationId: "market",
    type: "merchant",
    rarity: "rare",
    triggerCondition: {},
    weight: 8,
    tags: ["merchant", "resource"],
    options: [
      {
        optionId: "buy_pill",
        text: "購買凝氣丹",
        requirement: {
          minResource: {
            spiritStones: 10,
          },
        },
        successRate: 1,
        previewText: "消耗靈石換丹藥。",
        successResult: {
          description: "你買下一枚成色普通的凝氣丹。",
          resourcesDelta: {
            spiritStones: -10,
            pills: 1,
          },
        },
      },
      {
        optionId: "listen_news",
        text: "打聽消息",
        requirement: {},
        successRate: 0.82,
        previewText: "可能獲得機緣線索。",
        successResult: {
          description: "你聽聞西谷有雷雨後的靈光異象。",
          resourcesDelta: {
            destiny: 1,
          },
          markImportant: true,
        },
        failureResult: {
          description: "你被假消息耽擱，只換來幾句空話。",
          ageDelta: 1,
        },
      },
    ],
  },
  {
    eventId: "event_qingyun_008",
    title: "心魔低語",
    description: "閉關時，前世殘影在識海中浮沉，質問你為何仍困凡塵。",
    worldId: "world_qingyun",
    locationId: "meditation_room",
    type: "heart_demon",
    rarity: "rare",
    triggerCondition: {},
    weight: 5,
    tags: ["heart_demon", "risk"],
    options: [
      {
        optionId: "steady_mind",
        text: "守住道心",
        requirement: {
          minDaoHeart: 12,
        },
        successRate: 0.72,
        previewText: "成功可增強道心，失敗會受心魔影響。",
        successResult: {
          description: "你守住本心，心魔化作一縷前世記憶。",
          resourcesDelta: {
            pastLifeMemory: 1,
          },
          attributeDelta: {
            daoHeart: 1,
          },
          markImportant: true,
          rareEvent: true,
        },
        failureResult: {
          description: "心魔趁虛而入，你數月難以入定。",
          hpDelta: -8,
          statusAdd: ["heart_demon"],
        },
      },
    ],
  },
  {
    eventId: "event_qingyun_009",
    title: "雨夜悟道",
    description: "春雷後的雨聲連綿，你忽然聽見天地呼吸。",
    worldId: "world_qingyun",
    locationId: "hut",
    type: "opportunity",
    rarity: "common",
    triggerCondition: {},
    weight: 9,
    tags: ["cultivation"],
    options: [
      {
        optionId: "meditate",
        text: "順勢入定",
        requirement: {},
        successRate: 0.88,
        previewText: "高機率獲得修為。",
        successResult: {
          description: "一夜雨聲洗去浮躁，靈氣在周天流轉。",
          cultivationDelta: 30,
          hpDelta: 6,
        },
        failureResult: {
          description: "你心緒不寧，只睡了半夜。",
          cultivationDelta: 5,
        },
      },
    ],
  },
  {
    eventId: "event_qingyun_010",
    title: "廢棄洞府",
    description: "藤蔓遮掩的石門後，是一處早已荒廢的修士洞府。",
    worldId: "world_qingyun",
    locationId: "cave",
    type: "exploration",
    rarity: "epic",
    triggerCondition: {},
    weight: 7,
    tags: ["opportunity", "risk"],
    options: [
      {
        optionId: "enter",
        text: "入內搜尋",
        requirement: {},
        successRate: 0.62,
        previewText: "可能找到寶物，也可能觸發殘陣。",
        successResult: {
          description: "你避開殘陣，在石匣中找到靈石與法器碎片。",
          resourcesDelta: {
            spiritStones: 24,
            artifacts: 1,
          },
          reincarnationPointMultiplierDelta: 0.05,
          markImportant: true,
          rareEvent: true,
        },
        failureResult: {
          description: "殘陣亮起，你被靈光擊中，勉強逃出生天。",
          hpDelta: -34,
          statusAdd: ["injured"],
        },
      },
      {
        optionId: "observe",
        text: "只在外圍觀察",
        requirement: {},
        successRate: 1,
        previewText: "安全取得少量線索。",
        successResult: {
          description: "你拓下石門紋路，日後或許能悟出陣理。",
          cultivationDelta: 10,
          attributeDelta: {
            divineSense: 1,
          },
        },
      },
    ],
  },
  {
    eventId: "event_qingyun_011",
    title: "斷劍埋骨",
    description: "溪邊泥沙中露出半截斷劍，劍身仍有寒意。",
    worldId: "world_qingyun",
    locationId: "stream_bank",
    type: "encounter",
    rarity: "rare",
    triggerCondition: {},
    weight: 6,
    tags: ["artifact", "combat"],
    options: [
      {
        optionId: "pull_sword",
        text: "拔出斷劍",
        requirement: {},
        successRate: 0.7,
        previewText: "提升攻擊或受劍意反噬。",
        successResult: {
          description: "斷劍雖殘，仍可護身。",
          resourcesDelta: {
            artifacts: 1,
          },
          attributeDelta: {
            attack: 2,
          },
          markImportant: true,
        },
        failureResult: {
          description: "殘留劍意割傷經脈。",
          hpDelta: -18,
          statusAdd: ["weak"],
        },
      },
    ],
  },
  {
    eventId: "event_qingyun_012",
    title: "藥廬老人",
    description: "藥廬老人見你根基不穩，願以藥草換一枚療傷丹。",
    worldId: "world_qingyun",
    locationId: "medicine_hut",
    type: "npc",
    rarity: "common",
    triggerCondition: {},
    weight: 8,
    tags: ["heal", "resource"],
    options: [
      {
        optionId: "trade",
        text: "以藥草交換",
        requirement: {
          minResource: {
            herbs: 2,
          },
        },
        successRate: 1,
        previewText: "消耗藥草恢復氣血。",
        successResult: {
          description: "丹藥入口，暗傷漸消。",
          hpDelta: 26,
          resourcesDelta: {
            herbs: -2,
            pills: 1,
          },
          statusRemove: ["injured", "weak"],
        },
      },
      {
        optionId: "ask_advice",
        text: "請教養生之法",
        requirement: {},
        successRate: 0.78,
        previewText: "可能增加壽元。",
        successResult: {
          description: "老人傳你一段吐納養生訣。",
          lifespanDelta: 2,
          markImportant: true,
        },
        failureResult: {
          description: "老人只是笑而不語。",
        },
      },
    ],
  },
  {
    eventId: "event_qingyun_013",
    title: "山道劫修",
    description: "兩名劫修盯上你的行囊，退路被封。",
    worldId: "world_qingyun",
    locationId: "mountain_road",
    type: "combat",
    rarity: "common",
    triggerCondition: {},
    weight: 6,
    tags: ["combat", "death"],
    options: [
      {
        optionId: "break_out",
        text: "強行突圍",
        requirement: {},
        successRate: 0.58,
        previewText: "高風險戰鬥，失敗可能死亡。",
        successResult: {
          description: "你拼著受傷斬退劫修，反得一袋靈石。",
          hpDelta: -10,
          resourcesDelta: {
            spiritStones: 22,
          },
          attributeDelta: {
            attack: 1,
          },
        },
        failureResult: {
          description: "你被劫修重創，雖逃出山道，已傷及根本。",
          hpDelta: -48,
          statusAdd: ["injured"],
        },
      },
      {
        optionId: "pay",
        text: "交出靈石保命",
        requirement: {},
        successRate: 0.95,
        previewText: "損失靈石，避免戰鬥。",
        successResult: {
          description: "劫修收了靈石，冷笑著放你離開。",
          resourcesDelta: {
            spiritStones: -12,
          },
        },
        failureResult: {
          description: "劫修貪心不足，仍出手傷人。",
          hpDelta: -18,
        },
      },
    ],
  },
  {
    eventId: "event_qingyun_014",
    title: "孤燈經卷",
    description: "破廟孤燈下，一卷無名經文被雨水浸濕半角。",
    worldId: "world_qingyun",
    locationId: "old_temple",
    type: "opportunity",
    rarity: "legendary",
    triggerCondition: {},
    weight: 5,
    tags: ["rare", "comprehension"],
    options: [
      {
        optionId: "read",
        text: "通讀經卷",
        requirement: {
          minComprehension: 20,
        },
        successRate: 0.66,
        previewText: "悟性越高越值得嘗試。",
        successResult: {
          description: "經文不是功法，卻讓你明白何謂向道之心。",
          attributeDelta: {
            daoHeart: 2,
            comprehension: 1,
          },
          resourcesDelta: {
            pastLifeMemory: 1,
          },
          reincarnationPointMultiplierDelta: 0.1,
          markImportant: true,
          rareEvent: true,
        },
        failureResult: {
          description: "字句晦澀，你越讀越困，只記下幾個殘句。",
          cultivationDelta: 6,
        },
      },
    ],
  },
  {
    eventId: "event_qingyun_015",
    title: "同門邀戰",
    description: "一名同門邀你切磋，旁人已圍成一圈。",
    worldId: "world_qingyun",
    locationId: "sect_square",
    type: "sect",
    rarity: "common",
    triggerCondition: {},
    weight: 7,
    tags: ["sect", "combat"],
    options: [
      {
        optionId: "spar",
        text: "接受切磋",
        requirement: {},
        successRate: 0.72,
        previewText: "可能提升戰力，失敗會受傷。",
        successResult: {
          description: "你以半招取勝，對運氣行勁更熟悉了。",
          attributeDelta: {
            attack: 1,
            defense: 1,
          },
          cultivationDelta: 12,
        },
        failureResult: {
          description: "你敗下陣來，好在只是皮肉傷。",
          hpDelta: -10,
          cultivationDelta: 4,
        },
      },
      {
        optionId: "decline",
        text: "婉拒切磋",
        requirement: {},
        successRate: 1,
        previewText: "不冒風險，保留狀態。",
        successResult: {
          description: "你將時間留給修煉。",
          cultivationDelta: 8,
        },
      },
    ],
  },
  {
    eventId: "event_qingyun_016",
    title: "凡塵因果",
    description: "山下村民求你驅逐作祟野獸，報酬微薄，卻關乎人命。",
    worldId: "world_qingyun",
    locationId: "village",
    type: "npc",
    rarity: "rare",
    triggerCondition: {},
    weight: 6,
    tags: ["karma", "choice"],
    options: [
      {
        optionId: "help",
        text: "出手相助",
        requirement: {},
        successRate: 0.78,
        previewText: "獲得天命與少量資源。",
        successResult: {
          description: "村人感念你的恩情，為你立下一盞長明燈。",
          resourcesDelta: {
            destiny: 2,
            spiritStones: 4,
          },
          markImportant: true,
        },
        failureResult: {
          description: "野獸比預想兇猛，你救下村人，自己也受了傷。",
          hpDelta: -20,
          resourcesDelta: {
            destiny: 1,
          },
        },
      },
      {
        optionId: "ignore",
        text: "專心修行",
        requirement: {},
        successRate: 1,
        previewText: "不涉凡塵，因果略增。",
        successResult: {
          description: "你避開麻煩，卻在夜裡想起村民惶恐的眼神。",
          cultivationDelta: 10,
          resourcesDelta: {
            karma: 1,
          },
        },
      },
    ],
  },
  {
    eventId: "event_qingyun_017",
    title: "古樹聽風",
    description: "一棵千年古樹立在山巔，風過枝葉，如有人低聲講道。",
    worldId: "world_qingyun",
    locationId: "mountain_top",
    type: "encounter",
    rarity: "rare",
    triggerCondition: {},
    weight: 7,
    tags: ["dao_heart", "opportunity"],
    options: [
      {
        optionId: "listen",
        text: "靜坐聽風",
        requirement: {},
        successRate: 0.8,
        previewText: "增長道心與少量修為。",
        successResult: {
          description: "你坐到日落，心中雜念一點點沉下去。",
          cultivationDelta: 16,
          attributeDelta: {
            daoHeart: 1,
          },
        },
        failureResult: {
          description: "你只覺山風刺骨，提前下山。",
          hpDelta: -4,
        },
      },
    ],
  },
  {
    eventId: "event_qingyun_018",
    title: "靈石碎脈",
    description: "你發現一條細碎靈石脈，靈氣不盛，但足以支撐短期修煉。",
    worldId: "world_qingyun",
    locationId: "mine",
    type: "exploration",
    rarity: "common",
    triggerCondition: {},
    weight: 7,
    tags: ["resource"],
    options: [
      {
        optionId: "mine",
        text: "開採碎脈",
        requirement: {},
        successRate: 0.74,
        previewText: "獲得靈石，消耗氣血。",
        successResult: {
          description: "你開採到一小袋靈石。",
          hpDelta: -6,
          resourcesDelta: {
            spiritStones: 28,
          },
        },
        failureResult: {
          description: "碎脈坍塌，你被石塊擦傷。",
          hpDelta: -22,
          resourcesDelta: {
            spiritStones: 8,
          },
        },
      },
    ],
  },
  {
    eventId: "event_qingyun_019",
    title: "雷夜洗脈",
    description: "深夜天雷滾滾，天地靈機躁動，正適合冒險洗練經脈。",
    worldId: "world_qingyun",
    locationId: "cliff",
    type: "opportunity",
    rarity: "epic",
    triggerCondition: {},
    weight: 4,
    tags: ["rare", "risk", "breakthrough"],
    options: [
      {
        optionId: "temper",
        text: "引雷洗脈",
        requirement: {},
        successRate: 0.48,
        previewText: "成功大幅增益，失敗可能重傷。",
        successResult: {
          description: "雷意掠過經脈，你撐過痛楚，根骨更進一步。",
          cultivationDelta: 60,
          attributeDelta: {
            spiritualRoot: 2,
            maxHp: 8,
          },
          reincarnationPointMultiplierDelta: 0.08,
          markImportant: true,
          rareEvent: true,
        },
        failureResult: {
          description: "雷光失控，你被震落崖邊，幾乎喪命。",
          hpDelta: -55,
          statusAdd: ["injured", "weak"],
        },
      },
      {
        optionId: "watch",
        text: "觀雷悟勢",
        requirement: {},
        successRate: 0.86,
        previewText: "較安全地獲得少量突破感悟。",
        successResult: {
          description: "你不引雷入體，只觀其勢，對築基關隘略有所得。",
          cultivationDelta: 24,
          resourcesDelta: {
            destiny: 1,
          },
        },
        failureResult: {
          description: "雷聲擾心，你一夜無眠。",
          hpDelta: -4,
        },
      },
    ],
  },
  {
    eventId: "event_qingyun_020",
    title: "築基前兆",
    description: "你察覺丹田靈氣凝而不散，似乎已觸及築基門檻。",
    worldId: "world_qingyun",
    locationId: "meditation_room",
    type: "reincarnation",
    rarity: "mythic",
    weight: 5,
    triggerCondition: {
      minCultivation: 900,
      objectiveIncomplete: true,
    },
    tags: ["objective", "breakthrough"],
    options: [
      {
        optionId: "consolidate",
        text: "穩固根基",
        requirement: {},
        successRate: 0.9,
        previewText: "為築基做準備。",
        successResult: {
          description: "你壓下躁動靈氣，將根基打磨得更平穩。",
          cultivationDelta: 200,
          attributeDelta: {
            daoHeart: 1,
          },
          resourcesDelta: {
            destiny: 2,
            pastLifeMemory: 1,
          },
          reincarnationPointMultiplierDelta: 0.15,
          markImportant: true,
          rareEvent: true,
        },
        failureResult: {
          description: "靈氣躁動未平，你只得暫停閉關。",
          hpDelta: -8,
        },
      },
    ],
  },
];

export function getEventById(eventId: string): GameEvent {
  const event = events.find((item) => item.eventId === eventId);

  if (!event) {
    throw new Error(`Event not found: ${eventId}`);
  }

  return event;
}
