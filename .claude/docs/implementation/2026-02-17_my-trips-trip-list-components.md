# My Trips 페이지 + 재사용 가능 Trip List 컴포넌트

> **날짜**: 2026-02-17
> **Phase**: Phase 5 — Step 5-4 (UI/UX 개선)
> **관련 체크리스트**: My Trips 페이지 구현, Explore 페이지 준비

---

## 요약

검색(`SearchBar`), 필터링(`TripFilterTabs`), 정렬(`TripSortSelect`), 뷰 전환(`ViewToggle`)이 가능한 재사용 Trip List 컴포넌트 시스템을 구축하고, My Trips 페이지에 적용했다. 동일 컴포넌트로 Explore 페이지도 구동할 수 있도록 설계했다.

---

## 접근 방식

### 선택한 방법

**클라이언트 사이드 필터링/정렬**: 서버에서 trip 목록 전체를 받아온 뒤 (`useTrips`), `TripListContainer` 내부에서 `useMemo`로 검색·필터·정렬을 처리한다.

**컴포넌트 분리 원칙**: 각 UI 관심사를 독립 컴포넌트로 분리 (`SearchBar`, `TripFilterTabs`, `TripSortSelect`, `ViewToggle`, `TripCardCompact`, `TripCardGrid`)하고, `TripListContainer`가 이들을 조합하는 오케스트레이터 역할을 한다.

**SearchBar 디바운스**: 300ms 디바운스를 `useRef` 기반 타이머로 구현해, React state를 통하지 않고 input 값을 로컬로 관리한다. `onChange`(controlled `value`)는 오직 외부 상태 동기화(clear 버튼 표시 등)에만 사용한다.

### 고려한 대안

- **서버 사이드 필터링 (URL params)**: URL 쿼리 파라미터로 filter/sort를 관리하면 공유 가능한 URL이 생기지만, My Trips는 로그인 전용 비공개 페이지라 공유 필요성이 낮고 구현 복잡도가 높아 제외.
- **단일 `TripCard` 컴포넌트 + props로 variant 제어**: `variant="compact" | "grid"` 패턴. 두 레이아웃의 차이가 커서(compact = 가로 리스트, grid = 세로 이미지 카드) 단일 컴포넌트의 조건 분기가 복잡해질 것으로 판단해 별도 컴포넌트로 분리.
- **Zustand로 필터 상태 전역 관리**: My Trips와 Explore는 독립 상태가 맞아 로컬 `useState`로 충분. 페이지 이동 시 필터가 초기화되는 것이 자연스럽다.

---

## 트레이드오프

| 항목                                         | 장점                                             | 단점                                                                       |
| -------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------- |
| 클라이언트 필터링                            | 서버 왕복 없이 즉각 반응, 네트워크 비용 없음     | 대량 데이터(1000+)에는 성능 저하 가능. My Trips 규모에선 문제 없음         |
| TripCardCompact / TripCardGrid 분리          | 각 컴포넌트가 단순하고 테스트 용이               | 컴포넌트 수 증가, 향후 공통 로직 변경 시 두 파일 수정 필요                 |
| SearchBar `defaultValue` + `useRef` 디바운스 | 렌더링 최소화, 타이핑 성능 최적                  | 테스트에서 `act(() => jest.advanceTimersByTime())` 필요 — 약간 복잡        |
| `TripListContainer`에 `showFilters` 옵션     | Explore 페이지에서 Public/Private 탭 숨기기 가능 | `showFilters=false` 시 filter state가 여전히 존재 (무해하지만 소소한 낭비) |

---

## 주요 파일 변경

**신규 생성**

- `src/components/trip/SearchBar.tsx` — 300ms 디바운스 검색창, clear 버튼
- `src/components/trip/SearchBar.test.tsx` — 8개 테스트
- `src/components/trip/TripFilterTabs.tsx` — All / Public / Private 필터 탭
- `src/components/trip/TripFilterTabs.test.tsx` — 4개 테스트
- `src/components/trip/TripSortSelect.tsx` — Latest / Name / Start Date 정렬 드롭다운
- `src/components/trip/TripSortSelect.test.tsx` — 4개 테스트
- `src/components/trip/ViewToggle.tsx` — Grid / List 뷰 전환
- `src/components/trip/ViewToggle.test.tsx` — 4개 테스트
- `src/components/trip/TripCardCompact.tsx` — 썸네일 + 정보 가로 나열 리스트 카드
- `src/components/trip/TripCardCompact.test.tsx` — 8개 테스트
- `src/components/trip/TripCardGrid.tsx` — 홈 페이지와 동일한 몰입형 이미지 카드 (aspect-4/5)
- `src/components/trip/TripCardGrid.test.tsx` — 7개 테스트
- `src/components/trip/TripListContainer.tsx` — 검색·필터·정렬·뷰전환 통합 오케스트레이터
- `src/components/trip/TripListContainer.test.tsx` — 9개 테스트
- `src/app/(public)/my-trips/page.test.tsx` — 6개 테스트

**수정**

- `src/app/(public)/my-trips/page.tsx` — 플레이스홀더에서 완전 구현으로 교체. `useTrips({ myTripsOnly: true })` + `TripListContainer` 사용, auth gating 유지

---

## 테스트

- [x] TDD 적용 (테스트 → 구현 → 리팩토링 순서)
- **총 50개 테스트, 8개 테스트 스위트, 전부 통과**
- 기존 테스트 영향 없음 (5개 pre-existing 실패는 무관한 파일)
- 디바운스 테스트: `jest.useFakeTimers()` + `act(() => jest.advanceTimersByTime(300))`으로 처리

---

## Explore 페이지 재사용 가이드

```tsx
// src/app/(public)/explore/page.tsx
<TripListContainer
  trips={publicTrips}
  loading={loading}
  showFilters={false} // Public/Private 탭 숨김 (모두 public이므로)
  emptyIcon="explore"
  emptyTitle="No public trips yet"
  emptyDescription="Be the first to share your food journey"
/>
```

`SearchBar`, `TripSortSelect`, `ViewToggle`은 `showFilters=false`여도 항상 표시된다. Explore 전용 추가 필터가 필요하면 `TripListContainer`에 `extraFilters` slot을 추가하는 방향으로 확장 가능.

---

## 후속 작업

- [ ] Explore 페이지 구현 (공개 trips 전체 + 위 가이드 적용)
- [ ] `TripCardCompact`에 음식 개수(entry count) 표시 — DB join 필요
- [ ] 검색을 서버 사이드(DB `ilike`)로 전환 검토 — 데이터 규모가 커질 경우
- [ ] My Trips 페이지에서 Trip 삭제/수정 액션 인라인 추가 (TripActions 컴포넌트 연동)
