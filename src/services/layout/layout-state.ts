import { useState } from "react";
import { Layout } from "../../types/layout/layout";
import { flattenLayoutNodesByReference } from "./layout-content";

export function useLayoutState(layout: Layout) {
  const rows = layout.tree;
  const columns = flattenLayoutNodesByReference(layout.tree);

  const [rowId, setRowId] = useState<string | null>(rows[0].id);
  const [nodeId, setNodeId] = useState<string | null>(columns[0].id);

  return { rowId, setRowId, nodeId, setNodeId } as const;
}

export type LayoutState = ReturnType<typeof useLayoutState>;
