import { TeaType } from '@/domain/enums';
import { TeaFactory } from '@/domain/factories/TeaFactory';
import { TeaVariety, teaDictionary } from '@/domain/models/TeaVariety';

function reg(v: TeaVariety): void {
  teaDictionary.register(v);
}

// ═══════════════════════════════════════════════════════════
// Green (Normal)
// ═══════════════════════════════════════════════════════════
reg(new TeaVariety('longjing', 'varLongjing', TeaFactory.create(TeaType.GreenNormal), 'originChinaZhejiang',
  ['tagFamous', 'tagFlat', 'tagNutty'], 80, 3, 150, 3, 'time2to3min', 'descLongjing'));
reg(new TeaVariety('biluochun', 'varBiluochun', TeaFactory.create(TeaType.GreenNormal), 'originChinaJiangsu',
  ['tagFamous', 'tagSpiral', 'tagFruity'], 75, 3, 150, 3, 'time2to3min', 'descBiluochun'));
reg(new TeaVariety('huangshanmaofeng', 'varHuangshanMaofeng', TeaFactory.create(TeaType.GreenNormal), 'originChinaAnhui',
  ['tagMountain', 'tagFloral', 'tagOrchid'], 80, 3, 150, 3, 'time2to3min', 'descHuangshanMaofeng'));
reg(new TeaVariety('xinyangmaojian', 'varXinyangMaojian', TeaFactory.create(TeaType.GreenNormal), 'originChinaHenan',
  ['tagFuzzy', 'tagRobust', 'tagChestnut'], 80, 3, 150, 3, 'time2to3min', 'descXinyangMaojian'));
reg(new TeaVariety('taipinghoukui', 'varTaipingHoukui', TeaFactory.create(TeaType.GreenNormal), 'originChinaAnhui',
  ['tagLargeLeaf', 'tagOrchid', 'tagRare'], 85, 4, 200, 3, 'time2to3min', 'descTaipingHoukui'));

// ═══════════════════════════════════════════════════════════
// Green Sencha
// ═══════════════════════════════════════════════════════════
reg(new TeaVariety('sencha', 'varSencha', TeaFactory.create(TeaType.GreenSencha), 'originJapan',
  ['tagStandard', 'tagGrassy', 'tagRefreshing'], 70, 5, 120, 3, 'time1to1h30', 'descSencha'));
reg(new TeaVariety('fukamushi', 'varFukamushiSencha', TeaFactory.create(TeaType.GreenSencha), 'originJapan',
  ['tagDeepSteam', 'tagRich', 'tagSmooth'], 70, 5, 120, 3, 'time1min', 'descFukamushiSencha'));
reg(new TeaVariety('bancha', 'varBancha', TeaFactory.create(TeaType.GreenSencha), 'originJapan',
  ['tagEveryday', 'tagMild', 'tagLowCaffeine'], 90, 6, 200, 2, 'time30sec', 'descBancha'));
reg(new TeaVariety('kabusecha', 'varKabusecha', TeaFactory.create(TeaType.GreenSencha), 'originJapan',
  ['tagShaded', 'tagSweet', 'tagUmami'], 70, 5, 120, 3, 'time1to1h30', 'descKabusecha'));
reg(new TeaVariety('kukicha', 'varKukicha', TeaFactory.create(TeaType.GreenSencha), 'originJapan',
  ['tagStem', 'tagMild', 'tagCreamy'], 80, 6, 200, 2, 'time1min', 'descKukicha'));

// ═══════════════════════════════════════════════════════════
// Gyokuro
// ═══════════════════════════════════════════════════════════
reg(new TeaVariety('gyokuro', 'varGyokuro', TeaFactory.create(TeaType.GreenGyokuro), 'originJapan',
  ['tagPremium', 'tagShaded', 'tagUmami'], 50, 6, 80, 5, 'time2to2h30', 'descGyokuro'));
reg(new TeaVariety('tenju', 'varTenju', TeaFactory.create(TeaType.GreenGyokuro), 'originJapan',
  ['tagRare', 'tagHeaven', 'tagSweet'], 50, 6, 80, 5, 'time2min', 'descTenju'));
reg(new TeaVariety('aoyama', 'varAoyama', TeaFactory.create(TeaType.GreenGyokuro), 'originJapan',
  ['tagMountain', 'tagFresh', 'tagDeep'], 55, 6, 80, 5, 'time2min', 'descAoyama'));

// ═══════════════════════════════════════════════════════════
// White
// ═══════════════════════════════════════════════════════════
reg(new TeaVariety('baihaoyinzhen', 'varBaihaoYinzhen', TeaFactory.create(TeaType.White), 'originChinaFujian',
  ['tagSilver', 'tagDelicate', 'tagHoney'], 80, 3, 150, 3, 'time3to5min', 'descBaihaoYinzhen'));
reg(new TeaVariety('baimudan', 'varBaimudan', TeaFactory.create(TeaType.White), 'originChinaFujian',
  ['tagWhitePeony', 'tagMellow', 'tagFruity'], 85, 4, 200, 3, 'time3to5min', 'descBaimudan'));
reg(new TeaVariety('shoumei', 'varShoumei', TeaFactory.create(TeaType.White), 'originChinaFujian',
  ['tagLongevity', 'tagMild', 'tagPlum'], 90, 5, 200, 2, 'time3to5min', 'descShoumei'));
reg(new TeaVariety('gongmei', 'varGongmei', TeaFactory.create(TeaType.White), 'originChinaFujian',
  ['tagTribute', 'tagSmooth', 'tagDriedFruit'], 90, 5, 200, 2, 'time3to5min', 'descGongmei'));

// ═══════════════════════════════════════════════════════════
// Black
// ═══════════════════════════════════════════════════════════
reg(new TeaVariety('assam', 'varAssam', TeaFactory.create(TeaType.Black), 'originIndiaAssam',
  ['tagMalty', 'tagStrong', 'tagBreakfast'], 95, 3, 240, 1, 'time3to4min', 'descAssam'));
reg(new TeaVariety('keemun', 'varKeemun', TeaFactory.create(TeaType.Black), 'originChinaAnhui',
  ['tagWine', 'tagOrchid', 'tagFruity'], 90, 3, 200, 1, 'time3to4min', 'descKeemun'));
reg(new TeaVariety('darjeeling', 'varDarjeeling', TeaFactory.create(TeaType.Black), 'originIndiaDarjeeling',
  ['tagChampagne', 'tagMuscatel', 'tagSeasonal'], 90, 3, 200, 1, 'time3min', 'descDarjeeling'));
reg(new TeaVariety('ceylon', 'varCeylon', TeaFactory.create(TeaType.Black), 'originSriLanka',
  ['tagCitrus', 'tagCrisp', 'tagBright'], 95, 3, 200, 1, 'time3to4min', 'descCeylon'));
reg(new TeaVariety('lapsangsouchong', 'varLapsangSouchong', TeaFactory.create(TeaType.Black), 'originChinaFujian',
  ['tagSmoky', 'tagPine', 'tagBold'], 95, 4, 200, 1, 'time3to5min', 'descLapsangSouchong'));
reg(new TeaVariety('dianhong', 'varDianhong', TeaFactory.create(TeaType.Black), 'originChinaYunnan',
  ['tagGolden', 'tagMalt', 'tagSweet'], 90, 3, 200, 1, 'time3to4min', 'descDianhong'));

// ═══════════════════════════════════════════════════════════
// Oolong
// ═══════════════════════════════════════════════════════════
reg(new TeaVariety('tieguanyin', 'varTieguanyin', TeaFactory.create(TeaType.Oolong), 'originChinaFujian',
  ['tagIron', 'tagOrchid', 'tagRolling'], 95, 7, 100, 7, 'time30to60', 'descTieguanyin'));
reg(new TeaVariety('dahongpao', 'varDahongpao', TeaFactory.create(TeaType.Oolong), 'originChinaFujian',
  ['tagBigRed', 'tagRoast', 'tagMineral'], 98, 8, 120, 7, 'time20to40', 'descDahongpao'));
reg(new TeaVariety('dongding', 'varDongding', TeaFactory.create(TeaType.Oolong), 'originTaiwan',
  ['tagFrozen', 'tagRoast', 'tagCreamy'], 90, 7, 100, 6, 'time30to60', 'descDongding'));
reg(new TeaVariety('wenshanbaozhong', 'varWenshanBaozhong', TeaFactory.create(TeaType.Oolong), 'originTaiwan',
  ['tagPaper', 'tagFloral', 'tagLight'], 85, 6, 120, 5, 'time1min', 'descWenshanBaozhong'));
reg(new TeaVariety('fenghuangdancong', 'varFenghuangDancong', TeaFactory.create(TeaType.Oolong), 'originChinaGuangdong',
  ['tagPhoenix', 'tagHoney', 'tagFruity'], 95, 7, 100, 7, 'time20to40', 'descFenghuangDancong'));
reg(new TeaVariety('dongfangmeiren', 'varDongfangMeiren', TeaFactory.create(TeaType.Oolong), 'originTaiwan',
  ['tagOriental', 'tagHoney', 'tagBugBitten'], 85, 5, 120, 5, 'time1to2min', 'descDongfangMeiren'));

// ═══════════════════════════════════════════════════════════
// Pu-erh
// ═══════════════════════════════════════════════════════════
reg(new TeaVariety('shengpuerh', 'varShengPuerh', TeaFactory.create(TeaType.Puerh), 'originChinaYunnan',
  ['tagRaw', 'tagAging', 'tagFloral'], 95, 7, 100, 10, 'time20to40', 'descShengPuerh'));
reg(new TeaVariety('shupuerh', 'varShuPuerh', TeaFactory.create(TeaType.Puerh), 'originChinaYunnan',
  ['tagRipe', 'tagEarth', 'tagSmooth'], 100, 8, 120, 8, 'time20to30', 'descShuPuerh'));
reg(new TeaVariety('qizibing', 'varQizibing', TeaFactory.create(TeaType.Puerh), 'originChinaYunnan',
  ['tagSeven', 'tagCake', 'tagTraditional'], 95, 7, 100, 10, 'time20to40', 'descQizibing'));
reg(new TeaVariety('tuocha', 'varTuocha', TeaFactory.create(TeaType.Puerh), 'originChinaYunnan',
  ['tagBowl', 'tagCompact', 'tagAged'], 100, 6, 150, 8, 'time30to60', 'descTuocha'));

// ═══════════════════════════════════════════════════════════
// Yellow
// ═══════════════════════════════════════════════════════════
reg(new TeaVariety('junshanyinzhen', 'varJunshanYinzhen', TeaFactory.create(TeaType.Yellow), 'originChinaHunan',
  ['tagSilver', 'tagRare', 'tagRoyal'], 80, 3, 150, 3, 'time2to3min', 'descJunshanYinzhen'));
reg(new TeaVariety('huoshanhuangya', 'varHuoshanHuangya', TeaFactory.create(TeaType.Yellow), 'originChinaAnhui',
  ['tagMountain', 'tagMellow', 'tagSweet'], 80, 3, 150, 3, 'time2to3min', 'descHuoshanHuangya'));
reg(new TeaVariety('mengdinghuangya', 'varMengdingHuangya', TeaFactory.create(TeaType.Yellow), 'originChinaSichuan',
  ['tagAncient', 'tagSmooth', 'tagBamboo'], 80, 3, 150, 3, 'time2to3min', 'descMengdingHuangya'));

// ═══════════════════════════════════════════════════════════
// Tibetan
// ═══════════════════════════════════════════════════════════
reg(new TeaVariety('buttertea', 'varButterTea', TeaFactory.create(TeaType.Tibetan), 'originTibet',
  ['tagYak', 'tagSalt', 'tagEnergy'], 100, 10, 300, 3, 'time5to10min', 'descButterTea'));
reg(new TeaVariety('sweettea', 'varSweetTea', TeaFactory.create(TeaType.Tibetan), 'originTibet',
  ['tagMilk', 'tagSweet', 'tagStreet'], 100, 8, 250, 2, 'time5min', 'descSweetTea'));
