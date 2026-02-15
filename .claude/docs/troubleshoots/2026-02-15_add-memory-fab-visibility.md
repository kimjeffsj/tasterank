# Add Memory FAB 버튼 노출 조건 수정

> **날짜**: 2026-02-15
> **Phase**: Phase 2 — Trip Detail UI
> **관련 체크리스트**: Trip Detail 페이지

---

## 문제

Add Memory(+) FAB 버튼이 모든 사용자에게 무조건 노출되고 있었음.

- **비로그인 사용자**: FAB 클릭 시 LoginPrompt 모달이 뜨지만, 로그인 후에도 멤버가 아니면 entry 생성 권한이 없음
- **로그인했지만 멤버가 아닌 사용자**: FAB이 보이고 클릭하면 entry/new 페이지로 이동하지만, RLS에 의해 저장 실패
- **근본 원인**: TripActions 컴포넌트에 멤버십 정보가 전달되지 않아 권한 기반 UI 분기가 불가능했음

## 해결 방법

FAB 버튼을 `로그인 상태 + 트립 멤버`인 경우에만 렌더링하도록 변경.

### 왜 이 방법인가

1. 권한 없는 사용자에게 액션 버튼을 보여주는 것은 UX 안티패턴
2. 서버에서 이미 members 데이터를 fetch하고 있으므로 추가 쿼리 불필요
3. RLS가 최종 방어선이지만, UI 레벨에서도 일관된 접근 제어 필요

### 고려한 대안

- **대안 A**: 기존처럼 FAB 항상 노출 + 클릭 시 권한 체크 — 비멤버가 불필요한 페이지 이동을 하게 됨, 기각
- **대안 B**: FAB 클릭 시 멤버가 아니면 "Join trip first" 토스트 표시 — 버튼 자체를 숨기는 것이 더 깔끔, 기각

## 주요 코드 변경

### `src/components/trip/TripActions.tsx`

```tsx
// Props에 memberUserIds 추가
interface TripActionsProps {
  tripId: string;
  ownerId: string;
  inviteCode: string | null;
  memberUserIds: string[];
}

// 멤버십 체크
const isMember = user ? memberUserIds.includes(user.id) : false;

// FAB 조건부 렌더링
{user && isMember && (
  <button onClick={handleAddEntry} ...>
    <span className="material-icons-round">add</span>
  </button>
)}
```

- `LoginPrompt` import 및 `showLogin` state 제거 (더 이상 불필요)
- `handleAddEntry`에서 로그인 체크 로직 제거 (조건부 렌더링으로 대체)

### `src/app/(public)/trips/[tripId]/page.tsx`

```tsx
<TripActions
  tripId={tripId}
  ownerId={trip.owner_id}
  inviteCode={trip.invite_code}
  memberUserIds={members?.map((m) => m.user_id) ?? []}
/>
```

- 서버에서 이미 fetch한 members 데이터에서 user_id 배열만 추출하여 전달

## 트레이드오프

| 항목                   | 장점                           | 단점                                    |
| ---------------------- | ------------------------------ | --------------------------------------- |
| FAB 완전 숨김 (선택)   | 깔끔한 UX, 혼란 방지           | 비멤버가 entry 추가 기능 존재를 모를 수 있음 |
| FAB + 클릭 시 안내     | 기능 발견성 높음               | 불필요한 인터랙션, 복잡도 증가           |

## 테스트

- [x] 비로그인 사용자: FAB 미노출 확인
- [x] 로그인 + 멤버: FAB 노출, 클릭 시 entry/new 이동
- [x] 로그인 + 비멤버: FAB 미노출 확인
- [x] Owner 전용 버튼(설정, 초대)은 기존대로 동작

## 후속 작업

- [ ] 비멤버에게 "Join this trip" CTA를 별도로 표시하는 것 검토
