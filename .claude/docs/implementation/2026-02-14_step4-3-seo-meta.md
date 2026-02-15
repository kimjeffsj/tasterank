# Step 4-3: SEO + Meta

> **날짜**: 2026-02-14
> **Phase**: Phase 4 — 폴리시
> **관련 체크리스트**: SEO 메타태그, OG 이미지, sitemap, robots

---

## 요약

공개 트립 페이지에 동적 OG 메타태그, sitemap.xml, robots.txt를 추가하고 루트 레이아웃의 기본 메타데이터를 강화했다.

## 접근 방식

### 선택한 방법
- Next.js `metadata` export + `generateMetadata` 함수로 정적/동적 메타 처리
- `sitemap.ts`, `robots.ts` — Next.js Metadata API 기반 자동 생성
- 기존 `anonClient`로 공개 트립 데이터 조회 (추가 클라이언트 불필요)

### 고려한 대안
- **next-seo 패키지**: 불필요 — Next.js 내장 Metadata API로 충분
- **정적 sitemap 파일**: 공개 트립이 동적이므로 함수 기반이 적합

## 트레이드오프

| 항목 | 장점 | 단점 |
|------|------|------|
| generateMetadata 별도 쿼리 | 메타와 페이지 데이터 독립, 에러 격리 | 트립당 2회 쿼리 (메타 + 페이지). Next.js가 중복 요청 자동 dedup |
| sitemap에서 anonClient 사용 | 코드 일관성, RLS 준수 | 빌드 시 Supabase 연결 필요 |

## 주요 파일 변경

- `src/app/layout.tsx` — metadataBase, OG/twitter 기본값, apple-touch-icon 경로 수정, meta name 오타 수정
- `src/app/(public)/trips/[tripId]/page.tsx` — `generateMetadata` 추가 (trip name, description, cover_image)
- `src/app/(public)/trips/[tripId]/ranking/page.tsx` — `generateMetadata` 추가 (Rankings 타이틀)
- `src/app/sitemap.ts` — 공개 트립 동적 sitemap 생성 (신규)
- `src/app/robots.ts` — robots.txt 설정 (신규)
- `public/og-image.png` — 기본 OG 이미지 1200x630 (신규)

## 버그 수정

- `apple-touch-icon` href: `/icons/icon-192.png` → `/icons/icon-192x192.png`
- meta name: `mobile-web-apple-capable` → `apple-mobile-web-app-capable`

## 테스트

- [x] `pnpm build` 성공 확인
- [x] `/sitemap.xml`, `/robots.txt` 라우트 등록 확인

## 후속 작업

- [ ] Step 4-4: 테스트 커버리지 80%+ 달성 + Vercel 배포
