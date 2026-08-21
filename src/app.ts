// Express app factory — deliberately never calls .listen() here (that's
// src/index.ts's job). Keeps the app testable via a real listening server
// on an ephemeral port (see tests/app.test.ts) without a separate mocking
// layer, and matches the request/response shape any future endpoint
// should follow: parse+validate with zod, plain JSON responses, explicit
// status codes.

import express, { type Express, type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { countWidgets, createWidget, deleteWidget, getWidget, listWidgets } from "./store.js";

const NewWidgetSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().int().min(0),
});

/**
 * Exported (not inlined in createApp) specifically so its "not our error,
 * pass it on" branch can be unit-tested directly -- there's no legitimate
 * HTTP request against this app that produces a non-JSON-parse error to
 * exercise that branch through, and the property it protects (unrelated
 * errors never get mislabeled as "invalid JSON") is worth a real test,
 * not just coverage padding.
 */
export function jsonParseErrorHandler(err: unknown, _req: Request, res: Response, next: NextFunction): void {
  if (err instanceof SyntaxError && (err as SyntaxError & { status?: number; type?: string }).type === "entity.parse.failed") {
    res.status(400).json({ error: "invalid JSON in request body" });
    return;
  }
  next(err);
}

export function createApp(): Express {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/widgets", (_req, res) => {
    res.json({ widgets: listWidgets() });
  });

  // Must stay above /widgets/:id — otherwise the param route matches
  // "count" as an id and this endpoint 404s.
  app.get("/widgets/count", (_req, res) => {
    res.json({ count: countWidgets() });
  });

  app.get("/widgets/:id", (req, res) => {
    const widget = getWidget(req.params.id);
    if (!widget) {
      res.status(404).json({ error: "widget not found" });
      return;
    }
    res.json({ widget });
  });

  app.post("/widgets", (req, res) => {
    const parsed = NewWidgetSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? "invalid input" });
      return;
    }
    res.status(201).json({ widget: createWidget(parsed.data) });
  });

  app.delete("/widgets/:id", (req, res) => {
    if (!deleteWidget(req.params.id)) {
      res.status(404).json({ error: "widget not found" });
      return;
    }
    res.status(204).send();
  });

  // Must be registered after the routes -- Express only reaches
  // error-handling middleware (identified by its 4-arg signature) once
  // something calls next(err), and express.json() calling next(err) on a
  // malformed body happens before any route handler runs.
  app.use(jsonParseErrorHandler);

  return app;
}
