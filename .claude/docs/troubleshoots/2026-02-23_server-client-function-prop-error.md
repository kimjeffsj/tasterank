# Server Component에서 Client Component로 함수 전달 시 직렬화 오류 해결

> **날짜**: 2026-02-23
> **Phase**: Phase 2 — Food Detail Page
> **관련 체크리스트**: Food Detail Page 구현

---

## 문제

Next.js App Router 환경에서 서버 컴포넌트(`page.tsx`)가 클라이언트 컴포넌트(`EntryBottomBar`)로 이벤트 핸들러 함수(`onReviewAdded`)를 props로 전달하려고 할 때 직렬화(Serialization) 오류가 발생했습니다.

- **오류 메시지**: `Error: Event handlers cannot be passed to Client Component props.`
- **발생 위치**: `src/app/(public)/trips/[tripId]/entries/[entryId]/page.tsx`
- **근본 원인**: 서버 컴포넌트에서 렌더링된 결과는 클라이언트로 전송되기 위해 직렬화 과정을 거치는데, 자바스크립트 함수는 직렬화할 수 없기 때문에 네트워크 경계를 넘어 전달할 수 없습니다.

## 해결 방법

클라이언트 컴포넌트 내부에서 `useRouter().refresh()`를 직접 호출하여 서버 컴포넌트의 데이터를 새로고침하도록 변경했습니다.

### 왜 이 방법인가

1. **Next.js App Router 패턴 부합**: 클라이언트 액션 후 서버 데이터를 갱신하는 가장 표준적이고 권장되는 방법입니다.
2. **컴포넌트 결합도 감소**: `EntryBottomBar`와 `AddReviewSheet`가 부모 컴포넌트의 콜백에 의존하지 않고 스스로 데이터 갱신을 트리거할 수 있어 독립성이 높아집니다.
3. **코드 간소화**: 불필요한 prop 드릴링(`page` -> `EntryBottomBar` -> `AddReviewSheet`)을 제거할 수 있습니다.

### 고려한 대안

- **Server Action 사용**: `onReviewAdded`를 `"use server"` 지시어가 있는 Server Action으로 변경하여 전달 — **기각 사유**: 단순히 UI를 갱신(새로고침)하는 목적이므로, 클라이언트에서 `router.refresh()`를 호출하는 것이 훨씬 직관적이고 오버헤드가 적습니다.

## 주요 코드 변경

### `src/app/(public)/trips/[tripId]/entries/[entryId]/page.tsx`

```tsx
{
  /* Bottom action bar (client component) */
}
<EntryBottomBar
  entryId={entryId}
  entryTitle={entry.title}
  // onReviewAdded={() => {}} <- 제거됨
/>;
```

### `src/components/entry/AddReviewSheet.tsx`

```tsx
import { useRouter } from "next/navigation";

// ...

export function AddReviewSheet({
  entryId,
  open,
  onOpenChange,
}: AddReviewSheetProps) {
  const router = useRouter();

  // ...

  const handleSubmit = async () => {
    // ...
    try {
      await upsertRating({ /* ... */ });
      router.refresh(); // <- onReviewAdded() 대신 호출
      onOpenChange(false);
      // ...
    }
  };
}
```

## 트레이드오프

| 항목                    | 장점                                    | 단점                                                                    |
| ----------------------- | --------------------------------------- | ----------------------------------------------------------------------- |
| `router.refresh()` 사용 | 코드가 단순해지고 Next.js 패턴에 부합함 | 전체 페이지 데이터를 다시 가져오므로 약간의 네트워크 오버헤드 발생 가능 |
| Optimistic UI 적용      | 사용자에게 즉각적인 피드백 제공 가능    | 구현 복잡도가 크게 증가함 (상태 관리 필요)                              |

## 테스트

- [ ] 리뷰 작성 후 모달이 닫히는지 확인
- [ ] 리뷰 작성 후 페이지가 새로고침되어 새 리뷰가 목록에 표시되는지 확인
- [ ] `EntryBottomBar.test.tsx` 및 `AddReviewSheet.test.tsx` 테스트 코드 수정 및 통과 확인

## 후속 작업

- [ ] 테스트 코드(`EntryBottomBar.test.tsx`, `AddReviewSheet.test.tsx`)에서 `onReviewAdded` 관련 모킹 제거 및 `useRouter` 모킹 추가
- [ ] (선택) 향후 UX 개선을 위해 Optimistic UI 도입 검토
