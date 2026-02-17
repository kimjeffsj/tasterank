# Cron Ranking — Timeout & TypeScript 타입 미동기화

> **날짜**: 2026-02-17
> **Phase**: Phase 2 — AI 종합 랭킹
> **관련 파일**: `src/app/api/cron/generate-rankings/route.ts`, `src/types/database.ts`

---

## 문제

### 문제 1: TypeScript 타입 에러 (`upsert_ai_ranking`)

- **증상**: `supabase.rpc("upsert_ai_ranking", ...)` 호출 시 TypeScript 타입 에러 발생
- **환경**: 로컬 및 Vercel 빌드 모두
- **근본 원인**: `20260217080000_add_upsert_ai_ranking_rpc.sql` 마이그레이션으로 DB 함수를 추가했지만, `src/types/database.ts`를 재생성하지 않아 `Functions` 블록에 `upsert_ai_ranking`이 누락됨
- **착각 포인트**: 마이그레이션이 원격 DB에 적용됐는지 먼저 의심했지만, `supabase migration list`로 확인 결과 로컬/원격 모두 동기화 완료 상태였음

### 문제 2: cron-job.org Timeout

- **증상**: cron-job.org test run 시 timeout 발생
- **근본 원인**: 모든 public trip을 순차(`for` 루프)로 처리하면서 trip당 Gemini API 호출이 발생 → 응답이 30초(cron-job.org 기본 timeout)를 초과

---

## 해결 방법

### 문제 1: 타입 재생성

```bash
pnpm exec supabase gen types typescript --linked > src/types/database.ts
```

마이그레이션으로 DB 스키마가 변경될 때마다 이 명령어를 실행해야 함.

#### 왜 이 방법인가

1. 수동으로 타입을 추가하면 실제 DB 스키마와 드리프트가 생길 수 있음
2. `--linked` 플래그로 원격 DB 기준으로 생성하므로 완전히 정확함
3. 한 번 실행으로 전체 스키마(테이블/함수/뷰) 동기화

#### 고려한 대안

- **수동 타입 추가**: `Functions` 블록에 직접 추가 — 빠르지만 드리프트 위험, 기각
- **GitHub Actions 자동화**: 마이그레이션 push 시 자동 재생성 — 팀 규모가 커지면 도입 고려

---

### 문제 2: `after()` + 배치 병렬 처리

즉시 `202` 응답 후 `after()` 콜백에서 백그라운드 처리. 병렬은 Gemini 무료 티어 RPM 제한을 고려해 `CONCURRENCY = 3` 배치 단위로 제한.

#### 왜 이 방법인가

1. `after()`는 Next.js 15+에서 지원하는 공식 API로, 응답 후에도 Vercel 함수가 살아있는 동안 작업을 계속 실행함
2. cron-job.org는 HTTP 응답만 기다리므로 즉시 `202`를 받으면 timeout 없음
3. `Promise.allSettled()`는 배치 내 하나가 실패해도 나머지를 계속 처리
4. Gemini 무료 티어는 15 RPM 제한 → 3개씩 처리하면 안전권

#### 고려한 대안

- **순차 처리 유지 + timeout 연장**: cron-job.org Pro 플랜에서 timeout 늘릴 수 있지만 근본 해결 아님, 기각
- **완전 병렬 (`Promise.allSettled` 전체)**: Gemini RPM 초과 위험, 기각

---

## 주요 코드 변경

### `src/app/api/cron/generate-rankings/route.ts`

```typescript
import { after } from "next/server";

export async function GET(request: Request) {
  // ... 인증 검증 ...

  const { data: trips } = await supabase
    .from("trips")
    .select("id")
    .eq("is_public", true);

  // 즉시 202 응답 → cron-job.org timeout 방지
  after(async () => {
    await processAllTrips(
      supabase,
      trips.map((t) => t.id),
    );
  });

  return NextResponse.json(
    { message: `Ranking generation started for ${trips.length} trips` },
    { status: 202 },
  );
}

const CONCURRENCY = 3;

async function processAllTrips(supabase, tripIds) {
  for (let i = 0; i < tripIds.length; i += CONCURRENCY) {
    const batch = tripIds.slice(i, i + CONCURRENCY);
    // 하나 실패해도 나머지 계속 진행
    await Promise.allSettled(
      batch.map((tripId) => generateRankingForTrip(supabase, tripId)),
    );
  }
}
```

- 기존: 순차 `for` 루프, 동기 응답
- 변경: `after()` 백그라운드 + 배치 병렬

---

## 트레이드오프

| 항목                      | 장점                           | 단점                              |
| ------------------------- | ------------------------------ | --------------------------------- |
| `after()` 백그라운드      | cron timeout 해결, 응답 빠름   | 처리 결과를 응답 body에 포함 불가 |
| 배치 병렬 (CONCURRENCY=3) | Gemini RPM 안전, 순차보다 빠름 | 완전 병렬보다는 느림              |
| 타입 재생성 명령          | 정확, 드리프트 없음            | 마이그레이션마다 수동 실행 필요   |

---

## 테스트

- [x] `migration list`로 로컬/원격 동기화 확인
- [x] `supabase gen types` 실행 후 타입 에러 해소 확인
- [x] cron-job.org test run에서 202 응답 확인 (timeout 없음)
- [ ] Gemini RPM 초과 여부 모니터링 (트립 수 증가 시)

---

## 후속 작업

- [ ] `package.json`에 `"types:gen": "supabase gen types typescript --linked > src/types/database.ts"` 스크립트 추가
- [ ] 트립 수가 15개 이상 늘어나면 `CONCURRENCY` 재조정 또는 배치 간 딜레이 추가 고려
- [ ] `after()` 내부 에러 로깅 방법 검토 (현재 Vercel 함수 로그에서만 확인 가능)
