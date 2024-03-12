import { IBlock } from "./block";

export interface DocumentReference {
  filePath: string;
  fileName: string;
  name: string;
  id: string;
}

export type DocumentContent = IBlock[];

export type Document = {
  name: string;
  id: string;
  content: DocumentContent;
};
