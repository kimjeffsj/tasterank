# BottomNav + Trip FAB z-index Conflict

**Date**: 2026-02-14
**Symptoms**: Trip detail pages show both BottomNav and FAB button overlapping at the bottom; both use z-20, causing UI clutter and tap target conflicts

## Root Cause

`BottomNav` was rendered globally in `(protected)/layout.tsx`, meaning it appeared on all authenticated routes including `/trips/[tripId]/*`. Trip detail pages already have their own floating action button (FAB) for adding entries, positioned bottom-right with `z-20` — the same z-index as BottomNav's `fixed bottom-6 z-20`.

**Result:**
1. Two overlapping fixed-position elements at the bottom of the screen
2. BottomNav center "add" button and trip FAB compete for the same visual space
3. On smaller screens, tap targets overlap making both buttons unreliable

## Fixes Applied

1. **`src/components/layout/BottomNav.tsx`** — Added early return `null` when `pathname.startsWith("/trips/")`
2. **`src/app/(protected)/layout.tsx`** — Removed `<BottomNav />` entirely (all protected routes are under `/trips/`, so it would never render anyway)
3. **`src/components/layout/BottomNav.test.tsx`** — Added 2 tests verifying null render on `/trips/abc123` and `/trips/abc123/ranking`

## Rule
- Any page with its own bottom-positioned navigation/FAB must not render BottomNav
- Route-based hiding logic lives in `BottomNav.tsx` itself (component owns its visibility)
- If a layout's routes are entirely hidden by BottomNav's logic, don't include `<BottomNav />` in that layout at all
