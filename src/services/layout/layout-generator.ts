import {
  Layout,
  LayoutBranchData,
  LayoutNodeData,
} from "../../types/layout/layout";
import { v4 as uuidv4 } from "uuid";

export function generateLayoutBranch(
  data: Partial<LayoutBranchData>,
): LayoutBranchData {
  return {
    id: data.id || uuidv4(),
    type: "branch",
    children: data.children || [],
    flow: data.flow || "horizontal",
  };
}

export function generateLayoutNode(
  data: Partial<LayoutNodeData>,
): LayoutNodeData {
  return {
    id: data.id || uuidv4(),
    type: "node",
    shortcut: data.shortcut,
    data: data.data || undefined,
  };
}

export function generateLayout(
  data: Partial<Layout> & { name: string },
): Layout {
  return {
    name: data.name,
    id: data.id || uuidv4(),
    description: data.description || "",
    tree: data.tree || [],
  };
}
