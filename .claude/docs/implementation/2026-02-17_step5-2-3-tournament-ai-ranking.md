# Step 5-2/5-3: Tournament (mark complete) + AI Composite Ranking

**Date**: 2026-02-17
**Phase**: 5 — Advanced Features
**Status**: Complete

## Summary

- Marked Step 5-2 (이상형 월드컵) as complete in checklist
- Implemented Step 5-3: AI composite ranking system

## What Was Built

### DB Migration (`20260217070000_add_ai_rankings.sql`)
- `ai_rankings` table with JSONB `ranking_data`, `weights_used`, `generated_at`
- RLS: public SELECT for public trips, member SELECT for private, editor INSERT/DELETE

### Ranking Engine (`src/lib/ai/ranking-engine.ts`)
- Pure functions: `normalizeWinRate`, `normalizeAiResponseAvg`, `computeCompositeScore`
- Types: `ScoreWeights`, `ScoreBreakdown`, `RankingEntry`
- `DEFAULT_WEIGHTS`: user_score 40%, tournament 25%, ai_questions 20%, sentiment 15%
- 14 tests

### AI Prompt (`src/lib/ai/prompts.ts`)
- `buildRankingPrompt()` — batches entries with reviews + AI responses for sentiment analysis
- `parseRankingResponse()` — extracts `{entry_id, sentiment_score, ai_comment}` array
- Reviews truncated: max 5 per entry, 200 chars each
- 8 new tests (28 total in prompts.test.ts)

### API Route (`/api/ai/generate-ranking`)
- Auth check → editor permission → fetch all data → Gemini sentiment → compute composite → save
- Graceful degradation: if Gemini fails, uses sentiment_score=5 + generic comment
- 6 tests

### UI Updates
- `RankedEntry` interface extended with `composite_score`, `ai_comment`, `breakdown`
- `auto_awesome` icon (purple) replaces `star` icon when AI score available
- `GenerateRankingButton` — gradient purple/indigo, Lazy Auth, loading state
- Ranking page fetches `ai_rankings`, merges + re-sorts by composite score
- Shows "AI Score generated <timestamp>" when available
- 6 tests for GenerateRankingButton

## Key Decisions

| Decision | Chosen | Alternative | Why |
|----------|--------|-------------|-----|
| Store ranking as JSONB | Single row with array | Normalized table per entry | Simpler queries, atomic update, ranking is always regenerated as a whole |
| Sentiment via single Gemini call | Batch all entries | Per-entry calls | Token efficient, lower latency |
| Fallback on AI failure | Default score 5.0 | Return error | Better UX — partial data is better than no ranking |
| Manually added type to database.ts | Added ai_rankings type block | Run supabase gen types | Can't run db push without Supabase instance; will regenerate on next push |

## Test Coverage
- ranking-engine: 14 tests
- prompts (new): 8 tests
- generate-ranking route: 6 tests
- GenerateRankingButton: 6 tests
- Total new: 34 tests (64 total across modified suites)

## Commit Message Suggestion
```
feat: add AI composite ranking (Step 5-3)
- Weighted scoring: user avg 40%, tournament 25%, AI Q&A 20%, sentiment 15%
- Gemini sentiment analysis with graceful degradation
- Generate/Regenerate AI Ranking button with Lazy Auth
- 34 new tests
```
