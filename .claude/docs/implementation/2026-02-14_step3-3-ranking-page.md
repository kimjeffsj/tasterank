# Step 3-3: Basic Ranking Page

**Date**: 2026-02-14
**Status**: Complete

## What was done

1. **Ranking page** (`src/app/(public)/trips/[tripId]/ranking/page.tsx`) — Server Component
   - Fetches trip info, rankings (from `v_trip_rankings` view), photos, and tags via `anonClient`
   - Builds combined `RankedEntry[]` with photos and tags mapped by entry_id
   - Rounds avg_score to 1 decimal place
   - Sticky header with back button, trip name, and trophy icon

2. **RankingList** (`src/components/ranking/RankingList.tsx`) — Client Component
   - Tag filter pills (horizontal scroll) — filters entries and re-ranks
   - 1st place: full-width hero card, `aspect-[4/5]`, gradient overlay, gold badge
   - 2nd/3rd: side-by-side grid, `aspect-square`, silver/bronze badges
   - Runners-up (4th+): list items with thumbnail, rank number, name, score
   - Empty state with trophy icon
   - Photo fallback icon for entries without photos
   - Graceful handling of null avg_score

3. **Tests** (`src/components/ranking/RankingList.test.tsx`) — 8 tests
   - 1st/2nd/3rd place rendering, runners-up list, tag filtering, "All" reset, empty state, no-photo fallback, null score handling

4. **Trip detail page** — Added pill tabs (Food List / Ranking) between hero and entries section

## Architecture decisions

- **Server Component for data fetching**: Same pattern as trip detail page. anonClient enables public access without auth.
- **Client Component for interactivity**: Tag filtering requires useState, so RankingList is a client component receiving server-fetched data as props.
- **Re-ranking on filter**: When filtering by tag, entries are re-ranked (1, 2, 3...) rather than showing original ranks with gaps.
- **Separate photo/tag queries**: Rather than complex joins on the view, we fetch photos and tags separately and map them. This avoids issues with Supabase view join limitations.

## Files changed

| File | Action |
|------|--------|
| `src/app/(public)/trips/[tripId]/ranking/page.tsx` | New |
| `src/components/ranking/RankingList.tsx` | New |
| `src/components/ranking/RankingList.test.tsx` | New |
| `src/app/(public)/trips/[tripId]/page.tsx` | Modified — pill tabs |
| `.claude/CHECKLIST.md` | Updated |
