import { IBlock } from "./block";

/**
 * reference to a document file location
 */
export interface DocumentReference {
  filePath: string;
  fileName: string;
  name: string;
  id: string;
  keywords?: string[];
}

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
