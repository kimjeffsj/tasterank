# Step 2-3: useEntries 훅

> **날짜**: 2026-02-11
> **Phase**: Phase 2 — 핵심 기능
> **관련 체크리스트**: Step 2-3 useEntries 훅 + 테스트

---

## 요약

`food_entries` 테이블에 대한 CRUD 훅 `useEntries`를 구현하고 7개 테스트를 작성했다.

## 접근 방식

### 선택한 방법
`useTrips` 패턴을 그대로 따라 `useEntries(tripId)` 형태로 구현. tripId를 필수 파라미터로 받아 해당 트립의 엔트리만 조회한다. 빈 tripId일 경우 fetch를 건너뛴다.

### 고려한 대안
- **Zustand 스토어**: 전역 상태 관리 — 아직 여러 컴포넌트 간 공유 필요 없으므로 훅으로 충분
- **React Query**: 캐싱/재검증 — 현재 규모에서 과도, 나중에 필요시 마이그레이션

## 트레이드오프

| 항목 | 장점 | 단점 |
|------|------|------|
| useTrips 패턴 재사용 | 일관성, 학습 비용 없음 | refetch마다 전체 재조회 |
| tripId 빈 문자열 가드 | 불필요한 API 호출 방지 | 추가 분기 |

## 주요 파일 변경

- `src/hooks/useEntries.ts` — useEntries 훅 (list, create, update, delete, refetch)
- `src/hooks/useEntries.test.ts` — 7개 테스트 (fetch, empty tripId, error, create, update, delete, create error)

## 테스트

- [x] 7개 테스트 작성 및 통과
- 커버리지: 훅 전체 경로 커버 (정상/에러/가드)

## 후속 작업

- [ ] Step 2-4: EntryForm 컴포넌트 (이 훅을 사용하는 UI)
- [ ] Step 2-5: 사진 업로드 통합
