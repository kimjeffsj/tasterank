# BottomNav ADD PHOTOS — React Context 범위 밖 렌더로 멤버십 항상 false

> **날짜**: 2026-02-24
> **Phase**: Phase UI — 접근제어 / 인증
> **관련 체크리스트**: SPEC-UI-003 (비멤버 ADD PHOTOS 비활성화)

---

## 문제

SPEC-UI-003에서 구현한 ADD PHOTOS 버튼 비활성화 로직이 의도와 반대로 동작.

- **trip owner (로그인)**: ADD PHOTOS 버튼이 항상 비활성화(opacity-40)
- **비로그인 사용자**: 버튼이 활성화 상태 (비활성화 되어야 함)
- **근본 원인**: `BottomNav`가 `(public)/layout.tsx`에서 렌더되어 `trips/[tripId]/layout.tsx`가 생성하는 `TripMembershipProvider` Context 범위 **밖**에 위치. `useTripMembership()` 호출 시 항상 defaultValue `{ isMember: false }` 반환.

### 렌더 트리 구조

```
(public)/layout.tsx
├── {children}
│   └── trips/[tripId]/layout.tsx
│       └── <TripMembershipProvider isMember={true}>  ← Provider 범위
│           └── 실제 페이지
└── <BottomNav />  ← Provider 밖! useTripMembership() = { isMember: false }
```

### isDisabled 로직 오류 (2차)

Context 문제 외에도 비로그인 사용자에 대한 비활성화가 누락되어 있었음.

```typescript
// 기존: 비로그인(user=null)이면 isDisabled=false → 버튼 활성화 (의도와 다름)
const isDisabled = !!tripId && !!user && !isMember;
```

---

## 해결 방법

`BottomNav` 내부에서 Supabase 브라우저 클라이언트로 `trip_members` 테이블을 직접 쿼리. Context 의존성 완전 제거.

### 왜 이 방법인가

1. `BottomNav`는 `(public)/layout.tsx`에 고정되어 있어 Provider 내부로 이동 시 다른 public 페이지 레이아웃과 충돌 발생
2. 클라이언트 컴포넌트이므로 `createBrowserClient()`로 세션 쿠키를 자동 읽어 RLS 통과 가능
3. `authLoading` + `membershipLoading` 두 단계 로딩 상태 관리로 깜빡임(flicker) 방지

### 고려한 대안

- **대안 A — `TripMembershipProvider`를 `(public)/layout.tsx` 수준으로 올리기**: `tripId`가 없는 페이지(home, explore 등)에서 Provider 불필요하게 마운트됨. tripId를 pathname에서 파싱해야 하는 레이아웃 로직이 Server Component에서 처리하기 어려움 — 기각
- **대안 B — `BottomNav`를 `trips/[tripId]/layout.tsx` 내부로 이동**: 해당 경로 외 페이지에서 BottomNav가 사라지므로 별도 레이아웃에 다시 추가해야 하는 중복 발생 — 기각
- **대안 C — 이전 커밋 방식 (클라이언트 쿼리)**: 이전 구현은 `isMember` 초기값 또는 `isDisabled` 로직 오류로 항상 활성화. 로딩 상태 미처리가 원인 — 수정 후 채택

---

## 주요 코드 변경

### `src/components/layout/BottomNav.tsx`

```tsx
// Before: Context에 의존 → 항상 defaultValue(isMember: false) 반환
import { useTripMembership } from "@/contexts/TripMembershipContext";
const { isMember } = useTripMembership();

// After: Supabase 직접 쿼리 + 로딩 상태 관리
import { createClient } from "@/lib/supabase/client";

const { user, loading: authLoading } = useAuth();
const [isMember, setIsMember] = useState(false);
const [membershipLoading, setMembershipLoading] = useState(false);

// tripId를 useEffect 의존성으로 쓰기 위해 early return 앞으로 이동
const tripId = getTripIdFromPath(pathname);

useEffect(() => {
  if (!tripId || !user) {
    setIsMember(false);
    setMembershipLoading(false);
    return;
  }
  setMembershipLoading(true);
  createClient()
    .from("trip_members")
    .select("role")
    .eq("trip_id", tripId)
    .eq("user_id", user.id)
    .single()
    .then(({ data }) => {
      setIsMember(!!data);
      setMembershipLoading(false);
    });
}, [tripId, user?.id]);

// isDisabled: 비로그인도 비활성화, 로딩 중 flicker 방지
const isDisabled =
  !!tripId &&
  (authLoading || membershipLoading || !user || !isMember);
```

- `useTripMembership()` 완전 제거
- `tripId` 계산을 hooks 이후 / early return 이전으로 이동 (React hooks 규칙 준수)
- `authLoading || membershipLoading` 로 로딩 중 비활성화 유지 → 활성화 flicker 방지

### `src/components/layout/BottomNav.test.tsx`

```tsx
// TripMembershipProvider 래핑 제거
// Supabase 클라이언트 mock으로 교체
const mockSingle = jest.fn();
jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({ select: () => ({ eq: () => ({ eq: () => ({ single: mockSingle }) }) }) }),
  }),
}));

// 멤버 테스트: act(async () => {})로 Promise.then + React 상태 업데이트 flush
await act(async () => {});
```

---

## 트레이드오프

| 항목 | 장점 | 단점 |
|------|------|------|
| Supabase 직접 쿼리 | Context 범위 문제 완전 해결, 단순한 구조 | 트립 페이지 진입 시마다 추가 DB 쿼리 1회 발생 |
| 로딩 중 비활성화 | Flicker 없음, 상태 일관성 | 멤버도 초기 로딩 동안 잠깐 비활성화 상태로 보임 |

---

## 테스트

- [x] 오너 로그인 → ADD PHOTOS 버튼 활성화, 클릭 시 `/entries/new` 이동
- [x] 로그인 + 비멤버 → 버튼 비활성화(opacity-40), 클릭 시 "You must be a member" 팝오버
- [x] 비로그인 → 버튼 비활성화(opacity-40), 클릭 시 로그인 팝업
- [x] 홈/explore 등 비트립 페이지 → ADD TRIP 버튼 정상 동작
- [x] Jest 16/16 통과

---

## 후속 작업

- [ ] 트립 페이지 진입 시 멤버십 쿼리와 서버 레이아웃 쿼리가 중복 실행됨 — 캐싱 또는 통합 고려
- [ ] `TripMembershipContext`가 현재 `BottomNav` 외에 사용처가 없다면 제거 검토
