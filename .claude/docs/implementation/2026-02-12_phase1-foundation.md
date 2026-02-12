# Phase 1 — 파운데이션 (DB, Auth, Routing)

> **날짜**: 2026-02-12
> **Phase**: Phase 1 — 파운데이션
> **관련 체크리스트**: DB 스키마, 인증, 공개 라우팅

---

## 요약

ERD 기반 전체 DB 스키마 마이그레이션 (7 테이블 + RLS + 뷰 + 스토리지), Supabase 클라이언트 3종, Auth middleware, useAuth 훅, LoginPrompt 모달, (public)/(protected)/(auth) 라우트 그룹을 구축했다.

## 접근 방식

### 선택한 방법
- **마이그레이션 구조**: 단일 파일에 Tables → Functions → RLS → Views → Storage 순서로 배치. SQL에서 참조 순서 문제(헬퍼 함수가 테이블보다 먼저 정의)를 해결하기 위해 의존성 순서를 명확히 분리.
- **invite_code**: `gen_random_bytes` 대신 `substr(md5(random()::text), 1, 8)` 사용. Supabase 원격 DB에서 pgcrypto의 `gen_random_bytes`가 스키마 경로 문제로 접근 불가.
- **Supabase CLI**: npm 패키지 대신 Homebrew 설치. pnpm에서 바이너리 생성 실패 이슈.
- **환경변수**: `ANON_KEY` → `PUBLISHABLE_KEY` (Supabase 최신 네이밍).

### 고려한 대안
- **마이그레이션 분할**: 테이블별로 파일 분리 — 초기 단계에서 오버헤드. 단일 파일로 충분.
- **gen_random_bytes**: `extensions.gen_random_bytes(4)` — 스키마 경로 불확실. md5+random으로 대체.

## 트레이드오프

| 항목 | 장점 | 단점 |
|------|------|------|
| 단일 마이그레이션 파일 | 전체 스키마 한눈에 파악 | 파일이 400줄로 큼 |
| md5(random()) invite_code | pgcrypto 의존 없음 | 랜덤 품질이 약간 낮음 (충분히 실용적) |
| anon 클라이언트 | 비로그인 공개 조회 간편 | 별도 클라이언트 인스턴스 유지 |

## 주요 파일 변경

- `supabase/migrations/20260212072151_initial_schema.sql` — 전체 DB 스키마
- `src/types/database.ts` — 자동 생성 타입 (560줄)
- `src/lib/supabase/client.ts` — 브라우저 클라이언트
- `src/lib/supabase/server.ts` — 서버 클라이언트 (cookie 기반)
- `src/lib/supabase/anon.ts` — 비로그인 클라이언트
- `src/middleware.ts` — Auth 세션 갱신
- `src/hooks/useAuth.ts` — 클라이언트 Auth 훅
- `src/components/auth/LoginPrompt.tsx` — 로그인 모달 (lazy auth)
- `src/app/auth/callback/route.ts` — OAuth 콜백
- `src/app/(public)/page.tsx` — 홈 페이지 (공개 컬렉션 목록)
- `src/app/(public)/trips/[id]/page.tsx` — 컬렉션 상세
- `src/app/(protected)/layout.tsx` — 로그인 필수 레이아웃

## 테스트

- [x] 기존 cn 유틸 테스트 유지 (3개)
- [ ] Supabase 모킹 패턴 미확립 (다음 단계)

## 후속 작업

- [ ] Google OAuth Dashboard 설정 (Supabase Auth → Providers)
- [ ] Supabase 모킹 패턴 확립
- [ ] Phase 2: Trip CRUD, 초대, 음식 등록, 평가
