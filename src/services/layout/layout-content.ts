import {
  DocumentRegionData,
  DocumentViewData,
} from "../../types/document/document";
import {
  ContentfullLayout,
  Layout,
  LayoutBranchOrNodeData,
  LayoutNodeData,
  LayoutTree,
} from "../../types/layout/layout";
import { LayoutToDocumentRelation } from "../../types/layout/layout-relations";
import { deepJSONClone } from "../../utils/object";

export function generateContentfullLayout(
  documentView: DocumentViewData,
  layout: Layout,
): ContentfullLayout {
  if (layout.decorated === true) {
    return layout as ContentfullLayout;
  }
  const newLayout: ContentfullLayout = deepJSONClone({
    ...layout,
    decorated: true,
  });

  const regions = documentView.content.slice();
  const relations = layout.relations.slice();
  const nodes = flattenLayoutNodesByReference(newLayout.tree);

  let availableRegions = regions.slice();

  const findAndShiftRegion = (
    relation: LayoutToDocumentRelation | undefined,
  ): DocumentRegionData | undefined => {
    const targetRegion = availableRegions.find(
      (region) => region.id === relation?.regionId,
    );

    if (targetRegion === undefined) {
      return;
    }

    availableRegions = availableRegions.filter(
      (region) => region.id !== targetRegion?.id,
    );

    return targetRegion;
  };

  // First do relations
  for (const relation of relations) {
    const nodeIndex = nodes.findIndex(
      (node) => node.id === relation.layoutNodeId,
    );
    const region = findAndShiftRegion(relation);

    if (region && nodeIndex !== -1) {
      nodes[nodeIndex].data = { ...region };
    }
  }

  // Give leftover regions a spot
  for (const node of nodes) {
    if (node.contentfull === false) {
      const region = availableRegions.shift();

      if (region) {
        node.data = region;
        node.contentfull = true;
      }
    }
  }

  return newLayout;
}

export function flattenLayoutNodesByReference(
  tree: LayoutTree,
): LayoutNodeData[] {
  let results: LayoutNodeData[] = [];

  const traverseBranche = (
    array: LayoutBranchOrNodeData[],
    depth: number = 0,
  ) => {
    for (let item of array) {
      if (item.type === "node") {
        results.push(item);
      } else if (item.type === "branch") {
        traverseBranche(item.children, depth + 1);
      } else {
        return;
      }
    }
  };

  if (tree === undefined) {
    return [];
  }

  traverseBranche(tree as LayoutBranchOrNodeData[]);

  return results;
}

export function flattenLayoutNodes(layout: Layout): LayoutNodeData[] {
  const newLayout = deepJSONClone(layout);

  return flattenLayoutNodesByReference(newLayout.tree);
}
