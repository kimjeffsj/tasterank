# AI Questions Badge: Creator 노출 + 재답변 버그

> **날짜**: 2026-02-21
> **Phase**: Phase 5 — AI Integration
> **관련 체크리스트**: AI Follow-up Questions Badge

---

## 문제

N+1 쿼리 수정(`EntryGridWithBadges` 배치 쿼리 도입) 후 두 가지 버그 발견.

### Bug #1: Creator에게 badge 노출

- **현상**: 음식을 등록한 유저(creator)에게도 AI follow-up badge가 표시됨
- **기대**: creator는 본인이 올린 항목이므로 다른 유저 대상 follow-up question 불필요 → badge 숨김
- **근본 원인**: `AiQuestionsBadge.tsx:40`의 early-return guard에 `isCreator` 조건 누락. `isCreator`는 line 38에서 계산되지만 dialog 내부 텍스트 분기에만 사용되고, badge 렌더링 차단에는 미사용.

```tsx
// 버그: isCreator 체크 없음
if (!hasUnanswered || dismissed) return null;
```

### Bug #2: 답변 완료 후 새로고침하면 badge 재노출

- **현상**: 다른 유저가 AI questions에 답변 → 새로고침 → badge가 다시 나타남
- **근본 원인**: 배치 쿼리(`fetchUnansweredCount`)와 기존 개별 쿼리 간 시맨틱 불일치

| 방식 | 로직 | 의미 |
|------|------|------|
| 기존 개별 쿼리 | `data.some(q => q.ai_responses?.length > 0)` → `setHasUnanswered(false)` | ANY 질문에 1개라도 응답 있으면 → 완료 |
| 배치 쿼리 | 응답 없는 질문 개수 카운트 → 1개라도 미응답이면 badge 표시 | 전부 답해야 완료 |

배치 쿼리 도입 시 "전부 답해야 완료" 시맨틱이 들어와 기존 "1개라도 답하면 완료"와 역전됨.

---

## 해결 방법

### Bug #1: `AiQuestionsBadge.tsx` guard에 `isCreator` 추가

```tsx
if (!hasUnanswered || dismissed || isCreator) return null;
```

### Bug #2: `fetchUnansweredCount` 시맨틱을 "ANY 응답 → 완료"로 수정

```tsx
// 1단계: 응답 있는 entry 수집
const answeredEntries = new Set<string>();
for (const q of data) {
  const responses = q.ai_responses as unknown as { id: string }[] | null;
  if (responses && responses.length > 0) {
    answeredEntries.add(q.entry_id);
  }
}

// 2단계: 응답 0인 entry만 countMap에 추가
const countMap = new Map<string, number>();
for (const q of data) {
  if (!answeredEntries.has(q.entry_id)) {
    countMap.set(q.entry_id, 1);
  }
}
```

### 왜 이 방법인가

1. **기존 UX 일관성**: 원래 개별 쿼리는 "1개라도 답하면 완료" 시맨틱이었고 이것이 의도된 UX — 모든 질문에 강제 응답 불필요
2. **최소 변경**: 배치 쿼리 구조(단일 JOIN 쿼리)를 유지하면서 집계 로직만 수정
3. **guard 추가**: isCreator는 이미 계산되고 있었으므로 한 줄 추가로 해결

### 고려한 대안

- **`dismissed` 상태를 서버에 저장**: 새로고침 후 유지 가능하지만 DB 스키마 변경 필요 → 과도한 복잡도
- **모든 질문 필수 응답**: "전부 답해야 완료" 유지 → 기존 UX와 다르고 사용자 부담 증가 → 기각

---

## 주요 코드 변경

### `src/components/entry/AiQuestionsBadge.tsx`

```tsx
// before
if (!hasUnanswered || dismissed) return null;

// after
if (!hasUnanswered || dismissed || isCreator) return null;
```

- `isCreator`(line 38)가 이미 계산된 값 재사용 — 추가 비용 없음

### `src/hooks/useAiQuestions.ts`

```tsx
// before: 미응답 질문 개수 카운트 (전부 답해야 완료)
const countMap = new Map<string, number>();
for (const q of data) {
  const hasResponse = responses && responses.length > 0;
  if (!hasResponse) {
    countMap.set(q.entry_id, (countMap.get(q.entry_id) ?? 0) + 1);
  }
}

// after: ANY 응답 있는 entry는 완료 처리 (1개라도 답하면 완료)
const answeredEntries = new Set<string>();
for (const q of data) { ... }
const countMap = new Map<string, number>();
for (const q of data) {
  if (!answeredEntries.has(q.entry_id)) {
    countMap.set(q.entry_id, 1);
  }
}
```

### `src/components/entry/AiQuestionsBadge.test.tsx`

- 기존 `isCreator=true` 시 badge 렌더 테스트 → `isCreator=true` 시 badge null 테스트로 교체

### `src/hooks/useAiQuestions.test.ts`

- `fetchUnansweredCount` 테스트: `e1`(부분 응답)이 countMap에 없음(`undefined`)을 확인하도록 수정

---

## 트레이드오프

| 항목 | 장점 | 단점 |
|------|------|------|
| ANY 응답 → 완료 | 기존 UX 일치, 사용자 부담 낮음 | 미응답 질문이 남아도 badge 사라짐 |
| 전부 응답 → 완료 | 데이터 완결성 높음 | 기존 개별 쿼리와 시맨틱 역전, UX 변경 |

---

## 테스트

- [x] `AiQuestionsBadge.test.tsx` — 21개 통과
- [x] `useAiQuestions.test.ts` — 21개 통과
- [ ] 수동: Creator로 로그인 → 자신이 올린 항목에 badge 미노출 확인
- [ ] 수동: 다른 유저 → 답변 완료 → 새로고침 → badge 미노출 확인

---

## 후속 작업

- [ ] `dismissed` 상태를 세션 스토리지에 저장해 새로고침 후도 유지 (선택적 개선)
- [ ] creator가 자신의 항목에 대해 받는 질문 타입이 따로 필요한지 PRD 검토
