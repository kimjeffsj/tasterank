# AuthProvider 도입 — useAuth() 중복 getUser() 호출 근본 해결

> **날짜**: 2026-02-21
> **Phase**: Phase 4 — 인증/Auth
> **관련 체크리스트**: AuthProvider 도입, useAuth 전역 공유

---

## 문제

`useAuth()` 훅이 전역 공유 상태 없이 각 컴포넌트에서 독립적으로 `supabase.auth.getUser()`를 호출했다.

- **증상**: 단일 페이지 렌더링 시 `getUser()` 최대 8회 중복 호출 (컴포넌트 수 × 마운트 사이클)
- **직접 원인**: `useAuth()`가 매 호출마다 독립적인 `useState + useEffect` 인스턴스를 생성. 공유 캐시 없음
- **파생 문제 1**: N+1 쿼리 우회를 위한 "Lift State Up" 리팩터링이 시맨틱 불일치 + isCreator guard 누락 버그를 유발 (`2026-02-21_ai-questions-badge-creator-guard-and-reshow.md`)
- **파생 문제 2**: 단일 페이지에서 AI Questions N+1 발생 (`2026-02-21_trip-detail-ai-questions-n-plus-1.md`)
- **근본 원인**: 전역 auth 상태가 없어 각 컴포넌트가 독립적으로 세션을 조회. remount 시마다 전체 초기화

## 해결 방법

React Context 기반 `AuthProvider`를 `layout.tsx` 루트에 배치하여 auth 상태를 싱글턴으로 공유.

### 왜 이 방법인가

1. **단일 진실 공급원**: `getUser()` 호출이 앱 전체에서 1회로 줄어들고, 이후 `useContext(AuthContext)`로 즉시 소비
2. **Next.js App Router 친화적**: Server Component에서 클라이언트 Provider 감싸기 패턴이 공식 권장 방식
3. **Zustand 불필요**: 전체 코드베이스에서 크로스 컴포넌트 공유 상태는 auth 1개. 나머지 데이터 훅은 페이지별 독립 사용으로 글로벌 스토어 불필요

### 고려한 대안

- **Zustand**: auth 슬라이스 관리 가능하나 `src/stores/` 디렉토리 없고 패키지도 미설치. 현재 규모에서 과설계. 실시간 협업/멀티스텝 워크플로우 등 필요 시 도입 검토
- **SWR / TanStack Query**: `getUser()` 캐싱 문제를 해결할 수 있으나, 데이터 fetching 라이브러리 추가는 현재 YAGNI. auth 이외 훅도 동일 패턴이지만 페이지별 소비자 1~3개로 중복 호출 문제 없음
- **훅 내 모듈 레벨 캐시**: Singleton 변수로 캐시 가능하나 SSR/테스트 환경에서 격리 어렵고 React 패턴에서 이탈

## 주요 코드 변경

### `src/components/auth/AuthProvider.tsx`

```tsx
"use client";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 최초 1회만 getUser() 호출
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    );
    return () => subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ user, loading, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
```

- `getUser()` 호출을 Provider 레벨에서 1회로 집약
- `onAuthStateChange` 리스너로 세션 변경 시 자동 동기화

### `src/app/layout.tsx`

```tsx
<AuthProvider>
  {children}
</AuthProvider>
```

- 루트 레이아웃에 배치하여 앱 전체 싱글턴 보장

### `src/hooks/useAuth.ts`

```ts
// 기존: 독립 useState + useEffect로 getUser() 호출
// 변경: AuthProvider의 Context 소비만 담당 (AuthProvider.tsx의 useAuth로 대체)
```

- 기존 `src/hooks/useAuth.ts`는 AuthProvider 내 `useAuth` export로 대체

## 트레이드오프

| 항목 | 장점 | 단점 |
| ---- | ---- | ---- |
| React Context (선택) | Next.js 공식 패턴, 추가 패키지 없음, SSR 호환 | Provider 트리 필요, 에러 시 throw 처리 필요 |
| Zustand | DevTools, 외부 접근 용이 | 패키지 추가, 현재 규모에서 과설계 |
| SWR/TanStack Query | 캐싱/revalidation 자동화 | 데이터 fetching 라이브러리 추가, YAGNI |

## 인과관계 분석

이번 AuthProvider 도입은 이전 두 troubleshoot 문서의 근본 원인을 소급 해결한다.

```
useAuth() 전역 상태 없음 (근본 원인)
  ├─ 각 컴포넌트 독립 getUser() → N+1 쿼리
  │    └─ trip-detail-ai-questions-n-plus-1.md
  │         └─ Lift State Up 우회 → 시맨틱 불일치 + isCreator guard 누락
  │              └─ ai-questions-badge-creator-guard-and-reshow.md
  └─ AuthProvider 도입으로 근본 해결 (이번 작업)
```

## Zustand 불필요 판단 근거

현재 코드베이스 상태관리 현황:
- Auth: React Context (`AuthProvider`) — 13개 컴포넌트 소비
- Theme: React Context (`ThemeProvider`) — 2개 컴포넌트 소비
- 데이터 훅: 독립 `useState + useEffect` — 훅당 소비자 1~3개, 페이지별 독립
- 메인 읽기 경로: **Server Component** 서버사이드 fetch

Zustand가 필요해지는 시점:
- 실시간 협업 (여러 유저 동시 rating)
- 페이지 간 상태 유지 (entry 작성 draft 보존)
- 멀티스텝 워크플로우 (3단계 이상 마법사)
- 3+ 레벨 prop drilling 발생

## 테스트

- [x] `AuthProvider.test.tsx` — Provider 마운트 시 getUser() 1회만 호출
- [x] `useAuth.test.ts` — Provider 외부 호출 시 에러 throw
- [x] Provider 내부에서 user/loading/signIn/signOut 정상 반환

## 후속 작업

- [ ] 기존 `src/hooks/useAuth.ts` 삭제 또는 re-export로 전환 (점진적 마이그레이션)
- [ ] 데이터 훅 중복 패턴 증가 시 TanStack Query 도입 검토 (현재 YAGNI)
