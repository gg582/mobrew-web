export type TranslationKey =
  | 'appName' | 'appSubtitle' | 'backToMenu' | 'start' | 'cancel' | 'next' | 'prev' | 'reset'
  | 'pause' | 'resume' | 'brewing' | 'complete' | 'exhausted'
  | 'simpleModeTitle' | 'simpleModeDesc' | 'advancedModeTitle' | 'advancedModeDesc'
  | 'simpleQuestionTaste' | 'simpleQuestionMood' | 'simpleQuestionCaffeine'
  | 'simpleResultTitle' | 'simpleResultOrigin' | 'simpleResultVessel' | 'simpleResultTemp'
  | 'simpleResultTime' | 'simpleResultReason' | 'simpleStartButton' | 'simpleRestartButton'
  | 'simpleStepPrefix'
  | 'advancedTitle' | 'advancedSubtitle' | 'labelTeaType' | 'labelVessel' | 'labelBoilMethod'
  | 'labelTemperature' | 'labelLeafMass' | 'labelWaterVolume' | 'labelInfusions' | 'labelTds'
  | 'labelAltitude' | 'labelLeafSize' | 'advancedStartButton'
  | 'infusionCounter' | 'brewTime' | 'temperature' | 'extraction' | 'saturation' | 'hydration'
  | 'aromaFlux' | 'aminoAxes' | 'composition' | 'clarityIndex' | 'teaDistributor'
  | 'potential' | 'targetShare' | 'warningBitter' | 'warningMaxInfusions' | 'leafExhausted' | 'leafExhaustedDesc'
  | 'nextInfusion' | 'stats' | 'sessionHistory' | 'prepareNextInfusion'
  | 'nextInfusionTemp' | 'nextInfusionVolume'
  | 'regionEastAsia' | 'regionBritish' | 'regionSoutheastAsia' | 'regionTibetan' | 'regionWesternModern'
  | 'regionDescEastAsia' | 'regionDescBritish' | 'regionDescSoutheastAsia' | 'regionDescTibetan' | 'regionDescWesternModern'
  | 'teaGreenNormal' | 'teaWhite' | 'teaBlack' | 'teaOolong' | 'teaYellow' | 'teaPuerh'
  | 'teaGreenGyokuro' | 'teaGreenSencha' | 'teaGreenFukamushi' | 'teaTibetan'
  | 'vesselBritishTeapot' | 'vesselZisha' | 'vesselWhitePorcelain' | 'vesselCeladon'
  | 'vesselJapaneseCeramics' | 'vesselGlass' | 'vesselGaiwanWhitePorcelain' | 'vesselGaiwanCeladon'
  | 'boilElectric' | 'boilPotIron' | 'boilPotBronze' | 'boilPotClay'
  | 'tasteLight' | 'tasteLightDesc' | 'tasteSmooth' | 'tasteSmoothDesc' | 'tasteRich' | 'tasteRichDesc'
  | 'tasteFragrant' | 'tasteFragrantDesc' | 'tasteUnique' | 'tasteUniqueDesc'
  | 'moodRelax' | 'moodFocus' | 'moodEnergy' | 'moodDigestion'
  | 'caffeineLow' | 'caffeineMedium' | 'caffeineHigh'
  | 'recSencha' | 'recGyokuro' | 'recFukamushi' | 'recWhite' | 'recBlack'
  | 'recOolong' | 'recPuerh' | 'recTibetan' | 'recYellow' | 'recGreenNormal'
  // Tea varieties
  | 'varLongjing' | 'varBiluochun' | 'varHuangshanMaofeng' | 'varXinyangMaojian' | 'varTaipingHoukui'
  | 'varSencha' | 'varFukamushiSencha' | 'varBancha' | 'varKabusecha' | 'varKukicha'
  | 'varGyokuro' | 'varTenju' | 'varAoyama'
  | 'varBaihaoYinzhen' | 'varBaimudan' | 'varShoumei' | 'varGongmei'
  | 'varAssam' | 'varKeemun' | 'varDarjeeling' | 'varCeylon' | 'varLapsangSouchong' | 'varDianhong'
  | 'varTieguanyin' | 'varDahongpao' | 'varDongding' | 'varWenshanBaozhong' | 'varFenghuangDancong' | 'varDongfangMeiren'
  | 'varShengPuerh' | 'varShuPuerh' | 'varQizibing' | 'varTuocha'
  | 'varJunshanYinzhen' | 'varHuoshanHuangya' | 'varMengdingHuangya'
  | 'varButterTea' | 'varSweetTea'
  // Descriptions
  | 'descLongjing' | 'descBiluochun' | 'descHuangshanMaofeng' | 'descXinyangMaojian' | 'descTaipingHoukui'
  | 'descSencha' | 'descFukamushiSencha' | 'descBancha' | 'descKabusecha' | 'descKukicha'
  | 'descGyokuro' | 'descTenju' | 'descAoyama'
  | 'descBaihaoYinzhen' | 'descBaimudan' | 'descShoumei' | 'descGongmei'
  | 'descAssam' | 'descKeemun' | 'descDarjeeling' | 'descCeylon' | 'descLapsangSouchong' | 'descDianhong'
  | 'descTieguanyin' | 'descDahongpao' | 'descDongding' | 'descWenshanBaozhong' | 'descFenghuangDancong' | 'descDongfangMeiren'
  | 'descShengPuerh' | 'descShuPuerh' | 'descQizibing' | 'descTuocha'
  | 'descJunshanYinzhen' | 'descHuoshanHuangya' | 'descMengdingHuangya'
  | 'descButterTea' | 'descSweetTea'
  // Origins
  | 'originChinaZhejiang' | 'originChinaJiangsu' | 'originChinaAnhui' | 'originChinaHenan' | 'originChinaFujian' | 'originChinaHunan' | 'originChinaSichuan' | 'originChinaYunnan' | 'originChinaGuangdong'
  | 'originJapan' | 'originTaiwan' | 'originIndiaAssam' | 'originIndiaDarjeeling' | 'originSriLanka' | 'originTibet'
  // Tags
  | 'tagFamous' | 'tagFlat' | 'tagNutty' | 'tagSpiral' | 'tagFruity' | 'tagMountain' | 'tagFloral' | 'tagOrchid' | 'tagFuzzy' | 'tagRobust' | 'tagChestnut' | 'tagLargeLeaf' | 'tagRare'
  | 'tagStandard' | 'tagGrassy' | 'tagRefreshing' | 'tagDeepSteam' | 'tagRich' | 'tagSmooth' | 'tagEveryday' | 'tagMild' | 'tagLowCaffeine' | 'tagShaded' | 'tagSweet' | 'tagUmami' | 'tagStem' | 'tagCreamy'
  | 'tagPremium' | 'tagHeaven' | 'tagFresh' | 'tagDeep'
  | 'tagSilver' | 'tagDelicate' | 'tagHoney' | 'tagWhitePeony' | 'tagMellow' | 'tagPlum' | 'tagTribute' | 'tagDriedFruit'
  | 'tagMalty' | 'tagStrong' | 'tagBreakfast' | 'tagWine' | 'tagChampagne' | 'tagMuscatel' | 'tagSeasonal' | 'tagCitrus' | 'tagCrisp' | 'tagBright' | 'tagSmoky' | 'tagPine' | 'tagBold' | 'tagGolden' | 'tagMalt'
  | 'tagIron' | 'tagRolling' | 'tagBigRed' | 'tagRoast' | 'tagMineral' | 'tagFrozen' | 'tagPaper' | 'tagLight' | 'tagPhoenix' | 'tagOriental' | 'tagBugBitten'
  | 'tagRaw' | 'tagAging' | 'tagRipe' | 'tagEarth' | 'tagSeven' | 'tagCake' | 'tagTraditional' | 'tagBowl' | 'tagCompact' | 'tagAged'
  | 'tagRoyal' | 'tagBamboo' | 'tagYak' | 'tagSalt' | 'tagEnergy' | 'tagMilk' | 'tagStreet'
  // Time hints
  | 'time30sec' | 'time20to30' | 'time20to40' | 'time30to60' | 'time1min' | 'time1to1h30' | 'time1to2min' | 'time2min' | 'time2to2h30' | 'time2to3min' | 'time3min' | 'time3to4min' | 'time3to5min' | 'time5min' | 'time5to10min';

export interface ITranslationStrategy {
  readonly locale: string;
  readonly displayName: string;
  translate(key: TranslationKey): string;
  translateRaw(key: string): string;
}
