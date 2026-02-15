# Step 4-2: 반응형 UI

## Context

TasteRank is a mobile-first PWA. Per DESIGN.md, desktop simply centers the mobile layout with `max-w-md mx-auto`. Dark mode CSS variables and many `dark:` classes already exist, but there's no toggle or system preference detection. Loading/error/empty states are handled inline with no Next.js file conventions (loading.tsx, error.tsx, not-found.tsx).

## 1. Dark Mode Support

### 1a. ThemeProvider + Toggle

- Create `src/components/layout/ThemeProvider.tsx` ("use client")
  - On mount: read `localStorage('theme')` → fallback to `prefers-color-scheme` → fallback to `'light'`
  - Apply/remove `dark` class on `<html>` element
  - Expose `theme` and `toggleTheme` via React context
- Add dark mode toggle button to **HomePage header** (sun/moon icon)
- Add dark mode toggle to **Profile page** (placeholder page, add a settings section)
- Update `src/app/layout.tsx`:
  - Add `suppressHydrationWarning` on `<html>` tag
  - Add inline `<script>` in `<head>` to set `dark` class before paint (prevent flash)
  - Wrap `{children}` with `<ThemeProvider>`

### 1b. Fix Missing dark: Classes

Pages/components missing dark mode variants:
- **HomePage** (`src/app/(public)/page.tsx`): header `bg-background-light/90` → add `dark:bg-background-dark/90`, text colors, empty state
- **TripDetailPage**: hero section already good, but entry card text needs `dark:text-white`
- **RankingList** (`src/components/ranking/RankingList.tsx`): runner-up items `bg-white` → add `dark:bg-surface-dark`
- **EntryForm**, **TripForm**: already have extensive dark: classes ✅
- **JoinTripPage**: check and fix dark variants
- **Placeholder pages** (search, saved, profile): add dark variants
- **OfflinePage**: add dark variants

## 2. Mobile Layout Check

Per DESIGN.md §10: Mobile-first, desktop = `max-w-md` centered. No complex desktop breakpoints needed.

- Verify all pages use consistent `mx-auto w-full max-w-md min-h-screen` pattern
- Add `shadow-2xl` on desktop viewport for the centered container (optional enhancement per DESIGN.md)
- Ensure touch targets are ≥ 44px
- Verify safe area padding (`pb-24`) for BottomNav pages

This is mostly a verification pass — the current mobile layout is already well-structured.

## 3. Loading / Error / Empty State UI

### 3a. Reusable EmptyState Component

Create `src/components/layout/EmptyState.tsx`:
- Props: `icon`, `title`, `description`, `action?` (optional CTA button)
- Consistent styling with dark mode support
- Replace inline empty states in HomePage, TripDetailPage, RankingList

### 3b. Next.js File Conventions

Create these files for automatic route-level states:

- `src/app/loading.tsx` — Global loading (simple spinner/pulse)
- `src/app/error.tsx` — Global error boundary ("use client", retry button)
- `src/app/not-found.tsx` — Global 404 page
- `src/app/(public)/trips/[tripId]/loading.tsx` — Trip detail skeleton
- `src/app/(public)/trips/[tripId]/ranking/loading.tsx` — Ranking skeleton

### 3c. Skeleton Component

Create `src/components/layout/Skeleton.tsx`:
- Simple animated placeholder (pulse animation)
- Composable: `<Skeleton className="h-4 w-32" />`

## Files to Create/Modify

**Create:**
- `src/components/layout/ThemeProvider.tsx`
- `src/components/layout/EmptyState.tsx`
- `src/components/layout/Skeleton.tsx`
- `src/app/loading.tsx`
- `src/app/error.tsx`
- `src/app/not-found.tsx`
- `src/app/(public)/trips/[tripId]/loading.tsx`
- `src/app/(public)/trips/[tripId]/ranking/loading.tsx`

**Modify:**
- `src/app/layout.tsx` — ThemeProvider wrapper + hydration script
- `src/app/(public)/page.tsx` — dark mode fixes, use EmptyState
- `src/app/(public)/trips/[tripId]/page.tsx` — dark mode fixes, use EmptyState
- `src/components/ranking/RankingList.tsx` — dark mode fixes, use EmptyState
- `src/components/layout/BottomNav.tsx` — minor dark mode polish
- `src/app/(public)/search/page.tsx` — dark mode
- `src/app/(public)/saved/page.tsx` — dark mode
- `src/app/(public)/profile/page.tsx` — dark mode + theme toggle
- `src/app/~offline/page.tsx` — dark mode

## Implementation Order

1. ThemeProvider + layout.tsx integration (foundation)
2. EmptyState + Skeleton components (reusable pieces)
3. loading.tsx / error.tsx / not-found.tsx files
4. Dark mode fixes across all pages
5. Mobile layout verification pass
6. Build test to verify everything compiles

## Verification

- `pnpm build` — ensure no build errors
- Manual check: toggle dark mode, verify all pages render correctly in both modes
- Verify loading states show during navigation
- Verify error boundary catches errors gracefully
- Verify 404 page shows for invalid routes
