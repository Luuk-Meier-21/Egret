// export function

import { DocumentRegionData, TreeData } from "../document/document";
import { LayoutToDocumentRelation } from "./layout-relations";

/**
 * Common interface for all layout types
 */
export type LayoutCommon = {
  id: string;
  type: string;
};

export type LayoutNodeData = LayoutCommon & {
  shortcut?: `cmd+shift+${string}`;
  type: "node";
  data?: DocumentRegionData;
};

export type LayoutBranchData<T extends LayoutCommon = LayoutNodeData> =
  LayoutCommon & {
    type: "branch";
    children: T[];
    flow: "horizontal" | "wrap";
  };

/**
 * Quantum type for layout node & branches.
 */
export type LayoutBranchOrNodeData<T extends LayoutCommon = LayoutNodeData> =
  LayoutCommon & (LayoutBranchData<T> | LayoutNodeData);

/**
 * Branches out 3 layers extend to nest deeper.
 */
export type LayoutTreeTrunk = LayoutBranchOrNodeData<LayoutNodeData>;

export type LayoutTree = LayoutTreeTrunk[];

export type Layout = {
  id: string;
  name: string;
  description: string;
  tree: LayoutTree;
};

// export type ContentfullLayout = Layout & {
//   tree: LayoutTree<DocumentRegionData>;
// };
