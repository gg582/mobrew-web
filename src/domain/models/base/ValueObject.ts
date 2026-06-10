import { DomainObject } from './DomainObject';

/**
 * 값 객체(Value Object)의 추상 기반 클래스.
 * 값 객체는 불변이며, 동등성은 값(value) 자체로 판단됩니다.
 */
export abstract class ValueObject<T> extends DomainObject {
  /**
   * 값 객체가 감싸는 원시 값.
   */
  abstract readonly value: T;

  /**
   * 값 객체의 식별자는 타입명 + 값으로 자동 생성됩니다.
   */
  get id(): string {
    return `${this.constructor.name}_${String(this.value)}`;
  }

  /**
   * 값 기반 동등성 비교.
   */
  equals(other: unknown): boolean {
    if (!(other instanceof ValueObject)) return false;
    return this.value === (other as ValueObject<unknown>).value;
  }

  /**
   * 값 기반 해시코드.
   */
  hashCode(): number {
    const str = String(this.value);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return hash;
  }

  toString(): string {
    return `${this.constructor.name}(${this.value})`;
  }
}
