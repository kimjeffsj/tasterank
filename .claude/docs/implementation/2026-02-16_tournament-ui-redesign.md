# Tournament UI Redesign — 세로 풀카드 스택

> **날짜**: 2026-02-16
> **Phase**: Phase 5 — UI Polish
> **관련 체크리스트**: 토너먼트 월드컵 UI 리디자인

---

## 요약

토너먼트 투표 UI를 2컬럼 side-by-side 그리드에서 **세로 풀폭 카드 스택** 디자인으로 전면 재작성. 다크 배경 몰입형 레이아웃, 세그먼트 프로그레스 바, VS 뱃지, 태그 뱃지를 추가했다.

## 접근 방식

### 선택한 방법
레퍼런스 스크린샷 기반으로 5개 파일을 순차 수정: hook 데이터 확장 → 헤더 → 매치카드 → 페이지 레이아웃 → 테스트. 매치 진행 중일 때와 비매치 상태(노 토너먼트, 완료, 로딩)를 별도 렌더 분기로 분리하여 매치 뷰의 몰입감을 극대화.

### 고려한 대안
- **대안 A: 기존 2컬럼 유지 + 스타일만 변경** — 모바일에서 사진이 작아져 음식 비교가 어렵고 레퍼런스 디자인과 차이가 큼. 기각.
- **대안 B: Swipe 카드 (Tinder 스타일)** — UX 매력적이지만 두 옵션을 동시에 비교할 수 없어 월드컵 투표 맥락에 부적합. 기각.
- **대안 C: `tag_name` 대신 `restaurant_name`을 뱃지로 사용** — 추가 쿼리 불필요하지만, 태그가 음식 카테고리(Japanese, Italian 등)를 표현하여 시각적 정보량이 더 높음. `food_entry_tags` join 채택.

## 트레이드오프

| 항목 | 장점 | 단점 |
|------|------|------|
| 세로 풀카드 스택 | 사진 크게 표시, 모바일 최적, 몰입감 | 태블릿/데스크톱에서 공간 비효율 (max-w-md로 제한) |
| 다크 배경 (bg-gray-950) 하드코딩 | 항상 몰입형 UI 보장, 라이트/다크 모드 무관 | 앱 전체 테마와 불일치 가능 (의도적 — 월드컵은 특수 모드) |
| 세그먼트 프로그레스 바 | 직관적인 매치 진행률 표시, 개별 매치 완료 시각화 | totalMatches가 많으면 (16+) 세그먼트가 너무 얇아짐 |
| `food_entry_tags` join 추가 | 태그 뱃지로 음식 카테고리 표시 가능 | 쿼리 복잡도 증가, 태그 없는 엔트리는 뱃지 미표시 |
| 매치/비매치 렌더 분기 분리 | 매치 뷰 전용 레이아웃 최적화 | 페이지 컴포넌트 코드량 증가, 조건부 렌더링 복잡도 |

## 주요 파일 변경

- `src/hooks/useTournament.ts` — `TournamentEntryInfo`에 `tag_name: string | null` 추가, fetch 시 `food_entry_tags(tags(name))` join
- `src/components/tournament/TournamentHeader.tsx` — 세그먼트 프로그레스 바, X 닫기 버튼, "TASTERANK WORLD CUP" 타이틀, `onClose` prop 추가
- `src/components/tournament/MatchCard.tsx` — 2컬럼 그리드 → 세로 `flex-col` 풀카드 스택, `aspect-[4/3]` 사진, gradient 오버레이, 태그 뱃지, VS 뱃지 (white + primary border)
- `src/app/(protected)/trips/[tripId]/tournament/page.tsx` — 기존 `Header` 제거, `SimpleHeader`(비매치)와 `TournamentHeader`(매치) 분리, 전체 `bg-gray-950`, 하단 "Tap your favorite to advance" CTA
- `src/components/tournament/MatchCard.test.tsx` — 테스트 픽스처에 `tag_name` 추가, 태그 뱃지 렌더링 테스트 추가

## 테스트

- [x] 기존 테스트 전체 통과 (30/30)
- [x] 태그 뱃지 렌더링 테스트 추가
- [x] `pnpm build` 타입 체크 통과
- 커버리지 영향: 미미 (기존 테스트 구조 유지, 태그 테스트 1건 추가)

## 빌드 이슈

- `currentMatch.entryB`가 `string | null` 타입인데, `isActiveMatch` 가드에서 `!== null` 체크 후에도 TS가 narrowing하지 못함 → non-null assertion (`!`) 사용으로 해결

## 후속 작업

- [ ] 투표 시 카드 선택 애니메이션 (선택된 카드 scale-up + 미선택 fade-out)
- [ ] 라운드 전환 시 트랜지션 애니메이션
- [ ] totalMatches > 16일 때 세그먼트 바 대안 검토 (숫자 표시 등)
- [ ] `TournamentResults` 컴포넌트도 다크 테마 맞춤 스타일링
