// src/lib/tweakpane/folder.ts
import type { Schema } from "./types";

const FOLDER_MARKER = Symbol("tweakpane.folder");

export type FolderNode = {
  [FOLDER_MARKER]: true;
  schema: Schema;
  opts: { collapsed?: boolean };
};

export function folder(
  schema: Schema,
  opts: { collapsed?: boolean } = {}
): FolderNode {
  return { [FOLDER_MARKER]: true, schema, opts };
}

export function isFolder(value: unknown): value is FolderNode {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as Record<symbol, unknown>)[FOLDER_MARKER] === true
  );
}
