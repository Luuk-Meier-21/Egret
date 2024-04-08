import { IBlock } from "./block";
import { DocumentMetaData } from "./documents";

export interface TreeData {
  id: string;
  label?: string;
  type: string;
  contentType: string;
}

export type ContentData<T extends TreeData> = TreeData & {
  contentType: "inline";
  content: T[];
};
export type TextData = TreeData & {
  contentType: "text";
  blocks: BlockData;
};

// export type ContentOrTextData<T extends TreeData> = TreeData &
//   (TextData | ContentData<T>);

export type BlockData = IBlock[];

// Type expansions:

export type DocumentData = {
  name: string;
  id: string;
  keywords?: string[];
  data: DocumentContentData;
};

export type DocumentContentData = {
  meta: Partial<DocumentMetaData>;
  views: DocumentViewData[];
};

export interface DocumentViewData extends ContentData<DocumentRegionData> {
  id: string;
  type: "view";
  contentType: "inline";
  content: DocumentRegionData[];
  contentDict: Record<string, DocumentRegionData>;
}

/**
 * Support up to 3 layers nested content
 */
export type DocumentRegionData = {
  id: string;
  type: "region";
} & TextData;

// export type TextRegion = {
//   id: string;
//   type: "region";
// } & TextData;

// export type QRegionData<
//   ChildType extends TreeData = TextData,
//   WrapperType extends TreeData = ContentOrTextData<ChildType>,
// > = {
//   id: string;
//   type: "region";
// } & WrapperType;

// export type ContentDocumentRegionData<T extends TreeData = RegionTree> =
//   QRegionData<T, ContentData<T>>;

// export type TextDocumentRegionData = QRegionData<TextData, TextData>;

// export interface DocumentText extends TextData {
//   id: string;
//   contentType: "text";
//   blocks: BlockData;
// }
