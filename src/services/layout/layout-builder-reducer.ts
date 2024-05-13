import {
  DocumentRegionData,
  DocumentRegionUserLandmark,
} from "../../types/document/document";
import {
  Layout,
  LayoutBranchData,
  LayoutBranchOrNodeData,
  LayoutNodeData,
} from "../../types/layout/layout";
import { deepJSONClone } from "../../utils/object";
import { flattenLayoutNodesByReference } from "./layout-content";
import { generateLayoutBranch } from "./layout-generator";

// WARNING: Reducers and passing by reference do not work together.
// This behaviour makes the reducer call dispatch twice resulting in duplicated additions to the state.

type ActionRequired = {
  type: string;
};

type LayoutAction = ActionRequired &
  // | {
  //     type: "add-row";
  //     newRow: LayoutBranchOrNodeData;
  //     position: "before" | "after";
  //   }
  (| {
        type: "insert-row";
        row: LayoutBranchOrNodeData;
        newRow: LayoutBranchOrNodeData;
        position: "before" | "after";
      }
    // | {
    //     type: "add-column";
    //     row: LayoutBranchData;
    //     newColumn: LayoutNodeData;
    //     position: "before" | "after";
    //   }
    | {
        type: "insert-column";
        row: LayoutBranchData;
        column: LayoutNodeData;
        newColumn: LayoutNodeData;
        position: "before" | "after";
      }
    | {
        type: "add-column-to-node";
        row: LayoutNodeData;
        newColumn: LayoutNodeData;
        position: "before" | "after";
      }
    | {
        type: "remove-row";
        row: LayoutNodeData;
      }
    | {
        type: "remove-column-from-row";
        row: LayoutBranchData;
        column: LayoutNodeData;
      }
    | {
        type: "convert-row-to-node";
        row: LayoutBranchData;
      }
    | {
        type: "insert-content";
        node: LayoutNodeData;
        data: DocumentRegionData;
      }
    | {
        type: "overwrite";
        layout: Layout;
      }
    | {
        type: "add-landmark";
        node: LayoutNodeData;
        landmark: DocumentRegionUserLandmark;
      }
  );

export function layoutReducer(oldLayout: Layout, action: LayoutAction): Layout {
  switch (action.type) {
    // case "add-row": {
    //   const rows = deepJSONClone(oldLayout.tree);
    //   const appendKey = action.position === "before" ? "unshift" : "push";

    //   rows[appendKey](action.newRow);

    //   return { ...oldLayout, tree: rows };
    // }
    case "insert-row": {
      const rows = deepJSONClone(oldLayout.tree);
      const index = rows.findIndex((r) => r.id === action.row.id);
      const directionNumber = action.position === "before" ? 0 : 1;

      if (index < 0) {
        return oldLayout;
      }

      rows.splice(index + directionNumber, 0, action.newRow);

      return { ...oldLayout, tree: rows };
    }
    // case "add-column": {
    //   const rows = oldLayout.tree;
    //   const row = deepJSONClone(action.row);
    //   const appendKey = action.position === "before" ? "unshift" : "push";

    //   row.children[appendKey](action.newColumn);

    //   const index = rows.findIndex((r) => r.id === row.id);
    //   rows[index] = row;

    //   return { ...oldLayout, tree: rows };
    // }
    case "insert-column": {
      const rows = oldLayout.tree;
      const row = deepJSONClone(action.row);
      const columnIndex = row.children.findIndex(
        (c) => c.id === action.column.id,
      );
      const directionNumber = action.position === "before" ? 0 : 1;

      if (columnIndex < 0) {
        return oldLayout;
      }

      row.children.splice(columnIndex + directionNumber, 0, action.newColumn);

      const rowIndex = rows.findIndex((r) => r.id === row.id);

      if (rowIndex < 0) {
        return oldLayout;
      }

      rows[rowIndex] = row;

      return { ...oldLayout, tree: rows };
    }
    case "add-column-to-node": {
      const rows = deepJSONClone(oldLayout.tree);
      const row = deepJSONClone(action.row);
      const children =
        action.position === "before"
          ? [action.newColumn, row]
          : [row, action.newColumn];
      const index = rows.findIndex((r) => r.id === row.id);

      rows[index] = generateLayoutBranch({
        id: row.id,
        flow: "horizontal",
        children,
      });

      return { ...oldLayout, tree: rows };
    }
    case "remove-row": {
      const rows = oldLayout.tree;
      const row = deepJSONClone(action.row);
      const newRows = rows.filter((r) => r.id !== row.id);

      return { ...oldLayout, tree: newRows };
    }
    case "remove-column-from-row": {
      const rows = oldLayout.tree;
      const row = deepJSONClone(action.row);
      const index = rows.findIndex((r) => r.id === row.id);

      row.children = row.children.filter((c) => c.id !== action.column.id);

      rows[index] = row;

      return { ...oldLayout, tree: rows };
    }
    case "convert-row-to-node": {
      const rows = oldLayout.tree;
      const row = deepJSONClone(action.row);
      const index = rows.findIndex((r) => r.id === row.id);

      row.children[0].id = row.id;
      rows[index] = row.children[0];

      return { ...oldLayout, tree: rows };
    }
    case "insert-content": {
      const rows = oldLayout.tree;
      const nodes = flattenLayoutNodesByReference(rows);

      const node = nodes.find((node) => node.id === action.node.id);

      if (node) {
        node.data = action.data;
      }

      return { ...oldLayout, tree: rows };
    }
    case "add-landmark": {
      const rows = oldLayout.tree;
      const nodes = flattenLayoutNodesByReference(rows);

      const node = nodes.find((node) => node.id === action.node.id);

      if (node && node.data) {
        node.data.landmark = action.landmark;
      }

      return { ...oldLayout, tree: rows };
    }
    case "overwrite": {
      const layout = deepJSONClone(action.layout);

      return { ...layout };
    }
    default:
      return oldLayout;
  }
}
