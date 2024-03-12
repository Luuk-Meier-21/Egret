import { BaseDirectory } from "@tauri-apps/api/fs";

export const FILE = {
  path: "documents",
  source: BaseDirectory.AppData,
} as const;

export const KEYWORD_FILE = {
  filename: "keywords.json",
  source: BaseDirectory.AppData,
} as const;
