import { BaseDirectory } from "@tauri-apps/api/fs";

export const FILE = {
  path: "documents",
  source: BaseDirectory.AppData,
} as const;
