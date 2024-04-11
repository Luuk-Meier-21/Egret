import { FsOptions, readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import { formatDocumentName } from "../../utils/documents";
import { DOCUMENTS } from "../../config/files";
import { DocumentReference } from "../../types/documents";
import { requireDir } from "../../utils/filesystem";
import { useEffect } from "react";

export interface Store<T> {
  data: T;
  set: (data: T) => Store<T>;
  save: () => Promise<T | null>;
  load: () => Promise<T>;
}

export function documentPath(reference: DocumentReference): string {
  return `${DOCUMENTS.path}/${formatDocumentName(reference.name, reference.id)}`;
}

export function miscPath(name: string, extension: string = "json"): string {
  return `${DOCUMENTS.path}/${name}.${extension}`;
}

async function _loadStore<T>(
  path: string,
  option: FsOptions,
): Promise<Store<T>> {
  const store = _createStore<T>(undefined as any, path, option);

  await store.load();

  return store;
}

function _createStore<T>(value: T, path: string, options: FsOptions) {
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

export function useStore<T>(
  value: T,
  path: string,
  options: FsOptions = {
    dir: DOCUMENTS.source,
  },
) {
  const store: Store<T> = _createStore(value, path, options);

  useEffect(() => {
    store
      .set(value)
      .save()
      .then(() => {
        console.log("saved");
      });
  }, [value]);

  return store as Readonly<Store<T>>;
}

export function useAbstractStore() {
  const createStore = <T>(
    value: T,
    path: string,
    options: FsOptions = {
      dir: DOCUMENTS.source,
    },
  ): Store<T> => {
    return _createStore(value, path, options);
  };

  const loadStore = <T>(
    path: string,
    options: FsOptions = {
      dir: DOCUMENTS.source,
    },
  ): Promise<Store<T>> => {
    return _loadStore(path, options);
  };

  return {
    createStore,
    loadStore,
  } as const;
}

export type AbstractStore = ReturnType<typeof useAbstractStore>;
