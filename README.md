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
why that's a fixed part of the pipeline, not optional.

Every PR against `main` also runs `.github/workflows/ci.yml`, three
required status checks:

| Check | What it does |
|---|---|
| `test` | `npm run typecheck` + `npm test` |
| `sonarqube` | Real SonarCloud analysis (org `umahanish`) |
| `dependency-scan` | Trivy filesystem scan for known vulnerabilities |

`dependency-scan` stands in for the "Nexus IQ scan" named in
`ai-delivery-pipeline`'s `CLAUDE.md` — no Nexus IQ license/instance exists
in this environment, so Trivy (free, open-source) does the same job for
real instead. See `ai-delivery-pipeline`'s `docs/DECISIONS.md` for the
reasoning. A deploy-to-staging workflow is added by a later phase of that
project.
