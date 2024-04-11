// export function

import { DocumentRegionData } from "./document-service";
import { LayoutToDocumentRelation } from "./layout/layout-relations";

/**
 * Common interface for all layout types
 */
export type LayoutCommon = {
  id: string;
  type: string;
};

export type LayoutNodeData<T = unknown> = LayoutCommon & {
  shortcut?: `cmd+shift+${string}`;
  type: "node";
  contentfull: boolean;
  data?: T;
};

export type LayoutBranchData<T extends LayoutCommon = LayoutNodeData> =
  LayoutCommon & {
    type: "branch";
    children: T[];
    flow: "horizontal" | "vertical" | "wrap";
  };

/**
 * Quantum type for layout node & branches.
 */
export type LayoutBranchOrNodeData<T extends LayoutCommon = LayoutNodeData> =
  LayoutCommon & (LayoutBranchData<T> | LayoutNodeData);

/**
 * Branches out 3 layers extend to nest deeper.
 */
export type LayoutTreeTrunk<T extends LayoutCommon = LayoutNodeData> =
  LayoutBranchOrNodeData<LayoutBranchOrNodeData<LayoutBranchOrNodeData<T>>>;

export type LayoutTree = LayoutTreeTrunk[];

export type Layout<IsDecorated extends boolean = boolean> = {
  id: string;
  decorated: IsDecorated;
  name: string;
  description: string;
  tree: LayoutTree;
  relations: LayoutToDocumentRelation[];
};

export type ContentfullLayout = Layout<true>;
