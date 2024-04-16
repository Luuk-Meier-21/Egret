import { BaseDirectory } from "@tauri-apps/api/fs";

// Using constanst for now, this could become dynamic if tests point to the importance of that.

export const FILE = {
  path: "documents",
  source: BaseDirectory.AppData,
} as const;

export const DOCUMENTS = {
  path: "store/documents",
  source: BaseDirectory.AppData,
} as const;

export const STORE = {
  path: "store",
  source: BaseDirectory.AppData,
} as const;

export const FILE_BIN = {
  path: ".bin/documents",
  source: BaseDirectory.AppData,
} as const;

export const KEYWORD_FILE = {
  filename: "keywords.json",
  source: BaseDirectory.AppData,
} as const;
