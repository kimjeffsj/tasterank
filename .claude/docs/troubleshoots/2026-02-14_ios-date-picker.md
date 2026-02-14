# iOS Date Picker 크로스 브라우저 렌더링 깨짐

> **날짜**: 2026-02-14
> **Phase**: Phase 3 — UI/UX
> **관련 체크리스트**: TripForm 날짜 입력

---

## 문제

`<input type="date">`가 macOS Chrome에서는 정상이지만 iOS에서 깨지는 현상.

- **macOS Chrome**: `yyyy-mm-dd` placeholder + 캘린더 아이콘 정상 표시
- **iOS Safari/Chrome**: placeholder 없음, 캘린더 아이콘 안 보임, 사이징 불일치
- **1차 수정 시도 (pointer-events-none on input)**: display layer에 `onClick` + native input에 `pointer-events-none` 적용 → macOS에서는 `showPicker()`로 작동했으나, **iOS Chrome에서 picker가 아예 안 열림**. iOS WebKit은 `pointer-events-none`인 input에 대해 `showPicker()`도 무시하는 것으로 확인
- **근본 원인**: WebKit/iOS는 `<input type="date">`의 pseudo-element(`::-webkit-calendar-picker-indicator` 등) 스타일링을 대부분 무시. CSS만으로는 크로스 브라우저 일관성 확보 불가. 또한 iOS WebKit은 `pointer-events-none` input에 대해 프로그래밍 방식 picker 호출도 차단

## 해결 방법

Custom `DateInput` 래퍼 컴포넌트: display layer(시각) + invisible native input(기능) 분리.

### 왜 이 방법인가

1. native OS date picker UX 유지 (iOS spinning wheel, macOS calendar popup)
2. 시각적 완전 제어 — Material Icon + Intl.DateTimeFormat 포맷
3. 의존성 0개 — react-day-picker, shadcn Calendar 등 불필요

### 고려한 대안

- **CSS-only (webkit pseudo-element 스타일링)**: iOS WebKit이 대부분 무시 — 기각
- **shadcn Calendar + react-day-picker**: 의존성 추가, 선택적 shadcn 규칙 위반, 모바일 UX가 native picker보다 나쁨 — 기각
- **레이아웃만 세로 변경**: 핵심 렌더링 문제 해결 안 됨 — 기각

## 주요 코드 변경

### `src/components/ui/DateInput.tsx`

```tsx
export function DateInput({ id, value, onChange, ... }: DateInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    try {
      inputRef.current?.showPicker(); // macOS/Android 명시적 picker 호출
    } catch {
      inputRef.current?.focus();      // 미지원 브라우저 fallback
    }
  };

  return (
    <div className="relative" onClick={handleClick}>
      {/* 시각 레이어 */}
      <div className="... cursor-pointer">
        <span className="material-icons-round">calendar_today</span>
        <span>{value ? formatDate(value) : placeholder}</span>
      </div>
      {/* 투명 native input — opacity-0이지만 pointer-events는 유지 */}
      <input ref={inputRef} type="date" className="... opacity-0 cursor-pointer" />
    </div>
  );
}
```

- **부모 div에 `onClick={handleClick}`**: 컴포넌트 전체 영역 어디를 탭해도 `showPicker()` 호출. display layer, input 영역 구분 없이 동작
- **native input `pointer-events` 유지 (cursor-pointer)**: iOS Chrome에서 `pointer-events-none` input은 `showPicker()`도 무시하므로 반드시 이벤트 수신 가능 상태여야 함. `opacity-0`만으로 시각적 숨김 처리
- **이중 트리거 경로**: macOS는 `onClick` → `showPicker()`로 열리고, iOS는 native input 직접 터치로도 열림. 두 경로가 공존하지만 충돌하지 않음 (이미 열린 picker를 다시 여는 것은 no-op)
- **`showPicker()`**: macOS Chrome/Safari에서 프로그래밍 방식으로 date picker를 여는 API. 미지원 시 `focus()` fallback
- **`formatDate()`**: `Intl.DateTimeFormat` 사용, `new Date(str)` 대신 `split("-")` 파싱으로 timezone offset 버그 방지

### `src/app/globals.css`

```css
input[type="date"].date-input-hidden::-webkit-calendar-picker-indicator {
  opacity: 0;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0; left: 0;
}
```

- iOS WebKit에서 native picker indicator 탭 영역을 input 전체로 확장 (fallback 보험)

### `src/components/trip/TripForm.tsx`

- `<input type="date">` → `<DateInput>` 교체
- start/end 날짜 교차 검증: `max={endDate}`, `min={startDate}`

## 트레이드오프

| 항목 | 장점 | 단점 |
|------|------|------|
| Custom DateInput | 크로스 브라우저 일관성, 0 의존성, native picker UX 유지 | 컴포넌트 하나 추가 |
| showPicker() API | macOS에서 확실한 picker 호출 | 일부 구형 브라우저 미지원 (try-catch fallback 필요) |
| native input pointer-events 유지 | iOS Chrome 호환성 확보, 이중 트리거 경로로 안정성 ↑ | 이론상 더블 트리거 가능하나 실제로는 no-op |
| ~~pointer-events-none on input~~ | ~~더블 트리거 방지~~ | **iOS Chrome에서 picker 안 열림 — 기각** |

## 테스트

- [x] DateInput 단위 테스트 9개 pass (placeholder, 포맷, 아이콘, onChange, label, min/max, value)
- [x] TripForm 기존 테스트 8개 pass (label 연결, 편집 모드 등)
- [x] iOS Chrome 실기기 검증 — `pointer-events-none` 제거 후 정상 작동 확인
- [ ] iOS Safari 실기기 검증
- [ ] macOS Chrome/Safari date picker 열림 확인

## 후속 작업

- [ ] 다크 모드에서 display layer 색상 확인
