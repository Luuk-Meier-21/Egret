import { IBlock } from "./block";
import { DocumentMetaContent } from "./documents";

export interface TreeData {
  id: string;
  label?: string;
  type: string;
  contentType: string;
}

export interface ContentData<T extends TreeData> extends TreeData {
  id: string;
  type: string;
  contentType: "inline";
  content: T[];
}

export interface TextData extends TreeData {
  id: string;
  type: string;
  contentType: "text";
  blocks: BlockData;
}

export type BlockData = IBlock[];

// Type expansions:

export type DocumentData = {
  name: string;
  id: string;
  keywords?: string[];
  content: DocumentContent;
};

export type DocumentContent = {
  meta: Partial<DocumentMetaContent>;
  views: DocumentViewData[];
};

export interface DocumentViewData extends ContentData<DocumentRegionData> {
  id: string;
  type: "view";
  contentType: "inline";
  content: DocumentRegionData[];
}

export interface DocumentRegionData extends TextData {
  id: string;
  type: "region";
  contentType: "text";
  blocks: BlockData;
}

// export interface DocumentText extends TextData {
//   id: string;
//   contentType: "text";
//   blocks: BlockData;
// }
