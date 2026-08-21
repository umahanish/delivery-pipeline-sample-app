// Express app factory — deliberately never calls .listen() here (that's
// src/index.ts's job). Keeps the app testable via a real listening server
// on an ephemeral port (see tests/app.test.ts) without a separate mocking
// layer, and matches the request/response shape any future endpoint
// should follow: parse+validate with zod, plain JSON responses, explicit
// status codes.

import express, { type Express } from "express";
import { z } from "zod";
import { createWidget, deleteWidget, getWidget, listWidgets } from "./store.js";

const NewWidgetSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().int().min(0),
});

export function createApp(): Express {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/widgets", (_req, res) => {
    res.json({ widgets: listWidgets() });
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

  return app;
}
