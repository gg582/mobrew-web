/**
 * 시뮬레이션 스텝 간에 공유되는 컨텍스트.
 * PhysicsEngine이 계산하여 각 모델에 전달합니다.
 * 모델들이 추가 필드를 기록할 수 있도록 optional 필드가 포함됩니다.
 */
export interface SimulationContext {
  /** 현재 사이클 경과 시간 (ms) */
  elapsedMs: number;

  /** 활성 끓임 상태 여부 */
  isActiveBoiling: boolean;

  /** 현재 기압에서의 끓는점 */
  boilingPoint: number;

  /** 잎 전개에 따른 표면적 계수 */
  surfaceFactor: number;

  /** 수분 흡수에 따른 추출 계수 */
  hydrationFactor: number;

  /** 초기 지연 페널티 */
  lagPenalty: number;

  /** 난류 계수 */
  turbulenceFactor: number;

  /** 다구별 추출 계수 */
  vesselExtractionFactor: number;

  // --- Computed by ComponentExtractionModel ---
  deCatechin?: number;
  deAminoAcid?: number;
  deCaffeine?: number;
  dePectin?: number;
  dePolysaccharide?: number;
  deLignin?: number;
  deAroma?: number;

  // --- Computed by AromaDynamicsModel ---
  aromaVolLoss?: number;
  aromaRetained?: number;
  aromaBalanceCut?: boolean;
  aromaBalanceQuality?: number;
  aromaFloorMet?: boolean;
}
