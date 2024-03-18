import {
  copyFile,
  createDir,
  exists,
  readDir,
  readTextFile,
  removeFile,
  writeTextFile,
} from "@tauri-apps/api/fs";
import { FILE, FILE_BIN } from "../config/files";
import {
  Document,
  DocumentContent,
  DocumentReference,
} from "../types/documents";
import { v4 as uuidv4, validate } from "uuid";
import { requireDir } from "./filesystem";

export const formatDocumentName = (name: string, id: string) =>
  `${name}.${id}.json`;

export const formatDocumentPath = (name: string, id: string): string =>
  `${FILE.path}/${formatDocumentName(name, id)}`;

export const parseDocument = (
  name: string,
  id: string,
  content?: DocumentContent,
) => ({
  name: name,
  id: id,
  content: content ?? [
    {
      type: "paragraph",
      content: [],
    },
  ],
  keywords: [],
});

export const createDocument = (name: string, content?: DocumentContent) =>
  parseDocument(name, uuidv4(), content);

export const saveDocument = async (document: Document): Promise<boolean> => {
  if (!validate(document.id)) {
    return Promise.reject(false);
  }

  try {
    await writeTextFile(
      `${FILE.path}/${formatDocumentName(document.name, document.id)}`,
      JSON.stringify(document.content),
      {
        dir: FILE.source,
      },
    );

    return true;
  } catch (error) {
    console.error(error);
    return Promise.reject(false);
  }
};

export const fetchDocumentsReferences = async (): Promise<
  DocumentReference[]
> => {
  await requireDir(FILE.path, {
    dir: FILE.source,
  });

  const entries = await readDir(FILE.path, {
    dir: FILE.source,
  });

  const refs = entries
    .map((value) => {
      if (value.name === undefined) {
        return null;
      }

      const segments = value.name.split(".");
      const name = segments[0];
      const id = segments[1];

      if (!validate(id)) {
        return null;
      }

      return {
        filePath: value.path,
        fileName: value.name,
        name: name,
        id: id,
      } as DocumentReference;
    })
    .filter((ref) => ref !== null) as DocumentReference[];

  return refs;
};

export const fetchDocumentById = async (
  id: string,
  fromDocuments?: DocumentReference[],
): Promise<Document | null> => {
  const documents = fromDocuments ?? (await fetchDocumentsReferences());
  const documentRef = documents.find((document) =>
    document.fileName?.includes(id),
  );

  if (documentRef === undefined) {
    return null;
  }

  const contents = await readTextFile(
    formatDocumentPath(documentRef.name, documentRef.id),
    {
      dir: FILE.source,
    },
  );
  const content: DocumentContent = JSON.parse(contents);

  return parseDocument(documentRef.name, documentRef.id, content);
};

export const deleteDocumentById = async (
  id: string,
  fromDocuments?: DocumentReference[],
) => {
  await requireDir(FILE_BIN.path, {
    dir: FILE_BIN.source,
  });

  const documents = fromDocuments ?? (await fetchDocumentsReferences());
  const documentRef = documents.find((document) =>
    document.fileName?.includes(id),
  );

  if (documentRef === undefined) {
    return null;
  }

  const currentPath = formatDocumentPath(documentRef.name, documentRef.id);
  const binPath = `${FILE_BIN.path}/${formatDocumentName(documentRef.name, documentRef.id)}`;

  await copyFile(currentPath, binPath, {
    dir: FILE.source,
  });
  await removeFile(currentPath, {
    dir: FILE.source,
  });
};
