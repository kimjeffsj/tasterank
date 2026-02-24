# Jest OOM Crash + 15개 테스트 실패 일괄 수정

> **날짜**: 2026-02-24
> **Phase**: Phase 4-4 — 테스트 커버리지 + 품질
> **관련 체크리스트**: Phase 4 > Step 4-4 커버리지 80%+ 달성

---

## 문제

전체 테스트 실행 시 OOM crash + 15개 테스트 실패 발생.

- **`useTrips.test.ts`**: `Jest worker ran out of memory and crashed` — OOM으로 test suite 자체가 실행 불가
- **8개 test suite (15개 test)**: 다양한 원인으로 실패

**OOM 근본 원인**: `useTrips.ts`에서 `createClient()`를 매 렌더마다 새 객체로 생성 → `useCallback` 의존성 배열에 포함 → `useEffect` 반복 실행 → `setState` → 무한 재렌더 → 메모리 소진

```ts
// ❌ 문제 코드: 매 렌더마다 새 supabase 객체 생성
const supabase = createClient();
const fetchTrips = useCallback(async () => {...}, [supabase, ...]); // supabase가 매번 새 참조
useEffect(() => { fetchTrips(); }, [fetchTrips]); // 매 렌더마다 실행됨
```

---

## 해결 방법

`createClient()`를 `useMemo`로 감싸 stable reference 유지, Jest 메모리 설정 추가, 각 테스트 오류 원인별 개별 수정.

### 수정 목록 (9개 파일)

| 파일 | 문제 | 수정 |
|------|------|------|
| `src/hooks/useTrips.ts` | 무한루프 OOM | `createClient()` → `useMemo(() => createClient(), [])` |
| `jest.config.mjs` | 메모리 설정 없음 | `maxWorkers: 2`, `workerIdleMemoryLimit: "512MB"` 추가 |
| `jest.setup.ts` | fetch 미정의 | `global.fetch = jest.fn(...)` stub 추가 |
| `src/hooks/useTrips.test.ts` | userId 미전달 + mock chain 불일치 | `userId: "user-1"` 추가, mock chain `.eq()` 수정 |
| `AddReviewSheet.tsx` | `onReviewAdded` prop 없음 | prop 추가, 성공 후 호출 |
| `AddReviewSheet.test.tsx` | `next/navigation` 미mock | `jest.mock("next/navigation")` 추가 |
| `InviteShare.test.tsx` | 컴포넌트에 없는 텍스트 assertion | `"Invite Members"` expect 제거 |
| `my-trips/page.test.tsx` | `useTrips` 호출 인자 불일치 | `userId: "user-1"` 포함으로 수정 |
| `useTournament.test.ts` | `anonClient` 미mock + `.maybeSingle()` 불일치 | anon mock 추가, `single` → `maybeSingle` |
| `tournament/page.test.tsx` | `(protected)` 위치 오류 + anon 미mock | `(public)` 디렉토리로 이동, anon mock 추가 |
| `generate-trip-cover/route.test.ts` | mock chain `.eq()` 미설정 | `beforeEach`에서 select/eq/single chain 설정 |
| `generate-rankings/route.test.ts` | `after()` 미mock, 응답 구조 불일치 | `next/server` mock 추가, callback 수동 실행 방식으로 변경 |

---

## 주요 코드 변경

### `src/hooks/useTrips.ts` — OOM 원인 수정

```ts
// ✅ 수정: stable reference로 무한루프 차단
const supabase = useMemo(() => createClient(), []);
```

### `jest.config.mjs` — 메모리 방어

```js
const config = {
  testEnvironment: "jsdom",
  maxWorkers: 2,
  workerIdleMemoryLimit: "512MB",
  // ...
};
```

### `jest.setup.ts` — fetch stub

```ts
if (typeof global.fetch === "undefined") {
  global.fetch = jest.fn(() => Promise.resolve({ ok: true })) as jest.Mock;
}
```

### `generate-rankings/route.test.ts` — `after()` 테스트 패턴

`after()` 콜백은 route handler가 await하지 않으므로, mock에서 자동 실행 시 타이밍 문제 발생. callback을 capture해 테스트에서 수동 실행하는 패턴 사용.

```ts
// Mock: capture only (don't auto-run)
let capturedAfterFn: (() => Promise<void>) | null = null;
jest.mock("next/server", () => ({
  after: jest.fn((cb) => { capturedAfterFn = cb; }),
  // ...
}));

// Test: run manually after GET()
const res = await GET(makeRequest("test-cron-secret"));
await capturedAfterFn?.(); // ← 수동 실행 후 side-effect 검증
expect(mockRpc).toHaveBeenCalled();
```

---

## 트레이드오프

| 항목 | 장점 | 단점 |
|------|------|------|
| `useMemo` for supabase | stable reference, 무한루프 완전 차단 | 컴포넌트 마운트당 1회 클라이언트 생성 |
| `maxWorkers: 2` | OOM 방지 | 병렬 테스트 실행 속도 약간 감소 |
| `after()` 수동 실행 | 타이밍 문제 없음, 명시적 | 각 테스트마다 `await capturedAfterFn?.()` 작성 필요 |

---

## 재발 방지 패턴

### `useMemo` for Supabase 클라이언트
- 커스텀 훅 내부에서 `createClient()`를 직접 호출하면 매 렌더마다 새 객체가 생성됨
- **패턴**: `const supabase = useMemo(() => createClient(), [])` 항상 사용

### `next/server after()` 테스트
- `after()`는 route handler가 반환한 뒤 실행되는 background task
- 테스트에서는 항상 callback을 capture → 수동 실행 패턴 사용

### `anonClient` mock 누락
- `@/lib/supabase/anon`를 import하는 hook/page 테스트는 반드시 해당 mock 추가
- 미mock 시 `supabaseUrl is required` 에러로 test suite 전체 실패

### 테스트 파일 위치
- page.test.tsx는 반드시 page.tsx와 **동일 디렉토리**에 위치 (route group `(protected)` / `(public)` 구분 주의)

---

## 테스트

- [x] `useTrips.test.ts` 7/7 통과 (OOM 해결)
- [x] `AddReviewSheet.test.tsx` 9/9 통과
- [x] `InviteShare.test.tsx` 5/5 통과
- [x] `my-trips/page.test.tsx` 6/6 통과
- [x] `useTournament.test.ts` 3/3 통과
- [x] `tournament/page.test.tsx` 2/2 통과
- [x] `generate-trip-cover/route.test.ts` 5/5 통과
- [x] `generate-rankings/route.test.ts` 5/5 통과
- [x] 전체 54 suites, 435 tests 통과

## 후속 작업

- [ ] Phase 4-4: 커버리지 80%+ 달성 확인 (`pnpm test --coverage`)
