import { useState } from "react";
import { Layout } from "../../types/layout/layout";
import { flattenLayoutNodesByReference } from "./layout-content";
import { deepJSONClone } from "../../utils/object";

export function useLayoutState(staticLayout: Layout) {
  const rows = staticLayout.tree;
  const columns = flattenLayoutNodesByReference(staticLayout.tree);

  const [layout, setLayout] = useState<Layout>(deepJSONClone(staticLayout));
  const [rowId, setRowId] = useState<string | null>(rows[0].id);
  const [nodeId, setNodeId] = useState<string | null>(columns[0].id);

  return { rowId, setRowId, nodeId, setNodeId, layout, setLayout } as const;
}

export type LayoutState = ReturnType<typeof useLayoutState>;
