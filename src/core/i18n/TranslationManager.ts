import { type ITranslationStrategy, type TranslationKey } from './ITranslationStrategy';
import { EnTranslationStrategy } from './strategies/EnTranslationStrategy';
import { KoTranslationStrategy } from './strategies/KoTranslationStrategy';
import { ZhTranslationStrategy } from './strategies/ZhTranslationStrategy';
import { JpTranslationStrategy } from './strategies/JpTranslationStrategy';
import { TeaType, VesselType, BrewingRegion, BoilMethod } from '@/domain/enums';

export class TranslationManager {
  private static instance: TranslationManager;
  private strategies: Map<string, ITranslationStrategy> = new Map();
  private current: ITranslationStrategy;
  private listeners: Set<() => void> = new Set();

  private constructor() {
    const en = new EnTranslationStrategy();
    const ko = new KoTranslationStrategy();
    const zh = new ZhTranslationStrategy();
    const jp = new JpTranslationStrategy();
    this.strategies.set(en.locale, en);
    this.strategies.set(ko.locale, ko);
    this.strategies.set(zh.locale, zh);
    this.strategies.set(jp.locale, jp);

    const saved = this.detectBrowserLocale();
    this.current = this.strategies.get(saved) ?? en;
  }

  static getInstance(): TranslationManager {
    if (!TranslationManager.instance) {
      TranslationManager.instance = new TranslationManager();
    }
    return TranslationManager.instance;
  }

  t(key: TranslationKey | string): string {
    return this.current.translate(key);
  }

  tRaw(key: string): string {
    return this.current.translateRaw(key);
  }

  setLocale(locale: string): void {
    const strategy = this.strategies.get(locale);
    if (strategy && strategy.locale !== this.current.locale) {
      this.current = strategy;
      this.notify();
    }
  }

  getLocale(): string {
    return this.current.locale;
  }

  getDisplayName(): string {
    return this.current.displayName;
  }

  getAvailableLocales(): Array<{ locale: string; displayName: string }> {
    return Array.from(this.strategies.values()).map((s) => ({
      locale: s.locale,
      displayName: s.displayName,
    }));
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  teaType(type: TeaType): TranslationKey {
    const map: Record<TeaType, TranslationKey> = {
      [TeaType.GreenNormal]: 'teaGreenNormal',
      [TeaType.White]: 'teaWhite',
      [TeaType.Black]: 'teaBlack',
      [TeaType.Oolong]: 'teaOolong',
      [TeaType.Yellow]: 'teaYellow',
      [TeaType.Puerh]: 'teaPuerh',
      [TeaType.GreenGyokuro]: 'teaGreenGyokuro',
      [TeaType.GreenSencha]: 'teaGreenSencha',
      [TeaType.GreenFukamushi]: 'teaGreenFukamushi',
      [TeaType.Tibetan]: 'teaTibetan',
    };
    return map[type];
  }

  vessel(type: VesselType): TranslationKey {
    const map: Record<VesselType, TranslationKey> = {
      [VesselType.BritishTeapot]: 'vesselBritishTeapot',
      [VesselType.Zisha]: 'vesselZisha',
      [VesselType.WhitePorcelain]: 'vesselWhitePorcelain',
      [VesselType.Celadon]: 'vesselCeladon',
      [VesselType.JapaneseCeramics]: 'vesselJapaneseCeramics',
      [VesselType.Glass]: 'vesselGlass',
      [VesselType.GaiwanWhitePorcelain]: 'vesselGaiwanWhitePorcelain',
      [VesselType.GaiwanCeladon]: 'vesselGaiwanCeladon',
    };
    return map[type];
  }

  region(region: BrewingRegion): TranslationKey {
    const map: Record<BrewingRegion, TranslationKey> = {
      [BrewingRegion.EastAsia]: 'regionEastAsia',
      [BrewingRegion.British]: 'regionBritish',
      [BrewingRegion.SoutheastAsia]: 'regionSoutheastAsia',
      [BrewingRegion.Tibetan]: 'regionTibetan',
      [BrewingRegion.WesternModern]: 'regionWesternModern',
    };
    return map[region];
  }

  regionDesc(region: BrewingRegion): TranslationKey {
    const map: Record<BrewingRegion, TranslationKey> = {
      [BrewingRegion.EastAsia]: 'regionDescEastAsia',
      [BrewingRegion.British]: 'regionDescBritish',
      [BrewingRegion.SoutheastAsia]: 'regionDescSoutheastAsia',
      [BrewingRegion.Tibetan]: 'regionDescTibetan',
      [BrewingRegion.WesternModern]: 'regionDescWesternModern',
    };
    return map[region];
  }

  boilMethod(method: BoilMethod): TranslationKey {
    const map: Record<BoilMethod, TranslationKey> = {
      [BoilMethod.Electric]: 'boilElectric',
      [BoilMethod.PotIron]: 'boilPotIron',
      [BoilMethod.PotBronze]: 'boilPotBronze',
      [BoilMethod.PotClay]: 'boilPotClay',
    };
    return map[method];
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  private detectBrowserLocale(): string {
    const nav = typeof navigator !== 'undefined' ? navigator.language : 'en';
    if (nav.startsWith('ko')) return 'ko';
    if (nav.startsWith('zh')) return 'zh';
    if (nav.startsWith('ja') || nav.startsWith('jp')) return 'jp';
    return 'en';
  }
}

export const i18n = TranslationManager.getInstance();
