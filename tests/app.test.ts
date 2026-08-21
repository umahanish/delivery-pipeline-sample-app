import type { Server } from "node:http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp, jsonParseErrorHandler } from "../src/app.js";
import { resetStore } from "../src/store.js";

let server: Server | undefined;

async function startServer(): Promise<string> {
  const app = createApp();
  return new Promise((resolve) => {
    server = app.listen(0, () => {
      const address = server!.address();
      const port = typeof address === "object" && address ? address.port : 0;
      resolve(`http://127.0.0.1:${port}`);
    });
  });
}

beforeEach(() => {
  resetStore();
});

afterEach(async () => {
  await new Promise<void>((resolve) => (server ? server.close(() => resolve()) : resolve()));
  server = undefined;
});

describe("GET /health", () => {
  it("returns ok", async () => {
    const url = await startServer();
    const res = await fetch(`${url}/health`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });
});

describe("GET /widgets/count", () => {
  it("returns 0 when the store is empty", async () => {
    const url = await startServer();
    const res = await fetch(`${url}/widgets/count`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ count: 0 });
  });

  it("reflects widgets added and deleted", async () => {
    const url = await startServer();
    const createRes = await fetch(`${url}/widgets`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Sprocket", quantity: 5 }),
    });
    const { widget } = (await createRes.json()) as { widget: { id: string } };
    await fetch(`${url}/widgets`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Cog", quantity: 2 }),
    });

    const afterCreateRes = await fetch(`${url}/widgets/count`);
    expect(afterCreateRes.status).toBe(200);
    expect(await afterCreateRes.json()).toEqual({ count: 2 });

    await fetch(`${url}/widgets/${widget.id}`, { method: "DELETE" });

    const afterDeleteRes = await fetch(`${url}/widgets/count`);
    expect(await afterDeleteRes.json()).toEqual({ count: 1 });
  });
});

describe("widgets CRUD", () => {
  it("starts empty", async () => {
    const url = await startServer();
    const res = await fetch(`${url}/widgets`);
    expect(await res.json()).toEqual({ widgets: [] });
  });

  it("creates and lists a widget", async () => {
    const url = await startServer();
    const createRes = await fetch(`${url}/widgets`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Sprocket", quantity: 5 }),
    });
    expect(createRes.status).toBe(201);
    const created = (await createRes.json()) as { widget: { name: string; quantity: number } };
    expect(created.widget.name).toBe("Sprocket");
    expect(created.widget.quantity).toBe(5);

    const listRes = await fetch(`${url}/widgets`);
    const { widgets } = (await listRes.json()) as { widgets: unknown[] };
    expect(widgets).toHaveLength(1);
  });

  it("rejects invalid input (empty name, negative quantity)", async () => {
    const url = await startServer();
    const res = await fetch(`${url}/widgets`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "", quantity: -1 }),
    });
    expect(res.status).toBe(400);
  });

  it("returns a clean JSON error for a malformed JSON body, not an HTML error page", async () => {
    const url = await startServer();
    const res = await fetch(`${url}/widgets`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{name: Sprocket",
    });
    expect(res.status).toBe(400);
    expect(res.headers.get("content-type")).toContain("application/json");
    expect(await res.json()).toEqual({ error: "invalid JSON in request body" });
  });

  it("jsonParseErrorHandler passes non-JSON-parse errors through to next() rather than mislabeling them", () => {
    const err = new Error("something unrelated broke");
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Parameters<typeof jsonParseErrorHandler>[2];
    const next = vi.fn();

    jsonParseErrorHandler(err, {} as Parameters<typeof jsonParseErrorHandler>[1], res, next);

    expect(next).toHaveBeenCalledWith(err);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("gets a widget by id", async () => {
    const url = await startServer();
    const createRes = await fetch(`${url}/widgets`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Sprocket", quantity: 5 }),
    });
    const { widget } = (await createRes.json()) as { widget: { id: string } };

    const getRes = await fetch(`${url}/widgets/${widget.id}`);
    expect(getRes.status).toBe(200);
  });

  it("returns 404 for an unknown id", async () => {
    const url = await startServer();
    const res = await fetch(`${url}/widgets/nonexistent`);
    expect(res.status).toBe(404);
  });

  it("deletes a widget", async () => {
    const url = await startServer();
    const createRes = await fetch(`${url}/widgets`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Sprocket", quantity: 5 }),
    });
    const { widget } = (await createRes.json()) as { widget: { id: string } };

    const deleteRes = await fetch(`${url}/widgets/${widget.id}`, { method: "DELETE" });
    expect(deleteRes.status).toBe(204);

    const getRes = await fetch(`${url}/widgets/${widget.id}`);
    expect(getRes.status).toBe(404);
  });
});
