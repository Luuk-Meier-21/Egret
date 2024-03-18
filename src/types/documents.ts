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

export type DocumentContent = IBlock[];

/**
 * document data at file location
 */
export type Document = {
  name: string;
  id: string;
  keywords?: string[];
  content: DocumentContent;
};
