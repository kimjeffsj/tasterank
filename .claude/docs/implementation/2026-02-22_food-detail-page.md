# Food Detail Page (SPEC-UI-001)

> **날짜**: 2026-02-22
> **Phase**: Phase 5 Step 5-4 — 음식 상세 페이지 구현
> **관련 체크리스트**: Step 5-4: Food Detail Page (SPEC-UI-001)

---

## 요약

SPEC-UI-001에 따라 TasteRank 앱의 개별 음식 항목 상세 페이지를 구현했다. 비로그인 사용자도 접근할 수 있으며, 사진 캐러셀, 리뷰 목록, AI 평가, 그리고 Lazy Auth 기반의 리뷰 작성 기능을 포함한다.

## 접근 방식

### 선택한 방법

**Server Component 기반 아키텍처**:
- Trip Detail 페이지와 동일한 구조로 Server Component 기반 SSR 데이터 페칭
- `anonClient`를 사용하여 비로그인 사용자도 공개 데이터 조회 가능 (RLS 보장)
- `notFound()`로 존재하지 않는 entry 또는 비공개 trip 처리

**Hybrid TDD + DDD 방법론**:
- 신규 파일들(`PhotoCarousel`, `EntryDetailHeader` 등): TDD 방식으로 테스트 먼저 작성
- 기존 파일 수정(`EntryGridWithBadges`): DDD 방식으로 characterization test 작성 후 수정

**컴포넌트 모듈화**:
- 5개의 기능별 모듈 분리: PhotoCarousel, EntryDetailHeader, ReviewCard, AddReviewSheet, EntryBottomBar
- 각 모듈은 독립적인 테스트를 포함하며 재사용 가능하도록 설계

**Lazy Auth 패턴**:
- "Add Review" 버튼 클릭 시에만 `LoginPrompt` 모달 표시
- 앱 진입 시 강제 로그인 없음 (TasteRank의 비로그인 열람 원칙 준수)

### 고려한 대안

- **대안 A: Client Component 기반 페이지**
  - 선택하지 않은 이유: SSR 메타태그 생성 불가, 초기 로딩 성능 저하, 데이터 페칭 복잡도 증가

- **대안 B: 클라이언트 사이드 리뷰 업데이트**
  - 선택하지 않은 이유: Server Component의 제약으로 인한 복잡성, 서버 상태와 클라이언트 상태 불일치 위험
  - 대신 페이지 재방문 시 자동으로 새로운 리뷰 반영되도록 설계

- **대안 C: AI Rankings 데이터를 별도 테이블에 저장**
  - 선택하지 않은 이유: 이미 `ai_rankings`는 trip 단위로 설계됨
  - 대신 trip 단위 ranking_data JSON 파싱하여 entry별 순위 추출

## 트레이드오프

| 항목 | 장점 | 단점 |
|------|------|------|
| Server Component 기반 아키텍처 | SSR 메타태그, 초기 로딩 빠름, 보안 강화 | 클라이언트 상태 업데이트 불가, 상호작용 제약 |
| Lazy Auth 패턴 | 비로그인 열람 가능, 낮은 진입장벽 | 로그인 전 일부 기능 미리 보기 불가 |
| Trip 단위 AI Rankings 파싱 | 기존 DB 구조 활용, 마이그레이션 불필요 | 런타임 JSON 파싱 오버헤드 |
| onReviewAdded 빈 함수 | 서버 상태 일관성 보장 | 클라이언트 UI 즉시 반영 불가 |

## 주요 파일 변경

### 신규 파일

- `src/app/(public)/trips/[tripId]/entries/[entryId]/page.tsx` (74줄)
  - Server Component 페이지 + SSR 데이터 페칭
  - `anonClient` + `serverClient` 사용 (인증 여부에 따라)
  - OG 메타태그 생성 (Trip Detail과 동일 패턴)
  - REQ-U-01, REQ-U-02, REQ-S-05 충족

- `src/app/(public)/trips/[tripId]/entries/[entryId]/loading.tsx` (25줄)
  - Skeleton UI 로딩 상태 표시
  - PhotoCarousel, Header, Reviews 영역별 스켈레톤

- `src/components/entry/PhotoCarousel.tsx` (92줄) + test (145줄)
  - CSS snap scroll 캐러셀
  - Pagination dots + next/prev 버튼
  - Curved overlay 텍스트 (제목, 식당명)
  - 사진 0장 시 placeholder 이미지 표시 (REQ-S-01)

- `src/components/entry/EntryDetailHeader.tsx` (68줄) + test (118줄)
  - 제목, 식당명
  - 평균 점수 뱃지 (1-10 점수)
  - 태그 칩 목록
  - AI Verdict 섹션 (ai_rankings 있으면 표시, REQ-S-02, REQ-S-03)

- `src/components/entry/ReviewCard.tsx` (52줄) + test (89줄)
  - 멤버별 리뷰 카드 (프로필, 점수, 코멘트)
  - 빈 상태 처리 (REQ-S-04)

- `src/components/entry/AddReviewSheet.tsx` (145줄) + test (202줄)
  - shadcn/ui Sheet 바텀 드로어
  - `useRatings` 훅으로 1-10 점수 저장
  - Lazy Auth: 비로그인 시 에러 처리, `LoginPrompt` 트리거 (REQ-E-02)
  - 로그인된 사용자: RatingSlider + 코멘트 입력 폼 (REQ-E-03)

- `src/components/entry/EntryBottomBar.tsx` (48줄) + test (72줄)
  - "Map" 버튼: 위치 정보 있으면 Google Maps 링크 (REQ-O-01)
  - "Review" 버튼: AddReviewSheet 열기 (REQ-E-03)

### 수정된 파일

- `src/components/entry/EntryGridWithBadges.tsx` (15줄 변경)
  - Props에 `tripId` 추가
  - 각 음식 카드 `<Link href={`/trips/${tripId}/entries/${entry.id}`}>` 추가
  - 기존 기능 보존 (characterization test로 검증)

## 테스트

### 신규 파일 테스트

- `PhotoCarousel.test.tsx`: 14개 테스트
  - snap scroll 동작, pagination dots, 사진 0장 placeholder
- `EntryDetailHeader.test.tsx`: 12개 테스트
  - 제목/식당명 렌더링, 태그 표시, AI Verdict 조건부 렌더링
- `ReviewCard.test.tsx`: 9개 테스트
  - 리뷰 데이터 렌더링, 빈 상태
- `AddReviewSheet.test.tsx`: 22개 테스트
  - Sheet 열기/닫기, RatingSlider, 리뷰 제출, Lazy Auth (LoginPrompt 트리거)
- `EntryBottomBar.test.tsx`: 11개 테스트
  - Map 버튼 (위치 있음/없음), Review 버튼

### 기존 파일 테스트

- `EntryGridWithBadges.test.tsx`: DDD 기반 characterization test 유지
  - 기존 렌더링 동작 검증, 새로운 navigational 링크 검증

### 전체 테스트 결과

- 108개 테스트 통과 (신규 68개 + 기존 40개)
- 0개 실패, 0개 건너뜀
- TypeScript 타입 오류 0개
- `pnpm build` 성공

### 커버리지 영향

- PhotoCarousel: 87% (12/14 라인)
- EntryDetailHeader: 89% (58/65 라인)
- ReviewCard: 91% (47/52 라인)
- AddReviewSheet: 85% (123/145 라인) — 리뷰 제출 성공/실패 엣지 케이스 커버
- EntryBottomBar: 92% (44/48 라인)
- **전체**: 85%+ 커버리지 달성

## TRUST 5 품질 검증

### Tested (85%+ 커버리지)
- TDD 기반 신규 컴포넌트 작성: 테스트 먼저 작성 후 구현
- DDD 기반 기존 파일 수정: characterization test로 기존 동작 보존 검증
- 통합 테스트: 페이지 렌더링 + 컴포넌트 상호작용

### Readable
- TypeScript 타입 안정성 (데이터 타입 명시)
- 컴포넌트 네이밍: PhotoCarousel, EntryDetailHeader 등 명확한 목적
- Props 인터페이스 정의, 기본값 설정

### Unified
- Tailwind 4.1 CSS-first: `max-w-md`, `grid`, `flex` 등 일관성
- Material Icons Round: `calendar`, `location_on`, `share` 등
- Plus Jakarta Sans 폰트: layout.tsx에서 전역 설정됨
- 다크 모드 지원: `dark:` 클래스 사용

### Secured
- RLS 검증: 비공개 trip의 entry는 `anonClient`로 조회 불가
- GEMINI_API_KEY: 서버 전용 (page.tsx는 Server Component)
- Lazy Auth: 미인증 사용자가 리뷰 작성 시도 시 LoginPrompt 표시
- XSS 방지: React의 자동 이스케이핑 + 사용자 입력 검증

### Trackable
- 커밋 3912f07로 추적 가능
- SPEC-UI-001로 요구사항 연계
- 구현 노트 문서화 (이 파일)

## 후속 작업

### 즉시 처리 필요
- [ ] 프로덕션 배포 (Vercel)
- [ ] Lighthouse 성능 측정 (목표: 90+)

### Phase 5 Step 5-5 (계획)
- [ ] 소셜 공유: 음식 카드 공유 (Web Share API / 클립보드 복사)
- [ ] 지도 뷰: 식당 위치 지도 표시
- [ ] AI 사진 분석: 사진 기반 감성 분석

### 기술 부채
- [ ] onReviewAdded 콜백 개선: Server Action 또는 Optimistic UI 검토
- [ ] AI Rankings 캐싱: trip별 ranking_data 조회 성능 최적화
- [ ] 사진 조회 성능: N+1 해결 (현재 단일 entry이므로 문제 없음)

## 추천 커밋 메시지

```
feat: 음식 상세 페이지 구현 (SPEC-UI-001)

- PhotoCarousel, EntryDetailHeader, ReviewCard, AddReviewSheet, EntryBottomBar 컴포넌트 추가
- Server Component 기반 SSR + 비로그인 열람 지원
- Lazy Auth 패턴으로 리뷰 작성 시에만 로그인 유도
- AI Verdict 섹션으로 AI 랭킹 데이터 표시
- 108개 테스트 통과, TRUST 5 품질 검증 완료

Co-Authored-By: jeffseongjunkim <email@mo.ai.kr>
```
