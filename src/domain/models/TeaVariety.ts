import type { TeaType } from '@/domain/enums';
import type { Tea } from './tea/Tea';

/**
 * 차 품종(茶種) 엔티티.
 * 특정 차의 품종 정보를 캡슐화하며, Tea 객체를 구성으로 포함합니다.
 */
export class TeaVariety {
  constructor(
    readonly id: string,
    readonly nameKey: string,
    private readonly _tea: Tea,
    readonly originKey: string,
    readonly tagKeys: readonly string[],
    readonly defaultTempC: number,
    readonly defaultLeafMassG: number,
    readonly defaultWaterVolumeMl: number,
    readonly defaultInfusions: number,
    readonly brewTimeHintKey: string,
    readonly descriptionKey: string,
  ) {}

  /** 차 종류 식별자 */
  get teaType(): TeaType {
    return this._tea.teaType;
  }

  /** 차 객체 */
  get tea(): Tea {
    return this._tea;
  }

  /** 표시 이름 (번역 키) */
  get displayName(): string {
    return this.nameKey;
  }
}

/**
 * 차 품종 사전 (Singleton).
 */
export class TeaVarietyDictionary {
  private static instance: TeaVarietyDictionary;
  private varieties: Map<TeaType, TeaVariety[]> = new Map();
  private byId: Map<string, TeaVariety> = new Map();

  static getInstance(): TeaVarietyDictionary {
    if (!TeaVarietyDictionary.instance) {
      TeaVarietyDictionary.instance = new TeaVarietyDictionary();
    }
    return TeaVarietyDictionary.instance;
  }

  register(variety: TeaVariety): void {
    if (!this.varieties.has(variety.teaType)) {
      this.varieties.set(variety.teaType, []);
    }
    this.varieties.get(variety.teaType)!.push(variety);
    this.byId.set(variety.id, variety);
  }

  getByType(teaType: TeaType): TeaVariety[] {
    return this.varieties.get(teaType) ?? [];
  }

  getById(id: string): TeaVariety | undefined {
    return this.byId.get(id);
  }

  getAll(): TeaVariety[] {
    return Array.from(this.byId.values());
  }

  hasType(teaType: TeaType): boolean {
    return (this.varieties.get(teaType)?.length ?? 0) > 0;
  }
}

export const teaDictionary = TeaVarietyDictionary.getInstance();
