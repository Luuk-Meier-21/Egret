import { FileEntry, FsOptions, readDir } from "@tauri-apps/api/fs";
import { Store, _createStore, _loadStore } from "./store";
import { DOCUMENTS } from "../../config/files";
import { useEffect } from "react";
import { requireDir } from "../../utils/filesystem";

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
    fallbackContent: T,
    options: FsOptions = {
      dir: DOCUMENTS.source,
    },
  ): Promise<Store<T>> => {
    return _loadStore(path, options, fallbackContent as Record<string, any>);
  };

  const searchDirectory = async <T>(
    path: string,
    transform: (file: FileEntry) => T | null,
    options: FsOptions = {
      dir: DOCUMENTS.source,
    },
  ): Promise<T[]> => {
    await requireDir(path, options);

    const entries = await readDir(path, options);

    return entries.map(transform).filter((value) => value !== null) as T[];
  };

  return {
    createStore,
    loadStore,
    searchDirectory,
  } as const;
}

export type AbstractStore = ReturnType<typeof useAbstractStore>;
