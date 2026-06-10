import { DomainObject } from './base/DomainObject';
import { CatechinComponent } from './extraction/CatechinComponent';
import { AminoAcidComponent } from './extraction/AminoAcidComponent';
import { CaffeineComponent } from './extraction/CaffeineComponent';
import { PectinComponent } from './extraction/PectinComponent';
import { PolysaccharideComponent } from './extraction/PolysaccharideComponent';
import { AromaComponent } from './extraction/AromaComponent';
import { LigninComponent } from './extraction/LigninComponent';
import type { ExtractionComponent } from './extraction/ExtractionComponent';

/**
 * 차 잎(茶葉) 엔티티.
 * 잎의 구조적 상태와 추출 성분들을 캡슐화합니다.
 * TeaState가 이를 구성으로 포함합니다.
 */
export class TeaLeaf extends DomainObject {
  /** 구조적 무결성 (0~1) */
  structuralIntegrity = 1.0;

  /** 수분 흡수 상태 (0~1) */
  hydrationState = 0;

  /** 잎 전개 상태 (0~1) */
  unfurlingState = 0;

  /** 잎 밀도 */
  leafDensity = 0;

  /** 잎 폭 (mm) */
  leafWidth = 0;

  /** 잎 높이 (mm) */
  leafHeight = 0;

  private readonly components: Map<string, ExtractionComponent>;

  constructor() {
    super();
    this.components = new Map<string, ExtractionComponent>([
      ['catechin', new CatechinComponent(0)],
      ['aminoAcid', new AminoAcidComponent(0)],
      ['caffeine', new CaffeineComponent(0)],
      ['pectin', new PectinComponent(0)],
      ['polysaccharide', new PolysaccharideComponent(0)],
      ['aroma', new AromaComponent(0)],
      ['lignin', new LigninComponent(0)],
    ]);
  }

  /** 이름으로 추출 성분을 조회합니다. */
  getComponent(name: string): ExtractionComponent | undefined {
    return this.components.get(name);
  }

  /** 모든 추출 성분을 반환합니다. */
  getAllComponents(): ExtractionComponent[] {
    return Array.from(this.components.values());
  }

  /** 모든 성분의 추출량을 초기화합니다. */
  resetComponents(): void {
    for (const comp of this.components.values()) {
      comp.reset();
    }
  }

  get id(): string {
    return `leaf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
}
