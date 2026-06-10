import { ExtractionComponent } from './ExtractionComponent';

/**
 * 아미노산 성분.
 */
export class AminoAcidComponent extends ExtractionComponent {
  readonly name = 'aminoAcid';

  constructor(solubles: number, extracted = 0) {
    super(solubles, extracted);
  }
}
