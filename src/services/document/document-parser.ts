import { IBlock } from "../../types/block";
import {
  BlockData,
  DocumentContent,
  DocumentRegionData,
  DocumentViewData,
} from "../../types/document-service";
import { LegacyDocumentContent } from "../../types/documents";
import { v4 as uuidv4 } from "uuid";

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
): DocumentContent {
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
