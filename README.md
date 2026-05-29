# BugBite

BugBite is a tiny SaaS test app with one task: turn a messy customer complaint into a clean bug ticket.

The generator is locked behind a simple paid-plan layer. For testing, the "Simulate paid plan" button stores a local Pro state and unlocks the tool.

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
