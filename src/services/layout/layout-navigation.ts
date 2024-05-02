import { useEffect } from "react";
import {
  LayoutBranchOrNodeData,
  LayoutNodeData,
  LayoutTreeTrunk,
} from "../../types/layout/layout";
import { flattenLayoutNodesByReference } from "./layout-content";
import { LayoutBuilder } from "./layout-builder";
import { LayoutState } from "./layout-state";
import { delay, playSound } from "../../utils/sound";

export function useLayoutNavigator(
  { rowId, setRowId, nodeId, setNodeId }: LayoutState,
  builder: LayoutBuilder,
) {
  const rows = builder.layout.tree;
  const nodes = flattenLayoutNodesByReference(builder.layout.tree);

  const playSoundRows = async (row: LayoutTreeTrunk) => {
    const recursivePlay = async (count: number, index: number = 0) => {
      if (index < count) {
        playSound("Purr", { speed: 2.5, volume: 1, time: 0.25 });
        await delay(150);
        recursivePlay(count, index + 1);
      }
    };

    playSound("Blow", { speed: 2.5, volume: 1, time: 0.5 });
    await delay(300);
    recursivePlay(row.type === "branch" ? row.children.length : 1);
  };

  const playSoundColumn = async (column: LayoutNodeData) => {
    playSound("Purr", { speed: 1.5, volume: 1, time: 0.5 });
  };

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

    scrollNodeIntoView();
  }, [rowId, nodeId, builder.layout]);

  const scrollNodeIntoView = () => {
    const element = document.getElementById(nodeId || "");
    if (element === null) {
      return;
    }

    window.scrollTo({
      top: element.offsetTop - window.innerHeight / 4,
      left: element.offsetLeft - window.innerWidth / 4,
      behavior: "smooth",
    });
  };

  const getCurrentRow = (): LayoutBranchOrNodeData | null =>
    (rows.find((row) => row.id === rowId) as LayoutBranchOrNodeData) || null;

  const getCurrentNode = (): LayoutNodeData | null =>
    nodes.find((node) => node.id === nodeId) || null;

  const focusRowUp = () => {
    const index = rows.findIndex((row) => row.id === rowId);
    const previousRow = rows[index - 1];
    if (previousRow) {
      setRowId(previousRow.id);
      playSoundRows(previousRow);
    } else {
      const newRow = builder.addRow("before");
      setRowId(newRow.id);
    }
  };

  const focusRowDown = () => {
    const index = rows.findIndex((row) => row.id === rowId);
    console.log(index);
    const nextRow = rows[index + 1];
    if (nextRow) {
      setRowId(nextRow.id);
      playSoundRows(nextRow);
    } else {
      const newRow = builder.addRow("after");
      setRowId(newRow.id);
    }
  };

  const focusColumnLeft = () => {
    const rowIndex = rows.findIndex((row) => row.id === rowId);

    if (rowIndex < 0) {
      return;
    }

    const row = rows[rowIndex];
    if (row?.type === "branch") {
      const index = row.children.findIndex((column) => column.id === nodeId);
      const previousColumn = row.children[index - 1];
      if (previousColumn) {
        setNodeId(previousColumn.id);
        playSoundColumn(previousColumn);
      } else {
        const newColumn = builder.addColumn(row, "before");
        setNodeId(newColumn.id);
      }
    } else {
      const newColumn = builder.addColumnToNodeRow(row, "before");

      setNodeId(newColumn.id);
    }
  };

  const focusColumnRight = () => {
    const rowIndex = rows.findIndex((row) => row.id === rowId);
    console.log(rowIndex);

    if (rowIndex < 0) {
      return;
    }

    const row = rows[rowIndex];
    if (row?.type === "branch") {
      const index = row.children.findIndex((column) => column.id === nodeId);
      const nextColumn = row.children[index + 1];
      if (nextColumn) {
        setNodeId(nextColumn.id);
        playSoundColumn(nextColumn);
      } else {
        const newColumn = builder.addColumn(row, "after");

        setNodeId(newColumn.id);
      }
    } else {
      const newColumn = builder.addColumnToNodeRow(row, "after");

      setNodeId(newColumn.id);
    }
  };

  const focusColumnStart = () => {
    const rowIndex = rows.findIndex((row) => row.id === rowId);

    if (rowIndex < 0) {
      return;
    }

    const row = rows[rowIndex];
    if (row?.type === "branch") {
      const startColumn = row.children[0];
      if (startColumn) {
        setNodeId(startColumn.id);
        playSoundColumn(startColumn);
      }
    }
  };

  const focusColumnEnd = () => {
    const rowIndex = rows.findIndex((row) => row.id === rowId);

    if (rowIndex < 0) {
      return;
    }

    const row = rows[rowIndex];
    if (row?.type === "branch") {
      const startColumn = row.children[row.children.length - 1];
      if (startColumn) {
        setNodeId(startColumn.id);
        playSoundColumn(startColumn);
      }
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
    focusColumnStart,
    focusColumnEnd,
  } as const;
}

export type LayoutNavigator = ReturnType<typeof useLayoutNavigator>;
