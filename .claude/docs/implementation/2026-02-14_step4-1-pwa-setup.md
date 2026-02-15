# Step 4-1: PWA 기초 설정

**날짜**: 2026-02-14
**단계**: Phase 4 Step 4-1

## 변경 파일

| Action | File | Description |
|--------|------|-------------|
| Create | `src/app/manifest.ts` | Web App Manifest (name, icons, theme/bg colors) |
| Create | `src/app/sw.ts` | Service Worker (precache, runtime cache, offline fallback) |
| Create | `src/app/~offline/page.tsx` | Offline fallback page |
| Create | `public/icons/icon-192.png` | Placeholder icon 192x192 (orange #ec7f13) |
| Create | `public/icons/icon-512.png` | Placeholder icon 512x512 |
| Create | `public/icons/icon-512-maskable.png` | Maskable placeholder icon 512x512 |
| Modify | `next.config.ts` | withSerwistInit wrapper + turbopack: {} |
| Modify | `tsconfig.json` | webworker lib, @serwist/next/typings, exclude public/sw.js |
| Modify | `src/app/layout.tsx` | Apple PWA meta tags |
| Modify | `.gitignore` | Exclude public/sw*, public/swe-worker* |
| Modify | `package.json` | @serwist/next dep, serwist devDep, build: --webpack |

## 트레이드오프

### Next.js 16 Turbopack vs @serwist/next (webpack)

**문제**: Next.js 16은 Turbopack이 기본. @serwist/next는 webpack 플러그인만 지원.

**선택**:
- `pnpm dev` → Turbopack (serwist `disable: process.env.NODE_ENV !== "production"`)
- `pnpm build` → `--webpack` 플래그로 webpack 사용
- `turbopack: {}` 설정으로 "no turbopack config" 에러 억제

**대안 검토**:
1. `@serwist/turbopack` — experimental, 안정성 부족
2. `next dev --webpack` — dev 서버 속도 저하
3. configurator mode — 더 복잡한 설정 필요

**결론**: dev에서 SW 불필요하므로 disable이 가장 실용적. 프로덕션 빌드만 webpack 사용.

### Placeholder 아이콘

Node.js 순수 코드로 최소 PNG 생성 (zlib + 수동 PNG 청크). canvas/sharp 미설치 환경에서도 동작. 실제 디자인으로 교체 필요.

## 커밋 메시지

```
feat: add PWA setup with @serwist/next — manifest, service worker, offline fallback
```
