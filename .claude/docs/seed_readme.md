# Seed Data Guide

## Overview

`supabase/seed.sql` contains demo data for testing the app without real user data.

| Data | Count |
|------|-------|
| Demo user | 1 (`tasterank-demo`) |
| Trips | 2 (Seoul + Tokyo) |
| Food entries | 128 (64 per trip) |
| Ratings | 128 (1 per entry, scores 5-10) |
| Tags | 20 (cuisine/flavor/style/general) |

Both trips are **public** (`is_public = TRUE`) so anyone can view without login.

## UUID Scheme

All IDs follow a deterministic pattern for easy debugging:

| Entity | UUID Pattern | Range |
|--------|-------------|-------|
| Demo user | `00000000-0000-4000-a000-000000000001` | fixed |
| Seoul trip | `00000000-0000-4000-a000-000000000010` | fixed |
| Tokyo trip | `00000000-0000-4000-a000-000000000020` | fixed |
| Tags | `00000000-0000-4000-b000-00000000XXXX` | 0001..0014 (hex) |
| Seoul entries | `00000000-0000-4000-a001-00000000XXXX` | 0001..0040 (hex) |
| Tokyo entries | `00000000-0000-4000-a002-00000000XXXX` | 0001..0040 (hex) |

## Remote Supabase 적용 방법

### Method 1: Supabase Dashboard SQL Editor (Recommended)

1. https://supabase.com/dashboard 접속
2. 프로젝트 `tasterank` (ref: `jcarlbnfbgqgdieffixh`) 선택
3. 좌측 메뉴 **SQL Editor** 클릭
4. `supabase/seed.sql` 파일 내용을 전체 복사/붙여넣기
5. **Run** 클릭
6. 에러 없이 완료되면 성공

### Method 2: Supabase CLI (db reset)

**주의**: 이 방법은 기존 데이터를 **모두 삭제**하고 마이그레이션부터 재실행합니다.

```bash
# 리모트 DB 리셋 (마이그레이션 + seed.sql 자동 실행)
pnpm exec supabase db reset --linked
```

프롬프트에서 `y`를 입력하면 실행됩니다.

### Method 3: psql 직접 실행

```bash
# 1. DB URL 확인 (Dashboard > Settings > Database > Connection string > URI)
# 형식: postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# 2. seed.sql 실행
psql "postgresql://postgres.jcarlbnfbgqgdieffixh:[YOUR_DB_PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres" -f supabase/seed.sql
```

DB 비밀번호는 Dashboard > Settings > Database > Database password에서 확인.

### Method 4: Supabase CLI SQL 실행

```bash
# seed.sql 내용을 직접 실행
pnpm exec supabase db execute --linked < supabase/seed.sql
```

## 재실행 (Idempotent)

모든 INSERT에 `ON CONFLICT ... DO NOTHING`이 적용되어 있어서 **여러 번 실행해도 안전**합니다. 이미 존재하는 데이터는 건너뜁니다.

## 시드 데이터 삭제

시드 데이터만 삭제하려면 SQL Editor에서:

```sql
-- 순서 중요 (FK 종속성)
DELETE FROM ratings WHERE user_id = '00000000-0000-4000-a000-000000000001';
DELETE FROM food_entry_tags WHERE entry_id IN (SELECT id FROM food_entries WHERE created_by = '00000000-0000-4000-a000-000000000001');
DELETE FROM food_photos WHERE uploaded_by = '00000000-0000-4000-a000-000000000001';
DELETE FROM food_entries WHERE created_by = '00000000-0000-4000-a000-000000000001';
DELETE FROM trip_members WHERE user_id = '00000000-0000-4000-a000-000000000001';
DELETE FROM trips WHERE owner_id = '00000000-0000-4000-a000-000000000001';
DELETE FROM profiles WHERE id = '00000000-0000-4000-a000-000000000001';
DELETE FROM auth.users WHERE id = '00000000-0000-4000-a000-000000000001';
-- Tags are shared; only delete if no other entries use them
DELETE FROM tags WHERE id LIKE '00000000-0000-4000-b000-%';
```

## 검증 쿼리

시드 데이터 적용 후 아래 쿼리로 확인:

```sql
-- 트립 확인
SELECT id, name, is_public FROM trips WHERE owner_id = '00000000-0000-4000-a000-000000000001';

-- 엔트리 수 확인 (각 64개)
SELECT t.name, COUNT(e.id) FROM trips t
JOIN food_entries e ON e.trip_id = t.id
WHERE t.owner_id = '00000000-0000-4000-a000-000000000001'
GROUP BY t.name;

-- 평균 점수 확인 (랭킹 뷰)
SELECT title, avg_score, rank FROM v_trip_rankings
WHERE trip_id = '00000000-0000-4000-a000-000000000010'
ORDER BY rank LIMIT 10;

-- 태그 확인
SELECT COUNT(*) FROM tags WHERE id LIKE '00000000-0000-4000-b000-%';
```

## 현재 포함되지 않은 데이터

- **food_photos**: 추후 Unsplash URL로 추가 예정
- **food_entry_tags**: 추후 태그 연결 추가 예정
- **tournaments**: 앱에서 직접 생성/플레이
- **ai_questions / ai_responses**: AI 기능으로 생성

## Trip Details

### Seoul Street Food Tour
- 기간: 2025-03-10 ~ 2025-03-16
- 64개 한국 음식 (떡볶이, 김밥, 삼겹살, 냉면, 치킨 등)
- 서울 주요 지역: 명동, 강남, 홍대, 인사동, 종로, 잠실, 이태원 등

### Tokyo Ramen & Beyond
- 기간: 2025-04-01 ~ 2025-04-07
- 64개 일본 음식 (라멘, 스시, 돈카츠, 타코야키, 우동 등)
- 도쿄 주요 지역: 시부야, 신주쿠, 긴자, 아사쿠사, 이케부쿠로 등
