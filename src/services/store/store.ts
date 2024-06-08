import {
  FsOptions,
  copyFile,
  readTextFile,
  removeFile,
  writeTextFile,
} from "@tauri-apps/api/fs";
import { formatDocumentName } from "../../utils/documents";
import { DOCUMENTS, FILE_BIN } from "../../config/files";
import { DocumentDirectory, DocumentReference } from "../../types/documents";
import { requireDir, requireFile } from "../../utils/filesystem";

/**
 * @deprecated
 * @param reference
 * @returns
 */
export function documentPath(reference: DocumentReference): string {
  return `${DOCUMENTS.path}/${formatDocumentName(reference.name, reference.id)}`;
}

export function pathOfDocumentsDirectory(path: string): string {
  return `${DOCUMENTS.path}/${path}`;
}

export function pathInDirectory(dir: DocumentDirectory, path: string): string {
  return pathOfDocumentsDirectory(`${dir.fileName}/${path}`);
}

export function pathOfDirectory(dir: DocumentDirectory): string {
  return pathOfDocumentsDirectory(dir.fileName);
}

export function miscPath(name: string, extension: string = "json"): string {
  return `${DOCUMENTS.path}/${name}.${extension}`;
}

export function concatPath(...segments: string[]): string {
  return segments.join("/");
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

export interface Storea<T> {
  data: T;
  set: (data: T) => Store<T>;
  save: () => Promise<T | null>;
  load: () => Promise<T>;
}
export const defaultFsOptions: FsOptions = {
  dir: DOCUMENTS.source,
};

export class Store<T> {
  options: FsOptions = defaultFsOptions;

  constructor(
    public data: T,
    public path: string,
    public encode: (input: T) => string,
    public decode: (input: string) => T,
  ) {}

  setOptions = (options: FsOptions) => {
    this.options = options;
    return this;
  };

  set = (value: T) => {
    this.data = value;
    return this;
  };

  save = async () => {
    await requireDir(DOCUMENTS.path, {
      dir: DOCUMENTS.source,
    });

    await writeTextFile(this.path, this.encode(this.data), this.options);

    return this.data;
  };
  load = async () => {
    console.log("load for: ", this.path);
    const json = await readTextFile(this.path, this.options);
    this.data = this.decode(json);

    return this.data;
  };
  delete = async () => {
    await requireDir(FILE_BIN.path, {
      dir: FILE_BIN.source,
    });

    const binPath = `${FILE_BIN.path}/${this.path}`;

    await copyFile(this.path, binPath, this.options);
    await removeFile(this.path, this.options);

    return true;
  };

  static async load<T>(
    path: string,
    option: FsOptions,
    encode: (input: T) => string,
    decode: (input: string) => T,
    fallbackContent: Record<string, any> = {},
  ) {
    await requireFile(path, fallbackContent, option);

    const store = new Store<T>(undefined as any, path, encode, decode);

    await store.load();

    return store;
  }
}

export const encodeJSON = <T>(data: T): string => {
  return JSON.stringify(data);
};

export const decodeJSON = <T>(json: string): T => {
  return JSON.parse(json);
};

// export function _createStore<T>(
//   value: T,
//   path: string,
//   options: FsOptions,
//   encode: (input: T) => string,
//   decode: (input: string) => T,
// ) {
//   const store: Store<T> = {
//     data: value,
//     set: (value: T) => {
//       store.data = value;
//       return store;
//     },
//     save: async () => {
//       await requireDir(DOCUMENTS.path, {
//         dir: DOCUMENTS.source,
//       });

//       await writeTextFile(path, encode(store.data), options);

//       return store.data;
//     },
//     load: async () => {
//       const json = await readTextFile(path, options);
//       store.data = decode(json);

//       return store.data;
//     },
//   };

//   return store;
// }
