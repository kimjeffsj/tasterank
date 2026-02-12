# Supabase 통합 패턴

TasteRank 프로젝트의 Supabase (Auth, DB, Storage, RLS) 통합 규칙.

## 클라이언트 구분 (3종)

### 브라우저 클라이언트 (`src/lib/supabase/client.ts`)

```typescript
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
```

- `"use client"` 컴포넌트에서 사용
- 로그인된 사용자의 세션 자동 관리

### 서버 클라이언트 (`src/lib/supabase/server.ts`)

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );
}
```

- Server Components, Route Handlers, Server Actions에서 사용
- `cookies()` async 호출 (Next.js 16)

### 비로그인용 anon 클라이언트 (`src/lib/supabase/anon.ts`)

```typescript
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export const anonClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);
```

- 비로그인 공개 데이터 조회 전용
- RLS에서 `is_public = TRUE` 조건으로 접근

## 마이그레이션 규칙

- 파일명: `supabase/migrations/NNNNN_설명.sql` (5자리 순번)
- 모든 테이블에 `ENABLE ROW LEVEL SECURITY` 필수
- 공개 테이블은 반드시 anon SELECT 정책 포함
- UUID PK는 `DEFAULT gen_random_uuid()`
- 타임스탬프는 `TIMESTAMPTZ DEFAULT NOW()`
- 외래 키에 `ON DELETE CASCADE` 적용
- 자주 쿼리되는 컬럼에 인덱스 생성

## RLS 정책 패턴

### 공개 읽기 + 권한 쓰기 (기본 패턴)

```sql
-- 비로그인 포함 공개 조회
CREATE POLICY "public_select" ON public.{table} FOR SELECT
  USING ({공개 조건: is_public = TRUE 또는 관련 trip이 공개});

-- 멤버 비공개 조회
CREATE POLICY "member_select" ON public.{table} FOR SELECT
  USING (is_trip_member({trip_id_column}));

-- editor 이상 생성
CREATE POLICY "editor_insert" ON public.{table} FOR INSERT
  WITH CHECK (is_trip_editor({trip_id_column}) AND auth.uid() = {created_by_column});

-- 작성자 수정
CREATE POLICY "creator_update" ON public.{table} FOR UPDATE
  USING (auth.uid() = {created_by_column});

-- 작성자 또는 owner 삭제
CREATE POLICY "creator_owner_delete" ON public.{table} FOR DELETE
  USING (auth.uid() = {created_by_column} OR is_trip_owner({trip_id_column}));
```

### 헬퍼 함수

- `is_trip_member(trip_uuid)` — 멤버 여부
- `is_trip_editor(trip_uuid)` — editor 또는 owner
- `is_trip_owner(trip_uuid)` — owner만

## 타입 생성

스키마 변경 후 **반드시** 실행:

```bash
npx supabase gen types typescript > src/types/database.ts
```

## Storage 버킷

| 버킷          | 용도          | 공개 |
| ------------- | ------------- | ---- |
| `food-photos` | 음식 사진     | ✅   |
| `trip-covers` | 컬렉션 커버   | ✅   |
| `avatars`     | 프로필 아바타 | ✅   |

업로드: 인증된 유저만. 조회: 누구나 (공개 버킷).

## 쿼리 패턴

### 공개 컬렉션 목록 (비로그인)

```typescript
const { data } = await anonClient
  .from("trips")
  .select("*, trip_members(count), food_entries(count)")
  .eq("is_public", true)
  .order("created_at", { ascending: false });
```

### 멤버 전용 데이터 (로그인)

```typescript
const supabase = createClient();
const { data } = await supabase
  .from("food_entries")
  .select("*, food_photos(*), ratings(*), food_entry_tags(*, tags(*))")
  .eq("trip_id", tripId);
```

### 뷰 활용

- `v_entry_avg_scores` — 음식별 평균 점수
- `v_trip_rankings` — 여행 내 랭킹 (RANK() OVER)
