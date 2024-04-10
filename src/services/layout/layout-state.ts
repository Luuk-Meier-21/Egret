import { useState } from "react";
import { Layout, LayoutTree } from "../../types/layout-service";
import { flattenLayoutNodesByReference } from "./layout-content";
import { deepJSONClone } from "../../utils/object";

export interface LayoutState {
  rowId: string | null;
  setRowId: React.Dispatch<React.SetStateAction<string | null>>;
  nodeId: string | null;
  setNodeId: React.Dispatch<React.SetStateAction<string | null>>;
  layout: Layout;
  setLayout: React.Dispatch<React.SetStateAction<Layout>>;
}

export function useLayoutState(staticLayout: Layout): LayoutState {
  const rows = staticLayout.tree;
  const columns = flattenLayoutNodesByReference(staticLayout.tree);

  const [layout, setLayout] = useState<Layout>(deepJSONClone(staticLayout));
  const [rowId, setRowId] = useState<string | null>(rows[0].id);
  const [nodeId, setNodeId] = useState<string | null>(columns[0].id);

  return { rowId, setRowId, nodeId, setNodeId, layout, setLayout };
}
