import { DocumentRegionData } from "../../types/document-service";
import { Layout, LayoutNodeData } from "../../types/layout-service";
import { flattenLayoutNodesByReference } from "./layout-document";
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
  columnId: string;
  rowId: string;
  columns: LayoutNodeData<DocumentRegionData>[];

  constructor(
    public layout: Readonly<Layout>,
    // public builder: LayoutInsertable<LayoutNodeData<DocumentRegionData>>,
  ) {
    this.columns = flattenLayoutNodesByReference(
      this.layout.tree,
    ) as LayoutNodeData<DocumentRegionData>[];

    this.columnId = this.getFirstColumn().id;
    this.rowId = this.getFirstRow().id;
  }

  getFirstRow = () => this.layout.tree[0];

  getFirstColumn = () => this.columns[0];

  getFirst = () => this.getFirstColumn();

  up = (): LayoutNodeData<DocumentRegionData> => {
    const index = staticLayout.tree.findIndex((row) => row.id === rowId);
    const previousRow = staticLayout.tree[index - 1];
    if (previousRow) {
      setRowId(previousRow.id);
    } else {
      // Create new row
    }
  };

  left = (): LayoutNodeData<DocumentRegionData> => {
    return {} as any;
  };

  right = (): LayoutNodeData<DocumentRegionData> => {
    return {} as any;
  };

  down = (): LayoutNodeData<DocumentRegionData> => {
    return this.nextRow();
  };

  getValue(): LayoutNodeData<DocumentRegionData> {
    return {} as any;
  }
}
