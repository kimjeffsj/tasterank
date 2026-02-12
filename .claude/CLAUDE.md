# TasteRank (맛랭크)

여행 음식 공동 평가·랭킹 PWA. 비로그인 공개 열람 + 로그인 시 수정.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript 5 · Tailwind 4.1 (CSS-first, no config.js) · shadcn/ui (selective: Dialog, Sheet, Slider, Form) · Supabase (Auth, DB, Storage, RLS) · Zustand · Claude API (claude-sonnet-4-20250514) · @serwist/next (PWA) · Vercel · Plus Jakarta Sans · Material Icons Round

## Commands

```bash
pnpm dev                 # 개발 서버 (Turbopack)
pnpm build               # 프로덕션 빌드
pnpm test                # Jest 전체 실행
pnpm test --watch        # Jest 워치 모드
pnpm test --coverage     # 커버리지 리포트
pnpm test path/to/file   # 단일 파일 테스트

# Supabase
pnpm exec supabase db push                          # 마이그레이션 적용
pnpm exec supabase gen types typescript > src/types/database.ts  # 타입 생성
pnpm exec supabase migration new <name>             # 새 마이그레이션

# shadcn/ui
pnpm dlx shadcn@latest add <component>
```

## Architecture

```
src/app/(public)/      비로그인 접근 가능 (컬렉션 목록, 상세, 랭킹)
src/app/(protected)/   로그인 필수 (생성, 수정, 삭제, 월드컵)
src/app/(auth)/        로그인/콜백
src/app/api/ai/        AI API Routes (서버 전용)
src/components/        도메인별: trip/, entry/, ranking/, tournament/, auth/, layout/
src/hooks/             커스텀 훅: useTrips, useEntries, useRatings, useAuth
src/lib/supabase/      client.ts (브라우저), server.ts (SSR), anon.ts (비로그인)
src/lib/ai/            Claude API 클라이언트, 프롬프트, 랭킹 엔진
src/stores/            Zustand 스토어
src/types/             database.ts (자동생성), index.ts
supabase/migrations/   SQL 마이그레이션 파일
```

## Critical Rules

- **비로그인 열람**: `(public)` 라우트는 인증 없이 접근 가능. RLS에서 `is_public = TRUE`인 데이터는 anon SELECT 허용.
- **Lazy Auth**: 수정 액션 시도 시에만 `LoginPrompt` 모달로 Google OAuth 유도. 앱 진입 시 로그인 강제하지 않음.
- **Google OAuth만 사용**. Kakao 등 다른 provider 없음.
- **TDD**: 테스트 먼저 작성 → 구현 → 리팩토링. 커버리지 80%+. 테스트 파일은 대상과 같은 디렉토리에 `.test.tsx` 배치.
- **Tailwind 4.1**: `tailwind.config.js` 사용 금지. `globals.css` 내 `@theme` 블록으로 커스텀. hex 컬러.
- **Font**: Plus Jakarta Sans (Google Fonts). 한국어 폴백 없음.
- **Icons**: Material Icons Round (Google Fonts). `<span className="material-icons-round">icon_name</span>`.
- **UI Language**: English first. i18n/multi-language support planned for later.
- **shadcn/ui 선택적 사용**: Dialog, Sheet, Slider, Form만 사용. Card, Button, Badge 등 비주얼 컴포넌트는 레퍼런스 디자인 Tailwind 패턴 사용.
- **서버 키 보호**: `ANTHROPIC_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`는 서버 전용. 절대 클라이언트/브라우저 노출 금지.
- **Server Components 기본**: `"use client"` 필요한 경우에만 사용.
- **Supabase 타입 변경 후 반드시 `pnpm exec supabase gen types` 실행**.

## Development Workflow

1. **세션 시작 시** `.claude/CHECKLIST.md`를 읽고 현재 단계 파악
2. **구현 전** 해당 단계에 필요한 문서만 로드 (아래 참조)
3. **구현 후** 체크리스트 업데이트 + 구현 노트 작성 (`.claude/docs/implementation/`)
4. **구현 노트 규칙**: `{YYYY-MM-DD}_{name}.md`, 템플릿은 `_TEMPLATE.md` 참고
5. **트레이드오프 기록**: 각 구현 결정의 이유, 대안, 장단점을 구현 노트에 기록
6. **커밋 메시지 추천**: 각 작업 이후 커밋 메시지 추천 한줄 혹은 불렛포인트로 간단하게

## Docs — 필요 시에만 로드

| 문서            | 경로                               | 로딩 시점                             |
| --------------- | ---------------------------------- | ------------------------------------- |
| 체크리스트      | `.claude/CHECKLIST.md`             | 세션 시작 시                          |
| 제품 요구사항   | `.claude/docs/PRD.md`              | 요구사항/기능 스펙 확인 시            |
| DB 스키마/RLS   | `.claude/docs/ERD.md`              | DB/스키마/RLS/마이그레이션 작업 시    |
| 기술 명세       | `.claude/docs/TECH_SPEC.md`        | 설정/인증/API/서버 구조 작업 시       |
| 디자인/UI       | `.claude/docs/DESIGN.md`           | UI 컴포넌트/스타일 작업 시            |
| 디자인 스킬     | `.claude/skills/designer/SKILL.md` | 컴포넌트/페이지 디자인 시 (quick ref) |
| 레퍼런스 디자인 | `.claude/docs/reference_design.md` | 디자인 세부 HTML 확인 시              |
| 구현 노트       | `.claude/docs/implementation/*.md` | 이전 구현 컨텍스트 필요 시            |

## Quick Reference

### Supabase 클라이언트 3종

- `createBrowserClient()` — 클라이언트 컴포넌트 (`"use client"`)
- `createServerClient()` — Server Components, Route Handlers, Middleware
- `createAnonClient()` — 비로그인 공개 데이터 조회 전용

### 테스트 패턴

- 파일: `Component.test.tsx` (같은 디렉토리)
- 구조: Arrange → Act → Assert
- 서버 컴포넌트: `async/await` 렌더링 테스트
- Supabase 모킹: `jest.mock('@/lib/supabase/client')`

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL       Supabase 프로젝트 URL
NEXT_PUBLIC_SUPABASE_ANON_KEY  Supabase anon key
SUPABASE_SERVICE_ROLE_KEY      서버 전용
ANTHROPIC_API_KEY              서버 전용
NEXT_PUBLIC_APP_URL            앱 배포 URL
```
