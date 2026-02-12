# TasteRank Development Checklist

> 진행 상태: Phase 1 완료 → Phase 2 진행 중

---

## Phase 0: 프로젝트 셋업

### 구조 & 설정

- [x] Next.js 16 프로젝트 생성
- [x] `src/` 디렉토리 구조 이동 (`app/` → `src/app/`)
- [x] tsconfig.json paths 업데이트 (`@/*` → `./src/*`)
- [x] `.env.local` 환경변수 설정
- [x] Plus Jakarta Sans 웹폰트 설정 (Google Fonts)
- [x] Material Icons Round 설정 (Google Fonts)
- [x] Tailwind 4.1 커스텀 테마 (`globals.css` `@theme` 블록, 레퍼런스 색상 체계)
- [x] 다크모드 기초 설정 (class strategy)
- [x] shadcn/ui 선택적 설치 (`dialog`, `sheet`, `slider`, `form`만)

### 개발 도구

- [x] `.claude/` 구조 정리 (CLAUDE.md, CHECKLIST.md, docs, skills)
- [x] Jest + React Testing Library 설정
- [ ] ESLint + Prettier 설정 (보류)
- [ ] Husky + lint-staged (보류)

### Supabase

- [x] Supabase 프로젝트 생성
- [x] 로컬 Supabase CLI 설정 (`supabase init` + `supabase link`)
- [x] 환경변수 연결 확인

### PWA 기초 (선택 — Phase 4로 미뤄도 됨)

- [ ] `@serwist/next` 설치
- [ ] 기본 manifest.json

---

## Phase 1 (W1): 파운데이션

### DB 스키마 & 마이그레이션

- [x] `profiles` 테이블 (Google OAuth 연동)
- [x] `trips` 테이블 (컬렉션)
- [x] `trip_members` 테이블 (역할: owner/editor)
- [x] `entries` 테이블 (음식 항목)
- [x] `ratings` 테이블 (멤버별 점수)
- [x] `tags` + `entry_tags` 테이블
- [x] RLS 정책 설정 (공개 열람 + 역할 기반 수정)
- [x] 타입 생성 (`supabase gen types`)

### 인증

- [ ] Supabase Auth 설정 (Google OAuth — Dashboard에서 설정 필요)
- [x] `src/lib/supabase/client.ts` — 브라우저 클라이언트
- [x] `src/lib/supabase/server.ts` — 서버 클라이언트
- [x] `src/lib/supabase/anon.ts` — 비로그인 클라이언트
- [x] Auth middleware (`src/middleware.ts`)
- [x] `useAuth` 훅
- [x] `LoginPrompt` 모달 컴포넌트 (lazy auth)

### 공개 라우팅

- [x] `(public)` 레이아웃 — 비로그인 접근 가능
- [x] `(protected)` 레이아웃 — 로그인 리다이렉트
- [x] `(auth)` 라우트 — 로그인/콜백 페이지
- [x] 공개 컬렉션 목록 페이지 (`/`)
- [x] 공개 컬렉션 상세 페이지 (`/trips/[id]`)

### TDD 환경

- [x] 첫 번째 테스트 작성 및 통과 확인
- [x] Supabase 모킹 패턴 확립
- [ ] CI에서 테스트 실행 설정 (선택)

---

## Phase 2 (W2): 핵심 기능

### 컬렉션 (Trip) CRUD

- [x] 컬렉션 생성 폼 (여행명, 기간, 설명, 공개/비공개)
- [x] 컬렉션 수정 페이지
- [x] 컬렉션 삭제 (소프트 삭제 또는 하드 삭제)
- [x] `useTrips` 훅
- [x] Trip CRUD 테스트
- [x] `create_trip` RPC 함수 (trip + owner member 원자적 생성)
- [x] 함수 search_path 보안 경고 수정

### 초대 시스템

- [x] 초대 코드/링크 생성
- [x] 초대 수락 → `trip_members`에 editor 역할 추가
- [x] 멤버 목록 표시
- [ ] 초대 시스템 테스트
- [x] `join_trip_by_invite` RPC 함수

### 음식 등록 (Entry)

- [ ] 음식 등록 폼 (사진, 음식명, 식당명, 위치, 한줄평)
- [ ] 사진 업로드 (Supabase Storage)
- [ ] 위치 기록 (Geolocation + 수동 입력)
- [ ] `useEntries` 훅
- [ ] Entry CRUD 테스트

### 평가 (Rating)

- [ ] 점수 평가 UI (1~10점)
- [ ] 멤버별 개별 평가 저장
- [ ] `useRatings` 훅
- [ ] Rating 테스트

### RLS 검증

- [ ] 공개 컬렉션: 비로그인 SELECT 확인
- [ ] 비공개 컬렉션: 멤버만 접근 확인
- [ ] 수정 권한: owner/editor만 가능 확인
- [ ] RLS 통합 테스트

---

## Phase 3 (W3): 랭킹 & AI

### 태그 시스템

- [ ] 수동 태그 추가/제거 UI
- [ ] 태그 필터 (랭킹 페이지)
- [ ] 태그 시스템 테스트

### AI 태그 추천

- [ ] `src/app/api/ai/tags/route.ts` — Gemini API 엔드포인트
- [ ] `src/lib/ai/` — Claude 클라이언트, 프롬프트 템플릿
- [ ] 음식 사진 + 이름 → 태그 3~5개 추천
- [ ] 추천 태그 칩 UI (선택/제거/추가)
- [ ] AI 태그 추천 테스트

### 랭킹 페이지

- [ ] 기본 랭킹 (평균 점수 기준)
- [ ] 태그 필터 적용 랭킹
- [ ] 공개 접근 가능 (비로그인)
- [ ] 랭킹 페이지 테스트

---

## Phase 4 (W4): 폴리시

### PWA

- [ ] Service Worker 설정 (`@serwist/next`)
- [ ] 오프라인 캐싱 전략
- [ ] 홈 화면 추가 (manifest, 아이콘)
- [ ] PWA 동작 테스트

### 반응형 UI & 디자인

- [ ] 모바일 우선 레이아웃 최종 점검
- [ ] 데스크탑 레이아웃 조정
- [ ] 다크 모드 지원
- [ ] 로딩/에러/빈 상태 UI

### SEO & 메타

- [ ] 공개 컬렉션 SSR 메타태그
- [ ] OG 이미지 (동적 생성 또는 기본)
- [ ] sitemap.xml
- [ ] robots.txt

### 테스트 & 배포

- [ ] 전체 커버리지 80%+ 달성
- [ ] E2E 테스트 (선택 — Playwright)
- [ ] Vercel 배포 설정
- [ ] 프로덕션 환경변수 설정
- [ ] 배포 후 스모크 테스트

---

## Phase 5: Phase 2 기능 (향후)

### AI 후속 질문

- [ ] AI 후속 질문 생성 (맛 특징, 재방문 의향, 가성비 등)
- [ ] 후속 질문 응답 저장
- [ ] 감성 분석 데이터 활용

### 이상형 월드컵 (토너먼트)

- [ ] 토너먼트 생성 (8강/16강/32강 자동)
- [ ] 1:1 대결 UI (사진 비교)
- [ ] 멤버별 개별 진행 + 전원 완료 집계
- [ ] 월드컵 결과 저장

### AI 종합 랭킹

- [ ] 가중 합산 (점수 40% + 월드컵 25% + AI 질문 20% + 감성 15%)
- [ ] AI 코멘트 생성 (각 순위)
- [ ] 종합 랭킹 페이지

### 소셜 & 지도

- [ ] 소셜 공유 (랭킹 카드 이미지)
- [ ] 지도 뷰 (방문 식당 표시)
- [ ] AI 사진 분석 → 태그 자동 추출

---

## 구현 노트 인덱스

구현 완료된 단계의 노트는 `.claude/docs/implementation/`에 기록:

| 날짜       | 파일                              | 주제                                              |
| ---------- | --------------------------------- | ------------------------------------------------- |
| 2026-02-10 | `2026-02-10_project-structure.md` | 프로젝트 구조 개선 (src/ 이동, .claude/ 정리)     |
| 2026-02-11 | `2026-02-11_phase0-setup.md`      | Phase 0 셋업 (폰트, 테마, shadcn, Jest, 환경변수) |
| 2026-02-12 | `2026-02-12_phase1-foundation.md` | Phase 1 파운데이션 (DB 스키마, Auth, 라우팅) |
