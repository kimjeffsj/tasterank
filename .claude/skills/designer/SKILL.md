# Designer Skill — TasteRank

Quick-reference for implementing UI components and pages. Use this instead of reading the full reference HTML (1309 lines).

> **Full reference**: `.claude/docs/reference_design.md` (read only when this skill doesn't cover your case)
> **Design spec**: `.claude/docs/DESIGN.md` (full design system documentation)

---

## Design Tokens

### Colors
```
Primary:        #ec7f13  (bg-primary, text-primary)
Primary light:  #ffb063  (bg-primary-light)
Primary dark:   #b85e00  (bg-primary-dark, hover states)
BG light:       #f8f7f6  (bg-background-light)
BG dark:        #221910  (bg-background-dark)
Surface dark:   #362b20  (dark:bg-surface-dark — cards in dark mode)
Neutral surface:#fff9f2  (bg-neutral-surface)
```

### Font
```
Plus Jakarta Sans — font-display
Loaded via Google Fonts: wght@400;500;600;700;800
```

### Border Radius
```
Default:  rounded      (1rem)
Large:    rounded-lg   (2rem)
Card:     rounded-3xl
Inner:    rounded-2xl
Pill:     rounded-full
```

### Shadows
```
Card:     shadow-sm
Hover:    shadow-md
CTA glow: shadow-[0_4px_20px_-2px_rgba(236,127,19,0.3)]
FAB:      shadow-[0_8px_30px_rgb(236,127,19,0.4)]
Nav:      shadow-2xl
Soft:     shadow-[0_10px_40px_-10px_rgba(236,127,19,0.1)]
```

---

## Reusable Class Snippets

### Primary CTA Button
```tsx
className="w-full bg-primary hover:bg-primary-dark active:scale-[0.98] transition-all
           text-white font-bold py-4 px-6 rounded-full
           shadow-[0_4px_20px_-2px_rgba(236,127,19,0.3)]
           flex items-center justify-center gap-2 text-lg"
```

### Ghost / Secondary Button
```tsx
className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700
           text-gray-600 dark:text-gray-300 px-5 py-2.5 rounded-full
           font-semibold text-sm whitespace-nowrap shadow-sm"
```

### Icon Button (Floating / Glass)
```tsx
className="w-10 h-10 flex items-center justify-center
           bg-white/20 backdrop-blur-md rounded-full text-white
           border border-white/10 hover:bg-white/30 transition-all"
```

### Glassmorphism Surface
```tsx
className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10"
```

### Gradient Overlay (on images)
```tsx
className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
```

### Status Badge
```tsx
// Active/Ongoing
className="bg-primary/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
// Completed
className="bg-gray-800/80 backdrop-blur-sm text-gray-200 text-xs font-bold px-3 py-1 rounded-full"
```

### Tag Chip — Selected
```tsx
className="bg-primary text-white px-4 py-2 rounded-full text-sm font-bold
           shadow-md shadow-primary/20 whitespace-nowrap active:scale-95 transition"
```

### Tag Chip — Unselected
```tsx
className="bg-white dark:bg-[#3a2e22] text-gray-600 dark:text-gray-300
           border border-gray-100 dark:border-white/5 px-4 py-2 rounded-full
           text-sm font-medium whitespace-nowrap hover:bg-orange-50 transition"
```

### Rating Badge (on card)
```tsx
className="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm
           px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm"
// Inside: <span className="material-icons-round text-primary text-xs">star</span>
//         <span className="text-xs font-bold">9.8</span>
```

### Avatar Stack
```tsx
<div className="flex -space-x-2">
  <img className="w-8 h-8 rounded-full border-2 border-gray-800 object-cover" />
  <img className="w-8 h-8 rounded-full border-2 border-gray-800 object-cover" />
  <div className="w-8 h-8 rounded-full border-2 border-gray-800 bg-gray-700
                  flex items-center justify-center text-xs text-white font-medium">+2</div>
</div>
```

### Scrollbar Hidden Container
```tsx
className="overflow-x-auto no-scrollbar"
// Requires CSS: .no-scrollbar::-webkit-scrollbar { display: none; }
//               .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
```

---

## Page Structure Templates

### Mobile Container (all pages)
```tsx
<div className="w-full max-w-md mx-auto min-h-screen bg-background-light dark:bg-background-dark
                relative shadow-2xl overflow-hidden">
  {/* Page content */}
</div>
```

### Sticky Header
```tsx
<header className="sticky top-0 z-10 bg-background-light/90 dark:bg-background-dark/90
                   backdrop-blur-md px-6 pt-12 pb-4 flex justify-between items-center">
```

### Immersive Hero Header (Collection Details, Food Details)
```tsx
<header className="relative h-[420px] w-full">
  {/* Floating nav buttons (absolute top) */}
  <div className="absolute inset-0">
    <img className="w-full h-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
  </div>
  <div className="absolute bottom-0 w-full p-6 z-10">
    {/* Title, badges, avatars */}
  </div>
</header>
```

### Pill Tab Navigation
```tsx
<div className="sticky top-0 z-30 bg-background-light dark:bg-background-dark pt-4 pb-2 px-6">
  <div className="flex bg-white dark:bg-surface-dark p-1.5 rounded-full relative">
    {/* Active tab indicator */}
    <div className="w-1/2 absolute left-1.5 top-1.5 bottom-1.5 bg-primary rounded-full shadow-md z-0" />
    <button className="flex-1 relative z-10 py-2.5 text-sm font-bold text-white">Food List</button>
    <button className="flex-1 relative z-10 py-2.5 text-sm font-medium text-slate-500">Ranking</button>
  </div>
</div>
```

### 2-Column Food Grid
```tsx
<div className="grid grid-cols-2 gap-4">
  {/* EntryCard components */}
</div>
```

### Floating Bottom Nav
```tsx
<nav className="fixed bottom-6 left-0 right-0 flex justify-center px-4 z-20">
  <div className="bg-white dark:bg-gray-800 rounded-full shadow-2xl border border-gray-100
                  dark:border-gray-700 px-6 py-3 flex items-center gap-8 max-w-sm w-full justify-between">
    {/* 5 tabs: Home, Search, + (raised), Saved, Profile */}
  </div>
</nav>
```

### Fixed Bottom CTA
```tsx
<div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background-light
                via-background-light to-transparent z-30 max-w-md mx-auto pointer-events-none">
  <button className="pointer-events-auto w-full bg-primary text-white font-bold py-4
                     rounded-full shadow-xl shadow-primary/25 active:scale-[0.98] transition">
    Save Record
  </button>
</div>
```

### FAB (Floating Action Button)
```tsx
<button className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-primary text-white rounded-full
                   shadow-[0_8px_30px_rgb(236,127,19,0.4)] flex items-center justify-center
                   hover:bg-primary-dark hover:scale-105 active:scale-95 transition-all group">
  <span className="material-icons-round text-3xl group-hover:rotate-90 transition-transform duration-300">add</span>
</button>
```

---

## Icons Usage

Material Icons Round — use `<span>` with className:

```tsx
// Standard size
<span className="material-icons-round text-xl">icon_name</span>

// Small (in badges, tags)
<span className="material-icons-round text-sm">star</span>
<span className="material-icons-round text-xs">star</span>

// Large (hero, FAB)
<span className="material-icons-round text-2xl">add</span>
<span className="material-icons-round text-3xl">add</span>
```

---

## Dark Mode Patterns

Always pair light and dark classes:
```tsx
// Background
"bg-background-light dark:bg-background-dark"
"bg-white dark:bg-surface-dark"
"bg-white dark:bg-white/5"

// Text
"text-gray-900 dark:text-white"
"text-gray-500 dark:text-gray-400"

// Borders
"border-gray-100 dark:border-white/5"
"border-gray-100 dark:border-gray-700"

// Inputs
"bg-white dark:bg-[#2c241b]"
"dark:placeholder-white/20"
```

---

## shadcn Usage Guide

**Use shadcn for:**
- `Dialog` / `Sheet` — modals, bottom sheets (LoginPrompt, confirmations)
- `Slider` — rating input (1-10 score)
- `Form` — form validation with react-hook-form

**Do NOT use shadcn for:**
- Cards, buttons, badges — use Tailwind classes from snippets above
- Navigation — custom floating pill nav
- Tabs — custom pill tab implementation
- Any visual component — reference design's Tailwind is the source of truth

Install: `npx shadcn@latest add dialog sheet slider form`

---

## When to Read reference_design.md

Only read the full HTML reference when:
1. Implementing a page for the first time and need exact DOM structure
2. This skill doesn't cover a specific pattern
3. Checking pixel-level details or spacing

The reference contains 6 HTML documents:
- Lines 1-232: Home page
- Lines 234-478: Collection Details
- Lines 480-716: Rankings
- Lines 718-921: Add Food
- Lines 923-1129: Food Details
- Lines 1131-1309: World Cup Tournament
