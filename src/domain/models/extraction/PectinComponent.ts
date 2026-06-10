import { ExtractionComponent } from './ExtractionComponent';

/**
 * 펙틴 성분.
 */
export class PectinComponent extends ExtractionComponent {
  readonly name = 'pectin';

  constructor(solubles: number, extracted = 0) {
    super(solubles, extracted);
  }
}
