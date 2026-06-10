/**
 * 모든 도메인 객체의 추상 기반 클래스.
 * 동등성(equality)과 식별성(identity)을 제공합니다.
 */
export abstract class DomainObject {
  /**
   * 객체의 고유 식별자.
   * 동일한 도메인 개념 내에서는 동일한 id를 가진 객체는 동등합니다.
   */
  abstract get id(): string;

  /**
   * 동등성 비교. id 기반.
   */
  equals(other: unknown): boolean {
    if (!(other instanceof DomainObject)) return false;
    return this.id === other.id;
  }

  /**
   * 해시코드. id 기반.
   */
  hashCode(): number {
    let hash = 0;
    for (let i = 0; i < this.id.length; i++) {
      const char = this.id.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // 32-bit signed integer
    }
    return hash;
  }

  /**
   * 문자열 표현.
   */
  toString(): string {
    return `${this.constructor.name}(${this.id})`;
  }
}
