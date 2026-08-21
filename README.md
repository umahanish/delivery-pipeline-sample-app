# delivery-pipeline-sample-app

A small in-memory widgets inventory REST API.

This is the dedicated sample target repository for
[`ai-delivery-pipeline`](https://github.com/umahanish/ai-delivery-pipeline)
— its coding agent develops against this repo, not a real production
codebase, so every autonomous run (implement, test, self-review, open a
PR) happens somewhere low-stakes. See `CLAUDE.md` for the conventions the
agent (or a human) should follow when extending it.

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Liveness check |
| GET | `/widgets` | List all widgets |
| GET | `/widgets/:id` | Get one widget |
| POST | `/widgets` | Create a widget — `{ name: string, quantity: number }` |
| DELETE | `/widgets/:id` | Delete a widget |

## Development

```bash
npm install
npm run dev      # tsx watch, :3100
npm test
npm run typecheck
```

## CI / deploy

Branch protection on `main` requires a human-approved PR review before
merge — see `ai-delivery-pipeline`'s `CLAUDE.md` Constraints section for
why that's a fixed part of the pipeline, not optional. CI checks
(SonarQube, Nexus IQ) and a deploy-to-staging workflow are added by later
phases of that project.
