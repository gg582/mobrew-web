import { ValueObject } from './base/ValueObject';

/**
 * 부피 값 객체. 밀리리터를 납부 값으로 사용합니다.
 */
export class Volume extends ValueObject<number> {
  readonly value: number; // milliliters

  private constructor(milliliters: number) {
    super();
    this.value = milliliters;
  }

  static fromMilliliters(ml: number): Volume {
    return new Volume(ml);
  }

  static fromLiters(l: number): Volume {
    return new Volume(l * 1000);
  }

  toMilliliters(): number {
    return this.value;
  }

  toLiters(): number {
    return this.value / 1000;
  }

  formatted(): string {
    return `${this.value.toFixed(0)} ml`;
  }

  subtract(other: Volume): Volume {
    return new Volume(this.value - other.value);
  }
}
