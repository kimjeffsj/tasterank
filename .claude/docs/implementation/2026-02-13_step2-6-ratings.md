# Step 2-6: useRatings Hook + Rating UI

> **날짜**: 2026-02-13
> **Phase**: Phase 2 — 핵심 기능
> **관련 체크리스트**: Step 2-6 useRatings 훅 + 평가 UI

---

## 요약

`useRatings` 훅 (CRUD), `RatingSlider` 컴포넌트 (1~10점, 0.5 단위), EntryForm 통합을 구현. 음식 등록 시 평가 점수가 함께 저장됨.

## 접근 방식

### 선택한 방법
- `useRatings` 훅: useEntries 패턴 동일 적용 (fetch, upsert, update, delete)
- `RatingSlider`: shadcn Slider (Radix) 래핑 + 커스텀 디자인 (gradient track, emoji mood)
- 평가 저장: 엔트리 생성과 동시에 ratings 테이블에 insert (Promise.all로 사진 업로드와 병렬)
- 기본 점수: 7 (좋은 쪽으로 편향 — 여행 음식이므로 대부분 긍정적)

### 고려한 대안
- **별도 평가 페이지**: 엔트리 생성 후 따로 평가 — UX 복잡, 한 폼에서 처리가 간편

## 트레이드오프

| 항목 | 장점 | 단점 |
|------|------|------|
| 폼 내 평가 통합 | 한 번에 음식+점수 저장 | 폼이 길어짐 |
| 0.5 단위 | 세밀한 평가 가능 | 슬라이더 조작 정밀도 필요 |
| 기본값 7 | 긍정 편향 (여행 맥락 적합) | 편향된 데이터 가능성 |

## 주요 파일 변경

- `src/hooks/useRatings.ts` — ratings CRUD 훅
- `src/hooks/useRatings.test.ts` — 7개 테스트
- `src/components/entry/RatingSlider.tsx` — 1~10점 슬라이더 + emoji mood
- `src/components/entry/RatingSlider.test.tsx` — 6개 테스트
- `src/components/entry/EntryForm.tsx` — RatingSlider 통합, EntryFormData에 score 필드
- `src/components/entry/EntryForm.test.tsx` — score 필드 반영 + Slider mock
- `src/app/(protected)/trips/[tripId]/entries/new/page.tsx` — 평가 저장 (사진과 병렬)

## 테스트

- [x] useRatings 7개 + RatingSlider 6개 + EntryForm 11개 업데이트
- 전체 테스트: 56개 모두 통과

## 후속 작업

- [ ] Step 2-7: 테스트 보강 + RLS 검증
