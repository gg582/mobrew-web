import { ExtractionComponent } from './ExtractionComponent';

/**
 * 아로마 성분.
 * 발산(volatility) 메커니즘이 추가됩니다.
 */
export class AromaComponent extends ExtractionComponent {
  readonly name = 'aroma';
  private _volatilized = 0;

  constructor(solubles: number, extracted = 0, volatilized = 0) {
    super(solubles, extracted);
    this._volatilized = volatilized;
  }

  /** 현재 남아있는 아로마 (추출된 것 중 발산되지 않은 양) */
  get retained(): number {
    return Math.max(0, this._extracted - this._volatilized);
  }

  /** 발산된 양 */
  get volatilized(): number {
    return this._volatilized;
  }

  /** 주어진 양만큼 발산 */
  volatilize(amount: number): void {
    this._volatilized = Math.min(this._extracted, this._volatilized + amount);
  }

  /** 발산량 설정 */
  setVolatilized(amount: number): void {
    this._volatilized = Math.max(0, Math.min(this._extracted, amount));
  }

  /** 아로마 포화 비율 (0~1) */
  get aromaCaptureRatio(): number {
    return this._solubles > 0 ? this.retained / this._solubles : 0;
  }

  override reset(): void {
    super.reset();
    this._volatilized = 0;
  }

  get id(): string {
    return `comp_aroma_v${this._volatilized.toFixed(2)}`;
  }
}
