# TasteRank Development Checklist

> 진행 상태: Phase 4 Step 4-2 완료 ✅ → Step 4-3 다음

---

## Phase 0: 프로젝트 셋업 ✅

- [x] Next.js 16 프로젝트 생성, `src/` 구조, tsconfig paths
- [x] `.env.local` 환경변수 설정
- [x] Plus Jakarta Sans + Material Icons Round 폰트
- [x] Tailwind 4.1 커스텀 테마 (`@theme` 블록) + 다크모드 기초
- [x] shadcn/ui 선택적 설치 (Dialog, Sheet, Slider, Form)
- [x] `.claude/` 구조 정리
- [x] Jest + React Testing Library 설정
- [x] Supabase 프로젝트 생성 + CLI 설정 + 환경변수 연결

---

## Phase 1: 파운데이션 ✅

- [x] DB 스키마 7개 테이블 + RLS + 타입 생성
- [x] Supabase 클라이언트 3종 (browser, server, anon)
- [x] Auth middleware + `useAuth` 훅 + `LoginPrompt` 모달
- [x] 라우트 그룹: `(public)`, `(protected)`, `(auth)`
- [x] 공개 컬렉션 목록/상세 페이지
- [x] 첫 번째 테스트 + Supabase 모킹 패턴

---

## Phase 2: 핵심 기능

### Step 2-1: Trip CRUD + DB 함수 ✅

- [x] `create_trip` RPC (trip + owner member 원자적 생성)
- [x] 함수 search_path 보안 수정
- [x] `useTrips` 훅
- [x] `TripForm` 컴포넌트
- [x] 생성/수정/삭제 페이지
- [x] Trip CRUD 테스트

### Step 2-2: 초대 시스템 ✅

- [x] `join_trip_by_invite` RPC 함수
- [x] `/join/[inviteCode]` 페이지
- [x] `InviteShare` 컴포넌트
- [x] 멤버 목록 표시

### Step 2-3: useEntries 훅 + 테스트 ✅

- [x] `useEntries` 훅 (list, create, update, delete)
- [x] useEntries 테스트

### Step 2-4: 음식 등록 폼 UI ✅

- [x] `EntryForm` 컴포넌트 (음식명, 식당명, 위치, 한줄평)
- [x] `/trips/[tripId]/entries/new` 페이지
- [x] EntryForm 테스트 (11개)

### Step 2-5: 사진 업로드 ✅

- [x] `PhotoUploader` 컴포넌트 (Supabase Storage) + 테스트 8개
- [x] `uploadEntryPhotos` 유틸리티 (`src/lib/storage.ts`)
- [x] EntryForm에 사진 통합 (EntryFormData에 photos 필드 추가)
- [x] 트립 상세 엔트리 카드에 사진 표시 (food_photos join)

### Step 2-6: useRatings 훅 + 평가 UI ✅

- [x] `useRatings` 훅 + 테스트 7개
- [x] `RatingSlider` 컴포넌트 (1~10점, 0.5 단위) + 테스트 6개
- [x] EntryForm에 평가 통합 (score 필드 + 저장)

### Step 2-7: 테스트 보강 + RLS 검증 ✅

- [x] 초대 시스템 테스트 (InviteShare 5개)
- [x] RLS 통합 테스트 (쿼리 패턴 검증 9개)

---

## Phase 3: 랭킹 & AI

### Step 3-1: 태그 CRUD ✅

- [x] `useTags` 훅 + 테스트 7개
- [x] `TagSelector` 컴포넌트 + 테스트 13개
- [x] EntryForm에 태그 통합 (TagSelector, EntryFormData에 tags 필드)
- [x] new/page.tsx에서 태그 저장 (upsert + link)

### Step 3-2: AI 태그 추천 ✅

- [x] `@google/generative-ai` SDK 설치
- [x] `src/lib/ai/client.ts` — Gemini 클라이언트 (gemini-2.0-flash)
- [x] `src/lib/ai/prompts.ts` — 태그 추천 프롬프트 + 파서 + 테스트 8개
- [x] `/api/ai/suggest-tags` Route Handler + 테스트 4개
- [x] AI Suggest 버튼 + 로딩 상태 + AI 칩 UI (TagSelector 내장)

### Step 3-3: 기본 랭킹 페이지 ✅

- [x] `/trips/[tripId]/ranking` 페이지 (평균 점수 기준)
- [x] 태그 필터 적용
- [x] 공개 접근 (비로그인)
- [x] 테스트 (8개)
- [x] 트립 상세 페이지에 Ranking 탭 링크 추가

---

## Phase 4: 폴리시

### Step 4-1: PWA 기초 ✅

- [x] `@serwist/next` 설치 + Service Worker
- [x] manifest.ts + placeholder 아이콘 (192, 512, 512-maskable)
- [x] offline fallback 페이지 (`/~offline`)
- [x] Apple PWA meta tags
- [x] Next.js 16 Turbopack 호환 (dev: disable, build: --webpack)

### Step 4-2: 반응형 UI ✅

- [x] 모바일 레이아웃 점검 (모든 페이지 max-w-md 패턴 확인)
- [x] 다크 모드 지원 (ThemeProvider + ThemeToggle + 전체 페이지 dark: 클래스)
- [x] 로딩/에러/빈 상태 UI (loading.tsx, error.tsx, not-found.tsx + EmptyState/Skeleton)

### Step 4-3: SEO + 메타

- [ ] 공개 컬렉션 SSR 메타태그
- [ ] OG 이미지
- [ ] sitemap.xml + robots.txt

### Step 4-4: 테스트 + 배포

- [ ] 커버리지 80%+ 달성
- [ ] Vercel 배포 설정
- [ ] 프로덕션 스모크 테스트

---

## Phase 5: 고급 기능 (향후)

### Step 5-1: AI 후속 질문

- [ ] AI 후속 질문 생성 (맛 특징, 재방문 의향, 가성비)
- [ ] 응답 저장

### Step 5-2: 이상형 월드컵

- [ ] 토너먼트 생성 (8/16/32강)
- [ ] 1:1 대결 UI
- [ ] 멤버별 진행 + 집계

### Step 5-3: AI 종합 랭킹

- [ ] 가중 합산 (점수 40% + 월드컵 25% + AI 20% + 감성 15%)
- [ ] AI 코멘트 생성

### Step 5-4: 소셜 + 지도

- [ ] 소셜 공유 (랭킹 카드)
- [ ] 지도 뷰
- [ ] AI 사진 분석

---

## 구현 노트 인덱스

구현 완료된 단계의 노트는 `.claude/docs/implementation/`에 기록:

| 날짜       | 파일                              | 주제                                              |
| ---------- | --------------------------------- | ------------------------------------------------- |
| 2026-02-10 | `2026-02-10_project-structure.md` | 프로젝트 구조 개선 (src/ 이동, .claude/ 정리)     |
| 2026-02-11 | `2026-02-11_phase0-setup.md`      | Phase 0 셋업 (폰트, 테마, shadcn, Jest, 환경변수) |
| 2026-02-12 | `2026-02-12_phase1-foundation.md` | Phase 1 파운데이션 (DB 스키마, Auth, 라우팅)      |
| 2026-02-11 | `2026-02-11_step2-3-useEntries.md` | Step 2-3 useEntries 훅 (CRUD + 테스트 7개)       |
| 2026-02-13 | `2026-02-13_step2-4-entry-form.md` | Step 2-4 EntryForm 컴포넌트 (테스트 11개)        |
| 2026-02-13 | `2026-02-13_step2-5-photo-upload.md` | Step 2-5 사진 업로드 (PhotoUploader, Storage)   |
| 2026-02-13 | `2026-02-13_step2-6-ratings.md`      | Step 2-6 평가 시스템 (useRatings, RatingSlider) |
| 2026-02-13 | `2026-02-13_step2-7-tests.md`        | Step 2-7 테스트 보강 (InviteShare, RLS 검증)    |
| 2026-02-13 | `2026-02-13_step3-1-3-2-tags-ai.md`  | Step 3-1/3-2 태그 CRUD + AI 태그 추천           |
| 2026-02-14 | `2026-02-14_step3-3-ranking-page.md`  | Step 3-3 기본 랭킹 페이지                        |
| 2026-02-14 | `2026-02-14_step4-1-pwa-setup.md`     | Step 4-1 PWA 기초 설정                            |
| 2026-02-14 | `2026-02-14_step4-2-responsive-ui.md` | Step 4-2 반응형 UI (다크모드, 로딩/에러 상태)     |
