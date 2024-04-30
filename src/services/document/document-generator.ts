import { FileEntry } from "@tauri-apps/api/fs";
import {
  BlockData,
  DocumentContentData,
  DocumentData,
  DocumentRegionData,
  DocumentViewData,
} from "../../types/document/document";
import {
  DocumentDirectory,
  DocumentMetaData,
  DocumentReference,
  LegacyDocumentContent,
} from "../../types/documents";
import { v4 as uuidv4, validate } from "uuid";

/**
 * @deprecated
 */
export function generateDocumentReference(
  data: Partial<DocumentReference> & Omit<DocumentReference, "id">,
): DocumentReference {
  return {
    id: data.id || uuidv4(),
    name: data.name,
    filePath: data.filePath,
    fileName: data.name,
  };
}

export function generateDirectoryName(name: string, id?: string) {
  return `${name}.${id || uuidv4()}`;
}

export function generateDocumentData(
  data: Partial<DocumentData> & { name: string },
): DocumentData {
  return {
    id: data.id || uuidv4(),
    name: data.name,
    data: generateDocumentContentData(data.data || {}),
    keywords: data.keywords || undefined,
  };
}

export function generateDocumentContentData(
  data: Partial<DocumentContentData>,
): DocumentContentData {
  return {
    meta: generateDocumentMetaData(data?.meta || {}),
    views: data?.views || [],
  };
}

export function generateDocumentMetaData(
  data: Partial<DocumentMetaData>,
): DocumentMetaData {
  return {
    version: data?.version || 1,
    lang: data?.lang || "en",
  };
}

export function generateDocumentView(
  data: Partial<DocumentViewData>,
): DocumentViewData {
  const dictFromArray = (array: DocumentRegionData[]) =>
    array.reduce<Record<string, DocumentRegionData>>(
      (prev, curr) => ({ ...prev, [curr.id]: curr }),
      {},
    );

  const arrayFromDict = (dict: Record<string, DocumentRegionData>) =>
    Object.values(dict);

  return {
    id: data.id || uuidv4(),
    label: data.label || undefined,
    type: "view",
    contentType: "inline",
    content: data.content ?? arrayFromDict(data.contentDict || {}),
    contentDict: data.contentDict ?? dictFromArray(data.content || []),
  };
}

export function generateDocumentRegion(
  data: Partial<DocumentRegionData>,
): DocumentRegionData {
  return {
    id: data.id || uuidv4(),
    label: data.label || undefined,
    type: "region",
    contentType: "text",
    blocks: generateBlocks(data.blocks),
  };
}

export function generateBlocks(blocks: BlockData | undefined): BlockData {
  return (
    blocks ||
    ([
      {
        type: "paragraph",
        content: "",
      },
    ] as BlockData)
  );
}

export function parseFileToDocumentDirectory(
  file: FileEntry,
): DocumentDirectory | null {
  if (file.name === undefined) {
    return null;
  }

  const isDirectory = file.children !== undefined;
  const segments = file.name.split(".");
  const name = segments[0];
  const id = segments[1];

  if (!validate(id) || !isDirectory) {
    return null;
  }

  return {
    name,
    id,
    pathRelative: "/",
    fileName: file.name,
    filePath: file.path,
  };
}

export function parseFileToDocumentReference(
  file: FileEntry,
): DocumentReference | null {
  if (file.name === undefined) {
    return null;
  }

  const segments = file.name.split(".");
  const name = segments[0];
  const id = segments[1];
  const extention = segments[2];

  if (!validate(id) || extention !== "json") {
    return null;
  }

  return {
    name,
    id,
    fileName: file.name,
    filePath: file.path,
  };
}

export function parseDocumentContentFromLegacy(
  content: LegacyDocumentContent,
): DocumentContentData {
  content.meta.version = 1;

  return {
    meta: content.meta,
    views: [
      generateDocumentView({
        content: [
          generateDocumentRegion({
            blocks: content.text,
          }),
        ],
      }),
    ],
  } as const;
}
