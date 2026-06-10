import { ExtractionComponent } from './ExtractionComponent';

/**
 * 카테킨 성분.
 */
export class CatechinComponent extends ExtractionComponent {
  readonly name = 'catechin';

  constructor(solubles: number, extracted = 0) {
    super(solubles, extracted);
  }
}
