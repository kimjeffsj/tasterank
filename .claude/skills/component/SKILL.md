# 컴포넌트 개발 패턴

TasteRank 프로젝트의 React 컴포넌트 작성 규칙.

## 기본 원칙

1. **Server Components 기본** — `"use client"`는 필요한 경우에만 (이벤트 핸들러, hooks, 브라우저 API)
2. **TDD** — 테스트 먼저 작성 → 구현 → 리팩토링
3. **테스트 파일 위치** — 대상과 같은 디렉토리에 `.test.tsx` 배치
4. **shadcn/ui 기반** — 기본 UI는 shadcn/ui 컴포넌트 활용
5. **Tailwind 4.1** — `@theme` 변수 기반 스타일링, oklch 컬러

## 디렉토리 구조

```
src/components/
├── ui/           # shadcn/ui (자동 생성, 수정 지양)
├── trip/         # 컬렉션 관련: TripCard, TripForm
├── entry/        # 음식 관련: EntryCard, EntryForm, PhotoUploader, RatingSlider
├── ranking/      # 랭킹: RankingList, RankingCard
├── tournament/   # 월드컵: MatchCard, TournamentBracket
├── ai/           # AI UI: TagSuggestions, FollowUpQuestions
├── auth/         # 인증: AuthGuard, LoginPrompt, GoogleLoginButton
└── layout/       # 레이아웃: BottomNav, Header
```

## 컴포넌트 작성 템플릿

### Server Component (기본)

```tsx
// src/components/trip/TripCard.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";

interface TripCardProps {
  id: string;
  name: string;
  coverImageUrl: string | null;
  entryCount: number;
  memberCount: number;
  topScore: number | null;
}

export function TripCard({
  id,
  name,
  coverImageUrl,
  entryCount,
  memberCount,
  topScore,
}: TripCardProps) {
  return (
    <Link href={`/trips/${id}`}>
      <Card className="overflow-hidden transition-transform active:scale-[0.97]">
        {coverImageUrl && (
          <div className="relative aspect-video">
            <Image
              src={coverImageUrl}
              alt={name}
              fill
              className="object-cover"
            />
          </div>
        )}
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold">{name}</h3>
          <p className="text-sm text-muted">
            {entryCount}개 음식 · {memberCount}명 참여
          </p>
          {topScore && <Badge variant="secondary">⭐ 최고점 {topScore}</Badge>}
        </CardContent>
      </Card>
    </Link>
  );
}
```

### Client Component

```tsx
// src/components/entry/RatingSlider.tsx
"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";

interface RatingSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function RatingSlider({ value, onChange }: RatingSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">내 점수</span>
        <span className="text-3xl font-bold">{value}</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={1}
        max={10}
        step={0.5}
        className="h-12"
      />
    </div>
  );
}
```

## 디자인 스펙 주요 사항

### 레이아웃

- 모바일 우선: 375px 기준, max-w-lg 중앙 정렬
- 하단 네비게이션: 3탭 (홈/내 여행/프로필)
- Safe area padding (노치 대응): `pb-safe`

### 카드 스타일

- **TripCard**: `aspect-video` 커버 + 하단 정보
- **EntryCard**: `aspect-square` 정사각 사진 + 음식명/점수
- **RankingCard**: 1위는 크게 강조, 2~3위 중간, 4위 이후 컴팩트

### 색상 사용

- Primary (오렌지): CTA, 활성 탭, 선택된 태그
- Gold/Silver/Bronze: 1위/2위/3위 랭킹
- Muted: 보조 텍스트, 비활성 요소

### 인터랙션

- 카드 탭: `active:scale-[0.97]`
- 랭킹 진입: 순차 `fade-in` + `slide-up`
- 월드컵 선택: 선택 카드 확대 + 비선택 fade-out

## Props 네이밍 규칙

- 이벤트: `on` + 동사 (`onSubmit`, `onChange`, `onSelect`)
- 불리언: `is` / `has` 접두사 (`isPublic`, `hasRating`)
- 데이터: DB 컬럼명의 camelCase 변환 (`coverImageUrl` ← `cover_image_url`)

## shadcn/ui 컴포넌트 추가

```bash
npx shadcn@latest add button card input slider badge dialog sheet tabs
```

필요한 컴포넌트가 없으면 `npx shadcn@latest add <name>` 으로 추가.
shadcn/ui 컴포넌트는 `src/components/ui/`에 자동 생성됨.
