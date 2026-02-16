# Tournament 다크모드 하드코딩 + 뱃지 겹침 — 시스템 테마 존중 및 레이아웃 수정

> **날짜**: 2026-02-16
> **Phase**: Phase 5 — UI/UX
> **관련 체크리스트**: Tournament UI 리디자인

---

## 문제

토너먼트 UI 리디자인 이후 두 가지 시각적 문제 발생.

- **다크모드 하드코딩**: 토너먼트 페이지 전체(`page.tsx`, `TournamentHeader.tsx`, `MatchCard.tsx`)가 `bg-gray-950`, `text-white`, `text-gray-*` 등을 직접 사용하여 시스템 라이트 모드에서도 항상 다크 UI로 표시됨
- **뱃지 겹침**: Trip detail 페이지(`trips/[tripId]/page.tsx`)의 Recent Eats 카드에서 레이팅 뱃지(`absolute top-3 right-3`)와 AI Questions 뱃지(`absolute top-2 right-2 z-10`)가 같은 top-right 코너에 겹쳐 표시됨
- **근본 원인**: 리디자인 시 "몰입형 다크 UI" 컨셉으로 하드코딩했으나, 앱 전체가 `prefers-color-scheme` 기반 light/dark 테마를 사용하므로 일관성 깨짐. 뱃지는 두 개 모두 같은 absolute 위치를 사용

## 해결 방법

모든 하드코딩 다크 클래스를 `light dark:dark` 패턴으로 전환하고, 레이팅 뱃지를 사진 밖 텍스트 영역으로 이동.

### 왜 이 방법인가

1. 앱 전체 테마 시스템과 일관성 유지 — `bg-background-light dark:bg-background-dark` 패턴이 이미 다른 페이지에서 사용됨
2. 뱃지 겹침은 position 충돌이므로, 하나를 다른 영역으로 이동하는 것이 가장 깔끔
3. 레이팅은 텍스트 정보에 가까우므로 음식명 옆이 더 자연스러운 위치

### 고려한 대안

- **대안 A**: `forced-colors` 또는 `data-theme="dark"` 속성으로 토너먼트만 강제 다크 — 기각: 앱 테마와 불일치, 유지보수 복잡
- **대안 B**: 뱃지 z-index 조정으로 겹침만 해결 — 기각: 두 뱃지가 같은 위치에 겹쳐 있으면 둘 다 읽기 어려움
- **대안 C**: AI 뱃지를 top-left로 이동 — 기각: 사진 위에 뱃지가 양쪽에 산재하면 산만함

## 주요 코드 변경

### `TournamentHeader.tsx` — 5개 클래스 변환

```tsx
// Before
bg-gray-800/60 hover:bg-gray-700/80
text-gray-300
text-gray-400
bg-gray-800 text-gray-300
bg-gray-700

// After
bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20
text-gray-600 dark:text-gray-300
text-gray-500 dark:text-gray-400
bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300
bg-gray-200 dark:bg-gray-700
```

### `MatchCard.tsx` — light/dark 전환 + score badge 위치 이동

```tsx
// Before: score badge가 사진 위 absolute top-right
<div className="absolute top-3 right-3 bg-black/60 ...">

// After: restaurant name 옆 inline으로 이동
{entry.restaurant_name && (
  <div className="flex items-center justify-between gap-2">
    <p className="text-sm text-gray-200 mb-0.5">{entry.restaurant_name}</p>
    {entry.avg_score != null && (
      <div className="flex items-center gap-1">
        <span className="material-icons-round text-amber-300 text-xs">star</span>
        <span className="text-xs font-bold text-white">{entry.avg_score.toFixed(1)}</span>
      </div>
    )}
  </div>
)}
```

- gradient overlay 위의 텍스트(음식명, 레스토랑명)는 사진 배경이므로 항상 흰색 유지

### `tournament/page.tsx` — bg-gray-950 x5 → bg-background-light dark:bg-background-dark

- SimpleHeader도 동일 패턴 적용
- error 메시지: `bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400`

### `trips/[tripId]/page.tsx` — 레이팅 뱃지 재배치

```tsx
// Before: 사진 내부 absolute top-right (AI badge와 겹침)
<div className="absolute top-3 right-3 bg-white/90 ...">

// After: 텍스트 영역에서 음식명 우측 inline
<div className="flex items-start justify-between gap-1">
  <p className="font-bold text-sm ...">{entry.title}</p>
  {avgScore != null && (
    <div className="flex items-center gap-0.5 shrink-0">
      <span className="material-icons-round text-amber-400 text-xs">star</span>
      <span className="text-xs font-bold ...">{avgScore.toFixed(1)}</span>
    </div>
  )}
</div>
```

## 트레이드오프

| 항목 | 장점 | 단점 |
| --- | --- | --- |
| 시스템 테마 존중 | 앱 전체 일관성, 사용자 선호 반영 | 토너먼트 "몰입감" 다소 감소 (라이트모드 시) |
| 뱃지 텍스트 영역 이동 | 겹침 해소, 정보 계층 명확 | 사진 위에서 바로 점수 확인 불가 |
| gradient 위 텍스트 흰색 유지 | 사진 위 가독성 보장 | light/dark 전환과 무관한 예외 규칙 |

## 테스트

- [x] `pnpm exec jest "tournament"` — 30/30 통과
- [x] `pnpm build` — 에러 없음
- [ ] dev 서버에서 라이트/다크 모드 전환 시 토너먼트 UI 정상 확인
- [ ] trip detail 카드에서 rating badge + AI badge 겹침 없음 확인

## 후속 작업

- [ ] `NoTournamentState.tsx`, `UserCompleteState.tsx`, `TournamentResults.tsx`도 하드코딩 다크 클래스 있으면 동일 패턴 적용 검토
- [ ] 토너먼트 몰입감이 부족하다면 gradient overlay나 배경 이미지 blur 등 대안 검토
