# Component Development Patterns

TasteRank React component rules.

> **Visual design reference**: `.claude/skills/designer/SKILL.md` — use for all styling decisions

## Core Principles

1. **Server Components default** — `"use client"` only when needed (event handlers, hooks, browser APIs)
2. **TDD** — Write test first → implement → refactor
3. **Test file location** — Same directory as target: `Component.test.tsx`
4. **Tailwind-first styling** — Reference design patterns from Designer Skill
5. **shadcn/ui selective** — Only for Dialog, Sheet, Slider, Form (accessibility needs)

## Directory Structure

```
src/components/
├── ui/           # shadcn/ui (auto-generated, selective: dialog, sheet, slider, form)
├── trip/         # Collection: TripCard, TripForm, TripHero
├── entry/        # Food: EntryCard, EntryForm, PhotoUploader, RatingSlider
├── ranking/      # Ranking: RankingList, RankingCard, PodiumCard
├── tournament/   # World Cup: MatchCard, TournamentBracket, WinnerModal
├── ai/           # AI UI: TagSuggestions, AIAnalysisCard, FollowUpQuestions
├── auth/         # Auth: AuthGuard, LoginPrompt, GoogleLoginButton
└── layout/       # Layout: BottomNav, Header, PillTabs
```

## Component Templates

### Server Component (default)

```tsx
// src/components/trip/TripCard.tsx
import Image from "next/image";
import Link from "next/link";

interface TripCardProps {
  id: string;
  name: string;
  coverImageUrl: string | null;
  status: "ongoing" | "completed";
  memberAvatars: string[];
  topRatedName: string | null;
  topRatedScore: number | null;
}

export function TripCard({
  id, name, coverImageUrl, status, memberAvatars, topRatedName, topRatedScore,
}: TripCardProps) {
  return (
    <Link href={`/trips/${id}`}>
      <article className="group relative w-full aspect-[4/5] rounded-lg overflow-hidden shadow-lg cursor-pointer transform transition hover:scale-[1.01]">
        {coverImageUrl && (
          <Image
            src={coverImageUrl}
            alt={name}
            fill
            className="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-110"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div>
              <span className={`${status === "ongoing" ? "bg-primary/90" : "bg-gray-800/80"} backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full mb-2 inline-block uppercase`}>
                {status}
              </span>
              <h4 className="text-white font-bold text-2xl">{name}</h4>
            </div>
            <div className="flex -space-x-2">
              {memberAvatars.slice(0, 3).map((url, i) => (
                <Image key={i} src={url} alt="Member" width={32} height={32}
                  className="w-8 h-8 rounded-full border-2 border-gray-800 object-cover" />
              ))}
              {memberAvatars.length > 3 && (
                <div className="w-8 h-8 rounded-full border-2 border-gray-800 bg-gray-700 flex items-center justify-center text-xs text-white font-medium">
                  +{memberAvatars.length - 3}
                </div>
              )}
            </div>
          </div>
          {topRatedName && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
              <p className="text-gray-300 text-xs font-medium uppercase tracking-wider mb-1">Top Rated</p>
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold text-sm">{topRatedName}</span>
                {topRatedScore && (
                  <div className="flex items-center gap-1 text-primary">
                    <span className="material-icons-round text-sm">star</span>
                    <span className="text-sm font-bold text-white">{topRatedScore}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
```

### Client Component (interactive)

```tsx
// src/components/entry/RatingSlider.tsx
"use client";

import { useState } from "react";

interface RatingSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function RatingSlider({ value, onChange }: RatingSliderProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end px-1">
        <h3 className="font-bold text-lg text-gray-800 dark:text-white">Taste Score</h3>
        <span className="text-3xl font-extrabold text-primary">{value.toFixed(1)}</span>
      </div>
      <div className="relative py-2">
        <div className="absolute top-1/2 left-0 right-0 h-2 -mt-1 rounded-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-500 opacity-20 dark:opacity-30" />
        <input
          type="range"
          min={1}
          max={10}
          step={0.5}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full relative z-10 bg-transparent appearance-none h-2 cursor-pointer"
        />
        <div className="flex justify-between text-xs font-medium text-gray-400 mt-2 px-1">
          <span>Meh 😕</span>
          <span>Okay 😐</span>
          <span>Amazing 🤩</span>
        </div>
      </div>
    </div>
  );
}
```

## shadcn/ui — Selective Usage

**Install only these:**
```bash
npx shadcn@latest add dialog sheet slider form
```

**Use for:**
- `Dialog` — confirmation modals
- `Sheet` — LoginPrompt bottom sheet, filters
- `Slider` — alternative to custom range input if needed
- `Form` — react-hook-form integration

**Do NOT use for:**
- Card, Button, Badge, Tabs, Navigation — use reference design Tailwind patterns

## Props Naming

- Events: `on` + verb (`onSubmit`, `onChange`, `onSelect`)
- Booleans: `is` / `has` prefix (`isPublic`, `hasRating`)
- Data: camelCase from DB columns (`coverImageUrl` ← `cover_image_url`)

## Key Patterns

### Image with Gradient Overlay
```tsx
<div className="relative">
  <Image src={url} alt={name} fill className="object-cover" />
  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
  <div className="absolute bottom-0 p-6">{/* Content */}</div>
</div>
```

### Glassmorphism Card
```tsx
<div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
```

### Horizontal Scroll Container
```tsx
<div className="flex overflow-x-auto gap-3 no-scrollbar pb-2">
  {/* Chips, tags, thumbnails */}
</div>
```
