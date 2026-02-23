# SPEC-AI-001: Trip 커버 이미지 AI 자동 매칭

> **날짜**: 2026-02-23
> **Phase**: Phase 5 — 고급 기능
> **관련 체크리스트**: Step 5-4b (SPEC-AI-001)

---

## 요약

Trip 생성 후, AI(Gemini)가 trip 정보를 기반으로 Unsplash에서 적절한 커버 이미지를 자동으로 검색하여 백그라운드에서 업데이트하는 기능을 구현했다. 사용자에게 로딩 지표를 표시하지 않으며, 이후 방문 시 커버 이미지를 확인할 수 있다.

## 접근 방식

### 선택한 방법

**Fire-and-Forget with next/server after() API**

- `createTrip()` 완료 후, 프론트엔드에서 `/api/ai/generate-trip-cover` 엔드포인트를 비동기 호출 (await 하지 않음)
- API 라우트 내부에서 `after()` 콜백을 사용하여 응답을 반환한 후 백그라운드에서 처리
- 이미지 생성 프로세스의 어떤 단계에서 실패해도 trip 생성에 영향을 주지 않음

**Gemini로 Unsplash 최적화 키워드 생성**

- Trip name과 description을 입력으로 받아 2-4개의 영어 검색 키워드 생성
- Gemini 실패 시 trip name을 그대로 검색어로 사용 (graceful degradation)
- 키워드는 landscape 이미지 검색에 최적화됨

**Unsplash URL 직접 사용**

- 검색 결과 중 첫 번째 이미지의 `urls.regular` (1080px 너비) 사용
- Supabase Storage에 다운로드하지 않고, Unsplash CDN URL을 직접 저장
- Unsplash는 영구적인 CDN 보장으로 장기 안정성 확보

**사용자 기존 선택 존중**

- 기존 `cover_image_url`이 있는 경우 덮어쓰지 않음
- 사용자가 수동으로 커버 이미지를 설정한 경우 AI 이미지로 덮어써지지 않음

### 고려한 대안

- **Vercel Cron Jobs 사용**: SPEC-AI-001에서는 `after()` 콜백으로 충분하며, cron 추가의 복잡도 증가 없이 구현. 향후 대량 배치 처리 필요 시 cron으로 전환 가능
- **Supabase Storage에 이미지 저장**: 네트워크 I/O 증가, 스토리지 비용 증가로 인해 Unsplash URL 직접 사용이 더 효율적
- **Gemini 대신 프롬프트 엔지니어링**: 고정된 키워드 리스트 사용 시 영어 trip 기반에만 작동하므로, Gemini의 유연성이 필요

## 트레이드오프

| 항목 | 장점 | 단점 |
|------|------|------|
| **Fire-and-Forget 방식** | 사용자 경험 저하 없음, 비동기 처리로 빠른 응답 | 완료 여부를 사용자가 알 수 없음 (다음 방문 시 확인) |
| **Unsplash URL 직접 사용** | 스토리지 비용 절감, 네트워크 효율성, Unsplash CDN 신뢰성 | 이미지 URL 변경 리스크 (매우 낮음) |
| **기존 URL 유지 (no overwrite)** | 사용자 수동 설정 존중, UX 일관성 | AI 생성 이미지로 자동 업데이트 불가 |
| **Gemini 키워드 생성** | 동적 적응, 다양한 언어/문화 지원 | API 비용, 외부 의존성, rate limit 제약 |

## 주요 파일 변경

### 신규 파일

- `src/lib/unsplash.ts` — Unsplash API 클라이언트
  - `searchPhotos(query: string)` 함수: 쿼리로 landscape 이미지 검색, 첫 번째 결과의 URL 반환
  - null-safe: 결과 없음 또는 API 오류 시 `null` 반환

- `src/app/api/ai/generate-trip-cover/route.ts` — Next.js API Route
  - `POST /api/ai/generate-trip-cover` 핸들러
  - Trip 정보 수신 → Gemini 키워드 생성 → Unsplash 검색 → DB 업데이트
  - `after()` 콜백으로 백그라운드 처리
  - 모든 단계를 try-catch로 감싸 안정성 보장

### 수정된 파일

- `src/lib/ai/prompts.ts`
  - `buildCoverImagePrompt(name: string, description?: string)` 추가: Trip 정보 기반 프롬프트 생성
  - `parseCoverImageKeywords(text: string)` 추가: Gemini 응답에서 키워드 파싱 (쉼표 또는 줄바꿈으로 구분)

- `src/hooks/useTrips.ts`
  - `createTrip()` 내부에서 성공 후 `/api/ai/generate-trip-cover` 호출 추가
  - Fire-and-forget: `fetch()` 호출 후 await하지 않음, catch로 오류 무시

- `next.config.ts`
  - `images.remotePatterns`에 `images.unsplash.com` 추가 (Next.js Image 최적화 지원)

## 테스트

**총 21개 새로운 테스트 작성 및 통과**

### src/lib/unsplash.test.ts (6개 테스트)
- searchPhotos가 정상 응답 처리
- 검색 결과 없음 시 null 반환
- API 오류 시 null 반환
- 네트워크 오류 시 null 반환
- landscape 파라미터 포함
- Authorization 헤더 정상 설정

### src/lib/ai/cover-image.test.ts (10개 테스트)
- buildCoverImagePrompt 기본 형식
- description 포함/미포함 케이스
- parseCoverImageKeywords 쉼표 구분
- parseCoverImageKeywords 줄바꿈 구분
- 공백 처리
- 빈 응답 처리
- 다양한 포맷 케이스

### src/app/api/ai/generate-trip-cover/route.test.ts (5개 테스트)
- 정상 요청 처리
- Gemini 오류 시 graceful degradation
- Unsplash 오류 시 graceful degradation
- DB 업데이트 검증
- 기존 cover_image_url 유지

**커버리지 영향**: 라이브러리 함수 (unsplash.ts, prompts.ts) 및 API 라우트 모두 80%+ 커버리지 달성

## 환경변수 설정 (수동 작업)

`.env.local` 및 Vercel 대시보드에 추가 필요:

```
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
```

- Unsplash 개발자 포털에서 Access Key 발급 필요: https://unsplash.com/oauth/applications
- Unsplash 무료 티어 제한: 50 requests/hour
- 로컬 개발 시 `.env.local`에 추가
- 프로덕션 배포 전 Vercel 환경변수 추가 필수

## 후속 작업

- [ ] `UNSPLASH_ACCESS_KEY` 환경변수 설정 (로컬 + Vercel)
- [ ] 프로덕션 배포 후 기존 trips의 커버 이미지 일괄 생성 고려 (Vercel Cron Job 활용)
- [ ] 이미지 생성 진행 상황 UI 추가 (사용자 피드백 향상, optional)
- [ ] 다른 이미지 소스(Pexels, Pixabay) 추가 지원 (향후 확장)
