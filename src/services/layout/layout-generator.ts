import {
  Layout,
  LayoutBranchData,
  LayoutNodeData,
} from "../../types/layout-service";
import { v4 as uuidv4 } from "uuid";

export function generateLayoutBranch(
  data: Partial<LayoutBranchData>,
): LayoutBranchData {
  return {
    id: data.id || uuidv4(),
    type: "branch",
    children: data.children || [],
    flow: data.flow || "vertical",
  };
}

export function generateLayoutNode(
  data: Partial<LayoutNodeData>,
): LayoutNodeData {
  return {
    id: data.id || uuidv4(),
    contentfull: data.contentfull || false,
    type: "node",
    shortcut: data.shortcut,
  };
}

export function generateLayout(
  data: Partial<Layout> & { name: string },
): Layout {
  return {
    name: data.name,
    id: data.id || uuidv4(),
    decorated: data.decorated ?? false,
    description: data.description || "",
    tree: data.tree || [],
    relations: data.relations || [],
  };
}
