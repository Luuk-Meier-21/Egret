import { useEffect, useReducer } from "react";
import { generateLayoutNode } from "./layout-generator";
import {
  Layout,
  LayoutBranchData,
  LayoutBranchOrNodeData,
  LayoutCommon,
  LayoutNodeData,
  LayoutTreeTrunk,
  SanitizedLayout,
} from "../../types/layout/layout";
import { layoutReducer } from "./layout-builder-reducer";
import {
  DocumentRegionData,
  DocumentRegionUserLandmark,
} from "../../types/document/document";
import { systemSound } from "../../bindings";
import { blocksHaveContent } from "../../utils/block";
import { announceError } from "../../utils/error";
import { useHistoryState } from "./layout-history";
import { useObservableEffect } from "./layout-change";
import { useScopedAction } from "../actions/actions-hook";
import { useLayoutNavigator } from "./layout-navigation";
import { useLayoutState } from "./layout-state";
import { deepJSONClone } from "../../utils/object";
import { flattenLayoutNodesByReference } from "./layout-content";

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

  const addLandmark = (
    node: LayoutNodeData,
    landmark: DocumentRegionUserLandmark,
  ) => {
    dispatch({ type: "add-landmark", node, landmark });
    announceCreation();

    return node;
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
    addLandmark,
    layout,
  } as const;
}

export type LayoutBuilder = ReturnType<typeof useLayoutBuilder>;

export function layoutDeleteNode(
  navigator: ReturnType<typeof useLayoutNavigator>,
  builder: ReturnType<typeof useLayoutBuilder>,
  selection: ReturnType<typeof useLayoutState>,
  force: boolean = false,
): void {
  const currentRow = navigator.getCurrentRow();
  const currentNode = navigator.getCurrentNode();

  if (currentRow === null || currentNode === null) {
    announceError();
    return;
  }

  if (currentRow.type === "branch") {
    const node = builder.removeNodeFromRow(currentRow, currentNode, force);
    selection.setNodeId(node.id);
  } else {
    const node = builder.removeRow(currentRow, force);
    selection.setNodeId(node.id);
  }
}

export function layoutInsertRow(
  navigator: ReturnType<typeof useLayoutNavigator>,
  builder: ReturnType<typeof useLayoutBuilder>,
  selection: ReturnType<typeof useLayoutState>,
  position: "before" | "after",
): void {
  const currentRow = navigator.getCurrentRow();

  if (currentRow === null) {
    announceError();
    return;
  }

  const newNode = builder.insertRow(currentRow, position);
  selection.setNodeId(newNode.id);
}

export function layoutInsertColumn(
  navigator: ReturnType<typeof useLayoutNavigator>,
  builder: ReturnType<typeof useLayoutBuilder>,
  selection: ReturnType<typeof useLayoutState>,
  position: "before" | "after",
): void {
  const currentRow = navigator.getCurrentRow();
  const currentNode = navigator.getCurrentNode();

  if (currentRow === null || currentNode === null) {
    announceError();
    return;
  }

  if (currentRow.type === "branch") {
    const newNode = builder.insertColumn(currentRow, currentNode, position);
    selection.setNodeId(newNode.id);
  } else {
    const newNode = builder.addColumnToNodeRow(currentRow, position);
    selection.setNodeId(newNode.id);
  }
}

export function sanitizeLayout(layout: Layout): SanitizedLayout {
  const cloneLayout: SanitizedLayout = {
    ...deepJSONClone(layout),
    clean: true,
  };
  const nodes = flattenLayoutNodesByReference(cloneLayout.tree);
  nodes.forEach((node) => {
    node.data = undefined;
  });

  return cloneLayout;
}
