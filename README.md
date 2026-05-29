# BugBite

BugBite is a tiny SaaS test app with one task: turn a messy customer complaint into a clean bug ticket.

The generator is locked behind a Bags payment layer. The browser calls local Vercel API routes, those routes create and verify Bags checkout sessions server-side, and the tool unlocks only after Bags reports the checkout as complete.

## Bags environment

Set these in Vercel before production checkout will work:

```bash
BAGS_API_KEY=bag_test_...
BAGS_PRODUCT_ID=<bags-product-uuid>
BAGS_NETWORK=base_sepolia
```

Optional:

```bash
BAGS_API_BASE_URL=https://getbags.app
```

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy

This app is Vercel-ready. Vercel detects the Vite build and serves the `dist` output.
