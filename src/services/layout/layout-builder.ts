import { useEffect, useReducer } from "react";
import { generateLayoutNode } from "./layout-generator";
import {
  Layout,
  LayoutBranchData,
  LayoutBranchOrNodeData,
  LayoutCommon,
  LayoutNodeData,
  LayoutTreeTrunk,
} from "../../types/layout/layout";
import { layoutReducer } from "./layout-builder-reducer";
import { DocumentRegionData } from "../../types/document/document";
import { systemSound } from "../../bindings";
import { blocksHaveContent } from "../../utils/block";
import { announceError } from "../../utils/error";
import { useHistoryState } from "./layout-history";
import { useObservableEffect } from "./layout-change";
import { useScopedAction } from "../actions/actions-hook";

export type LayoutBuilderCallback = (layout: Layout) => void;

export function useLayoutBuilder(staticLayout: Layout) {
  const [layout, dispatch] = useReducer(layoutReducer, staticLayout);
  const layoutHistory = useHistoryState(layout);

  useObservableEffect(() => {
    layoutHistory.setState(layout);
  }, [layout]);

  useScopedAction("undo layout change", "cmd+z", () => {
    layoutHistory.undo();

    console.log(layoutHistory.pointer);
  });

  useEffect(() => {
    handleRowChildrenChange(layout.tree);
  }, [layout]);

  const announceCreation = () => {
    systemSound("Frog", 1.5, 1, 0.1);
  };

  const announceDeletion = () => {
    systemSound("Pop", 1.5, 1.5, 0.2);
  };

  const insertContent = (
    data: DocumentRegionData,
    node: LayoutNodeData,
  ): LayoutNodeData => {
    dispatch({ type: "insert-content", node, data });

    return node;
  };

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

  // const addRow = (position: "before" | "after"): LayoutNodeData => {
  //   const newRow = generateLayoutNode({});
  //   dispatch({ type: "add-row", position, newRow });
  //   announceCreation();

  //   return newRow;
  // };

  const insertRow = (
    row: LayoutBranchOrNodeData,
    position: "before" | "after",
  ): LayoutNodeData => {
    const newRow = generateLayoutNode({});
    dispatch({ type: "insert-row", position, row, newRow });
    announceCreation();

    return newRow;
  };

  // const addColumn = (
  //   row: LayoutBranchData,
  //   position: "before" | "after",
  // ): LayoutNodeData => {
  //   const newColumn = generateLayoutNode({});
  //   dispatch({
  //     type: "add-column",
  //     position,
  //     row,
  //     newColumn: newColumn,
  //   });
  //   announceCreation();

  //   return newColumn;
  // };

  const insertColumn = (
    row: LayoutBranchData,
    column: LayoutNodeData,
    position: "before" | "after",
  ): LayoutNodeData => {
    const newColumn = generateLayoutNode({});
    dispatch({ type: "insert-column", position, row, column, newColumn });
    announceCreation();

    console.log(newColumn);

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
    announceCreation();

    return newColumn;
  };

  const removeRow = (
    row: LayoutNodeData,
    force: boolean = false,
  ): LayoutNodeData => {
    if (!force && row.data?.blocks && blocksHaveContent(row.data.blocks)) {
      announceError();
      return row;
    }

    const index = layout.tree.indexOf(row);

    if (layout.tree.length <= 1 && layout.tree[0].type === "node") {
      announceError();
      return layout.tree[0];
    }

    dispatch({ type: "remove-row", row });
    announceDeletion();

    const futureRow =
      layout.tree[index + 1] || layout.tree[index - 1] || layout.tree[0];

    if (futureRow.type === "branch") {
      return futureRow.children[0];
    } else {
      return futureRow;
    }
  };

  const removeNodeFromRow = (
    row: LayoutBranchData,
    column: LayoutNodeData,
    force: boolean = false,
  ): LayoutNodeData => {
    if (
      !force &&
      column.data?.blocks &&
      blocksHaveContent(column.data.blocks)
    ) {
      announceError();
      return column;
    }

    const nodeIndex = row.children.indexOf(column);

    dispatch({ type: "remove-column-from-row", row, column });
    announceDeletion();

    return (
      row.children[nodeIndex + 1] ||
      row.children[nodeIndex - 1] ||
      row.children[0]
    );
  };

  return {
    // addRow,
    // addColumn,
    removeRow,
    removeNodeFromRow,
    addColumnToNodeRow,
    insertContent,
    insertRow,
    insertColumn,
    layout,
  } as const;
}

export type LayoutBuilder = ReturnType<typeof useLayoutBuilder>;
