# 프로젝트 구조 개선

> **날짜**: 2026-02-10
> **Phase**: Phase 0 — 프로젝트 셋업
> **관련 체크리스트**: 구조 & 설정, .claude/ 구조 정리

---

## 요약

프로젝트 디렉토리를 `app/` → `src/app/`으로 이동하고, `.claude/` 구조를 개선하여 개발 워크플로우를 체계화했다.

## 접근 방식

### 선택한 방법
- `src/` 디렉토리 사용: Next.js의 `src/` 컨벤션을 따라 소스 코드와 설정 파일을 분리
- CLAUDE.md에 Development Workflow 섹션 추가: 체크리스트 기반 개발 + 구현 노트 워크플로우
- 문서 경로를 `.claude/docs/`로 통일

### 고려한 대안
- **루트 `app/` 유지**: 설정이 간단하지만 소스와 설정 파일이 섞임 — 프로젝트 규모가 커지면 관리 어려움
- **별도 스킬 추가 (TDD, 구현노트)**: 오버엔지니어링. 기존 스킬 2개로 충분하고, 워크플로우는 CLAUDE.md 규칙으로 해결

## 트레이드오프

| 항목 | 장점 | 단점 |
|------|------|------|
| `src/` 구조 | 소스/설정 분리, 문서와 경로 일치 | 초기 설정 이동 필요 |
| CHECKLIST.md | 단계별 추적, 세션 간 진행상황 공유 | 수동 업데이트 필요 |
| 구현 노트 워크플로우 | 트레이드오프 기록, 의사결정 추적 | 작성 오버헤드 |
| 스킬 2개 유지 | 컨텍스트 절약, 필요 시 확장 가능 | Phase 2 AI 작업 시 스킬 추가 필요 가능 |

## 주요 파일 변경

- `app/` → `src/app/` — 디렉토리 이동 (layout.tsx, page.tsx, globals.css, favicon.ico)
- `tsconfig.json` — paths를 `./src/*`로 업데이트
- `.claude/CLAUDE.md` — 경로 수정, Development Workflow/Quick Reference 섹션 추가
- `.claude/CHECKLIST.md` — 신규 생성 (Phase 0~5 체크리스트)
- `.claude/docs/implementation/_TEMPLATE.md` — 구현 노트 템플릿

## 테스트

- 아직 테스트 환경 미설정 (Phase 0 후반 작업)
- `npm run build`로 구조 이동 후 빌드 성공 확인

## 후속 작업

- [ ] `.env.local` 환경변수 설정
- [ ] Tailwind 커스텀 테마 (oklch 컬러)
- [ ] shadcn/ui 초기화
- [ ] Jest + RTL 설정
