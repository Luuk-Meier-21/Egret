import { IBlock } from "../block";
import { DocumentMetaData } from "../documents";

export interface TreeData {
  id: string;
  label?: string;
  type: string;
  contentType: string;
}
export type BlockData = IBlock[];

export type TextData = TreeData & {
  contentType: "text";
  blocks: BlockData;
};

export type ContentData<T extends TreeData> = TreeData & {
  contentType: "inline";
  content: T[];
};
// export type ContentOrTextData<T extends TreeData> = TreeData &
//   (TextData | ContentData<T>);

export type DocumentRegionData = {
  id: string;
  type: "region";
} & TextData;

export interface DocumentViewData extends ContentData<DocumentRegionData> {
  id: string;
  type: "view";
  contentType: "inline";
  content: DocumentRegionData[];
  contentDict: Record<string, DocumentRegionData>;
}

export type DocumentContentData = {
  meta: Partial<DocumentMetaData>;
  views: DocumentViewData[];
};

export type DocumentMeta = {
  name: string;
  id: string;
  keywords?: string[];
  language: "nl" | "en";
};
