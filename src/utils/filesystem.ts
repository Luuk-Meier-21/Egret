import {
  FsDirOptions,
  createDir,
  exists,
  writeTextFile,
} from "@tauri-apps/api/fs";

export async function requireDir(path: string, options: FsDirOptions = {}) {
  const hasDir = await exists(path, options);
  if (!hasDir) {
    if (options.recursive == undefined) {
      options.recursive = true;
    }
    await createDir(path, options);
  }
}

export async function requireFile(
  path: string,
  defaultContext: Record<string, any> | Record<string, any>[],
  options: FsDirOptions = {},
) {
  const hasFile = await exists(path, options);
  if (!hasFile) {
    await writeTextFile(path, JSON.stringify(defaultContext), options);
  }
}
