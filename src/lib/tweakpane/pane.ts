// src/lib/tweakpane/pane.ts
import { Pane } from "tweakpane";

let paneInstance: Pane | null = null;

// Returns the singleton Pane, creating it lazily on first call.
// Client-only: throws if called server-side. All call sites (the hook
// and the panel host) are inside "use client" boundaries or effects,
// so this is safe.
export function getPane(): Pane {
  if (typeof window === "undefined") {
    throw new Error("getPane() called on the server");
  }
  if (!paneInstance) {
    paneInstance = new Pane({ title: "Parameters" });
    // Detach from <body> so the panel host can adopt the element.
    const el = paneInstance.element;
    if (el.parentElement) {
      el.parentElement.removeChild(el);
    }
  }
  return paneInstance;
}
