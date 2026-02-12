# Phase 0 — 프로젝트 셋업 (폰트, 테마, shadcn, Jest)

> **날짜**: 2026-02-11
> **Phase**: Phase 0 — 프로젝트 셋업
> **관련 체크리스트**: 폰트, Tailwind 테마, 다크모드, shadcn/ui, Jest, 환경변수

---

## 요약

Plus Jakarta Sans + Material Icons Round 폰트 설정, Tailwind 4.1 커스텀 테마(DESIGN.md 기반), shadcn/ui 4개 컴포넌트 설치, Jest + RTL 테스트 환경, .env.local 템플릿을 구성했다.

## 접근 방식

### 선택한 방법
- **폰트**: `next/font/google`로 Plus Jakarta Sans 로드 (variable font). Material Icons Round는 `<link>` 태그로 로드 (next/font에서 icon font 미지원).
- **테마**: shadcn/ui의 CSS 변수 시스템(`:root`, `.dark`)을 TasteRank 색상으로 커스터마이즈. 추가 커스텀 토큰은 `@theme inline` 블록에 별도 정의.
- **다크모드**: `@custom-variant dark (&:is(.dark *))` — class 기반 전략 (shadcn 기본값).
- **Jest**: `.mjs` 설정 파일로 ts-node 의존성 회피. `ts-jest`로 TS/TSX 변환.

### 고려한 대안
- **Material Icons를 next/font로**: 불가 — Google Fonts icon font는 next/font 미지원
- **Jest config를 .ts로**: ts-node 추가 설치 필요 — .mjs로 회피

## 트레이드오프

| 항목 | 장점 | 단점 |
|------|------|------|
| shadcn CSS 변수 유지 | shadcn 컴포넌트 호환성 | globals.css가 다소 길어짐 |
| `--color-primary: var(--primary)` 패턴 | light/dark 모드 자동 전환 | 직접 hex 접근 시 `--color-primary-light` 등 별도 토큰 필요 |
| Material Icons `<link>` 로드 | 간단, 안정적 | FOUT 가능성 (swap 미지원) |

## 주요 파일 변경

- `src/app/layout.tsx` — Plus Jakarta Sans, Material Icons, 메타데이터, viewport
- `src/app/globals.css` — 전체 테마 시스템 (shadcn 변수 + 커스텀 토큰 + 다크모드)
- `jest.config.mjs` — Jest 설정 (ts-jest, path alias, CSS mock)
- `jest.setup.ts` — @testing-library/jest-dom 설정
- `package.json` — test 스크립트 추가, 의존성 추가
- `.env.example` — 환경변수 템플릿 (커밋용)
- `src/components/ui/` — shadcn dialog, sheet, slider, form, button, label

## 테스트

- [x] `src/lib/utils.test.ts` — cn 유틸리티 테스트 (3개 통과)
- 커버리지 영향: 기초 설정 단계, 의미 있는 커버리지 아직 없음

## 후속 작업

- [ ] ESLint + Prettier 설정 (Phase 0 잔여)
- [ ] Supabase 프로젝트 생성 + CLI 연결 (Phase 0 잔여)
- [ ] Phase 1 시작: DB 스키마, 인증, 라우팅
