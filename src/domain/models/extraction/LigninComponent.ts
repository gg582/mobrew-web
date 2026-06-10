import { ExtractionComponent } from './ExtractionComponent';

/**
 * 리그닌 성분.
 * 구조적 파괴(integrity)에 의해서만 추출됩니다.
 */
export class LigninComponent extends ExtractionComponent {
  readonly name = 'lignin';

  constructor(solubles: number, extracted = 0) {
    super(solubles, extracted);
  }
}
