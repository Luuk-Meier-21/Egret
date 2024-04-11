import {
  generateDocumentContentData,
  generateDocumentData,
  generateDocumentMetaData,
  generateDocumentRegion,
  generateDocumentView,
} from "../services/document/document-generator";
import { DocumentData } from "../types/document/document";
import { ONBOARDING_BLOCKS } from "./onboarding";

export function generateBlankDocument(
  name: string,
  withOnboarding: boolean = true,
): DocumentData {
  return generateDocumentData({
    name,
    data: generateDocumentContentData({
      meta: generateDocumentMetaData({}),
      views: [
        generateDocumentView({
          content: [
            generateDocumentRegion({
              blocks: withOnboarding
                ? ONBOARDING_BLOCKS
                : [{ type: "paragraph", content: [] }],
            }),
          ],
        }),
      ],
    }),
  });
}
