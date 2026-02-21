Food Entry Detail Page Implementation Plan

Context

Trip 내에서 개별 음식 항목의 상세 페이지가 존재하지 않음. 현재 entry들은 trip detail
페이지에서 카드 그리드로만 표시되고, 클릭 불가. 이 페이지는 음식 사진 캐러셀, 평균
점수, 태그, AI Verdict, 멤버 리뷰 목록, 즐겨찾기/공유/리뷰 작성 기능을 포함하는 상세
뷰를 구현한다.

Step 1: DB Migration — favorites 테이블

파일: supabase/migrations/YYYYMMDD_add_favorites.sql

CREATE TABLE public.favorites (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
entry_id UUID NOT NULL REFERENCES public.food_entries(id) ON DELETE CASCADE,
created_at TIMESTAMPTZ DEFAULT NOW(),
UNIQUE(user_id, entry_id)
);
-- 인덱스 + RLS (SELECT: public entries visible, INSERT/DELETE: own user only)

완료 후: pnpm exec supabase db push → pnpm exec supabase gen types typescript >
src/types/database.ts

Step 2: useFavorites Hook (TDD)

파일: src/hooks/useFavorites.ts, src/hooks/useFavorites.test.ts

- useFavorites(entryId) → { isFavorited, loading, toggleFavorite }
- mount 시 로그인 유저면 favorites 체크, 비로그인이면 false
- toggleFavorite() — insert 또는 delete

Step 3: Server Component — Entry Detail Page

파일: src/app/(public)/trips/[tripId]/entries/[entryId]/page.tsx

Server Component로 createAnonClient()를 사용해 5개 병렬 쿼리:

쿼리: Entry + trip 유효성
소스: food_entries + trips!inner join
────────────────────────────────────────
쿼리: Photos
소스: food_photos (display_order ASC)
────────────────────────────────────────
쿼리: Tags
소스: food_entry_tags + tags(id, name, category) join
────────────────────────────────────────
쿼리: Ratings + 프로필
소스: ratings + profiles!user_id(display_name, avatar_url) join
────────────────────────────────────────
쿼리: AI Verdict
소스: ai_rankings (최신 1건) → ranking_data JSONB에서 해당 entry의 ai_comment 추출

- 평균 점수: ratings 배열에서 서버사이드 계산
- generateMetadata: title, description, OG image (첫 번째 사진)
- entry 없으면 notFound() 호출

파일: src/app/(public)/trips/[tripId]/entries/[entryId]/loading.tsx — Skeleton UI

Step 4: Presentational Components

src/components/entry/AiVerdictCard.tsx

- Props: aiComment: string | null
- null이면 렌더링 안함
- 스타일: bg-gradient-to-br from-primary/10 to-primary/5 rounded-[2rem]

src/components/entry/ReviewCard.tsx

- Props: displayName, avatarUrl, score, reviewText, createdAt
- 아바타 + 이름, 점수 뱃지, 리뷰 텍스트, 상대 시간

Step 5: PhotoCarousel

파일: src/components/entry/PhotoCarousel.tsx (Client Component)

- overflow-x-auto snap-x snap-mandatory no-scrollbar h-[400px]
- 스크롤 기반 pagination dots
- Floating header: back 버튼 (뒤로가기), share 버튼, favorite 버튼
- Glassmorphism: bg-white/20 backdrop-blur-md rounded-full
- Curved bottom overlay: rounded-t-[2rem]
- 사진 없으면 gradient placeholder

Step 6: FavoriteButton

파일: src/components/entry/FavoriteButton.tsx (Client Component)

- useFavorites + useAuth 사용
- 비로그인 시 LoginPrompt 모달 표시
- 아이콘: favorite (filled, red) / favorite_border (outline)

Step 7: ReviewDialog

파일: src/components/entry/ReviewDialog.tsx (Client Component)

- shadcn Dialog 사용
- RatingSlider 컴포넌트 재사용 (src/components/entry/RatingSlider.tsx)
- <textarea> for review text
- 기존 리뷰 있으면: "Edit Review" 타이틀 + 기존 score/text 프리필
- 새 리뷰: "Add Review" 타이틀 + score 기본값 5
- 저장: useRatings(entryId) — 새 리뷰는 upsertRating(), 수정은 updateRating(id, ...)
- 성공 후 router.refresh()로 서버 데이터 갱신

Step 8: EntryDetailClient — Main Orchestrator

파일: src/components/entry/EntryDetailClient.tsx (Client Component)

서버에서 받은 모든 data를 props로 받아 전체 레이아웃 렌더링:

1.  PhotoCarousel — 사진 + floating 버튼 (back/share/favorite)
2.  Title block + score badge (bg-primary text-white rounded-xl)
3.  Tags row (bg-orange-100 text-orange-700 rounded-full)
4.  AiVerdictCard
5.  Member Reviews — 처음 3개 표시, "See All (N)" 토글
6.  ReviewCard 리스트
7.  Bottom action bar (fixed) — "Add Review" / "Edit Review" 버튼

State 관리:

- useAuth() — 현재 유저 확인
- ReviewDialog open/close
- LoginPrompt open/close
- 현재 유저의 기존 rating 찾기 (ratings.find(r => r.user_id === user?.id))

Share 구현: navigator.share() → fallback navigator.clipboard.writeText()
(기존 TripActions.tsx 패턴 참고)

Step 9: Entry 카드에 링크 추가

파일: src/app/(public)/trips/[tripId]/page.tsx

기존 entry 카드 <div>를 <Link href={/trips/${tripId}/entries/${entry.id}}> 또는 <a>
로 래핑.

Step 10: Tests

각 컴포넌트 .test.tsx를 같은 디렉토리에 작성 (기존 패턴 따름)

주요 재사용 파일

파일: src/hooks/useRatings.ts
용도: 리뷰 CRUD
────────────────────────────────────────
파일: src/hooks/useTags.ts
용도: 태그 fetch (참고용, 서버에서 이미 fetch)
────────────────────────────────────────
파일: src/components/entry/RatingSlider.tsx
용도: ReviewDialog 내 점수 슬라이더
────────────────────────────────────────
파일: src/components/layout/Skeleton.tsx
용도: 로딩 상태
────────────────────────────────────────
파일: src/app/(public)/trips/[tripId]/page.tsx
용도: anonClient + profiles join 패턴
────────────────────────────────────────
파일: src/app/(public)/trips/[tripId]/ranking/page.tsx
용도: AI ranking data 추출 패턴
────────────────────────────────────────
파일: src/components/trip/TripActions.tsx
용도: Share API 패턴

참고사항

- Score 타입: DB는 INT(1-10), RatingSlider는 step=0.5 → PostgreSQL이 INT로 반올림.
  기존 동작과 동일하게 유지.
- BottomNav: /trips/[tripId]/entries/\* 경로에서 이미 자동 숨김 처리됨.
- Private trip: anonClient로 접근 불가 → 자동 404 (기존 패턴과 동일).

Verification

1.  pnpm exec supabase db push — migration 적용 확인
2.  pnpm dev → /trips/{tripId} 에서 entry 카드 클릭 → detail 페이지 이동 확인
3.  사진 캐러셀 스와이프 + dots 동작 확인
4.  비로그인 상태에서 "Add Review" 클릭 → LoginPrompt 표시 확인
5.  로그인 후 리뷰 작성 → 목록에 반영 확인
6.  기존 리뷰 있을 때 "Edit Review" → 프리필 + 수정 확인
7.  즐겨찾기 토글 확인 (로그인/비로그인)
8.  Share 버튼 → native share 또는 clipboard 복사 확인
9.  pnpm test — 전체 테스트 통과
