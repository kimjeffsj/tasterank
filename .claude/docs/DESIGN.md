# TasteRank — Design Specification

> **Version**: 2.0
> **Date**: 2026-02-11
> **Design System**: Tailwind 4.1 (CSS-first) + Material Icons Round
> **Target**: Mobile-first (375px ~ 430px), desktop centered (max-w-md)
> **Reference**: `.claude/docs/reference_design.md` (HTML mockup)

---

## 1. Design Principles

| Principle | Description |
|-----------|-------------|
| **Mobile First** | All UI designed for 375px, desktop uses max-w-md centered |
| **Photo-centric** | Food photos dominate the screen — large cards, immersive headers |
| **One-hand Operation** | Floating bottom nav, CTAs in thumb zone (bottom 40%) |
| **Minimal Login Barrier** | Browse freely, login prompt only on edit actions |
| **Glassmorphism** | Frosted glass effects (backdrop-blur, white/20 backgrounds) |
| **Dark Mode Ready** | All components have dark: variants |

---

## 2. Color System

```css
@theme {
    /* Primary — Warm Orange */
    --color-primary: #ec7f13;
    --color-primary-light: #ffb063;
    --color-primary-dark: #b85e00;

    /* Background */
    --color-bg-light: #f8f7f6;
    --color-bg-dark: #221910;
    --color-surface-dark: #362b20;    /* Card backgrounds in dark mode */
    --color-neutral-surface: #fff9f2; /* Light mode card highlight */

    /* Neutral */
    --color-gray-50: #f9fafb;
    --color-gray-100: #f3f4f6;
    --color-gray-400: #9ca3af;
    --color-gray-500: #6b7280;
    --color-gray-600: #4b5563;
    --color-gray-800: #1f2937;
    --color-gray-900: #111827;

    /* Ranking Accents */
    --color-gold: #facc15;      /* 1st place */
    --color-silver: #d1d5db;    /* 2nd place */
    --color-bronze: #b45309;    /* 3rd place */

    /* Semantic */
    --color-success: #16a34a;
    --color-error: #dc2626;
}
```

### Key Patterns
- Primary CTA: `bg-primary text-white`
- Primary glow: `shadow-[0_4px_20px_-2px_rgba(236,127,19,0.3)]`
- Glassmorphism: `bg-white/20 backdrop-blur-md border border-white/10`
- Dark card: `dark:bg-surface-dark` or `dark:bg-white/5`

---

## 3. Typography

**Font**: Plus Jakarta Sans (Google Fonts)

```css
@theme {
    --font-display: "Plus Jakarta Sans", sans-serif;
}
```

| Usage | Size | Weight | Example |
|-------|------|--------|---------|
| Hero title | text-4xl (36px) | font-extrabold | "Record the taste of your travels" |
| Page title | text-3xl (30px) | font-extrabold | Food name in detail page |
| Card title | text-2xl (24px) | font-bold | Trip card title |
| Section heading | text-xl (20px) | font-bold | "Your Collections" |
| Body large | text-lg (18px) | font-medium | Subtitle, description |
| Body | text-base (16px) | font-normal | Review text |
| Caption | text-sm (14px) | font-medium | Location, date, meta |
| Micro | text-xs (12px) | font-bold | Tags, badges, labels |
| Score display | text-3xl (30px) | font-extrabold | Rating number |

---

## 4. Icons

**Material Icons Round** (Google Fonts)

```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
```

Common icons used:
- Navigation: `home`, `search`, `bookmark`, `person`, `arrow_back`
- Actions: `add`, `add_circle`, `add_a_photo`, `edit`, `save`, `share`, `close`
- Food: `restaurant`, `restaurant_menu`, `local_fire_department`
- Rating: `star`, `emoji_events`
- AI: `auto_awesome`, `psychology`
- Location: `location_on`, `place`, `calendar_today`
- Misc: `favorite`, `favorite_border`, `more_horiz`, `tune`, `expand_more`

Usage: `<span className="material-icons-round text-xl">icon_name</span>`

---

## 5. Spacing & Radius

| Token | Value | Usage |
|-------|-------|-------|
| Page padding | px-6 (24px) | Main content horizontal padding |
| Card gap | gap-4 to gap-6 | Between cards in lists |
| Section gap | gap-8 | Between major sections |
| Border radius default | rounded (1rem/16px) | Standard containers |
| Border radius large | rounded-lg (2rem/32px) | Hero sections, large cards |
| Border radius pill | rounded-full | Buttons, badges, nav, avatars |
| Border radius card | rounded-3xl | Food/trip cards |
| Border radius inner | rounded-2xl | Images inside cards |

---

## 6. Shadows

```css
/* Standard card */
shadow-sm

/* Elevated card / Hover */
shadow-md, shadow-lg

/* Primary CTA glow */
shadow-glow: 0 4px 20px -2px rgba(236, 127, 19, 0.3)
shadow-lg shadow-primary/30

/* Bottom nav */
shadow-2xl

/* Ranking soft glow */
shadow-soft: 0 10px 40px -10px rgba(236, 127, 19, 0.1)
```

---

## 7. Page Layouts

### 7.1 Home (`/`)

```
┌─────────────────────────────────┐
│ Header (sticky, blur bg)        │
│ [Logo icon] TasteRank  [Avatar] │
├─────────────────────────────────┤
│ Hero Section                    │
│ "Record the taste              │
│  of your travels"              │
│ subtitle                        │
│ [Start New Trip] (full-width)   │
├─────────────────────────────────┤
│ Filter chips (horizontal scroll)│
│ [All Trips] [Favorites] [Map]   │
├─────────────────────────────────┤
│ "Your Collections"  View all →  │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ TripCard (aspect-[4/5])     │ │
│ │ [Cover photo - full]        │ │
│ │ gradient overlay            │ │
│ │ badge + title + avatars     │ │
│ │ top-rated glass card        │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ TripCard 2                  │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ Floating Bottom Nav (pill)      │
│ [Home] [Search] [+] [Saved] [Profile] │
└─────────────────────────────────┘
```

**Key classes:**
- Container: `w-full max-w-md min-h-screen relative pb-24`
- Header: `sticky top-0 bg-background-light/90 backdrop-blur-md px-6 pt-12 pb-4`
- Hero title: `font-extrabold text-4xl leading-[1.1]`, primary span: `text-primary`
- CTA button: `w-full bg-primary text-white font-bold py-4 rounded-full shadow-glow`
- TripCard: `aspect-[4/5] rounded-lg overflow-hidden shadow-lg` with gradient overlay

### 7.2 Collection Details (`/trips/[tripId]`)

```
┌─────────────────────────────────┐
│ Hero Image (h-[420px])          │
│ [← back]              [share]   │
│ gradient overlay                │
│ badges (Ongoing, date)          │
│ Title (text-4xl bold)           │
│ avatars + location              │
├─────────────────────────────────┤
│ Sticky Pill Tabs                │
│ [●Food List] [Ranking]          │
├─────────────────────────────────┤
│ "Recent Eats"       Filter →    │
│                                 │
│ ┌──────────┬──────────┐         │
│ │ EntryCard │ EntryCard│         │
│ │ [photo]  │ [photo]  │  2-col  │
│ │ ★ 9.8   │ ★ 8.5   │  grid   │
│ │ name     │ name     │         │
│ └──────────┴──────────┘         │
│ ┌──────────┬──────────┐         │
│ │ EntryCard │ [+Add]  │         │
│ └──────────┴──────────┘         │
│                                 │
│ [FAB: + button] (fixed bottom)  │
└─────────────────────────────────┘
```

**Key classes:**
- Hero: `relative h-[420px]` with full-bleed image
- Floating buttons: `bg-white/20 backdrop-blur-md rounded-full`
- Pill tabs: `bg-white p-1.5 rounded-full`, active tab `bg-primary text-white rounded-full`
- Entry grid: `grid grid-cols-2 gap-4`
- EntryCard: `rounded-3xl overflow-hidden shadow-sm`, image `aspect-[4/5]` or `aspect-square`
- Rating badge: `bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full` (absolute top-right)
- FAB: `fixed bottom-6 right-6 w-16 h-16 bg-primary rounded-full shadow-[0_8px_30px_rgb(236,127,19,0.4)]`

### 7.3 Rankings (`/trips/[tripId]/ranking`)

```
┌─────────────────────────────────┐
│ Header (sticky, blur)           │
│ [←] "Best of Tokyo 🇯🇵" [share]│
│ Tag filters (pill scroll)       │
│ [All] [🍜 Ramen] [🍣 Sushi]    │
├─────────────────────────────────┤
│ 🥇 1st Place (large card)       │
│ ┌─────────────────────────────┐ │
│ │ [photo aspect-[4/5]]        │ │
│ │ gradient overlay             │ │
│ │ rank badge (gold circle)     │ │
│ │ "Ichiran Ramen"              │ │
│ │ ★ 4.9 + quote               │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌──────────┬──────────┐         │
│ │ 🥈 2nd   │ 🥉 3rd   │         │
│ │ [photo]  │ [photo]  │         │
│ │ name ★   │ name ★   │         │
│ └──────────┴──────────┘         │
│                                 │
│ 🤖 AI Taste Analysis            │
│ ┌─────────────────────────────┐ │
│ │ gradient bg + analysis text  │ │
│ └─────────────────────────────┘ │
│                                 │
│ "Runners Up"                    │
│ 4. [thumb] Afuri Ramen    ★4.6 │
│ 5. [thumb] Gyukatsu       ★4.5 │
│ 6. [thumb] Harajuku Gyoza ★4.5 │
│                                 │
│ [🏆 Play Food World Cup]       │
└─────────────────────────────────┘
```

**Key classes:**
- 1st place: `aspect-[4/5] rounded-lg overflow-hidden shadow-soft`, gold badge `bg-yellow-400 text-yellow-900 w-8 h-8 rounded-full`
- 2nd/3rd: `bg-background-light rounded-lg p-3`, image `aspect-square rounded-2xl`
- AI section: `bg-gradient-to-br from-primary/10 to-orange-100/30 rounded-lg p-5 border border-primary/10`
- Runner-up items: `flex items-center gap-4 bg-white p-2 rounded-xl`, thumb `w-16 h-16 rounded-lg`
- World Cup CTA: `w-full bg-primary text-white font-bold py-4 rounded-full shadow-lg`

### 7.4 Add Food (`/trips/[tripId]/entries/new`)

```
┌─────────────────────────────────┐
│ Photo Area (h-[42vh])           │
│ [Cancel]  "New Memory"  [...]   │
│ [main photo]                    │
│ pagination dots                 │
│              [📷 camera button] │
├─────────────────────────────────┤
│ Input Card (white, rounded-xl)  │
│ "What did you eat?"             │
│ [food name input - text-2xl]    │
│ "Where was it?"                 │
│ 📍 [location input]            │
├─────────────────────────────────┤
│ Taste Score          8.5        │
│ ○━━━━━━━━━━━━━━━●━━○           │
│ Meh 😕  Okay 😐  Amazing 🤩    │
├─────────────────────────────────┤
│ ✨ AI Recommended Tags          │
│ [●Spicy] [Umami] [Crunchy]     │
├─────────────────────────────────┤
│ 🧠 AI Food Critic (collapsible) │
│ ▸ Answer 2 quick questions      │
├─────────────────────────────────┤
│ [Save Record] (fixed bottom)    │
└─────────────────────────────────┘
```

**Key classes:**
- Photo area: `relative h-[42vh] rounded-b-xl overflow-hidden`
- Input card: `bg-white rounded-xl p-6 shadow-sm border border-orange-100`
- Food name input: `text-2xl font-extrabold bg-transparent border-b-2 focus:border-primary`
- Score slider: custom range input with `border-4 border-primary` thumb
- Tag selected: `bg-primary text-white px-4 py-2 rounded-full font-bold`
- Tag unselected: `bg-white border border-gray-100 px-4 py-2 rounded-full`
- AI section: `bg-orange-50 rounded-xl border border-orange-100` with `<details>` expand
- Save button: `fixed bottom-0 w-full bg-primary text-white font-bold py-4 rounded-full`

### 7.5 Food Details (`/trips/[tripId]/entries/[entryId]`)

```
┌─────────────────────────────────┐
│ Photo Carousel (h-[400px])      │
│ [←]              [share] [♡]    │
│ [swipe photos]                  │
│ pagination dots                 │
│ curved bottom overlay           │
├─────────────────────────────────┤
│ Title Block                     │
│ "Spicy Miso Ramen"     [9.2★]  │
│ 📍 Ramen Nagi, Tokyo           │
│                                 │
│ Tags: [Spicy] [Pork Broth]     │
├─────────────────────────────────┤
│ 🤖 TasteRank AI Verdict        │
│ ┌─────────────────────────────┐ │
│ │ gradient bg + analysis       │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ "Member Reviews"    See All → │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ [avatar] Jeff    ★ 9.0      │ │
│ │ "Best noodles..."            │ │
│ ├─────────────────────────────┤ │
│ │ [avatar] Sarah   ★ 8.5      │ │
│ │ "Great flavor..."            │ │
│ └─────────────────────────────┘ │
│                                 │
│ [🗺 Map] [✏️ Add Review]       │
└─────────────────────────────────┘
```

**Key classes:**
- Carousel: `flex overflow-x-auto snap-x snap-mandatory h-[400px]`
- Curved overlay: `absolute -bottom-1 h-8 bg-background-light rounded-t-[2rem]`
- Score badge: `bg-primary text-white font-bold text-xl px-4 py-2 rounded-xl shadow-lg`
- Tags: `px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase`
- AI section: `bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-[2rem] border border-primary/10`
- Review card: `bg-white p-5 rounded-2xl shadow-sm border border-gray-100`
- Bottom bar: `bg-white/90 backdrop-blur-lg rounded-full shadow-[0_8px_30px] border border-gray-100`

### 7.6 World Cup Tournament (`/trips/[tripId]/tournament`)

```
┌─────────────────────────────────┐
│ Header (gradient overlay)       │
│ [✕]  TasteRank World Cup  [1/8]│
│      Round of 16                │
│ ████░░░░░░░░░░░░ progress      │
├─────────────────────────────────┤
│                                 │
│ Option A (flex-1, full-width)   │
│ [food photo - full bleed]       │
│ gradient overlay                │
│ country badge + food name       │
│                                 │
│         ┌──VS──┐                │
│         └──────┘                │
│                                 │
│ Option B (flex-1, full-width)   │
│ [food photo - full bleed]       │
│ gradient overlay                │
│ country badge + food name       │
│                                 │
│ "Tap your favorite to advance"  │
└─────────────────────────────────┘
```

**Key classes:**
- Full screen: `h-screen overflow-hidden flex flex-col`
- Progress: `flex gap-1 h-1.5`, active `bg-primary rounded-full`, inactive `bg-white/30 rounded-full`
- Option: `relative flex-1 cursor-pointer overflow-hidden hover:flex-[1.1] active:scale-[0.98]`
- VS badge: `w-16 h-16 rounded-full bg-white p-1 shadow-[0_0_30px]`, inner `bg-primary rounded-full`
- Winner overlay: `bg-black/60 backdrop-blur-sm`, modal `rounded-[2.5rem] shadow-2xl`

---

## 8. Common Components

### 8.1 Floating Bottom Nav

```html
<nav class="fixed bottom-6 left-0 right-0 flex justify-center px-4 z-20">
  <div class="bg-white rounded-full shadow-2xl border border-gray-100
              px-6 py-3 flex items-center gap-8 max-w-sm w-full justify-between">
    <!-- Tab items -->
    <button class="flex flex-col items-center gap-1 text-primary">
      <span class="material-icons-round">home</span>
      <span class="text-[10px] font-bold">Home</span>
    </button>
    <!-- Center raised button -->
    <div class="-mt-8">
      <button class="bg-primary shadow-lg shadow-primary/40 text-white
                     w-14 h-14 rounded-full flex items-center justify-center">
        <span class="material-icons-round text-2xl">add</span>
      </button>
    </div>
    <!-- ... more tabs -->
  </div>
</nav>
```

- 5 items: Home, Search, + (raised), Saved, Profile
- Active: `text-primary`, inactive: `text-gray-400`
- Safe area: `bottom-6` + container `pb-24`

### 8.2 TripCard

- Container: `group relative w-full aspect-[4/5] rounded-lg overflow-hidden shadow-lg`
- Image: `absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-700`
- Gradient: `absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent`
- Content: `absolute bottom-0 w-full p-6 flex flex-col gap-3`
- Badge: `bg-primary/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full`
- Glass info: `bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10`
- Avatars: `flex -space-x-2`, each `w-8 h-8 rounded-full border-2 border-gray-800`

### 8.3 EntryCard (Food Card)

- Container: `group relative bg-white dark:bg-surface-dark rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all`
- Image: `relative aspect-[4/5] overflow-hidden` (or `aspect-square`)
- Rating badge: `absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full`
- Info: `p-3`, title `font-bold leading-tight`, subtitle `text-xs text-slate-500 truncate`

### 8.4 RatingSlider

- Gradient track: `bg-gradient-to-r from-red-400 via-yellow-400 to-green-500 opacity-20`
- Custom thumb: `w-[28px] h-[28px] rounded-full bg-white border-4 border-primary`
- Score display: `text-3xl font-extrabold text-primary`
- Labels: `Meh 😕 | Okay 😐 | Amazing 🤩`

### 8.5 TagChip

- Selected: `bg-primary text-white px-4 py-2 rounded-full text-sm font-bold shadow-md shadow-primary/20`
- Unselected: `bg-white border border-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm font-medium`
- AI recommended: prepend icon `material-icons-round text-base` (e.g., `local_fire_department`)
- Container: `flex overflow-x-auto gap-3 no-scrollbar`

### 8.6 ReviewCard

- Container: `bg-white dark:bg-[#2a2018] p-5 rounded-2xl shadow-sm border border-gray-100`
- Avatar: `w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm`
- Score badge: green for 9+, orange for 7-8, based on `bg-green-50` or `bg-orange-50`

### 8.7 AI Analysis Card

- Container: `bg-gradient-to-br from-primary/10 to-orange-100/30 rounded-lg p-5 border border-primary/10`
- Decorative bg: `material-icons-round text-primary/10 absolute -right-4 -bottom-4 text-8xl`
- Header: `material-icons-round text-primary` + `font-bold text-primary-dark text-sm uppercase tracking-wide`

---

## 9. Animation & Interaction

| Element | Animation |
|---------|-----------|
| Page transition | View Transitions API (React 19) |
| Card tap | `active:scale-[0.97]` or `active:scale-[0.98]` |
| Card hover | `hover:scale-[1.01]`, image `group-hover:scale-110 transition duration-700` |
| Ranking entry | Sequential fade-in + slide-up |
| World Cup select | Selected option `flex-[1.1]`, hover overlay `bg-primary/20 mix-blend-overlay` |
| World Cup result | confetti + `animate-[scaleIn_0.4s_ease-out]` |
| Score slider | Value bounce on change |
| Photo upload | Shimmer placeholder |
| FAB icon | `group-hover:rotate-90 transition-transform duration-300` |
| CTA shimmer | `bg-gradient-to-r via-white/20 animate-[shimmer_1s_infinite]` |
| Bottom nav raise | Center button `-mt-8` with glow shadow |

---

## 10. Responsive

| Screen | Width | Layout |
|--------|-------|--------|
| Mobile (default) | < 640px | Single column, bottom nav, full-width cards |
| Tablet | 640px ~ 1024px | 2-col grid, bottom nav maintained |
| Desktop | > 1024px | max-w-md centered with shadow-2xl, mobile layout preserved |

Mobile optimization is the priority. Desktop simply centers the mobile layout with `max-w-md mx-auto shadow-2xl`.

---

## 11. Dark Mode

All components use Tailwind `dark:` prefix. Key dark tokens:

| Element | Light | Dark |
|---------|-------|------|
| Background | `bg-background-light` (#f8f7f6) | `bg-background-dark` (#221910) |
| Card | `bg-white` | `dark:bg-surface-dark` or `dark:bg-white/5` |
| Text primary | `text-gray-900` | `dark:text-white` |
| Text secondary | `text-gray-500` | `dark:text-gray-400` |
| Border | `border-gray-100` | `dark:border-white/5` or `dark:border-gray-700` |
| Input bg | `bg-white` | `dark:bg-[#2c241b]` or `dark:bg-background-dark` |
| Tag unselected | `bg-white border-gray-100` | `dark:bg-[#3a2e22] dark:border-white/5` |

---

## 12. Accessibility

- Touch targets: min 44x44px (buttons, nav items)
- Color contrast: WCAG AA (4.5:1+)
- Image alt: food name + restaurant name
- Keyboard navigation: Tab/Enter support
- Screen reader: rank/score aria-labels
- Focus visible: outline-primary for all interactive elements

---

## 13. shadcn/ui Usage (Selective)

| Use shadcn | Don't use shadcn |
|------------|-----------------|
| Dialog / Sheet (modals, bottom sheets) | Card, Button, Badge |
| Slider (rating input) | Bottom Nav, Tabs |
| Form primitives | All visual/layout components |

shadcn components go in `src/components/ui/`. Install only what's needed:
```bash
npx shadcn@latest add dialog sheet slider form
```
