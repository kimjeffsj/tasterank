# trip_members 조인 시 동일 Trip 중복 key 경고

> **날짜**: 2026-02-17
> **Phase**: Phase 5 — My Trips 페이지 구현
> **관련 체크리스트**: My Trips 페이지, useTrips 훅

---

## 문제

My Trips 페이지 구현 후 브라우저 콘솔에서 React duplicate key 경고 발생.

```
installHook.js:1 Encountered two children with the same key, 
`90433fa8-5ce2-4131-91b3-88c2576c2975`. Keys should be unique so that 
components maintain their identity across updates.
```

- **My Trips 페이지**: 특정 trip이 목록에 두 번 렌더링되며 duplicate key 경고 발생
- **홈 페이지**: 동일 trip 데이터임에도 문제 없음
- **근본 원인**: `useTrips({ myTripsOnly: true })`가 `trips` 테이블이 아닌 `trip_members` 테이블을 조인해서 조회하는데, 한 사용자가 동일 trip에 대해 `trip_members` row를 여러 개 가질 수 있다. 예를 들어 `create_trip` RPC가 trip 생성 시 owner를 `trip_members`에 삽입하고, 이후 `join_trip_by_invite`로 같은 유저가 다시 합류하거나, 내부 RPC 로직의 중복 삽입이 발생하면 동일 `trip_id`가 두 번 조회된다. 결과 배열에서 중복 제거 없이 그대로 렌더링하므로 동일 `trip.id`가 card key로 두 번 사용된다.

홈 페이지는 `trips` 테이블을 직접 `SELECT`하므로 PK 단위로 유일하게 조회돼 이 문제가 없다.

---

## 해결 방법

`useTrips.ts`의 `myTripsOnly` 분기에서 `extracted` 배열을 만든 뒤, `Array.findIndex`로 첫 번째 등장만 남겨 중복을 제거한다.

### 왜 이 방법인가

1. **데이터 레이어에서 처리**: UI 컴포넌트(`TripListContainer`, `TripCardCompact` 등)는 고유한 trip 배열을 받는다고 가정하므로, 원천(훅)에서 보장하는 것이 가장 안전하다.
2. **단순하고 성능 충분**: My Trips 수는 수십~수백 개 수준이므로 `O(n²)` `findIndex`도 문제없다.
3. **원래 정렬 순서 유지**: `filter` + `findIndex` 패턴은 첫 번째 등장 순서를 보존한다.

### 고려한 대안

- **DB 레벨 `DISTINCT ON (trip_id)`**: Supabase Postgrest로 `distinct`를 적용하기 위해선 커스텀 View나 RPC가 필요해 마이그레이션이 필요함 — 클라이언트 fix로 충분한 상황에서 과도한 변경.
- **`Map`으로 중복 제거**: `new Map(trips.map(t => [t.id, t])).values()` — 결과 동일하나 가독성이 `findIndex` 패턴보다 낮음.
- **RPC/DB를 고쳐 중복 row 자체를 막기**: `trip_members`에 `UNIQUE(user_id, trip_id)` 제약이 이미 있어야 하는데, 실제로 중복이 발생하고 있다면 마이그레이션으로 제약을 추가해야 한다. 그러나 기존 중복 데이터가 있을 수 있어 먼저 클라이언트 측 방어 코드를 추가.

---

## 주요 코드 변경

### `src/hooks/useTrips.ts`

```ts
// Before: 중복 제거 없음
const extracted = (memberTrips ?? [])
  .map((m) => m.trips)
  .filter((t): t is Trip => t !== null);

// After: 첫 번째 등장만 유지
const extracted = (memberTrips ?? [])
  .map((m) => m.trips)
  .filter((t): t is Trip => t !== null)
  // Deduplicate: a trip can appear multiple times in trip_members
  // (e.g. owner row + member row for the same trip)
  .filter((t, i, arr) => arr.findIndex((x) => x.id === t.id) === i);
```

### `src/hooks/useTrips.test.ts`

`myTripsOnly` 시나리오 테스트 2개 추가:
- 정상 조회 확인 (`trip_members` 경로 사용)
- **중복 row가 있을 때 결과 배열이 유일한지** 검증

---

## 트레이드오프

| 항목 | 장점 | 단점 |
|------|------|------|
| 클라이언트 `findIndex` dedup | 마이그레이션 불필요, 즉시 반영 | DB에 중복 row가 계속 쌓이는 근본 원인은 해결 안 됨 |
| DB `UNIQUE(user_id, trip_id)` 제약 추가 | 중복 자체를 원천 차단 | 기존 중복 데이터 정리 마이그레이션 필요, 추가 작업 |

---

## 테스트

- [x] `useTrips.test.ts` — `myTripsOnly` 정상 조회 (7개 중 2개 신규)
- [x] `myTripsOnly` + 중복 row 입력 시 결과 배열 길이 2 (유일) 검증
- [x] 전체 테스트 스위트 영향 없음 확인

---

## 후속 작업

- [ ] `trip_members` 테이블에 `UNIQUE(user_id, trip_id)` 제약이 있는지 마이그레이션 확인 → 없으면 추가
- [ ] `create_trip` RPC와 `join_trip_by_invite` RPC에서 중복 삽입이 발생하는 경로 확인 후 `ON CONFLICT DO NOTHING` 적용 검토
