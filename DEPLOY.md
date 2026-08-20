# Deploy the EduFreek proxy anywhere

Yeh repo teen jagah deploy ho sakti hai. Proxy logic `_shared/proxy.ts` mein hai — teeno adapters wahi call karte hain.

## 1. Cloudflare Pages (recommended)

1. GitHub repo ko Cloudflare Pages mein connect karo.
2. Build settings:
   - Framework preset: **None**
   - Build command: (blank chhod do)
   - Build output directory: `public`
3. Deploy. `functions/[[path]].ts` har request ko proxy kar dega.

Wrangler se local test:
```sh
npx wrangler pages dev public
```

## 2. Vercel

1. GitHub repo import karo.
2. Framework preset: **Other**. Build command / output blank.
3. Deploy. `vercel.json` sab requests ko `/api/proxy` (edge function) pe rewrite karta hai.

## 3. Lovable (default)

Lovable ke andar TanStack Start server routes (`src/routes/$.tsx`, `src/routes/index.tsx`) same proxy ko serve karte hain. Kuch bhi change karne ki zarurat nahi.

## Branding change karna ho

`_shared/proxy.ts` mein `REPLACEMENTS` array update karo (aur agar Lovable pe bhi chalana ho toh `src/lib/proxy.server.ts` mein bhi). Dono files same shape use karti hain.
