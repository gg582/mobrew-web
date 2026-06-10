# mobrew-web

모브루 CLI의 물리 시뮬레이션 엔진을 현대 웹 UI + Glassmorphism으로 재구성한 TypeScript 웹 애플리케이션입니다.

## Architecture

### Design Patterns
- **Facade Pattern**: `BrewFacade`가 PhysicsEngine, TeaState, PersistenceManager 등 모든 하위 시스템을 숨기고 단일 진입점을 제공합니다.
- **Data-Oriented Design (DoD)**: 설정 데이터(tea profiles, vessel props, constants, presets)는 순수 데이터 테이블로 분리되어 있으며, 시스템은 이 데이터 위에서 동작합니다.
- **OOP**: TeaState, PhysicsEngine, PersistenceManager 등 핵심 도메인을 클래스로 모델링했습니다.

### Tech Stack
- **React 19 + Vite + TypeScript**
- **Tailwind CSS 3** + Glassmorphism CSS utilities
- **Framer Motion** — animations & transitions
- **Zustand** — lightweight state management
- **Lucide React** — icons
- **clsx + tailwind-merge** — className utilities

## Features

### Easy Mode (원클릭)
- **5개 Region Preset**: East Asia, British Isles, Southeast Asia, Himalayan/Tibetan, Western/Modern
- 각 리전은 기본 다기, 온도, 찻잎 양, 물 양, TDS, 고도, 다회 우림 수를 자동 설정합니다.
- 차 종류만 선택하면 시뮬레이션이 즉시 시작됩니다.

### Expert Mode
- 차 종류, 다기, 온도, 찻잎 무게, 물 용량, 다회 우림 수, TDS, 고도, 잎 크기, 가열 방식 등 모든 파라미터를 직접 조정할 수 있습니다.

### Simulation Dashboard
- **실시간 물리 시뮬레이션**: 온도 감쇠, 수분 흡수, 잎 펼쳐짐, 성분 추출, 아로마 휘발, 투명도 지수 등을 실시간으로 계산합니다.
- **Leaf Visualizer**: 잎의 펼쳐짐 정도를 4단계 SVG 애니메이션으로 시각화합니다.
- **Leaching Box**: 추출 속도에 따라 움직이는 입자 시뮬레이션을 제공합니다.
- **Tea Distributor**: 남은 인퓨전들의 추출 목표치를 동적으로 재조정합니다.
- **다회 우림 지원**: 한 세션 내에서 여러 번 우림할 수 있으며, 각 인퓨전의 온도/용량을 개별 설정할 수 있습니다.
- **localStorage Persistence**: 세션 종료 시 온도를 저장하여 다음 세션에서 복원할 수 있습니다 (`.mobrew_state` 웹 버전).

## Physics Model

원본 `mobrew-cli`의 모든 핵심 물리 모델을 그대로 이식했습니다:

- **Leaf Hydration Model**: `dH/dt = k_hyd * (1 - H) * exp((T-100)/15) / ρ`
- **Thermodynamic Cooling**: `dT/dt = -k_cool * T`
- **Arrhenius-based Extraction Kinetics**: 각 성분(카테킨, 아미노산, 카페인, 펙틴, 다당류, 아로마)별 독립적인 추출 속도
- **Aroma-Priority Stop Window**: 아로마 추출률 vs 휘발률, 아미노 축, 투명도 상한을 종합적으로 판단하여 최적 종료 시점을 결정합니다.
- **Decoction Model**: 끓임 모드에서 점도 지수(Viscosity Index)로 종료를 판단합니다.
- **Tea Distributor Algorithm**: 남은 가용 성분 농도, 잎 기하학, drag ratio를 고려하여 인퓨전 간 추출 목표를 재분배합니다.

## Build & Run

```bash
cd mobrew-web
npm install
npm run dev
```

빌드:

```bash
npm run build
```

## Project Structure

```
src/
├── domain/           # Types & Enums
├── data/             # DoD configuration tables (constants, presets, profiles, vesselData)
├── engine/           # Physics engine, TeaState, PersistenceManager
├── facades/          # BrewFacade (Facade pattern)
├── stores/           # Zustand store
├── components/       # React UI components
│   ├── ui/           # GlassCard
│   ├── BrewDashboard.tsx
│   ├── EasyModePanel.tsx
│   ├── ExpertModePanel.tsx
│   ├── LeafVisualizer.tsx
│   └── LeachingBox.tsx
├── lib/              # utils (cn, formatTime, formatNumber)
├── App.tsx
└── main.tsx
```
