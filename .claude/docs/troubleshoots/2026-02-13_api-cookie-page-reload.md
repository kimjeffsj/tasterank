# API Route Cookie → Page Reload Bug

**Date**: 2026-02-13
**Symptoms**: Tags disappear after AI suggest; page auto-reloads (especially on iOS via LAN IP)

## Root Cause (Two layers)

### Layer 1: API route handler
API route (`/api/ai/suggest-tags`) used `createClient()` from `server.ts` which writes `Set-Cookie` headers when `auth.getUser()` refreshes the session token.

### Layer 2: Proxy (middleware)
The proxy (`src/proxy.ts`) also intercepted `/api/` requests and called `auth.getUser()`, writing `Set-Cookie` headers. This affected iOS Safari via LAN IP even after fixing the route handler.

**Chain reaction:**
1. Browser receives new auth cookies from API/proxy response
2. Supabase browser client detects token change → `onAuthStateChange` fires
3. Next.js App Router detects cookie change → soft navigation re-executes Server Components
4. Client component (EntryForm) remounts → all state wiped (tags, score, photos, text)

**Why localhost Chrome worked but iOS didn't:**
On localhost, cookie domain matching and same-origin behavior meant session tokens stayed consistent. On iOS Safari via LAN IP (`192.168.1.105`), the cross-origin cookie behavior triggered more aggressive session refresh.

## Fixes Applied

1. **`src/lib/supabase/route.ts`** — Read-only Supabase client for API routes (no-op `setAll()`)
2. **`src/proxy.ts`** — Excluded `/api/` routes from proxy matcher (they handle auth themselves)
3. **`next.config.ts`** — Added LAN IP to `allowedDevOrigins`

## When to use which client

| Client | File | Use case |
|--------|------|----------|
| `createBrowserClient()` | `client.ts` | Client components (`"use client"`) |
| `createClient()` | `server.ts` | Server Components, Middleware (needs cookie write for auth refresh) |
| `createRouteClient()` | `route.ts` | API Route Handlers (read-only, no cookie write) |
| `createAnonClient()` | `anon.ts` | Public data queries (no auth) |

## Rule
- All API routes (`src/app/api/`) must use `createRouteClient()` from `route.ts`
- Proxy matcher must exclude `/api/` paths
