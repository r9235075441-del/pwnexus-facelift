# Rebrand proxy: PW-NEXUS → EduFreek

Update the text-replacement map in both proxy entry points so the served site is branded **EduFreek** instead of PW-NEXUS.

## Files to edit (identical change in both)

- `_shared/proxy.ts` — used by Cloudflare Pages Functions (`functions/[[path]].ts`) and Vercel Edge (`api/proxy.ts`).
- `src/lib/proxy.server.ts` — used by the Lovable preview catch-all route (`src/routes/$.tsx`).

Only the `REPLACEMENTS` array changes in each file. New map:

```ts
const REPLACEMENTS: Array<[string, string]> = [
  ["PW-MARCO", "EduFreek"],
  ["PW-NEXUS", "EduFreek"],
  [
    "https://i.ibb.co/YBbwNGxz/Logo-pw-removebg-preview.png",
    "https://i.ibb.co/ksRGCJdv/IMG-20260820-152721-928.jpg",
  ],
  ["https://t.me/official_marco_22", "https://t.me/EduFreek"],
  ["official_marco_22", "EduFreek"],
  ["officialmarco22", "EduFreek"],
];
```

### What each line does

1. `PW-MARCO` → `EduFreek` — the origin's brand name (the main brand swap).
2. `PW-NEXUS` → `EduFreek` — safety net in case any upstream text already reads `PW-NEXUS`, so nothing old leaks through.
3. Original logo URL → new logo `https://i.ibb.co/ksRGCJdv/IMG-20260820-152721-928.jpg`.
4. `t.me/official_marco_22` → `t.me/EduFreek` — all Telegram links now point to the new handle.
5–6. Bare handle variants (`official_marco_22`, `officialmarco22`) → `EduFreek`, matching the previous pattern so config/API text is consistent.

## Docs (optional, cosmetic)

Update `DEPLOY.md` title and `README.md`/`public/.gitkeep` mentions from "PW-NEXUS proxy" → "EduFreek proxy" so repo text matches. No runtime effect.

## Verification

After editing, hit the preview root and grep the returned HTML for `PW-NEXUS`/`PW-MARCO` (should be gone) and `EduFreek`/the new logo URL / `t.me/EduFreek` (should be present).
