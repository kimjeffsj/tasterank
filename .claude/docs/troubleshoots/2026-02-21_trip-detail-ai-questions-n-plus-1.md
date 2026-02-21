# Trip Detail 페이지 AI Questions N+1 쿼리 — Lift State Up으로 해결

> **날짜**: 2026-02-21
> **Phase**: Phase 5 — AI 기능 / 성능 최적화
> **관련 체크리스트**: AI follow-up questions 배지 표시

---

## 문제

Trip detail 페이지(`/trips/[tripId]`)에서 로그인 유저 접속 시, 항목 N개마다 `AiQuestionsBadge` 클라이언트 컴포넌트가 개별적으로:

1. `useAuth()` 호출 → `supabase.auth.getUser()` 1회 (N번)
2. `ai_questions` 테이블에 개별 SELECT 쿼리 1회 (N번)

브라우저 Network 탭 실측:

| 항목 수 | HTTP 요청 수 | 로딩 시간 |
| ------- | ------------ | --------- |
| ~50개   | **426 req**  | **~25초** |

- **근본 원인**: `AiQuestionsBadge`가 상태를 직접 fetch하는 독립 클라이언트 컴포넌트라 컴포넌트 인스턴스 N개 × (auth 1 + DB 1) = **2N 요청** 발생. CORS preflight까지 합치면 4N.
- **이미 있던 해결책**: `useAiQuestions.ts`에 `fetchUnansweredCount(entryIds[], userId)` 배치 메서드가 존재했으나 **미사용** 상태.

---

## 해결 방법

**Lift State Up** — 새 래퍼 컴포넌트 `EntryGridWithBadges`가 `useAuth()` 1회 + `fetchUnansweredCount()` 1회 호출 후 결과를 `AiQuestionsBadge`에 props로 내려줌.

```
Before:
  page.tsx (Server)
    └── AiQuestionsBadge × N  ← 각자 auth + DB fetch

After:
  page.tsx (Server)
    └── EntryGridWithBadges (Client, "use client")
          ├── useAuth() × 1
          ├── fetchUnansweredCount(allEntryIds) × 1
          └── AiQuestionsBadge × N  ← props만 받음 (fetch 없음)
```

### 성능 향상 수치

| 지표                     | Before       | After      | 개선율     |
| ------------------------ | ------------ | ---------- | ---------- |
| HTTP 요청 수 (50개 기준) | **~426 req** | **~2 req** | **-99.5%** |
| auth 요청                | N회 (50회)   | 1회        | -98%       |
| `ai_questions` DB 쿼리   | N회 (50회)   | 1회        | -98%       |
| 예상 로딩 시간           | ~25초        | <1초       | ~25× 빠름  |

> 항목 수 N에 대한 일반식:
>
> - Before: `2N` 요청 (preflight 포함 `4N`)
> - After: `2` 요청 (auth 1 + batch query 1), 항목 수에 무관

### 왜 이 방법인가

1. **기존 배치 메서드 재활용** — `fetchUnansweredCount()`가 이미 구현되어 있었고, `entryIds[]`를 받아 한 번에 처리하는 설계였음
2. **최소 변경** — `page.tsx` Server Component는 손대지 않고 클라이언트 경계만 새 컴포넌트로 이동
3. **`AiQuestionsBadge` 단순화** — fetch 로직 제거 → 순수 표현 컴포넌트에 가까워져 테스트 용이성 향상

### 고려한 대안

- **SWC/React Query로 캐싱**: `useQuery`에 같은 key 사용 시 자동 dedup 가능 — 하지만 라이브러리 추가 부담 + 근본 문제(N 인스턴스)는 그대로
- **Server Component에서 ai_questions 미리 fetch**: SSR 시점에 배치 조회 가능하나 RLS에서 anon은 `ai_responses`에 접근 불가, 서버 컴포넌트에선 유저 auth 맥락 필요해 Server Action 추가 필요 → 복잡도 증가
- **`AiQuestionsBadge`에서 SWC deduplicate**: 동일 요청을 묶는 커스텀 훅 — 표준 패턴이 아니고 구현 복잡

---

## 주요 코드 변경

### `src/components/entry/EntryGridWithBadges.tsx` (신규)

```tsx
export function EntryGridWithBadges({ entries, scoreMap }) {
  const { user } = useAuth(); // 1회
  const { fetchUnansweredCount } = useAiQuestions();

  useEffect(() => {
    if (!user || entries.length === 0) return;
    const entryIds = entries.map((e) => e.id);
    fetchUnansweredCount(entryIds, user.id).then((countMap) => {
      // 1회
      // countMap → unansweredMap (Record<string, boolean>)
    });
  }, [user, entries, fetchUnansweredCount]);

  // 각 AiQuestionsBadge에 hasUnanswered props로 전달
}
```

### `src/components/entry/AiQuestionsBadge.tsx` (간소화)

```tsx
// Before: useAuth() + useEffect(supabase.from("ai_questions")...)
// After:  props만 받음

interface AiQuestionsBadgeProps {
  hasUnanswered: boolean; // 추가
  user: User | null; // 추가 (isCreator 계산용)
  onAnswered?: () => void; // 추가
  // entryId, entryTitle, createdBy, creatorName, creatorAvatar 유지
}
```

### `src/app/(public)/trips/[tripId]/page.tsx` (교체)

```tsx
// Before: 70줄의 entries.map(...) JSX + AiQuestionsBadge 인스턴스 N개
// After:
<EntryGridWithBadges
  entries={entries ?? []}
  scoreMap={Object.fromEntries(scoreMap)}
/>
```

---

## 트레이드오프

| 항목                         | 장점                                | 단점                                                 |
| ---------------------------- | ----------------------------------- | ---------------------------------------------------- |
| **Lift State Up 선택**       | N+1 → 2 요청, 기존 코드 최대 재활용 | EntryGridWithBadges가 grid + badge 로직 모두 포함    |
| **AiQuestionsBadge 단순화**  | 테스트 용이, 재사용성 향상          | props 인터페이스 변경으로 기존 사용처 모두 수정 필요 |
| **dismissed 로컬 상태 유지** | 답변 후 즉시 UI 반영, 재요청 없음   | 새로고침 시 서버 상태와 동기화 (정상 동작)           |

---

## 테스트

- [x] `AiQuestionsBadge.test.tsx` — 8개 테스트 (props 기반으로 재작성)
- [x] `EntryGridWithBadges.test.tsx` — 8개 테스트 (신규)
- [x] `pnpm test` 전체 통과 (16 tests, 0 failures)
- [ ] 실기기 Network 탭 확인 — 로그인 후 trip detail 접속 시 `ai_questions` 요청 1-2개 확인

## 후속 작업

- [ ] 답변 완료 후 `onAnswered` 콜백에서 서버 재검증(revalidation) 고려 (현재는 로컬 dismissed로만 처리)
- [ ] 항목이 200개 이상일 경우 `fetchUnansweredCount` 쿼리에 `.in()` limit 검토 (Supabase `.in()` 최대 1000개)

  Suggested commit: fix: batch AI questions fetch in trip detail (N+1 → 2 requests)
