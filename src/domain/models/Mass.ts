import { ValueObject } from './base/ValueObject';
import type { Volume } from './Volume';

/**
 * 질량 값 객체. 그램을 납부 값으로 사용합니다.
 */
export class Mass extends ValueObject<number> {
  readonly value: number; // grams

  private constructor(grams: number) {
    super();
    this.value = grams;
  }

  static fromGrams(g: number): Mass {
    return new Mass(g);
  }

  toGrams(): number {
    return this.value;
  }

  formatted(): string {
    return `${this.value.toFixed(1)} g`;
  }

  ratioTo(volume: Volume): number {
    return volume.toMilliliters() / this.value;
  }
}
