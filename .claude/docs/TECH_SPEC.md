# TasteRank — 기술 명세서 (Technical Specification)

> **Version**: 2.0  
> **Date**: 2025-02-09  
> **Stack**: Next.js 16 + Supabase + Tailwind 4.1 + PWA  

---

## 1. 기술 스택

| 레이어 | 기술 | 버전 | 선정 이유 |
|--------|------|------|----------|
| **Framework** | Next.js (App Router) | 16.x | Cache Components, PPR, Turbopack 기본 |
| **React** | React | 19.x | View Transitions, useEffectEvent, Activity |
| **Language** | TypeScript | 5.x | 타입 안전성 |
| **Styling** | Tailwind CSS | 4.1.x | CSS-first 설정, text-shadow, mask 등 |
| **UI Components** | shadcn/ui | latest | Base UI 지원, Tailwind 4 호환 |
| **Database** | Supabase (PostgreSQL) | - | Auth, DB, Storage, RLS, Realtime |
| **ORM / Client** | @supabase/supabase-js | 2.x | 타입 생성, RLS 연동 |
| **State** | Zustand | 5.x | 경량 상태 관리 |
| **Testing** | Jest + React Testing Library | 30.x / 16.x | TDD |
| **AI** | Anthropic Claude API | claude-sonnet-4-20250514 | Vision + 텍스트 생성 |
| **Image** | sharp + browser-image-compression | - | 서버/클라이언트 이미지 처리 |
| **Deploy** | Vercel | - | Next.js 16 최적화, 엣지 배포 |
| **PWA** | @serwist/next | 9.x | next-pwa 후속, SW 관리 |

---

## 2. 프로젝트 구조

```
tasterank/
├── src/
│   ├── app/
│   │   ├── (public)/                     # 비로그인 접근 가능 그룹
│   │   │   ├── layout.tsx                # 공개 레이아웃 (네비게이션)
│   │   │   ├── page.tsx                  # 랜딩 → 공개 컬렉션 목록
│   │   │   ├── trips/
│   │   │   │   ├── page.tsx              # 공개 컬렉션 목록
│   │   │   │   └── [tripId]/
│   │   │   │       ├── page.tsx          # 컬렉션 상세 (음식 목록)
│   │   │   │       └── ranking/
│   │   │   │           └── page.tsx      # 랭킹 (비로그인 열람)
│   │   │   └── join/
│   │   │       └── [inviteCode]/
│   │   │           └── page.tsx          # 초대 링크 → 로그인 유도
│   │   ├── (auth)/                       # 인증 관련
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── callback/
│   │   │       └── route.ts              # Google OAuth 콜백
│   │   ├── (protected)/                  # 로그인 필수 그룹
│   │   │   ├── layout.tsx                # AuthGuard 포함
│   │   │   ├── trips/
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx          # 컬렉션 생성
│   │   │   │   └── [tripId]/
│   │   │   │       ├── entries/
│   │   │   │       │   ├── new/
│   │   │   │       │   │   └── page.tsx  # 음식 등록
│   │   │   │       │   └── [entryId]/
│   │   │   │       │       ├── page.tsx  # 음식 상세 + 평가
│   │   │   │       │       └── edit/
│   │   │   │       │           └── page.tsx
│   │   │   │       ├── tournament/
│   │   │   │       │   └── page.tsx      # 이상형 월드컵
│   │   │   │       └── members/
│   │   │   │           └── page.tsx      # 멤버 관리
│   │   │   └── profile/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   ├── ai/
│   │   │   │   ├── suggest-tags/route.ts
│   │   │   │   ├── follow-up-questions/route.ts
│   │   │   │   └── generate-ranking/route.ts
│   │   │   └── upload/route.ts
│   │   ├── layout.tsx
│   │   └── manifest.ts
│   ├── components/
│   │   ├── ui/                           # shadcn/ui
│   │   ├── trip/
│   │   │   ├── TripCard.tsx
│   │   │   ├── TripCard.test.tsx
│   │   │   ├── TripForm.tsx
│   │   │   └── TripForm.test.tsx
│   │   ├── entry/
│   │   │   ├── EntryCard.tsx
│   │   │   ├── EntryCard.test.tsx
│   │   │   ├── EntryForm.tsx
│   │   │   ├── EntryForm.test.tsx
│   │   │   ├── PhotoUploader.tsx
│   │   │   ├── PhotoUploader.test.tsx
│   │   │   ├── RatingSlider.tsx
│   │   │   └── RatingSlider.test.tsx
│   │   ├── ranking/
│   │   │   ├── RankingList.tsx
│   │   │   ├── RankingList.test.tsx
│   │   │   └── RankingCard.tsx
│   │   ├── tournament/
│   │   │   ├── MatchCard.tsx
│   │   │   └── TournamentBracket.tsx
│   │   ├── ai/
│   │   │   ├── TagSuggestions.tsx
│   │   │   └── FollowUpQuestions.tsx
│   │   ├── auth/
│   │   │   ├── AuthGuard.tsx             # 로그인 필수 래퍼
│   │   │   ├── LoginPrompt.tsx           # 수정 시도 시 로그인 유도 모달
│   │   │   └── GoogleLoginButton.tsx
│   │   └── layout/
│   │       ├── BottomNav.tsx
│   │       └── Header.tsx
│   ├── hooks/
│   │   ├── useTrips.ts
│   │   ├── useEntries.ts
│   │   ├── useRatings.ts
│   │   └── useAuth.ts
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                 # 브라우저 클라이언트
│   │   │   ├── server.ts                 # 서버 클라이언트
│   │   │   ├── anon.ts                   # 비로그인용 anon 클라이언트
│   │   │   └── middleware.ts
│   │   ├── ai/
│   │   │   ├── claude.ts
│   │   │   ├── prompts.ts
│   │   │   └── ranking-engine.ts
│   │   └── utils/
│   │       ├── image.ts
│   │       ├── location.ts
│   │       ├── invite.ts
│   │       └── tournament.ts
│   ├── stores/
│   │   └── authStore.ts
│   └── types/
│       ├── database.ts                   # supabase gen types
│       └── index.ts
├── supabase/
│   ├── migrations/
│   │   ├── 00001_create_profiles.sql
│   │   ├── 00002_create_trips.sql
│   │   ├── 00003_create_food_entries.sql
│   │   ├── 00004_create_ratings.sql
│   │   ├── 00005_create_tags.sql
│   │   ├── 00006_create_ai_tables.sql
│   │   ├── 00007_create_tournaments.sql
│   │   ├── 00008_create_views.sql
│   │   └── 00009_create_rls_policies.sql
│   ├── seed.sql
│   └── config.toml
├── jest.config.ts
├── jest.setup.ts
├── next.config.ts                        # Next.js 16은 .ts 설정
├── postcss.config.mjs
├── tsconfig.json
├── package.json
└── .env.local.example
```

---

## 3. 라우팅 — 공개 vs 보호

### 3.1 공개 라우트 (비로그인 접근)

| 경로 | 설명 |
|------|------|
| `/` | 랜딩 → 공개 컬렉션 목록 |
| `/trips` | 공개 컬렉션 목록 |
| `/trips/[tripId]` | 컬렉션 상세 (음식 목록 + 사진) |
| `/trips/[tripId]/ranking` | 랭킹 (평균 점수 + AI 랭킹) |
| `/join/[inviteCode]` | 초대 링크 랜딩 → 로그인 유도 |
| `/login` | Google OAuth 로그인 |

### 3.2 보호 라우트 (로그인 필수)

| 경로 | 설명 | 권한 |
|------|------|------|
| `/trips/new` | 컬렉션 생성 | 로그인 유저 |
| `/trips/[tripId]/entries/new` | 음식 등록 | editor+ |
| `/trips/[tripId]/entries/[entryId]` | 음식 평가/수정 | editor+ |
| `/trips/[tripId]/tournament` | 이상형 월드컵 | editor+ |
| `/trips/[tripId]/members` | 멤버 관리 | owner |
| `/profile` | 프로필 수정 | 로그인 유저 |

### 3.3 Lazy Auth 구현

```typescript
// src/components/auth/LoginPrompt.tsx
// 수정 액션 시도 시 모달로 로그인 유도
"use client";

export function LoginPrompt({ action }: { action: string }) {
    return (
        <Dialog>
            <DialogContent>
                <p>"{action}" 하려면 로그인이 필요합니다.</p>
                <GoogleLoginButton />
            </DialogContent>
        </Dialog>
    );
}

// 사용 예: 공개 페이지에서 "음식 추가" 버튼 클릭 시
// 비로그인 → LoginPrompt 표시
// 로그인 상태 → /trips/[id]/entries/new 이동
```

---

## 4. 인증 (Google OAuth Only)

### 4.1 Supabase Auth 설정

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

export const createClient = () =>
    createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
```

```typescript
// src/lib/supabase/anon.ts
// 비로그인 사용자용 — 공개 데이터 조회에 사용
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export const anonClient = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### 4.2 Google OAuth 플로우

```
[Google 로그인 버튼 클릭]
→ supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
→ Google 동의 화면
→ /auth/callback (route.ts에서 코드 교환)
→ profiles 자동 생성 (트리거)
→ 원래 페이지로 리다이렉트
```

### 4.3 미들웨어 — 보호 라우트만 체크

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PROTECTED_PATHS = [
    '/trips/new',
    '/profile',
];

// 동적 보호 경로 패턴
const PROTECTED_PATTERNS = [
    /^\/trips\/[^/]+\/entries\/new$/,
    /^\/trips\/[^/]+\/entries\/[^/]+\/edit$/,
    /^\/trips\/[^/]+\/tournament$/,
    /^\/trips\/[^/]+\/members$/,
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isProtected =
        PROTECTED_PATHS.some(p => pathname.startsWith(p)) ||
        PROTECTED_PATTERNS.some(p => p.test(pathname));

    if (!isProtected) return NextResponse.next();

    // 인증 확인
    const response = NextResponse.next();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { /* cookie handling */ } }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return response;
}
```

---

## 5. API Routes

### 5.1 AI 태그 추천

```
POST /api/ai/suggest-tags
Auth: Required (editor+)
Body: { imageUrl: string, title: string, restaurantName?: string }
Response: { tags: [{ name, category, confidence }] }
```

### 5.2 AI 후속 질문

```
POST /api/ai/follow-up-questions
Auth: Required (editor+)
Body: { entryId, title, tags[], restaurantName? }
Response: { questions: [{ questionText, questionType, options? }] }
```

### 5.3 AI 종합 랭킹

```
POST /api/ai/generate-ranking
Auth: Required (owner)
Body: { tripId, weights? }
Response: { rankings: [{ entryId, rank, compositeScore, breakdown }], reasoning }
```

---

## 6. Tailwind CSS 4.1 설정

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
    --font-sans: "Pretendard", "Inter", sans-serif;
    --color-primary: oklch(0.7 0.15 30);   /* warm orange */
    --color-surface: oklch(0.98 0.005 80);
    --color-muted: oklch(0.55 0.01 260);
    --radius-default: 0.75rem;
}
```

Tailwind 4.1은 `tailwind.config.js` 불필요 — CSS `@theme` 디렉티브로 설정.

---

## 7. TDD 설정

### 7.1 Jest 설정

```typescript
// jest.config.ts
import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
    testEnvironment: 'jsdom',
    setupFilesAfterSetup: ['<rootDir>/jest.setup.ts'],
    moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/types/**',
    ],
    coverageThreshold: {
        global: { branches: 80, functions: 80, lines: 80, statements: 80 },
    },
};

export default createJestConfig(config);
```

### 7.2 Supabase 모킹

```typescript
// __tests__/mocks/supabase.ts
export const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    auth: {
        getUser: jest.fn(),
        signInWithOAuth: jest.fn(),
        signOut: jest.fn(),
    },
    storage: {
        from: jest.fn().mockReturnValue({
            upload: jest.fn(),
            getPublicUrl: jest.fn(),
        }),
    },
};

jest.mock('@/lib/supabase/client', () => ({
    createClient: () => mockSupabase,
}));
```

---

## 8. PWA (@serwist/next)

```typescript
// src/app/manifest.ts
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'TasteRank - 맛랭크',
        short_name: '맛랭크',
        description: '여행 음식 공동 랭킹',
        start_url: '/trips',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#f97316',
        orientation: 'portrait',
        icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
    };
}
```

---

## 9. 환경 변수

```bash
# .env.local.example
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_APP_URL=https://tasterank.vercel.app
```

---

## 10. 셋업 명령어

```bash
# 프로젝트 생성 (Next.js 16)
npx create-next-app@latest tasterank --typescript --tailwind --eslint --app --src-dir

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# UI
npx shadcn@latest init
npx shadcn@latest add button card input slider badge dialog sheet tabs

# State
npm install zustand

# AI
npm install @anthropic-ai/sdk

# Image
npm install browser-image-compression sharp

# PWA
npm install @serwist/next

# Testing
npm install -D jest @testing-library/react @testing-library/jest-dom @types/jest ts-jest

# Utils
npm install nanoid date-fns
```

---

## 11. SEO — 공개 컬렉션

```typescript
// src/app/(public)/trips/[tripId]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const trip = await getPublicTrip(params.tripId);
    return {
        title: `${trip.name} | TasteRank`,
        description: trip.description,
        openGraph: {
            title: trip.name,
            description: trip.description,
            images: [trip.cover_image_url],
            type: 'website',
        },
    };
}
```

---

## 12. 보안 체크리스트

| 항목 | 구현 |
|------|------|
| 인증 | Google OAuth + Supabase Auth |
| 권한 | RLS (공개 읽기 + 멤버 쓰기) |
| API 키 | 서버 사이드만 (ANTHROPIC, SERVICE_ROLE) |
| 이미지 | 클라이언트 리사이즈 + Storage RLS |
| 초대 코드 | 8자 hex, 재생성 가능 |
| 공개 접근 | anon key로 RLS 통과, 쓰기 불가 |
