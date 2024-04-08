import { DocumentRegionData } from "../../types/document-service";
import {
  Layout,
  LayoutBranchOrNodeData,
  LayoutCommon,
  LayoutNodeData,
} from "../../types/layout-service";
import { deepJSONClone } from "../../utils/object";
import {
  flattenLayoutNodes,
  flattenLayoutNodesByReference,
} from "./layout-document";
import { LayoutNavigatable } from "./layout-navigator";

export interface LayoutInsertable<T> {
  insert: (
    node: LayoutNodeData<T>,
    direction: "horizontal" | "vertical",
    place: "before" | "after",
  ) => LayoutNodeData<T>;
}

export class LayoutRegionNavigator
  implements LayoutNavigatable<LayoutNodeData<DocumentRegionData>>
{
  positionId: string;
  arrayLayout: LayoutNodeData<DocumentRegionData>[];

  constructor(
    public layout: Readonly<Layout>,
    positionId?: string,
    // public builder: LayoutInsertable<LayoutNodeData<DocumentRegionData>>,
  ) {
    this.arrayLayout = flattenLayoutNodesByReference(
      this.layout.tree,
    ) as LayoutNodeData<DocumentRegionData>[];

    this.positionId = positionId || deepJSONClone(this.arrayLayout[0].id);
  }

  findRowById(tree: LayoutBranchOrNodeData[], id: string): number {
    return tree.findIndex((v) =>
      v.type === "branch" ? this.findRowById(v.children, id) : v.id === id,
    );
  }

  getRowOfIndex() {}

  nextRow(): LayoutBranchOrNodeData<DocumentRegionData> {
    const row = this.findRowById(
      this.layout.tree as LayoutBranchOrNodeData[],
      this.positionId,
    );
    console.log(row);
  }

  // previousRow(): LayoutCommon {
  //   return this.layout[]
  // }

  nextColumn(): this {
    return this;
  }

  previousColumn(): this {
    return this;
  }

  getFirst = () => {
    return this.arrayLayout[0];
  };

  left = (): LayoutNodeData<DocumentRegionData> => {
    return {} as any;
  };

  right = (): LayoutNodeData<DocumentRegionData> => {
    return {} as any;
  };

  up = (): LayoutNodeData<DocumentRegionData> => {
    return this.previousRow();
  };

  down = (): LayoutNodeData<DocumentRegionData> => {
    return this.nextRow();
  };

  getValue(): LayoutNodeData<DocumentRegionData> {
    return {} as any;
  }
}
