# Step 2-4: EntryForm Component

> **날짜**: 2026-02-13
> **Phase**: Phase 2 — 핵심 기능
> **관련 체크리스트**: Step 2-4 음식 등록 폼 UI

---

## 요약

음식 등록/수정을 위한 `EntryForm` 컴포넌트와 `/trips/[tripId]/entries/new` 페이지를 구현. TDD로 테스트 11개 먼저 작성 후 구현.

## 접근 방식

### 선택한 방법
- TripForm 패턴을 따라 동일한 구조로 EntryForm 구현 (일관성)
- 필수 필드: food name만 required, 나머지 optional
- DESIGN.md 7.4 섹션의 "Add Food" 레이아웃 참고하되 사진/평점은 Step 2-5, 2-6에서 추가

### 고려한 대안
- **shadcn Form 사용**: react-hook-form + zod — 현재 필드가 4개로 단순하여 useState로 충분. 복잡해지면 전환 가능.

## 트레이드오프

| 항목 | 장점 | 단점 |
|------|------|------|
| useState 방식 | 단순, 의존성 없음 | 복잡한 validation에는 부적합 |
| 사진/평점 분리 | 단계적 구현, 작은 PR | 폼 완성까지 여러 단계 필요 |

## 주요 파일 변경

- `src/components/entry/EntryForm.tsx` — 음식 등록 폼 (title, restaurant, location, description)
- `src/components/entry/EntryForm.test.tsx` — 11개 테스트 (렌더링, 제출, 검증, 편집, 에러)
- `src/app/(protected)/trips/[tripId]/entries/new/page.tsx` — 새 음식 등록 페이지

## 테스트

- [x] 11개 테스트 작성 및 통과
- 전체 테스트: 35개 모두 통과

## 후속 작업

- [ ] Step 2-5: PhotoUploader 컴포넌트 + EntryForm 사진 통합
- [ ] Step 2-6: RatingSlider + 평가 통합
