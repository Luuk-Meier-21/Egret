import { readDir, readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import { FILE } from "../config/files";
import {
  Document,
  DocumentContent,
  DocumentReference,
} from "../types/documents";
import { v4 as uuidv4 } from "uuid";

export const formatDocumentName = (name: string, id: string) =>
  `${name}.${id}.json`;

export const createDocument = (name: string, content?: DocumentContent) => ({
  name: name,
  id: uuidv4(),
  content: content ?? [
    {
      type: "paragraph",
      content: [],
    },
  ],
});

export const saveDocument = async (document: Document): Promise<boolean> => {
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
    return Promise.reject();
  }
};

export const fetchDocumentsReferences = async (): Promise<
  DocumentReference[]
> => {
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
    `${FILE.path}/${formatDocumentName(documentRef.name, documentRef.id)}`,
    {
      dir: FILE.source,
    },
  );

  const content: DocumentContent = JSON.parse(contents);
  return createDocument(documentRef.name, content);
};
