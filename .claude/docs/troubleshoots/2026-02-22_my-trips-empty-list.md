# /my-trips 빈 목록 — Auth Race Condition 수정

> **날짜**: 2026-02-22
> **Phase**: Phase 5 — 배포/버그수정
> **관련 체크리스트**: My Trips 페이지 실데이터 연동

---

## 문제

배포 환경(`https://tasterank.vercel.app/my-trips`)에서 로그인한 유저가 생성하거나 속한 트립이 전혀 표시되지 않음.

- **증상**: 페이지 로드 시 트립 목록 빈 상태. 새로고침 해도 동일.
- **근본 원인 1 (HIGH)**: `useTrips({ myTripsOnly: true })`가 마운트 즉시 `fetchTrips()`를 실행하는데, 이 시점에 `AuthProvider`의 `supabase.auth.getUser()`가 아직 비동기 처리 중. Supabase 브라우저 클라이언트가 세션 복원을 완료하지 못한 상태에서 쿼리 → `auth.uid() = NULL` → RLS에서 0건 반환. auth 상태 변경 시 re-fetch하지 않음(dependency 누락).
- **근본 원인 2 (MEDIUM)**: `trip_members` 쿼리에 `.eq("user_id", userId)` 없이 RLS에만 의존 → public 트립에서 다른 멤버 row도 반환될 수 있음.
- **근본 원인 3 (MEDIUM)**: `src/middleware.ts` 미존재 → JWT 만료(1시간) 후 인증 쿼리 실패 가능.

## 해결 방법

`useTrips`에 `userId` 파라미터 추가 → auth 완료 전엔 fetch 스킵, 완료 후 자동 re-fetch.

### 왜 이 방법인가

1. `userId`가 없으면 fetch를 완전히 스킵 → 빈 쿼리/RLS 오류 없음
2. `userId`가 dependency에 포함되므로 auth 복원 후 자동으로 re-fetch 트리거됨
3. `.eq("user_id", userId)` 명시적 필터로 RLS 의존성 최소화

### 고려한 대안

- **`authLoading`을 useTrips 내부에서 직접 참조**: 훅 간 결합도가 높아짐 — 기각
- **`useEffect`에서 auth 이벤트 직접 구독**: 이미 AuthProvider에서 처리 중, 중복 — 기각
- **SSR로 전환**: 서버에서 데이터 패치로 race 자체 제거. 향후 개선으로 남김.

## 주요 코드 변경

### `src/hooks/useTrips.ts`

```typescript
interface UseTripsOptions {
  myTripsOnly?: boolean;
  userId?: string; // 추가
}

// fetchTrips 내부
if (options.myTripsOnly) {
  if (!options.userId) {
    setTrips([]);
    setLoading(false);
    return; // auth 복원 전 스킵
  }
  const { data: memberTrips } = await supabase
    .from("trip_members")
    .select("trip_id, trips(*)")
    .eq("user_id", options.userId) // 명시적 필터 추가
    .order("joined_at", { ascending: false });
}

// dependency에 userId 추가
}, [supabase, options.myTripsOnly, options.userId]);
```

### `src/app/(public)/my-trips/page.tsx`

```typescript
const { user, loading: authLoading } = useAuth();
const { trips, loading: tripsLoading, error } = useTrips({
  myTripsOnly: true,
  userId: user?.id, // auth 완료 전 undefined → fetch 스킵
});
```

### `src/middleware.ts` (신규)

```typescript
// Supabase 공식 패턴 — JWT 자동 갱신
await supabase.auth.getUser();
```

## 트레이드오프

| 항목                          | 장점                        | 단점                              |
| ----------------------------- | --------------------------- | --------------------------------- |
| userId dependency 추가        | 간단, 기존 패턴 유지        | authLoading 중 빈 화면 잠깐 표시  |
| SSR 전환                      | race condition 근본 해결    | 페이지 리팩토링 필요 (scope 큼)   |
| middleware JWT 갱신           | 1시간 후 만료 버그 예방     | 모든 요청에 getUser() 오버헤드    |

## 테스트

- [x] Google OAuth 로그인 후 `/my-trips` 접근 → 트립 목록 표시
- [x] 페이지 새로고침 후 목록 유지
- [x] 로그아웃 → 재로그인 후 목록 정상 표시
- [ ] JWT 1시간 만료 후 재접근 테스트 (middleware 검증)

## 후속 작업

- [ ] SSR 기반 MyTripsPage로 전환하여 race condition 근본 해결
- [ ] `useTrips` 테스트에 userId 파라미터 케이스 추가
