# Bottom Nav Enhancement

**Date**: 2026-02-15

## Summary

Restructured the bottom navigation from 5 generic items (Home, Search, Add, Saved, Profile) to 5 purposeful items that match actual user journeys.

## New Structure

```
[HOME]  [EXPLORE]  [ADD TRIP / ADD PHOTOS]  [MY TRIPS]  [PROFILE / SIGN IN]
```

## Key Decisions

### Contextual Center Button
- **Default**: "ADD TRIP" → navigates to `/trips/new`
- **On trip detail page** (`/trips/[tripId]` or `/trips/[tripId]/ranking`): "ADD PHOTOS" → navigates to `/trips/[tripId]/entries/new`
- Both are auth-gated — shows `LoginPrompt` if not signed in
- Uses `photo_camera` icon (consistent with food photo theme)

### Nav Visibility
- **Previously**: Hidden entirely on all `/trips/*` routes
- **Now**: Only hidden on full-screen flows (`/trips/new`, `/trips/[id]/edit`, `/trips/[id]/entries/new`)
- Trip detail pages and ranking pages now show the nav with contextual "ADD PHOTOS" button

### Profile / Sign In
- Shows "SIGN IN" label when unauthenticated → opens `LoginPrompt` on click
- Shows "PROFILE" label when authenticated → navigates to `/profile`

### FAB Removal
- Removed the floating action button from `TripActions.tsx` (was only for logged-in members)
- BottomNav center button now serves this purpose globally

## Files Changed

| File | Change |
|------|--------|
| `src/components/layout/BottomNav.tsx` | Rewritten with new nav structure |
| `src/components/trip/TripActions.tsx` | Removed FAB section |
| `src/app/(public)/explore/page.tsx` | Created (placeholder) |
| `src/app/(public)/my-trips/page.tsx` | Created (lazy auth pattern) |
| `src/app/(public)/search/page.tsx` | Deleted |
| `src/app/(public)/saved/page.tsx` | Deleted |
