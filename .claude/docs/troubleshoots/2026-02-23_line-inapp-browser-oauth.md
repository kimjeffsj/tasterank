# LINE 인앱 브라우저 Google OAuth 차단 + 로그인 후 리다이렉트 소실

> **날짜**: 2026-02-23
> **Phase**: Auth UX — 인증 흐름 개선
> **관련 체크리스트**: OAuth / 공유 링크 UX

---

## 문제

LINE으로 링크를 공유했을 때 두 가지 UX 문제 발생.

- **LINE 인앱 브라우저**: "Access Blocked: TasteRank's request does not comply with Google's policies" 오류. LINE의 내장 WebView는 Google의 Secure Browser Policy를 충족하지 않아 OAuth 자체가 차단됨.
- **로그인 후 리다이렉트 소실**: 다른 브라우저로 링크를 열었을 때, 비로그인 상태에서 로그인을 완료하면 원래 보던 페이지가 아닌 홈(`/`)으로 이동함.
- **근본 원인 1**: Google은 인앱 WebView에서의 OAuth를 정책으로 차단. 우회 불가.
- **근본 원인 2**: `signInWithGoogle()`의 `redirectTo`가 `next` 파라미터 없이 `/auth/callback`으로만 고정되어 있어, 콜백 라우트가 항상 `/`로 리다이렉트.

## 해결 방법

인앱 브라우저는 배너로 감지·안내하고, 리다이렉트는 `next` 파라미터로 복원.

### 왜 이 방법인가

1. **인앱 브라우저 차단은 Google 정책** — 클라이언트 측에서 OAuth 자체를 우회하는 것은 불가능. 사용자가 외부 브라우저로 직접 열도록 안내하는 것이 유일한 선택지.
2. **배너(비차단 방식)** — 뷰어 기능은 인앱 브라우저에서도 동작하므로(비로그인 열람 가능) 전체 차단이 아닌 안내 배너가 적절.
3. **`next` 파라미터** — `/auth/callback` 라우트는 이미 `next` 쿼리 파라미터를 처리하는 코드가 존재. `signInWithGoogle`에서 현재 `pathname + search`를 인코딩해 전달하는 것만으로 해결.

### 고려한 대안

- **인앱 브라우저 전체 페이지 차단(full overlay)**: 뷰어 기능도 사용 불가해져 UX 악화 — 기각
- **LINE URL 스킴(`lineapp://browser?url=...`)으로 외부 브라우저 강제 오픈**: LINE 측 정책으로 인해 일반 웹에서 호출 불가 — 기각
- **`signInWithGoogle`에 `next` 인자 추가**: 컨텍스트 인터페이스 변경 필요. `window.location`을 함수 내에서 직접 읽는 방식이 더 단순 — 기각

## 주요 코드 변경

### `src/components/auth/AuthProvider.tsx`

```tsx
const signInWithGoogle = useCallback(async () => {
  const next = window.location.pathname + window.location.search;
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
}, [supabase]);
```

- `window.location.pathname + search`를 `next`로 인코딩해 콜백에 전달
- 콜백 라우트(`/auth/callback/route.ts`)는 기존 코드 그대로 `next` 파라미터 처리

### `src/components/auth/InAppBrowserBanner.tsx` (신규)

```tsx
export function detectInAppBrowser(ua: string): string | null {
  // LINE, Facebook, Instagram, KakaoTalk UA 패턴 감지
}

export function InAppBrowserBanner() {
  // useEffect로 UA 감지 → 인앱이면 하단 배너 표시
  // Android: intent:// 스킴으로 Chrome 열기 버튼
  // iOS: "··· → Open in browser" 안내 + Copy link 버튼
}
```

### `src/app/layout.tsx`

```tsx
<ThemeProvider>
  <AuthProvider>{children}</AuthProvider>
  <InAppBrowserBanner />   {/* ThemeProvider 안, body 최하단 */}
</ThemeProvider>
```

## 트레이드오프

| 항목 | 장점 | 단점 |
| ---- | ---- | ---- |
| 배너(비차단) | 뷰어 기능 유지, 덜 침습적 | 로그인 없이 보기만 하는 사용자는 배너를 계속 봄 |
| 전체 차단 오버레이 | 메시지 명확 | 비로그인 뷰어도 사용 불가 |
| Android intent:// | 직접 Chrome 오픈 가능 | Chrome 미설치 시 실패, LINE 버전에 따라 동작 상이 |
| iOS Copy link | 항상 동작 | 사용자가 직접 붙여넣기해야 함 |

## 테스트

- [x] `detectInAppBrowser` — LINE/Facebook/Instagram/KakaoTalk 감지, 일반 브라우저 null 반환
- [x] 일반 브라우저에서 배너 미노출
- [x] LINE iOS UA에서 배너 및 iOS 안내 텍스트 노출
- [x] LINE Android UA에서 "Open in Chrome" 버튼 노출
- [x] Dismiss 버튼으로 배너 닫기
- [x] Copy link 버튼 → clipboard.writeText 호출
- [x] 복사 후 "Copied!" 상태 표시
- [x] `signInWithGoogle` — redirectTo에 `?next=` 포함 확인

## 후속 작업

- [ ] Instagram, KakaoTalk 실기기 테스트 (UA 패턴 추가 필요 시)
- [ ] iOS LINE에서 `intent://` 대체 방안 검토 (`x-safari-...` 스킴 등)
- [ ] 배너 dismiss 상태를 `sessionStorage`에 저장해 새로고침 후에도 유지 고려
