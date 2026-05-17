# Cookie Deal — GTM Intelligence Console

> 쿠키딜 GTM 인텔리전스 콘솔 — 다출처 분산 기업 정보를 단일 모델로 통합하는 **ETL 파이프라인** + 중소기업 M&A 매칭 **BI 대시보드** 프로토타입.

「2026 신용보증기금 × ICT콤플렉스 채용 연계형 기업 실무 프로젝트」 1지망 **① 프렉탈테크놀로지(쿠키딜)** — *GTM ETL 인텔리전스 데이터 파이프라인 구축 + 데이터 대시보드 제작* 과제에 첨부하는 라이브 데모입니다.

- 작성자: **박용환** ([@yonghwan1106](https://github.com/yonghwan1106))
- 라이브: https://cookiedeal-gtm-console.vercel.app *(배포 후)*
- 22개월 누적 86건 수상 / Vercel 라이브 데모 7건 별도 보유

## 페이지 (6)

| # | 경로 | 설명 |
|---|---|---|
| 1 | `/` | **Overview Dashboard** — KPI 6개 + GTM 퍼널 + 12개월 시계열 + 지역/업종 분포 + 실시간 활동 피드 |
| 2 | `/deals` | **매물 익스플로러** — 50건 mock 매물, 업종/지역/매출/매칭점수 필터, 테이블 ↔ 카드 토글 |
| 3 | `/deals/[id]` | **매물 상세** — 재무 3년 차트, AI 매칭 TOP 5 바이어 + XAI 사유, 데이터 출처 카드, 유사 매물 |
| 4 | `/matches` | **AI 매칭 매트릭스** — 셀러×바이어 heatmap, 점수 분포 히스토그램, 가중치 슬라이더 (실시간 재계산) |
| 5 | `/pipeline` | **ETL 모니터링** — 8개 소스 상태판, 7일 처리량, 알림 패널, 실행 로그 50건 |
| 6 | `/sources` | **데이터 카탈로그** — 8개 소스 스키마·SLA·신뢰도·샘플 row, ERD, 가상 API 미리보기 |

## 기술 스택

- **Next.js 16.2** (App Router · **Turbopack** · React 19.2 · async `params`)
- TypeScript 5 strict
- **Tailwind CSS 4** (CSS-first config) + 자체 디자인 토큰 (Bloomberg 톤 다크)
- **Recharts** (Area · Line · Bar · custom Heatmap)
- lucide-react · next-themes · nuqs · date-fns · clsx · tailwind-merge
- 폰트: **Pretendard Variable** + JetBrains Mono (수치 정렬용)

## Mock Data (시드 기반, 재현 가능)

- `companies.ts` — **50** 매물 (한국 중소기업 가명, 업종 8종, 지역 8종)
- `buyers.ts` — **30** 바이어 (PE · 전략적 SI · 패밀리오피스 · 해외 SI · VC)
- `matches.ts` — **1,500** 매칭 (50×30 매트릭스, 상위 200건 캐시)
- `etl-runs.ts` — **~1,300** ETL 실행 로그 (7일 × 8소스)
- `sources.ts` — **8** 데이터 소스 (DART · NTS · KODIT · KIS · NICE · KOSIS · NEWS · KB-RE)
- `activity.ts` — **50** 활동 피드 이벤트
- `_seed.ts` — mulberry32 PRNG로 시드 고정

## 실행

```bash
npm install
npm run dev        # http://localhost:3000 (Turbopack)
npm run build      # Production build
npm run start      # 프로덕션 서버
```

## 디렉터리

```
src/
├─ app/               # 6개 페이지 (App Router)
├─ components/
│  ├─ layout/         # sidebar, top-bar
│  ├─ kpi/            # kpi-card, sparkline
│  ├─ charts/         # funnel-stages, time-series, bar-distribution
│  ├─ deals/          # deals-explorer, stage-badge
│  ├─ matches/        # matches-explorer
│  ├─ activity/       # activity-feed
│  └─ ui/             # card, badge primitives
├─ data/              # mock data (시드 기반 재현 가능)
├─ lib/               # utils, format, seed, matching
└─ types/             # 도메인 타입
```

## 라이선스 / 사용 안내

본 저장소는 프렉탈테크놀로지(쿠키딜) 채용 응모용 비공식 데모입니다.
실제 쿠키딜·프렉탈테크놀로지 서비스와 무관하며, 모든 회사명·매칭 결과는 **mock data** 입니다.

---

박용환 · heisenbug0306@gmail.com · 010-7939-3123
크리에이티브 넥서스 · 한양대학교 공학대학원 프로젝트 관리 전공
