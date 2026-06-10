import { BrewingRegion, TeaType } from '@/domain/enums';

export class RecommendationResult {
  constructor(
    readonly teaType: TeaType,
    readonly region: BrewingRegion,
    readonly name: string,
    readonly reasonKey: string,
    readonly tags: readonly string[],
    readonly brewTimeHint: string,
    readonly tempHint: string,
  ) {}

  get displayName(): string {
    return this.name;
  }
}

export class RecommendationResultBuilder {
  private teaType: TeaType = TeaType.GreenNormal;
  private region: BrewingRegion = BrewingRegion.WesternModern;
  private name = '';
  private reasonKey = '';
  private tags: string[] = [];
  private brewTimeHint = '';
  private tempHint = '';

  setTeaType(type: TeaType): this {
    this.teaType = type;
    return this;
  }

  setRegion(region: BrewingRegion): this {
    this.region = region;
    return this;
  }

  setName(name: string): this {
    this.name = name;
    return this;
  }

  setReasonKey(key: string): this {
    this.reasonKey = key;
    return this;
  }

  setTags(tags: string[]): this {
    this.tags = [...tags];
    return this;
  }

  setBrewTimeHint(hint: string): this {
    this.brewTimeHint = hint;
    return this;
  }

  setTempHint(hint: string): this {
    this.tempHint = hint;
    return this;
  }

  build(): RecommendationResult {
    return new RecommendationResult(
      this.teaType,
      this.region,
      this.name,
      this.reasonKey,
      this.tags,
      this.brewTimeHint,
      this.tempHint,
    );
  }
}
