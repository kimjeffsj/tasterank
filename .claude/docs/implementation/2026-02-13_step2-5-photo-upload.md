# Step 2-5: Photo Upload

> **날짜**: 2026-02-13
> **Phase**: Phase 2 — 핵심 기능
> **관련 체크리스트**: Step 2-5 사진 업로드

---

## 요약

`PhotoUploader` 컴포넌트, `uploadEntryPhotos` 유틸리티를 구현하고 EntryForm에 통합. 트립 상세 페이지에서 엔트리 카드에 사진 표시.

## 접근 방식

### 선택한 방법
- **클라이언트 사이드 업로드**: 브라우저에서 직접 Supabase Storage로 업로드 (API Route 불필요)
- **2단계 저장**: entry 생성 → photo 업로드 (entry ID가 필요하므로 순차)
- **File 객체 관리**: PhotoUploader는 File[] 상태만 관리, 실제 업로드는 폼 제출 시 page에서 처리
- **URL.createObjectURL**: 로컬 프리뷰 (네트워크 불필요)

### 고려한 대안
- **서버 API Route 경유**: 추가 복잡성, Supabase RLS가 이미 인증 처리하므로 불필요
- **즉시 업로드**: 파일 선택 시 바로 업로드 — orphan 파일 문제 (사용자가 폼 취소 시)

## 트레이드오프

| 항목 | 장점 | 단점 |
|------|------|------|
| 클라이언트 직접 업로드 | 단순, 서버 부하 없음 | 대용량 파일에 RLS만으로 제한 |
| 폼 제출 시 업로드 | orphan 파일 없음 | 제출 시간 증가 (사진 수에 비례) |
| maxPhotos=5 기본값 | UX 제한으로 스토리지 관리 | 유연성 부족 |

## 주요 파일 변경

- `src/components/entry/PhotoUploader.tsx` — 사진 선택/프리뷰/제거 컴포넌트
- `src/components/entry/PhotoUploader.test.tsx` — 8개 테스트
- `src/lib/storage.ts` — uploadEntryPhoto, uploadEntryPhotos 유틸리티
- `src/components/entry/EntryForm.tsx` — PhotoUploader 통합, EntryFormData에 photos 필드 추가
- `src/components/entry/EntryForm.test.tsx` — photos 필드 반영
- `src/app/(protected)/trips/[tripId]/entries/new/page.tsx` — 사진 업로드 처리
- `src/app/(public)/trips/[tripId]/page.tsx` — 엔트리 카드에 사진 표시 (food_photos join)

## 테스트

- [x] PhotoUploader 테스트 8개 작성 및 통과
- [x] EntryForm 테스트 11개 photos 필드 반영 후 통과
- 전체 테스트: 43개 모두 통과

## 후속 작업

- [ ] Step 2-6: useRatings 훅 + RatingSlider 평가 UI
