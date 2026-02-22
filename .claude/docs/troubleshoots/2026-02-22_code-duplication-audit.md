# 코드 중복 및 미사용 코드 전체 감사

> **날짜**: 2026-02-22
> **Phase**: 리팩토링 사전 감사
> **관련 체크리스트**: 코드 품질 개선

---

## 문제

코드베이스 전반을 감사한 결과 8개 항목의 중복/미사용 코드 확인. 각 항목은 우선순위별로 분류.

---

## 🔴 High Priority

### 1. AI 랭킹 생성 로직 중복

- **파일 A**: `src/app/api/ai/generate-ranking/route.ts` (수동 생성, 208줄)
- **파일 B**: `src/app/api/cron/generate-rankings/route.ts` (크론잡, 255줄)
- **중복 규모**: 핵심 로직 ~100줄 거의 동일

**중복 블록:**

| 로직 | 수동 라우트 | 크론 라우트 |
|------|------------|------------|
| `v_entry_avg_scores` 조회 | L51-64 | L84-99 |
| 토너먼트 wins + winCounts 빌드 | L66-85 | L102-121 |
| AI 응답 + aiResponseMap 빌드 | L88-110 | L124-152 |
| 리뷰 + reviewMap 빌드 | L113-124 | L155-166 |
| 프롬프트 인풋 빌드 | L127-135 | L169-177 |
| Gemini 호출 + 감성 파싱 | L138-154 | L180-196 |
| Composite Score 계산 + 정렬 | L157-187 | L199-233 |

**차이점 (엣지만 다름):**
- 수동 라우트: `createRouteClient()` + 유저 인증 + 멤버십 체크, `delete+insert` 방식
- 크론 라우트: `anonClient` + `CRON_SECRET` 베어러 토큰, `rpc("upsert_ai_ranking")` 방식, `after()` 백그라운드 + 배치 동시성(3)

**해결 방안**: `src/lib/ai/ranking-service.ts`에 `generateRankingData(tripId, supabase)` 함수 추출. 두 라우트는 auth/DB write 로직만 보유.

**현재 리스크**: 버그 수정 시 두 라우트를 동시에 수정해야 하며 한쪽 놓칠 가능성 높음.

---

### 2. 토너먼트 생성 로직 중복

- **파일 A**: `src/app/api/tournament/create/route.ts` (API 라우트, 101줄)
- **파일 B**: `src/hooks/useTournament.ts` (인증 유저 경로, L304-369)

**참고**: Hook의 데모 모드(L280-302)는 API 라우트를 `fetch`로 호출하므로 중복 아님.

**중복 블록 (인증 유저 경로):**

| 로직 | API 라우트 | Hook |
|------|-----------|------|
| `food_entries` 조회 | L44-58 | L313-320 |
| avg scores + scoreMap 빌드 | L61-75 | L323-332 |
| 시드 배정 + 브래킷/라운드 계산 | L77-80 | L334-342 |
| `tournaments` 테이블 인서트 | L82-94 | L344-356 |

**공통 사용 중인 유틸**: `calculateBracketSize`, `seedEntries`, `calculateRounds` (`@/lib/tournament/bracket`) — 이미 분리되어 있음.

**해결 방안**: Supabase 쿼리 + 인서트 로직을 `src/lib/tournament/create-tournament.ts`에 공통 함수로 추출.

---

## 🟡 Medium Priority

### 3. 미사용 패키지 및 UI 컴포넌트

**패키지 (package.json에 존재, 앱 코드에서 0회 import):**
- `react-hook-form: ^7.71.1`
- `@hookform/resolvers: ^5.2.2`
- `zod: ^4.3.6`

**미사용 UI 컴포넌트:**
- `src/components/ui/form.tsx` — shadcn 보일러플레이트로 추가됐으나 앱에서 한 번도 import 안 됨
- `src/components/ui/label.tsx` — 동일

**현황**: 앱의 모든 폼(`EntryForm.tsx`, `TripForm.tsx`)은 순수 `useState`로 구현됨.

**해결 방안**: 패키지 3개 + 컴포넌트 2개 삭제.

---

### 4. lucide-react 규칙 위반

**CLAUDE.md 규칙**: "Material Icons Round만 사용"

**실제 사용:**
- `src/components/ui/dialog.tsx` L4: `import { XIcon } from "lucide-react"`
- `src/components/ui/sheet.tsx` L4: `import { XIcon } from "lucide-react"`

shadcn 컴포넌트 추가 시 자동으로 포함된 것. `lucide-react` 패키지가 이 두 파일에서만 사용됨.

**해결 방안**: 두 파일의 `XIcon`을 `<span className="material-icons-round">close</span>`으로 교체 후 `lucide-react` 패키지 삭제.

---

### 5. 훅 보일러플레이트 중복

5/6 데이터 패칭 훅이 동일한 패턴:

```ts
const [data, setData] = useState<T[]>([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  fetchData()
}, [deps])
```

**해당 훅**: `useTrips`, `useEntries`, `useRatings`, `useTags`, `useTournament`, `useProfile`(약간 변형)

**예외**: `useAiQuestions` — `useEffect` 자동 패치 없음, 수동 트리거 방식.

**해결 방안**: `useSupabaseQuery<T>` 커스텀 훅 추출.

**주의**: SWR/React Query 도입은 현재 규모(6개 훅)에서 과도. 최소 추상화 원칙 적용.

---

## 🟢 Low Priority

### 6. 이미지 폴백 UI 중복

`restaurant` Material Icon 폴백이 8개 파일, 12개 인스턴스에 분산:

| 파일 | 인스턴스 수 | 스타일 |
|------|------------|--------|
| `src/components/trip/TripCardGrid.tsx` L40-42 | 1 | `text-primary/20 text-7xl` |
| `src/components/trip/TripCardCompact.tsx` L40-42 | 1 | `text-primary/40 text-2xl` |
| `src/components/tournament/MatchCard.tsx` L64 | 1 | 별도 스타일 |
| `src/components/tournament/TournamentResults.tsx` L47, L91, L138, L185 | 4 | 별도 스타일 |
| `src/components/entry/EntryGridWithBadges.tsx` L99 | 1 | 별도 스타일 |
| `src/components/ranking/RankingList.tsx` L174, L254, L319 | 3 | 별도 스타일 |
| `src/components/profile/ProfileContent.tsx` L175 | 1 | 별도 스타일 |
| `src/app/(public)/page.tsx` L23 | 1 | 별도 스타일 |

**해결 방안**: `<EntryImage>` 또는 `<ImageWithFallback>` 공통 컴포넌트 추출. 크기/스타일은 props로 받음.

---

### 7. formatDateRange 함수 중복

두 파일에 문자 그대로 동일한 함수 정의:

- `src/components/trip/TripCardGrid.tsx` L10
- `src/components/trip/TripCardCompact.tsx` L10

**해결 방안**: `src/lib/utils/date.ts`로 이동 후 import.

---

### 8. generateMetadata 중복

두 페이지에서 타이틀만 다르고 동일한 로직:

- `src/app/(public)/trips/[tripId]/page.tsx` L11-33
- `src/app/(public)/trips/[tripId]/ranking/page.tsx` L11-33

**공통 패턴**: `anonClient`로 trip 조회 → OG 태그 생성 → cover_image_url 폴백

**차이**: 랭킹 페이지는 타이틀에 `Rankings` suffix 추가.

**해결 방안**: `src/lib/metadata/trip.ts`에 `generateTripMetadata(tripId, titleSuffix?)` 헬퍼 추출.

---

## 우선순위별 요약

| 우선순위 | 항목 | 예상 효과 |
|---------|------|----------|
| 🔴 High | AI 랭킹 로직 추출 | 버그 싱크 리스크 제거 |
| 🔴 High | 토너먼트 생성 로직 추출 | 버그 싱크 리스크 제거 |
| 🟡 Medium | 미사용 패키지/컴포넌트 삭제 | 번들 사이즈 감소, 의존성 정리 |
| 🟡 Medium | lucide-react 제거 | CLAUDE.md 규칙 준수 |
| 🟡 Medium | useSupabaseQuery 추출 | 훅 코드 50% 감소 |
| 🟢 Low | ImageWithFallback 컴포넌트 | UI 일관성 |
| 🟢 Low | formatDateRange → utils | 단순 DRY |
| 🟢 Low | generateTripMetadata 헬퍼 | 단순 DRY |

## 후속 작업

- [ ] #1: AI 랭킹 서비스 함수 추출 (`src/lib/ai/ranking-service.ts`)
- [ ] #2: 토너먼트 생성 함수 추출 (`src/lib/tournament/create-tournament.ts`)
- [ ] #3: 미사용 패키지 삭제 (`pnpm remove react-hook-form @hookform/resolvers zod`)
- [ ] #4: lucide-react 교체 및 삭제 (`pnpm remove lucide-react`)
- [ ] #5: `useSupabaseQuery` 추출
- [ ] #6: `ImageWithFallback` 컴포넌트 생성
- [ ] #7: `formatDateRange` → `src/lib/utils/date.ts`
- [ ] #8: `generateTripMetadata` 헬퍼 추출
