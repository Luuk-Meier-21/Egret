import { IBlock } from "./block";
import { Keyword } from "./keywords";

/**
 * @deprecated
 */
export interface DocumentReference {
  filePath: string;
  fileName: string;
  name: string;
  id: string;
}

export interface DocumentDirectory {
  filePath: string;
  fileName: string;
  pathRelative: string;
  name: string;
  id: string;
}

export type DocumentReferenceWithKeywords = DocumentReference & {
  keywords: Keyword[];
};

export type DocumentMetaData = {
  lang: ("en" | "nl") & string;
  version: number;
};

export type DocumentTextContent = IBlock[];

/**
 * @deprecated replaced by `RegionDocumentContent`
 */
export type LegacyDocumentContent = {
  meta: Partial<DocumentMetaData>;
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
