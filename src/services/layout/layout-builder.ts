import { useEffect, useReducer } from "react";
import { generateLayoutNode } from "./layout-generator";
import {
  Layout,
  LayoutBranchData,
  LayoutCommon,
  LayoutNodeData,
  LayoutTreeTrunk,
} from "../../types/layout-service";
import { layoutReducer } from "./layout-builder-reducer";

export type LayoutBuilderCallback = (layout: Layout) => void;

export function useLayoutBuilder(staticLayout: Layout) {
  const [layout, dispatch] = useReducer(layoutReducer, staticLayout);

  useEffect(() => {
    handleRowChildrenChange(layout.tree);
  }, [layout]);

  const override = () => {};

  const handleRowChildrenChange = (rows: LayoutTreeTrunk[]) => {
    for (let row of rows) {
      if (row.type === "branch" && row.children.length <= 1) {
        if (row.children.length < 1) {
          // Remove empty rows
          dispatch({
            type: "remove-row",
            row: row as LayoutCommon as LayoutNodeData,
          });
        } else {
          dispatch({
            type: "convert-row-to-node",
            row: row as LayoutBranchData,
          });
        }
      }
    }
  };

  const addRow = (position: "before" | "after"): LayoutNodeData => {
    const newRow = generateLayoutNode({});
    dispatch({ type: "add-row", position, newRow });

    return newRow;
  };

  const addColumn = (
    row: LayoutBranchData,
    position: "before" | "after",
  ): LayoutNodeData => {
    const newColumn = generateLayoutNode({});
    dispatch({
      type: "add-column",
      position,
      row,
      newColumn: newColumn,
    });

    return newColumn;
  };

  const addColumnToNodeRow = (
    row: LayoutNodeData,
    position: "before" | "after",
  ): LayoutNodeData => {
    const newColumn = generateLayoutNode({});

    dispatch({
      type: "add-column-to-node",
      row: row,
      newColumn: newColumn,
      position: position,
    });

    return newColumn;
  };

  const removeRow = (row: LayoutNodeData): LayoutNodeData => {
    const index = layout.tree.indexOf(row);

    dispatch({ type: "remove-row", row });
    // For some reason state is not updated here yet.

    const futureRow =
      layout.tree[index + 1] || layout.tree[index - 1] || layout.tree[0];

    if (futureRow.type === "branch") {
      return futureRow.children[0] as LayoutNodeData;
    } else {
      return futureRow;
    }
  };

  const removeNodeFromRow = (
    row: LayoutBranchData,
    column: LayoutNodeData,
  ): LayoutNodeData => {
    const nodeIndex = row.children.indexOf(column);

    dispatch({ type: "remove-column-from-row", row, column });

    return (
      row.children[nodeIndex + 1] ||
      row.children[nodeIndex - 1] ||
      row.children[0]
    );
  };

  return {
    addRow,
    addColumn,
    addColumnToNodeRow,
    removeRow,
    removeNodeFromRow,
    layout,
  } as const;
}

export type LayoutBuilder = ReturnType<typeof useLayoutBuilder>;
