# AtollonCVsearch

React-based prototype that compares a configurable AI-powered "test" demo with a live data "real" demo for CV search.

## Getting started

```bash
pnpm install
pnpm run start
```

## Demo modes

- **Test demo** – Uses the bundled mock profiles and runs them through the AI search pipeline (`useAISearch`). Configure Gemini/OpenAI/Anthropic via the `.env.local` variables listed below.
- **Real data** – Calls the Atollon CV search service (`http://188.245.251.4:4510/svc/cvsearch/search`) with the provided session header, maps the response into the existing UI, and surfaces semantic/BM25 scores.

⚠️ Browsers block direct requests with custom headers to that host (CORS). During local development the CRA proxy (`src/setupProxy.js`) forwards `/api/real-search` to the remote host so the request originates from Node instead of the browser. In production the bundled serverless function (`api/real-search.js`) performs the same forwarding on Vercel. Deploying elsewhere? Host an equivalent proxy and keep the VPS endpoint/session out of the client bundle.

Switch between the modes with the toggle to the right of the search input; both modes reuse the same query box.

## Environment variables

Create `.env.local` (already gitignored) and set the variables you need:

```
# AI search (test demo)
REACT_APP_AI_API_KEY=your-gemini-or-openai-key
REACT_APP_AI_PROVIDER=gemini                      # 'openai' | 'anthropic' | 'gemini'
REACT_APP_AI_ENDPOINT=https://your-proxy.example # optional override/proxy

# Real data service
# Leave undefined to fall back to /api/real-search (dev proxy + Vercel function).
REACT_APP_REAL_SEARCH_URL=/api/real-search
REACT_APP_REAL_SEARCH_SESSION=test-session

# Optional: override the dev proxy target/session without exposing them to the browser
REAL_SEARCH_TARGET=http://188.245.251.4:4510
REAL_SEARCH_SESSION=test-session
```

Restart `pnpm run start` whenever you add or change env vars so CRA can pick them up. When deploying to Vercel, set `REAL_SEARCH_TARGET` and `REAL_SEARCH_SESSION` as encrypted project env vars so the serverless proxy can talk to the VPS securely.
