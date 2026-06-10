import { DomainObject } from '../base/DomainObject';

/**
 * 추출 성분의 추상 기반 클래스.
 * 각 성분은 총 용핼량(solubles)과 현재 추출량(extracted)을 관리합니다.
 */
export abstract class ExtractionComponent extends DomainObject {
  /** 성분의 고유 이름 */
  abstract readonly name: string;

  constructor(
    protected _solubles: number,
    protected _extracted: number = 0,
  ) {
    super();
  }

  /** 총 용핼 가능량 */
  get totalSolubles(): number {
    return this._solubles;
  }

  /** 현재 추출된 양 */
  get currentExtracted(): number {
    return this._extracted;
  }

  /** 남은 추출 가능량 */
  get remaining(): number {
    return Math.max(0, this._solubles - this._extracted);
  }

  /** 포화 비율 (0~1) */
  get saturationRatio(): number {
    return this._solubles > 0 ? this._extracted / this._solubles : 0;
  }

  /** 주어진 양만큼 추출. 총 용핼량을 초과하지 않습니다. */
  extract(amount: number): void {
    this._extracted = Math.min(this._solubles, this._extracted + amount);
  }

  /** 추출량을 직접 설정 */
  setExtracted(amount: number): void {
    this._extracted = Math.max(0, Math.min(this._solubles, amount));
  }

  /** 상태 초기화 */
  reset(): void {
    this._extracted = 0;
  }

  get id(): string {
    return `comp_${this.name}`;
  }

  toString(): string {
    return `${this.name}(${this._extracted.toFixed(2)}/${this._solubles.toFixed(2)})`;
  }
}
