import { useEffect } from "react";
import {
  Layout,
  LayoutBranchData,
  LayoutBranchOrNodeData,
  LayoutNodeData,
} from "../../types/layout-service";
import { flattenLayoutNodesByReference } from "./layout-content";
import { LayoutState } from "./layout-state";
import { LayoutBuilder } from "./layout-builder";

export interface LayoutNavigator {
  focusRowUp: () => void;
  focusRowDown: () => void;
  focusColumnLeft: () => void;
  focusColumnRight: () => void;
  focusColumn: (rowId: string, columnId: string) => void;
  blurColumn: () => void;
  getCurrentRow: () => LayoutBranchOrNodeData;
  getCurrentNode: () => LayoutNodeData;
}

export function useLayoutNavigator(
  layout: Layout,
  { rowId, setRowId, nodeId, setNodeId }: LayoutState,
  builder: LayoutBuilder,
): LayoutNavigator {
  const rows = layout.tree;
  const nodes = flattenLayoutNodesByReference(layout.tree);

  useEffect(() => {
    const row = rows.find((row) => row.id === rowId);
    if (row?.type === "branch") {
      const columnInRow = row.children.find((column) => column.id === nodeId);

      if (columnInRow) {
        setNodeId(columnInRow.id);
      } else {
        setNodeId(row.children[0].id);
      }
    } else if (row?.type === "node") {
      setNodeId(row.id);
    }
  }, [rowId, nodeId]);

  const getCurrentRow = (): LayoutBranchOrNodeData | null =>
    (rows.find((row) => row.id === rowId) as LayoutBranchOrNodeData) || null;

  const getCurrentNode = (): LayoutNodeData | null =>
    nodes.find((node) => node.id === nodeId) || null;

  const focusRowUp = () => {
    const index = rows.findIndex((row) => row.id === rowId);
    const previousRow = rows[index - 1];
    if (previousRow) {
      setRowId(previousRow.id);
    } else {
      const newRow = builder.addRow("before");
      setRowId(newRow.id);
    }
  };

  const focusRowDown = () => {
    const index = rows.findIndex((row) => row.id === rowId);
    const nextRow = rows[index + 1];
    if (nextRow) {
      setRowId(nextRow.id);
    } else {
      const newRow = builder.addRow("after");
      setRowId(newRow.id);
    }
  };

  const focusColumnLeft = () => {
    const rowIndex = rows.findIndex((row) => row.id === rowId);
    const row = rows[rowIndex];
    if (row?.type === "branch") {
      const index = row.children.findIndex((column) => column.id === nodeId);
      const previousColumn = row.children[index - 1];
      if (previousColumn) {
        setNodeId(previousColumn.id);
      } else {
        const newColumn = builder.addColumn(row as LayoutBranchData, "before");

        setNodeId(newColumn.id);
      }
    } else {
      const newColumn = builder.addColumnToNodeRow(row, "before");

      setNodeId(newColumn.id);
    }
  };

  const focusColumnRight = () => {
    const rowIndex = rows.findIndex((row) => row.id === rowId);
    const row = rows[rowIndex];
    if (row?.type === "branch") {
      const index = row.children.findIndex((column) => column.id === nodeId);
      const nextColumn = row.children[index + 1];
      if (nextColumn) {
        setNodeId(nextColumn.id);
      } else {
        const newColumn = builder.addColumn(row as LayoutBranchData, "after");

        setNodeId(newColumn.id);
      }
    } else {
      const newColumn = builder.addColumnToNodeRow(row, "after");

      setNodeId(newColumn.id);
    }
  };

  const focusColumn = (rowId: string, columnId: string) => {
    setNodeId(columnId);
    setRowId(rowId);
  };

  const blurColumn = () => {
    setNodeId(null);
    setRowId(null);
  };

  return {
    focusRowUp,
    focusRowDown,
    focusColumnLeft,
    focusColumnRight,
    focusColumn,
    blurColumn,
    getCurrentRow,
    getCurrentNode,
  };
}
