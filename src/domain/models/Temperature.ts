import { ValueObject } from './base/ValueObject';

/**
 * 온도 값 객체. 섭씨를 납부 값으로 사용하며 화씨/켈빈 변환을 제공합니다.
 */
export class Temperature extends ValueObject<number> {
  readonly value: number; // celsius

  private constructor(celsius: number) {
    super();
    this.value = celsius;
  }

  static fromCelsius(c: number): Temperature {
    return new Temperature(c);
  }

  static fromFahrenheit(f: number): Temperature {
    return new Temperature((f - 32) * 5 / 9);
  }

  toCelsius(): number {
    return this.value;
  }

  toFahrenheit(): number {
    return this.value * 9 / 5 + 32;
  }

  toKelvin(): number {
    return this.value + 273.15;
  }

  formatted(useFahrenheit = false): string {
    const val = useFahrenheit ? this.toFahrenheit() : this.value;
    return `${val.toFixed(1)}°${useFahrenheit ? 'F' : 'C'}`;
  }

  isAbove(other: Temperature): boolean {
    return this.value > other.value;
  }

  isBelow(other: Temperature): boolean {
    return this.value < other.value;
  }

  clamp(min: Temperature, max: Temperature): Temperature {
    const v = Math.max(min.value, Math.min(max.value, this.value));
    return new Temperature(v);
  }
}
