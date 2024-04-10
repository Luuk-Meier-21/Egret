import { FsOptions, readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import { formatDocumentName } from "../../utils/documents";
import { DOCUMENTS } from "../../config/files";
import { DocumentReference } from "../../types/documents";
import { requireDir } from "../../utils/filesystem";

export interface Store<T> {
  data: T;
  write: (data: T) => Store<T>;
  save: () => Promise<T | null>;
  load: () => Promise<T>;
}

// export interface StoreRecord<T> {
//   save: () => T;
// }

export function documentPath(reference: DocumentReference): string {
  return `${DOCUMENTS.path}/${formatDocumentName(reference.name, reference.id)}`;
}

export function miscPath(name: string, extension: string = "json"): string {
  return `${DOCUMENTS.path}/${name}.${extension}`;
}

export function useStore<T>(
  value: T,
  path: string,
  options: FsOptions = {
    dir: DOCUMENTS.source,
  },
) {
  const encode = (data: T): string => {
    return JSON.stringify(data);
  };

  const decode = (json: string): T => {
    return JSON.parse(json);
  };

  const store: Store<T> = {
    data: value,
    write: (value: T) => {
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

  return store as Readonly<Store<T>>;
}
