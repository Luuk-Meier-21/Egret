import {
  BlockData,
  DocumentContentData,
  DocumentData,
  DocumentRegionData,
  DocumentViewData,
  TextDocumentRegionData,
} from "../../types/document-service";
import { DocumentMetaData, LegacyDocumentContent } from "../../types/documents";
import { v4 as uuidv4 } from "uuid";

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
  return {
    id: data.id || uuidv4(),
    label: data.label || undefined,
    type: "view",
    contentType: "inline",
    content: data.content ?? [],
  };
}

export function generateDocumentRegion(
  data: Partial<DocumentRegionData>,
): DocumentRegionData {
  // nested regions not implemented yet
  // if (data.contentType === "inline") {
  //   return {
  //     id: data.id || uuidv4(),
  //     label: data.label || undefined,
  //     type: "region",
  //     contentType: "inline",
  //     content: data.content || [],
  //   };
  // }

  const textData = data as TextDocumentRegionData;

  return {
    id: textData.id || uuidv4(),
    label: textData.label || undefined,
    type: "region",
    contentType: "text",
    blocks: generateBlocks(textData.blocks),
  };
}

export function generateBlocks(blocks: BlockData | undefined): BlockData {
  return (
    blocks ||
    ([
      {
        type: "paragraph",
        content: [],
      },
    ] as BlockData)
  );
}

// export function generateDocumentText(
//   data: Partial<DocumentText>,
// ): DocumentText {
//   return {
//     id: data.id || uuidv4(),
//     type: "text",
//     contentType: "text",
//     blocks: data.blocks ?? [],
//   };
// }

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
