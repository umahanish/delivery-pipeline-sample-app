# delivery-pipeline-sample-app

A small in-memory widgets inventory REST API. This is the **dedicated
sample target repo** for
[`ai-delivery-pipeline`](https://github.com/umahanish/ai-delivery-pipeline)'s
coding agent — see that project's own `CLAUDE.md` (Constraints section)
for why: an autonomous agent's first runs shouldn't be against a real
production codebase. Every backlog item the pipeline processes results in
a change to *this* repo, on its own branch, via a PR a human still has to
approve.

## Conventions

- TypeScript, strict mode, plain Node + `tsx` — **not** bundler-based.
  Relative imports use explicit `.js` extensions (`NodeNext` module
  resolution requires it). This is the opposite convention from
  `ai-delivery-pipeline` itself (a Next.js app, extensionless imports) —
  get this backwards and the build fails in a confusing way; see that
  project's `docs/DECISIONS.md` for the exact failure mode it caused
  there.
- Express, one app factory (`src/app.ts`'s `createApp()`). It never calls
  `.listen()` — that's `src/index.ts`'s job only. This is what makes the
  app testable via a real listening server on an ephemeral port (see
  `tests/app.test.ts`) instead of a mocking layer.
- In-memory store only (`src/store.ts`) — no database, deliberately. This
  repo exists to be a fast, low-stakes target for an autonomous agent to
  extend, not a realistic production app. Don't add persistence unless a
  specific backlog item genuinely calls for it.
- Every new endpoint needs: a zod schema for its input if it takes a body,
  and a test in `tests/app.test.ts` covering the success path, the
  validation-failure path, and the not-found path where applicable.
- `npm test` and `npm run typecheck` must both pass before a change is
  considered done.
- Keep changes scoped to what the backlog item actually asks for — no
  drive-by refactors, no speculative abstractions for endpoints that don't
  exist yet.

## Running it

```bash
npm install
npm run dev     # tsx watch, :3100
npm test
```
