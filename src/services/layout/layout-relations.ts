import { DocumentRegionData } from "../../types/document/document";
import { Layout, LayoutNodeData } from "../../types/layout/layout";
import { LayoutToDocumentRelation } from "../../types/layout/layout-relations";
import { slugify } from "../../utils/url";

export function generateLayoutToDocumentRelation(
  layout: Layout,
  node: LayoutNodeData,
  region: DocumentRegionData,
): LayoutToDocumentRelation {
  // If type branch link to first available item of branch.

  return {
    label: `${slugify(layout.name)}:${slugify(region.label || "unknown")}`,
    layoutId: layout.id,
    layoutNodeId: node.id,
    regionId: region.id,
  };
}

export function addRelationsToLayout(
  layout: Layout,
  relations: LayoutToDocumentRelation[],
): Layout {
  const newLayout = { ...layout };
  newLayout.relations = relations;

  return newLayout;
}
