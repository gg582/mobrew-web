import { TeaType } from '../enums';
import type { Tea } from '../models/tea/Tea';
import { GreenTea } from '../models/tea/GreenTea';
import { GyokuroTea } from '../models/tea/GyokuroTea';
import { SenchaTea } from '../models/tea/SenchaTea';
import { FukamushiTea } from '../models/tea/FukamushiTea';
import { BlackTea } from '../models/tea/BlackTea';
import { OolongTea } from '../models/tea/OolongTea';
import { WhiteTea } from '../models/tea/WhiteTea';
import { YellowTea } from '../models/tea/YellowTea';
import { PuerhTea } from '../models/tea/PuerhTea';
import { TibetanTea } from '../models/tea/TibetanTea';

/**
 * Tea 객체 팩토리.
 * TeaType enum을 받아 해당하는 Tea 인스턴스를 생성합니다.
 */
export class TeaFactory {
  private static readonly cache = new Map<TeaType, Tea>();

  static create(teaType: TeaType): Tea {
    const cached = this.cache.get(teaType);
    if (cached) return cached;

    const tea = this.instantiate(teaType);
    this.cache.set(teaType, tea);
    return tea;
  }

  private static instantiate(teaType: TeaType): Tea {
    switch (teaType) {
      case TeaType.GreenNormal:
        return new GreenTea();
      case TeaType.GreenGyokuro:
        return new GyokuroTea();
      case TeaType.GreenSencha:
        return new SenchaTea();
      case TeaType.GreenFukamushi:
        return new FukamushiTea();
      case TeaType.Black:
        return new BlackTea();
      case TeaType.Oolong:
        return new OolongTea();
      case TeaType.White:
        return new WhiteTea();
      case TeaType.Yellow:
        return new YellowTea();
      case TeaType.Puerh:
        return new PuerhTea();
      case TeaType.Tibetan:
        return new TibetanTea();
      default:
        throw new Error(`Unknown tea type: ${teaType}`);
    }
  }
}
