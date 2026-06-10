import { ExtractionComponent } from './ExtractionComponent';

/**
 * 카페인 성분.
 */
export class CaffeineComponent extends ExtractionComponent {
  readonly name = 'caffeine';

  constructor(solubles: number, extracted = 0) {
    super(solubles, extracted);
  }
}
