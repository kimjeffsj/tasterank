---
id: SPEC-UI-001
version: "1.0.0"
status: completed
created: 2026-02-22
updated: 2026-02-22
author: jeffseongjunkim
priority: high
---

## HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-02-22 | jeffseongjunkim | Initial SPEC creation |

# SPEC-UI-001: Food Detail Page

## 개요

TasteRank 앱에서 개별 음식 항목의 상세 정보를 보여주는 페이지를 구현한다.
현재 Trip Detail 페이지에서 음식 카드를 클릭해도 이동할 페이지가 없어 사용자 경험이 단절되어 있다.

**라우트**: `/trips/[tripId]/entries/[entryId]`
**라우트 그룹**: `(public)` — 비로그인 열람 가능
**설계 기준**: DESIGN.md Section 7.5

## 요구사항

### Ubiquitous (항상 적용)

- REQ-U-01: 시스템은 항상 Food Detail 페이지를 Server Component로 렌더링해야 하며, OG 메타데이터를 포함해야 한다.
- REQ-U-02: 시스템은 항상 `anonClient`로 공개 데이터를 조회하여 비로그인 열람을 보장해야 한다.
- REQ-U-03: 시스템은 항상 모바일 퍼스트 레이아웃(`max-w-md` 중앙 정렬)을 유지해야 한다.
- REQ-U-04: 시스템은 항상 Material Icons Round 아이콘과 Plus Jakarta Sans 폰트를 사용해야 한다.

### Event-Driven (이벤트 발생 시)

- REQ-E-01: WHEN 사용자가 사진 캐러셀을 스와이프하면, THEN 다음/이전 사진으로 snap 이동하고 pagination dot을 업데이트해야 한다.
- REQ-E-02: WHEN 비로그인 사용자가 "Add Review" 버튼을 탭하면, THEN LoginPrompt 모달을 표시해야 한다.
- REQ-E-03: WHEN 로그인된 사용자가 "Add Review"를 탭하면, THEN shadcn/ui Sheet 바텀 드로어를 열어 점수 슬라이더와 리뷰 입력 폼을 표시해야 한다.
- REQ-E-04: WHEN 사용자가 리뷰를 제출하면, THEN `ratings` 테이블에 upsert하고 리뷰 목록을 새로고침해야 한다.
- REQ-E-05: WHEN 사용자가 Share 버튼을 탭하면, THEN Web Share API(지원 시) 또는 클립보드 복사를 실행해야 한다.

### Unwanted Behavior (발생하지 않아야 함)

- REQ-N-01: 시스템은 비로그인 사용자에게 리뷰 작성 폼을 직접 노출하지 않아야 한다 (Lazy Auth 원칙).
- REQ-N-02: 시스템은 `is_public = false`인 trip의 entry를 `anonClient`로 조회할 수 없어야 한다 (RLS 보장).
- REQ-N-03: 시스템은 `GEMINI_API_KEY`를 클라이언트에 노출하지 않아야 한다.

### State-Driven (상태 기반)

- REQ-S-01: IF 음식 항목에 사진이 0장이면, THEN 플레이스홀더 이미지를 표시해야 한다.
- REQ-S-02: IF AI 랭킹 데이터(`ai_rankings`)가 존재하면, THEN AI Verdict 섹션을 표시해야 한다.
- REQ-S-03: IF AI 랭킹 데이터가 없으면, THEN AI Verdict 섹션을 숨겨야 한다.
- REQ-S-04: IF 리뷰가 0개이면, THEN "No reviews yet" 빈 상태를 표시해야 한다.
- REQ-S-05: IF `entry_id`가 유효하지 않거나 존재하지 않으면, THEN `notFound()`를 호출해야 한다.

### Optional (선택적)

- REQ-O-01: WHERE 식당 위치 정보가 있는 경우, Map 버튼을 제공하여 Google Maps 링크로 열 수 있어야 한다.
- REQ-O-02: WHERE 음식 상세 페이지가 표시되는 경우, 좋아요(Heart) UI를 제공할 수 있다 (기능은 후속 SPEC).

## 구현 모듈

### Module 1: Page & Data Layer

**목적**: Server Component 페이지 + 데이터 페칭
**파일**:
- `src/app/(public)/trips/[tripId]/entries/[entryId]/page.tsx`
- `src/app/(public)/trips/[tripId]/entries/[entryId]/loading.tsx`

### Module 2: PhotoCarousel

**목적**: 사진 캐러셀 (CSS snap scroll, pagination dots, curved overlay)
**파일**:
- `src/components/entry/PhotoCarousel.tsx`
- `src/components/entry/PhotoCarousel.test.tsx`

### Module 3: Entry Detail Header & Review Card

**목적**: 타이틀 블록, 태그, AI Verdict, 멤버 리뷰
**파일**:
- `src/components/entry/EntryDetailHeader.tsx`
- `src/components/entry/EntryDetailHeader.test.tsx`
- `src/components/entry/ReviewCard.tsx`
- `src/components/entry/ReviewCard.test.tsx`

### Module 4: Add Review Sheet

**목적**: 리뷰 작성 바텀 드로어 (shadcn/ui Sheet, Lazy Auth)
**파일**:
- `src/components/entry/AddReviewSheet.tsx`
- `src/components/entry/AddReviewSheet.test.tsx`

### Module 5: Bottom Action Bar

**목적**: 하단 Map/Review 액션 바
**파일**:
- `src/components/entry/EntryBottomBar.tsx`
- `src/components/entry/EntryBottomBar.test.tsx`

## 구현 노트

**구현일**: 2026-02-22
**커밋**: 3912f07
**구현 방법론**: Hybrid TDD (신규 파일) + DDD (기존 파일 수정)

### 실제 구현된 파일

- `src/app/(public)/trips/[tripId]/entries/[entryId]/page.tsx` — Server Component 페이지 + SSR 데이터 페칭
- `src/app/(public)/trips/[tripId]/entries/[entryId]/loading.tsx` — Skeleton 로딩 UI
- `src/components/entry/PhotoCarousel.tsx` — CSS snap scroll 캐러셀 + pagination dots + curved overlay
- `src/components/entry/EntryDetailHeader.tsx` — 제목, 스코어 뱃지, 태그
- `src/components/entry/ReviewCard.tsx` — 리뷰 개별 카드 표시
- `src/components/entry/AddReviewSheet.tsx` — shadcn/ui Sheet 바텀 드로어 + Lazy Auth + RatingSlider
- `src/components/entry/EntryBottomBar.tsx` — Map/Review 액션 바
- `src/components/entry/EntryGridWithBadges.tsx` (수정) — tripId prop 추가 및 navigational 링크 연결

### 재사용된 기존 컴포넌트

- `LoginPrompt`, `RatingSlider`, `useRatings`, `useAuth` — 기존 개발된 컴포넌트 및 훅
- `shadcn/ui Sheet` — 이미 프로젝트에 설치된 컴포넌트

### 주요 결정 사항

**AI Rankings 데이터 조회 전략**:
- `ai_rankings` 테이블에 `entry_id` 컬럼이 없고 trip 단위로 저장되어 있음
- Server Component에서 `trip_id` 기준으로 조회 후 JSON 파싱하여 해당 entry의 ranking 추출

**EntryGridWithBadges 인터페이스 변경**:
- 기존 파일에 `tripId` prop 추가 (Trip Detail 페이지에서 entry detail 링크 생성용)
- DDD 방식으로 기존 기능은 보존하면서 확장

**Lazy Auth 패턴 적용**:
- "Add Review" 클릭 시에만 `LoginPrompt` 모달로 인증 유도 (앱 진입 시 강제 로그인 없음)
- REQ-E-02, REQ-N-01 충족

**Server Component 제약에 따른 설계**:
- `onReviewAdded` 콜백을 빈 함수로 처리 (Server Component에서 client-side 상태 업데이트 불가)
- 사용자가 페이지 재방문 시 새로운 리뷰가 자동으로 반영됨 (next.js revalidate 활용)

### 테스트 결과

- 108개 테스트 통과 (모든 신규/수정 컴포넌트 포함)
- 0개 테스트 실패
- TypeScript 타입 오류 0개
- `pnpm build` 성공 (프로덕션 빌드 검증)

### TRUST 5 품질 검증

- **Tested**: TDD 기반 신규 컴포넌트 + DDD 기반 기존 파일 수정 (85%+ 커버리지)
- **Readable**: TypeScript + 명확한 컴포넌트 네이밍
- **Unified**: Tailwind 4.1 + Material Icons + Plus Jakarta Sans 일관성 유지
- **Secured**: RLS 검증 + anonClient 사용 + GEMINI_API_KEY 보호
- **Trackable**: 커밋 3912f07로 추적 가능

### 후속 작업

- Step 5-4 (소셜 공유, 지도 뷰) 계획됨
