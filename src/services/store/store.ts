import { FsOptions, readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import { formatDocumentName } from "../../utils/documents";
import { DOCUMENTS } from "../../config/files";
import { DocumentDirectory, DocumentReference } from "../../types/documents";
import { requireDir, requireFile } from "../../utils/filesystem";

export interface Store<T> {
  data: T;
  set: (data: T) => Store<T>;
  save: () => Promise<T | null>;
  load: () => Promise<T>;
}

export function documentPath(reference: DocumentReference): string {
  return `${DOCUMENTS.path}/${formatDocumentName(reference.name, reference.id)}`;
}

export function pathInDirectory(dir: DocumentDirectory, path: string): string {
  return `${DOCUMENTS.path}/${dir.fileName}/${path}`;
}

export function miscPath(name: string, extension: string = "json"): string {
  return `${DOCUMENTS.path}/${name}.${extension}`;
}

export function documentsPath(
  filePath?: string,
  extension: string = "json",
): string {
  if (filePath === undefined) {
    return DOCUMENTS.path;
  }

  return `${DOCUMENTS.path}/${filePath}.${extension}`;
}

export async function _loadStore<T>(
  path: string,
  option: FsOptions,
  fallbackContent: Record<string, any> = {},
): Promise<Store<T>> {
  await requireFile(path, fallbackContent, option);

  const store = _createStore<T>(undefined as any, path, option);

  await store.load();

  return store;
}

export function _createStore<T>(value: T, path: string, options: FsOptions) {
  const encode = <T>(data: T): string => {
    return JSON.stringify(data);
  };

  const decode = <T>(json: string): T => {
    return JSON.parse(json);
  };

  const store: Store<T> = {
    data: value,
    set: (value: T) => {
      store.data = value;
      return store;
    },
    save: async () => {
      await requireDir(DOCUMENTS.path, {
        dir: DOCUMENTS.source,
      });

      await writeTextFile(path, encode(store.data), options);

      return store.data;
    },
    load: async () => {
      const json = await readTextFile(path, options);
      store.data = decode(json);

      return store.data;
    },
  };

  return store;
}
