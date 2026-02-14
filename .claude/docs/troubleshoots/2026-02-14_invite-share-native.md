# Invite Share — Native Share + Sheet Fallback

> **날짜**: 2026-02-14
> **Phase**: Phase 2 — UI/UX 개선
> **관련 체크리스트**: Invite 공유 UX 통일

---

## 문제

InviteShare 컴포넌트가 absolute-positioned 드롭다운으로 렌더링되어 iOS Chrome과 macOS Chrome에서 일관되지 않은 UI를 보임.

- **iOS Chrome**: `max-w-[calc(100vw-3rem)]`이 넓은 floating card로 렌더링
- **macOS Chrome**: 좁은 compact dropdown으로 렌더링
- **근본 원인**: 작은 버튼 그룹(`flex gap-2`)에서 absolute 포지셔닝 + viewport-dependent max-width 조합

## 해결 방법

`navigator.share()` (Web Share API) 우선 호출 + shadcn Sheet fallback 패턴 적용.

### 왜 이 방법인가

1. **Native Share**: iOS/Android에서 OS 네이티브 공유 시트를 직접 활용 — 사용자에게 가장 익숙한 UX
2. **Sheet Fallback**: 데스크톱 브라우저는 Web Share API 미지원이 많으므로 bottom Sheet로 일관된 UI 제공
3. **AbortError 처리**: 사용자가 네이티브 공유를 취소했을 때 Sheet를 열지 않음 (불필요한 fallback 방지)

### 고려한 대안

- **대안 A**: 드롭다운 CSS 수정 (fixed width 등) — 근본적 해결이 아님, 디바이스별 분기 필요
- **대안 B**: Dialog 사용 — Sheet가 모바일에서 더 자연스러운 UX (하단에서 올라오는 패턴)

## 주요 코드 변경

### `src/components/trip/TripActions.tsx`

```tsx
const handleInvite = async () => {
  if (!inviteCode) return;
  const inviteUrl = `${window.location.origin}/join/${inviteCode}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: "Join my TasteRank trip!",
        text: "Join me on TasteRank to rate and rank food together.",
        url: inviteUrl,
      });
      return; // 네이티브 공유 성공
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return; // 사용자 취소
    }
  }
  setShowInvite(true); // fallback: Sheet 열기
};
```

- 기존 `onClick={() => setShowInvite(!showInvite)}` → `onClick={handleInvite}` (async)
- absolute 드롭다운 div 제거 → `<Sheet side="bottom">` + `<SheetContent>` 사용

### `src/components/trip/InviteShare.tsx`

- 외부 카드 컨테이너 제거 (`bg-white`, `rounded-2xl`, `border`, `shadow-lg`, 제목 영역)
- Sheet가 컨테이너 + 제목 역할을 대신하므로 URL 표시 + 복사/공유 버튼만 유지

## 트레이드오프

| 항목 | 장점 | 단점 |
|------|------|------|
| Native Share 우선 | iOS/Android 최적 UX, 코드 간결 | 데스크톱에서는 사용 불가 (fallback 필요) |
| Sheet fallback | 일관된 UI, shadcn 기존 컴포넌트 활용 | InviteShare를 단독 사용 시 컨테이너 없음 |
| AbortError 분기 | 불필요한 Sheet 노출 방지 | 다른 share 에러 시 Sheet fallback 발생 |

## 테스트

- [x] pnpm build 성공 확인
- [ ] iOS Chrome: person_add 탭 → 네이티브 공유 시트 표시
- [ ] macOS Chrome: person_add 클릭 → bottom Sheet 표시 + 복사/공유 동작
- [ ] 네이티브 공유 취소 시 Sheet 미노출 확인

## 후속 작업

- [ ] InviteShare가 Sheet 외부에서 단독 사용되는 곳이 있는지 확인 (현재는 TripActions에서만 사용)
