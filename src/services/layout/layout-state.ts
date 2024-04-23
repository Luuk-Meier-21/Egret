import { useState } from "react";
import { Layout } from "../../types/layout/layout";
import { flattenLayoutNodesByReference } from "./layout-content";
import { deepJSONClone } from "../../utils/object";
import { LayoutBuilder } from "./layout-builder";

export function useLayoutState(builder: LayoutBuilder) {
  const rows = builder.layout.tree;
  const columns = flattenLayoutNodesByReference(builder.layout.tree);

  const [layout, setLayout] = useState<Layout>(deepJSONClone(builder.layout));
  const [rowId, setRowId] = useState<string | null>(rows[0].id);
  const [nodeId, setNodeId] = useState<string | null>(columns[0].id);

  return { rowId, setRowId, nodeId, setNodeId, layout, setLayout } as const;
}

export type LayoutState = ReturnType<typeof useLayoutState>;
