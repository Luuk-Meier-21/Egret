import { FsDirOptions, createDir, exists } from "@tauri-apps/api/fs";

export async function requireDir(path: string, options: FsDirOptions = {}) {
  const hasDir = await exists(path, options);
  if (!hasDir) {
    if (options.recursive == undefined) {
      options.recursive = true;
    }
    await createDir(path, options);
  }
}
