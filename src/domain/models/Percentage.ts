import { ValueObject } from './base/ValueObject';

/**
 * 백분율 값 객체. 0~100 범위의 퍼센트 값을 표현합니다.
 */
export class Percentage extends ValueObject<number> {
  readonly value: number; // percent 0-100

  private constructor(percent: number) {
    super();
    this.value = percent;
  }

  static fromRatio(ratio: number): Percentage {
    return new Percentage(ratio * 100);
  }

  static fromPercent(pct: number): Percentage {
    return new Percentage(pct);
  }

  toPercent(): number {
    return this.value;
  }

  toRatio(): number {
    return this.value / 100;
  }

  formatted(digits = 1): string {
    return `${this.value.toFixed(digits)}%`;
  }

  isMaxed(): boolean {
    return this.value >= 100;
  }
}
