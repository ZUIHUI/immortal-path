import { getRealmById } from "./realms";
import type { RealmId, StoryChapter } from "../types";

export const storyChapters: StoryChapter[] = [
  {
    id: "story_qingyun_awakening",
    title: "青雲入道篇",
    realmRange: { minOrder: 0, maxOrder: 4 },
    summary:
      "你自凡塵醒來，帶著輪迴殘響踏入青雲小界。山村、外門、古洞與靈泉皆是起點，真正的考驗是以凡骨築出第一座道基。",
    currentObjective: "在壽元耗盡前完成築基，證明此世有問仙之資。",
    nextObjective: "築基後尋找更高靈脈，為凝結金丹做準備。",
    locations: ["山村", "青雲外門", "靈泉古洞", "試煉石階"],
    themes: ["凡骨逆命", "初遇仙門", "靈根覺醒", "道基將成"],
    aiGuidance:
      "此階段劇情聚焦入門、奇遇、築基前兆與凡人逆命，不要過早出現仙界或高階大能親自下場。",
    milestoneRealmIds: ["realm_qi_refining_early", "realm_foundation_early"],
  },
  {
    id: "story_foundation_river",
    title: "道基山河篇",
    realmRange: { minOrder: 5, maxOrder: 8 },
    summary:
      "築基之後，丹田靈湖初成，青雲小界不再只是牢籠。你開始接觸內門、秘境與散修爭鬥，也第一次感到金丹大道的沉重門檻。",
    currentObjective: "穩固道基，累積丹火與本命法器，衝擊金丹。",
    nextObjective: "凝成金丹後，讓自身道韻足以震懾一方山河。",
    locations: ["青雲內門", "山河秘境", "散修坊市", "丹火石室"],
    themes: ["道基穩固", "內門爭鋒", "本命法器", "金丹門檻"],
    aiGuidance:
      "此階段可加入內門競爭、秘境資源、築基修士恩怨與丹火淬體，重點是從活下去轉向爭奪道途。",
    milestoneRealmIds: ["realm_foundation_middle", "realm_core_formation_early"],
  },
  {
    id: "story_core_formation_oath",
    title: "金丹立誓篇",
    realmRange: { minOrder: 9, maxOrder: 12 },
    summary:
      "金丹既成，天地靈氣在腹中旋成一輪小日。你已能鎮壓小界風波，卻也引來魔修、古族與宗門高層的目光。",
    currentObjective: "淬煉金丹品相，立下本命大道誓言，尋找元嬰胎息。",
    nextObjective: "讓金丹孕出元嬰，踏入神魂離體的境界。",
    locations: ["金丹法壇", "古族遺府", "魔修血陣", "青雲主峰"],
    themes: ["金丹品相", "本命道誓", "小界風波", "元嬰胎息"],
    aiGuidance:
      "此階段劇情應有金丹修士的壓迫感與宗門棋局，可以出現更大的因果，但仍以青雲小界為主舞台。",
    milestoneRealmIds: ["realm_core_formation_middle", "realm_nascent_soul_early"],
  },
  {
    id: "story_nascent_soul_shadow",
    title: "元嬰出竅篇",
    realmRange: { minOrder: 13, maxOrder: 16 },
    summary:
      "元嬰一成，神魂不再困於肉身。前世殘影開始清晰，你也逐漸察覺輪迴並非恩賜，而像是一道被人刻下的命盤。",
    currentObjective: "修成元嬰出竅，探索前世記憶與輪迴命盤的第一層真相。",
    nextObjective: "以神魂問道，尋找化神契機。",
    locations: ["神魂夜海", "前世殘卷", "命盤幻境", "嬰火洞府"],
    themes: ["元嬰出竅", "前世殘影", "命盤疑雲", "心魔試煉"],
    aiGuidance:
      "此階段可加重神魂、前世、心魔與輪迴真相，不要只寫資源獲取，要讓玩家感到主線疑雲正在浮現。",
    milestoneRealmIds: ["realm_nascent_soul_middle", "realm_spirit_transformation_early"],
  },
  {
    id: "story_spirit_transformation_dao",
    title: "化神問道篇",
    realmRange: { minOrder: 17, maxOrder: 20 },
    summary:
      "化神之後，一念可觀山河氣機。你開始與天道意志擦肩，青雲小界的邊界也出現了裂縫與外界投影。",
    currentObjective: "凝聚自身道域雛形，確認輪迴長河與青雲小界的關聯。",
    nextObjective: "煉虛成界，真正踏出小界束縛。",
    locations: ["天道裂隙", "青雲界壁", "問道古台", "神念星河"],
    themes: ["道域雛形", "界壁裂縫", "天道回聲", "小界真相"],
    aiGuidance:
      "此階段劇情可有天道壓迫、界壁裂縫與外界窺探，事件應更宏大，但仍保持角色親身抉擇。",
    milestoneRealmIds: ["realm_spirit_transformation_middle", "realm_void_refinement_early"],
  },
  {
    id: "story_void_refinement_world",
    title: "煉虛觀界篇",
    realmRange: { minOrder: 21, maxOrder: 24 },
    summary:
      "煉虛修士能以己身觀一界。你開始理解每一次轉生都在修補某條斷裂因果，而青雲只是長河中的第一枚石子。",
    currentObjective: "以虛空法則重塑道域，掌握一界因果的流向。",
    nextObjective: "合體歸一，讓肉身、神魂與道域不再分離。",
    locations: ["虛空渡口", "界河殘橋", "因果石碑", "道域雛界"],
    themes: ["虛空行走", "界河因果", "道域成界", "輪迴修補"],
    aiGuidance:
      "此階段可以描述虛空、界河、因果與輪迴任務，選項要有宏觀代價，不要寫成普通採藥事件。",
    milestoneRealmIds: ["realm_void_refinement_middle", "realm_integration_early"],
  },
  {
    id: "story_integration_sentinel",
    title: "合體鎮界篇",
    realmRange: { minOrder: 25, maxOrder: 28 },
    summary:
      "合體之境，己身即法相，道域即城池。你能鎮壓界災，也會被更高層的輪迴守門者視為變數。",
    currentObjective: "完成人道、法相與道域合一，成為能鎮一界的存在。",
    nextObjective: "大乘立道，讓自身大道足以承載眾生命數。",
    locations: ["鎮界法相", "守門者古殿", "萬民願海", "界災裂谷"],
    themes: ["法相鎮界", "守門者", "眾生願力", "大乘之路"],
    aiGuidance:
      "此階段劇情可以有守門者、界災與眾生願力，玩家抉擇應牽動群體命運與自身道心。",
    milestoneRealmIds: ["realm_integration_middle", "realm_mahayana_early"],
  },
  {
    id: "story_mahayana_vow",
    title: "大乘立道篇",
    realmRange: { minOrder: 29, maxOrder: 32 },
    summary:
      "大乘者不只求己身飛升，也要決定何為自身大道。你逐漸能看見輪迴長河上無數前世的火光。",
    currentObjective: "立下可承載輪迴的本命大道，準備面對天劫清算。",
    nextObjective: "渡過九重雷劫，打開飛升天門。",
    locations: ["大道誓壇", "輪迴長河", "眾生命燈", "天劫雲海"],
    themes: ["大乘立道", "眾生命數", "輪迴長河", "天劫前夜"],
    aiGuidance:
      "此階段劇情要莊嚴且有抉擇重量，可讓前世記憶與眾生因果同時壓上主角道心。",
    milestoneRealmIds: ["realm_mahayana_middle", "realm_tribulation_early"],
  },
  {
    id: "story_tribulation_gate",
    title: "渡劫飛升篇",
    realmRange: { minOrder: 33, maxOrder: 36 },
    summary:
      "九重雷劫不是懲罰，而是天地對你此生所有因果的最後審問。每一道雷，都照出一段前世與一個未償之願。",
    currentObjective: "渡過九重雷劫，斬斷凡界束縛，推開飛升天門。",
    nextObjective: "飛升成仙，在仙界重新理解輪迴命盤。",
    locations: ["九重雷海", "飛升天門", "因果審判台", "前世雷影"],
    themes: ["雷劫清算", "飛升天門", "前世願火", "天地審問"],
    aiGuidance:
      "此階段劇情應有雷劫、審判、前世清算與飛升壓迫，成功要爽，失敗要慘烈但不廉價。",
    milestoneRealmIds: ["realm_tribulation_middle", "realm_true_immortal_early"],
  },
  {
    id: "story_true_immortal_origin",
    title: "真仙命盤篇",
    realmRange: { minOrder: 37, maxOrder: 40 },
    summary:
      "飛升之後，你終於看見命盤的背面。所謂輪迴成長不是無限重開，而是一場跨越諸世的補天之局。",
    currentObjective: "凝聚真仙道果，查明輪迴命盤的源頭。",
    nextObjective: "此版本主線暫止於真仙圓滿，後續將通往更高仙域。",
    locations: ["仙界初庭", "命盤背面", "補天古卷", "諸世星河"],
    themes: ["真仙道果", "命盤源頭", "補天之局", "仙域伏筆"],
    aiGuidance:
      "此階段劇情應像終章與新章交界，揭露部分輪迴真相，同時留下更高仙域與補天局的伏筆。",
    milestoneRealmIds: ["realm_true_immortal_middle", "realm_true_immortal_perfect"],
  },
];

export function getStoryChapterByRealmId(realmId: RealmId): StoryChapter {
  const realm = getRealmById(realmId);
  return (
    storyChapters.find(
      (chapter) =>
        realm.order >= chapter.realmRange.minOrder &&
        realm.order <= chapter.realmRange.maxOrder,
    ) ?? storyChapters[storyChapters.length - 1]
  );
}

export function getNextStoryChapter(realmId: RealmId): StoryChapter | undefined {
  const current = getStoryChapterByRealmId(realmId);
  const index = storyChapters.findIndex((chapter) => chapter.id === current.id);
  return index >= 0 ? storyChapters[index + 1] : undefined;
}
