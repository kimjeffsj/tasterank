# Step 5-1: AI Follow-up Questions

**Date**: 2026-02-14
**Status**: Complete

## What was done

1. **DB Migration** (`20260214120000_add_ai_questions.sql`)
   - `ai_questions` table: entry_id FK, question_text, question_type (scale/text/choice), options JSONB, question_order
   - `ai_responses` table: question_id FK, user_id FK, response_text, response_value (1-5), UNIQUE(question_id, user_id)
   - RLS: public trip SELECT, member SELECT, editor INSERT, own UPDATE (follows ratings pattern)

2. **Prompt Functions** (added to `src/lib/ai/prompts.ts`)
   - `buildFollowUpPrompt()` — generates 2-3 questions mixing scale/text/choice types
   - `parseFollowUpQuestions()` — JSON parser with validation, limits to 3 questions

3. **API Route** (`/api/ai/follow-up-questions`)
   - POST: auth → validate → Gemini → parse → INSERT ai_questions → return with IDs
   - Graceful degradation: AI failure returns `{ questions: [] }` (200), not 500

4. **Hook** (`useAiQuestions`)
   - `generateQuestions()` — calls API, manages loading/questions state
   - `saveResponses()` — upserts to ai_responses via Supabase client

5. **Component** (`FollowUpQuestions`)
   - Renders per question_type: scale (1-5 circles), text (textarea), choice (pill buttons)
   - Auto-skips when no questions (AI failure = transparent skip)
   - Skip/Done buttons, saves on Done

6. **Integration** (new entry page)
   - Phase state: `"form" | "followup"`
   - After entry creation → phase switches to followup → FollowUpQuestions renders
   - onComplete/onSkip both navigate to trip detail

## Key Decisions

- **Graceful degradation over error display**: AI failure returns empty array, component auto-skips. User never sees an error for optional AI feature.
- **Single API call for generate+save**: API route both generates via Gemini and saves to DB, so client receives questions with IDs ready for response saving.
- **Phase-based rendering**: Used simple state instead of router navigation to avoid losing entry creation context.

## Test Count

- Prompt functions: 12 tests (8 existing + 4 new buildFollowUp + 8 new parseFollowUp = 20 total in file)
- API route: 5 tests
- Hook: 6 tests
- Component: 9 tests
- **Total new: 28 tests**
