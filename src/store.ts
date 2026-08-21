// In-memory widget store — deliberate, not a stand-in for a real
// database. This repo exists to be a fast, low-stakes target for an
// autonomous coding agent to extend, not a realistic production app.

export interface Widget {
  id: string;
  name: string;
  quantity: number;
  createdAt: string;
}

export interface NewWidgetInput {
  name: string;
  quantity: number;
}

const widgets = new Map<string, Widget>();
let nextId = 1;

/** Test-only — gives each test a clean slate without restarting the process. */
export function resetStore(): void {
  widgets.clear();
  nextId = 1;
}

export function listWidgets(): Widget[] {
  return [...widgets.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function countWidgets(): number {
  return widgets.size;
}

export function getWidget(id: string): Widget | undefined {
  return widgets.get(id);
}

export function createWidget(input: NewWidgetInput): Widget {
  const widget: Widget = {
    id: String(nextId++),
    name: input.name,
    quantity: input.quantity,
    createdAt: new Date().toISOString(),
  };
  widgets.set(widget.id, widget);
  return widget;
}

export function deleteWidget(id: string): boolean {
  return widgets.delete(id);
}

/** Updates just the quantity of an existing widget; undefined if no such id. */
export function updateWidgetQuantity(id: string, quantity: number): Widget | undefined {
  const widget = widgets.get(id);
  if (!widget) {
    return undefined;
  }
  widget.quantity = quantity;
  return widget;
}
