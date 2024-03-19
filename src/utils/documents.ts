import {
  copyFile,
  exists,
  readDir,
  readTextFile,
  removeFile,
  writeTextFile,
} from "@tauri-apps/api/fs";
import { FILE, FILE_BIN } from "../config/files";
import {
  Document,
  DocumentTextContent,
  DocumentMetaContent,
  DocumentReference,
  DocumentContent,
} from "../types/documents";
import { v4 as uuidv4, validate } from "uuid";
import { requireDir } from "./filesystem";
import { handleError } from "./announce";

export const formatDocumentName = (name: string, id: string) =>
  `${name}.${id}.json`;

export const formatDocumentPath = (name: string, id: string): string =>
  `${FILE.path}/${formatDocumentName(name, id)}`;

export const parseDocument = (
  name: string,
  id: string,
  meta?: Partial<DocumentMetaContent>,
  text?: DocumentTextContent,
): Document => ({
  name: name,
  id: id,
  content: {
    meta: meta ?? {},
    text: text ?? [
      {
        type: "paragraph",
        content: [],
      },
    ],
  },
});

export const encodeDocumentContent = (document: Document): string => {
  const content: DocumentContent = {
    meta: document.content.meta,
    text: document.content.text,
  };

  return JSON.stringify(content);
};

export const decodeDocumentContent = (jsonString: string): DocumentContent =>
  JSON.parse(jsonString);

export const createDocument = (
  name: string,
  content?: DocumentContent,
): Document => parseDocument(name, uuidv4(), content?.meta, content?.text);

export const saveDocument = async (document: Document): Promise<boolean> => {
  try {
    if (!validate(document.id)) {
      return Promise.reject(false);
    }

    await writeTextFile(
      `${FILE.path}/${formatDocumentName(document.name, document.id)}`,
      encodeDocumentContent(document),
      {
        dir: FILE.source,
      },
    );

    return true;
  } catch (error) {
    handleError(error);
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

  const json = await readTextFile(
    formatDocumentPath(documentRef.name, documentRef.id),
    {
      dir: FILE.source,
    },
  );
  const contents = decodeDocumentContent(json);

  return parseDocument(
    documentRef.name,
    documentRef.id,
    contents.meta,
    contents.text,
  );
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
