# AI Badge Skip 잔존 + 멤버 Rating/Questions 미지원

> **날짜**: 2026-02-15
> **Phase**: Phase 5 — AI Follow-up Questions
> **관련 체크리스트**: AI follow-up questions after food entry

---

## 문제

AI follow-up badge가 두 가지 시나리오에서 잘못 동작.

- **Skip 후 배지 잔존**: Skip 클릭 시 dialog만 닫고 DB에 아무것도 저장하지 않음 → 새로고침하면 배지 재표시
- **부분 답변 시 배지 잔존**: 3개 질문 중 1개만 답변해도 나머지 2개가 미답변이라 배지 계속 표시
- **멤버 지원 부재**: Badge/FollowUpQuestions가 entry creator만 대상. Trip 멤버에게는 AI questions도 rating도 제공하지 않음
- **근본 원인**: (1) Skip에 DB dismiss 로직 없음 (2) 배지 판정이 "ALL questions answered"인데 "ANY answered"여야 함 (3) 멤버 구분 없이 단일 경로만 존재

## 해결 방법

Skip 시 빈 ai_responses row insert + 배지 판정을 "1개라도 응답 시 숨김"으로 변경 + creator/member 분기 추가.

### 왜 이 방법인가

1. 빈 ai_responses row는 "이 user가 이 question을 봤다"는 기록 역할 — 별도 dismissed 컬럼보다 단순
2. "ANY responded = done" 정책은 UX 관점에서 한 번이라도 상호작용했으면 재촉하지 않는 것이 자연스러움
3. 기존 RLS가 trip_members 기반으로 ai_responses/ratings 쓰기를 이미 허용 → DB 변경 불필요

### 고려한 대안

- **대안 A**: `ai_questions`에 `dismissed_by` 배열 컬럼 추가 — DB 마이그레이션 필요, 기존 RLS 재설정 필요하여 기각
- **대안 B**: LocalStorage에 skip 기록 — 디바이스 간 동기화 안 됨, 브라우저 초기화 시 유실되어 기각
- **대안 C**: "ALL answered" 유지하되 Skip 시에도 모든 질문에 빈 응답 저장 — 결국 같은 결과이므로 판정 로직도 함께 변경하는 것이 더 명확

## 주요 코드 변경

### `src/hooks/useAiQuestions.ts`

```ts
const dismissQuestions = useCallback(
  async (entryId: string, userId: string) => {
    const supabase = createClient();
    const { data: questions } = await supabase
      .from("ai_questions")
      .select("id")
      .eq("entry_id", entryId);

    if (!questions || questions.length === 0) return;

    const rows = questions.map((q) => ({
      question_id: q.id,
      user_id: userId,
    }));

    await supabase
      .from("ai_responses")
      .upsert(rows, { onConflict: "question_id,user_id" });
  },
  [],
);
```

- 해당 entry의 모든 ai_questions에 빈 ai_responses row를 upsert하여 "dismiss" 기록

### `src/components/entry/AiQuestionsBadge.tsx`

```ts
// 변경 전: ANY question 미답변이면 배지 표시
const unanswered = data.some((q) => !responses || responses.length === 0);

// 변경 후: 1개라도 응답했으면 done으로 간주
const hasAnyResponse = data.some((q) => responses && responses.length > 0);
setHasUnanswered(!hasAnyResponse);
```

- `handleSkip`에서도 `setHasUnanswered(false)` 호출하여 즉시 배지 제거
- `createdBy`, `creatorName`, `creatorAvatar` props 추가, `isCreator` 구분하여 FollowUpQuestions에 전달

### `src/components/entry/FollowUpQuestions.tsx`

```ts
// Skip 시 dismiss 기록
const handleSkip = async () => {
  if (user) await dismissQuestions(entryId, user.id);
  onSkip();
};

// Non-creator: rating + AI responses 동시 저장
if (!isCreator) {
  promises.push(supabase.from("ratings").upsert(...));
}
```

- `isCreator` prop으로 creator/member 분기
- Non-creator에게 creator 정보 헤더 + RatingSlider + AI questions 표시
- Creator에게는 AI questions만 표시 (기존 동작)

### `src/app/(public)/trips/[tripId]/page.tsx`

```ts
.select("id, title, restaurant_name, created_by, created_at, food_photos(...), profiles!created_by(display_name, avatar_url)")
```

- Entry query에 `created_by` + `profiles` join 추가하여 creator 정보를 AiQuestionsBadge에 전달

## 트레이드오프

| 항목 | 장점 | 단점 |
|------|------|------|
| 빈 row로 dismiss 기록 | DB 스키마 변경 없음, 기존 RLS 그대로 사용 | ai_responses에 빈 row가 늘어남 (미미한 수준) |
| "ANY responded = done" | 사용자에게 재촉 최소화, UX 자연스러움 | 나머지 질문을 답변할 기회를 놓칠 수 있음 |
| Dialog에서 직접 rating upsert | useRatings 훅 의존성 없이 간단 | rating 로직이 두 곳에 존재 (EntryForm + FollowUpQuestions) |

## 테스트

- [x] `useAiQuestions.test.ts` — dismissQuestions 함수 테스트 (2개 추가)
- [x] `AiQuestionsBadge.test.tsx` — skip 후 배지 사라짐, 부분 답변 시 배지 숨김, creator/member 구분 (4개 추가)
- [x] `FollowUpQuestions.test.tsx` — dismiss 호출, rating 저장 (non-creator), creator info 표시 (6개 추가)
- [x] 전체 36 tests 통과

## 후속 작업

- [ ] 멤버가 이미 rating을 가진 경우 RatingSlider 초기값을 기존 rating으로 설정
- [ ] 멤버가 이미 rating이 있으면 배지를 숨길지 별도 정책 결정
