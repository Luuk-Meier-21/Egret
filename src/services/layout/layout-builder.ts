import { useRef } from "react";
import { flattenLayoutNodesByReference } from "./layout-content";
import { generateLayoutBranch, generateLayoutNode } from "./layout-generator";
import {
  Layout,
  LayoutBranchData,
  LayoutBranchOrNodeData,
  LayoutNodeData,
} from "../../types/layout-service";
import { clearMocks } from "@tauri-apps/api/mocks";

export interface LayoutBuilder {
  addRow: (position: "before" | "after") => LayoutNodeData;
  addColumn: (
    row: LayoutBranchData,
    position: "before" | "after",
  ) => LayoutNodeData;
  addColumnToNodeRow: (
    row: LayoutNodeData,
    position: "before" | "after",
  ) => LayoutNodeData;
  removeNodeFromRow: (
    row: LayoutBranchOrNodeData,
    node: LayoutNodeData,
  ) => LayoutNodeData;
  removeRow: (row: LayoutBranchOrNodeData) => LayoutNodeData;
  onLayoutChange: (callback: LayoutBuilderCallback) => void;
  beforeLayoutChange: (callback: LayoutBuilderCallback) => void;
}

export type LayoutBuilderCallback = (layout: Layout) => void;

export function useLayoutBuilder(layout: Layout): LayoutBuilder {
  const onLayoutChangeCallbacks = useRef<LayoutBuilderCallback>(() => {});
  const beforeLayoutChangeCallbacks = useRef<LayoutBuilderCallback>(() => {});

  const onLayoutChange = (callback: LayoutBuilderCallback) => {
    onLayoutChangeCallbacks.current = callback;
  };

  const beforeLayoutChange = (callback: LayoutBuilderCallback) => {
    beforeLayoutChangeCallbacks.current = callback;
  };

  const dispatchLayoutChange = (from: "before" | "after" = "after") => {
    if (from === "before") {
      return beforeLayoutChangeCallbacks.current(layout);
    }

    onLayoutChangeCallbacks.current(layout);
  };

  const rowsReference = (): LayoutBranchOrNodeData[] => {
    return layout.tree as LayoutBranchOrNodeData[];
  };

  const addRow = (position: "before" | "after"): LayoutNodeData => {
    dispatchLayoutChange("before");
    // TODO: Unshift erases state of editor, push does not (copying over array?)

    const newRow = generateLayoutNode({});
    const appendKey = position === "before" ? "unshift" : "push";

    rowsReference()[appendKey](newRow);

    dispatchLayoutChange();

    return newRow;
  };

  const addColumn = (
    row: LayoutBranchData,
    position: "before" | "after",
  ): LayoutNodeData => {
    dispatchLayoutChange("before");
    // TODO: Unshift erases state of editor, push does not (copying over array?)

    const newColumn = generateLayoutNode({});
    const appendKey = position === "before" ? "unshift" : "push";

    row.children[appendKey](newColumn);

    dispatchLayoutChange();

    return newColumn;
  };

  const removeNodeFromRow = (
    row: LayoutBranchData,
    node: LayoutNodeData,
  ): LayoutNodeData => {
    dispatchLayoutChange("before");

    const rowIndex = rowsReference().indexOf(row);
    const nodeIndex = row.children.indexOf(node);
    row.children = row.children.filter((a) => a.id !== node.id);

    if (row.children.length <= 1) {
      rowsReference()[rowIndex] = row.children[0];
      return rowsReference()[rowIndex] as LayoutNodeData;
    }

    dispatchLayoutChange();

    return (
      row.children[nodeIndex] || row.children[nodeIndex - 1] || row.children[0]
    );
  };

  const removeRow = (row: LayoutNodeData): LayoutNodeData => {
    dispatchLayoutChange("before");

    const index = rowsReference().indexOf(row);
    layout.tree = rowsReference().filter((r) => r.id !== row.id);
    const availableRow =
      rowsReference()[index] ||
      rowsReference()[index - 1] ||
      rowsReference()[0];
    if (availableRow.type === "branch") {
      return availableRow.children[0] as LayoutNodeData;
    } else {
      return availableRow;
    }
  };

  const addColumnToNodeRow = (
    row: LayoutNodeData,
    position: "before" | "after",
  ): LayoutNodeData => {
    dispatchLayoutChange("before");

    const rowIndex = rowsReference().findIndex((r) => r.id === row.id);

    const newNode = generateLayoutNode({});
    const children = position === "before" ? [newNode, row] : [row, newNode];

    rowsReference()[rowIndex] = generateLayoutBranch({
      flow: "horizontal",
      children,
    });

    dispatchLayoutChange();

    return newNode;
  };

  return {
    addRow,
    addColumn,
    addColumnToNodeRow,
    onLayoutChange,
    beforeLayoutChange,
    removeNodeFromRow,
    removeRow,
  };
}
