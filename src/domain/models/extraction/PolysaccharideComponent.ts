import { ExtractionComponent } from './ExtractionComponent';

/**
 * 다당류 성분.
 */
export class PolysaccharideComponent extends ExtractionComponent {
  readonly name = 'polysaccharide';

  constructor(solubles: number, extracted = 0) {
    super(solubles, extracted);
  }
}
