import { ValueObject } from './base/ValueObject';

/**
 * 경과 시간 값 객체. 밀리초를 납부 값으로 사용합니다.
 */
export class ElapsedTime extends ValueObject<number> {
  readonly value: number; // milliseconds

  private constructor(milliseconds: number) {
    super();
    this.value = milliseconds;
  }

  static fromMilliseconds(ms: number): ElapsedTime {
    return new ElapsedTime(ms);
  }

  static fromSeconds(sec: number): ElapsedTime {
    return new ElapsedTime(sec * 1000);
  }

  static fromMinutes(min: number): ElapsedTime {
    return new ElapsedTime(min * 60 * 1000);
  }

  toMilliseconds(): number {
    return this.value;
  }

  toSeconds(): number {
    return this.value / 1000;
  }

  toMinutes(): number {
    return this.value / 1000 / 60;
  }

  toFormattedString(): string {
    const totalSec = Math.floor(this.value / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
}
