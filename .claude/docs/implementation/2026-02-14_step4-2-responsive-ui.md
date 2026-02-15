# Step 4-2: 반응형 UI

> **날짜**: 2026-02-14
> **Phase**: Phase 4 — 폴리시
> **관련 체크리스트**: 모바일 레이아웃 점검, 다크 모드 지원, 로딩/에러/빈 상태 UI

---

## 요약

다크 모드 토글 시스템 구현(ThemeProvider + inline script for FOUC prevention), 전체 페이지 dark: 클래스 적용, Next.js 파일 기반 loading/error/not-found 페이지 추가, 재사용 EmptyState/Skeleton 컴포넌트 생성.

## 접근 방식

### 선택한 방법
- **다크 모드**: localStorage + prefers-color-scheme 감지. `<html>` 태그에 `dark` 클래스 토글. Inline script로 페인트 전 적용하여 FOUC 방지.
- **레이아웃**: DESIGN.md 기준 — 모바일 퍼스트, 데스크탑은 max-w-md 센터링. 복잡한 반응형 브레이크포인트 불필요.
- **상태 UI**: Next.js 파일 컨벤션(loading.tsx, error.tsx, not-found.tsx) + 재사용 Skeleton/EmptyState 컴포넌트.

### 고려한 대안
- **next-themes 라이브러리**: 외부 의존성 추가 불필요 — 직접 구현이 간단하고 번들 크기 절감
- **CSS prefers-color-scheme만**: 사용자 수동 토글 불가능 — localStorage 조합 선택
- **Zustand 다크모드 스토어**: React Context로 충분 — 추가 스토어 불필요

## 트레이드오프

| 항목 | 장점 | 단점 |
|------|------|------|
| Inline theme script | FOUC 완전 방지 | dangerouslySetInnerHTML 사용 |
| suppressHydrationWarning | 서버/클라이언트 불일치 경고 제거 | hydration 오류 숨길 수 있음 |
| EmptyState 컴포넌트 | 일관된 빈 상태 UI | HomePage만 적용, 나머지는 점진적 마이그레이션 |

## 주요 파일 변경

### 신규 생성
- `src/components/layout/ThemeProvider.tsx` — 다크모드 컨텍스트 + localStorage/system pref 감지
- `src/components/layout/ThemeToggle.tsx` — sun/moon 아이콘 토글 버튼
- `src/components/layout/EmptyState.tsx` — 재사용 빈 상태 컴포넌트
- `src/components/layout/Skeleton.tsx` — animate-pulse 스켈레톤 컴포넌트
- `src/app/loading.tsx` — 글로벌 로딩 스피너
- `src/app/error.tsx` — 글로벌 에러 바운더리 (retry 버튼)
- `src/app/not-found.tsx` — 글로벌 404 페이지
- `src/app/(public)/trips/[tripId]/loading.tsx` — 트립 상세 스켈레톤
- `src/app/(public)/trips/[tripId]/ranking/loading.tsx` — 랭킹 스켈레톤

### 수정
- `src/app/layout.tsx` — ThemeProvider 래퍼 + inline theme script + suppressHydrationWarning
- `src/app/(public)/page.tsx` — ThemeToggle 헤더 추가, dark: 클래스, EmptyState 적용
- `src/app/(public)/trips/[tripId]/page.tsx` — dark: 클래스 추가
- `src/app/(public)/trips/[tripId]/ranking/page.tsx` — dark: 클래스 추가
- `src/components/ranking/RankingList.tsx` — dark: 클래스 추가
- `src/app/(public)/search/page.tsx` — dark: 클래스 추가
- `src/app/(public)/saved/page.tsx` — dark: 클래스 추가
- `src/app/(public)/profile/page.tsx` — dark: 클래스 추가
- `src/app/(public)/join/[inviteCode]/page.tsx` — dark: 클래스 추가
- `src/app/(protected)/trips/new/page.tsx` — dark: 클래스 추가
- `src/app/(protected)/trips/[tripId]/edit/page.tsx` — dark: 클래스 추가
- `src/app/~offline/page.tsx` — CSS 변수를 Tailwind 클래스로 교체 + dark: 추가

## 테스트

- [x] `pnpm build` 성공
- [ ] ThemeProvider 유닛 테스트 (향후)
- 커버리지 영향: 신규 컴포넌트 테스트 미작성 (Phase 4-4에서 커버리지 보강)

## 후속 작업

- [ ] Phase 4-3: SEO + 메타태그
- [ ] EmptyState를 나머지 인라인 빈 상태에도 점진적 적용
