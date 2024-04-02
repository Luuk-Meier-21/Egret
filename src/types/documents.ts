import { IBlock } from "./block";
import { Keyword } from "./keywords";

/**
 * reference to a document file location
 */
export interface DocumentReference {
  filePath: string;
  fileName: string;
  name: string;
  id: string;
}

export type DocumentReferenceWithKeywords = DocumentReference & {
  keywords: Keyword[];
};

export type DocumentMetaContent = {
  lang: ("en" | "nl") & string;
  version: number;
};

export type DocumentTextContent = IBlock[];

/**
 * @deprecated replaced by `RegionDocumentContent`
 */
export type LegacyDocumentContent = {
  meta: Partial<DocumentMetaContent>;
  text: DocumentTextContent;
};

/**
 * document data at file location
 * @deprecated replaced by `DocumentData`
 */
export type Document = {
  name: string;
  id: string;
  keywords?: string[];
  content: LegacyDocumentContent;
};
