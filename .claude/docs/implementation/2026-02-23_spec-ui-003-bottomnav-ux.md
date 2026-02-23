# SPEC-UI-003: Bottom Navigation UX 개선

**날짜:** 2026-02-23
**SPEC:** SPEC-UI-003
**커밋:** 299e02b

## 구현 개요

Bottom Navigation의 UX를 개선하는 두 가지 기능을 구현했습니다:
1. Tournament 페이지에서 BottomNav 숨김
2. 비멤버 사용자에 대한 센터 버튼 컨텍스트 전환 (Option B: Disabled State + Popover)

## 구현된 파일

| 파일 | 변경 | 설명 |
|------|------|------|
| `src/components/layout/BottomNav.tsx` | 수정 | tournament 숨김 + 멤버십 기반 버튼 로직 |
| `src/contexts/TripMembershipContext.tsx` | 신규 | Context + Provider + useTripMembership 훅 |
| `src/contexts/TripMembershipContext.test.tsx` | 신규 | 10개 테스트 |
| `src/app/(public)/trips/[tripId]/layout.tsx` | 신규 | 서버 컴포넌트 멤버십 조회 + Provider |
| `src/components/layout/BottomNav.test.tsx` | 신규 | 16개 테스트 |

## 핵심 설계 결정

### Layout 방식 선택

Trip 상세 + Ranking 페이지 모두 멤버십 상태가 필요하므로 `(public)/trips/[tripId]/layout.tsx`에 서버 컴포넌트를 두어 단일 멤버십 쿼리로 두 페이지를 커버.

**대안 검토:**
- BottomNav에서 직접 API 호출 → 모든 페이지 렌더링마다 불필요한 호출 (기각)
- 각 페이지에서 개별 Provider 설정 → 코드 중복 (기각)
- URL 파라미터 → 깨끗하지 않은 URL (기각)

### Popover 구현 (라이브러리 없음)

별도 Popover 라이브러리 대신 Tailwind + `useState` + `useRef` + `useEffect`로 구현:
- `absolute bottom-full` 포지션으로 버튼 위에 표시
- CSS border trick으로 하향 삼각형 화살표
- `document.addEventListener('click')` + `useEffect` cleanup으로 외부 클릭 감지

### 멤버십 판단 로직

```
tripId && isMember        → entries/new 이동 (기존)
tripId && user && !isMember → Popover 표시
tripId && !user           → LoginPrompt (기존)
!tripId                   → ADD TRIP (기존)
```

## 트레이드오프

| 결정 | 장점 | 단점 |
|------|------|------|
| Layout 방식 | 쿼리 1회, 두 페이지 커버 | 추가 DB 쿼리 (약 1ms) |
| Tailwind Popover | 의존성 없음, 가벼움 | 복잡한 위치 계산 필요시 한계 |
| Context 기본값 false | Provider 없는 페이지 안전 | trip 페이지 외 isMember=false 유지 |

## 테스트 결과

- TripMembershipContext: 10개 테스트 통과
- BottomNav: 16개 테스트 통과 (tournament 숨김, 멤버/비멤버 시나리오 등)
- 빌드: pnpm build 성공
