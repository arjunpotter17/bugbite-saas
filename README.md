# BugBite

BugBite is a tiny SaaS test app with one task: turn a messy customer complaint into a clean bug ticket.

The generator is locked behind a Bags payment layer. The browser calls local Vercel API routes, those routes create and verify Bags checkout sessions server-side, and the tool unlocks only after Bags reports the checkout as complete.

The current test plan is **BugBite Pro** for **$1.00**.

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

## Create the Bags plan

With a Bags API key available locally:

```bash
BAGS_API_KEY=bag_test_... npm run bags:create-plan
```

The script creates:

- a `$1.00` BugBite Pro product
- a reusable Bags payment link for that product

Use the returned `productId` as `BAGS_PRODUCT_ID` in Vercel.

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
