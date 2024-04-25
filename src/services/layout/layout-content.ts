import { DocumentRegionData } from "../../types/document/document";
import {
  Layout,
  LayoutBranchOrNodeData,
  LayoutNodeData,
  LayoutTree,
} from "../../types/layout/layout";
import { deepJSONClone } from "../../utils/object";

export function generateLayoutWithContent(
  layout: Layout,
  content: DocumentRegionData[],
): Layout {
  const layoutClone = deepJSONClone(layout);
  const nodes = flattenLayoutNodesByReference(layoutClone.tree);
  for (let [index, region] of content.entries()) {
    const node = nodes[index];

    node.data = region;
  }

  return layoutClone;
}

// /**
//  * @deprecated
//  * @param documentView
//  * @param layout
//  * @returns
//  */
// export function generateContentfullLayout(
//   documentView: DocumentViewData,
//   layout: Layout,
// ): Layout {
//   const newLayout: Layout = deepJSONClone({
//     ...layout,
//     decorated: true,
//   });

//   const regions = documentView.content.slice();
//   const nodes = flattenLayoutNodesByReference(newLayout.tree);

//   let availableRegions = regions.slice();

//   const findAndShiftRegion = (
//     relation: LayoutToDocumentRelation | undefined,
//   ): DocumentRegionData | undefined => {
//     const targetRegion = availableRegions.find(
//       (region) => region.id === relation?.regionId,
//     );

//     if (targetRegion === undefined) {
//       return;
//     }

//     availableRegions = availableRegions.filter(
//       (region) => region.id !== targetRegion?.id,
//     );

//     return targetRegion;
//   };

//   // First do relations
//   for (const relation of relations) {
//     const nodeIndex = nodes.findIndex(
//       (node) => node.id === relation.layoutNodeId,
//     );
//     const region = findAndShiftRegion(relation);

//     if (region && nodeIndex !== -1) {
//       nodes[nodeIndex].data = { ...region };
//     }
//   }

//   // Give leftover regions a spot
//   for (const node of nodes) {
//     if (node.contentfull === false) {
//       const region = availableRegions.shift();

//       if (region) {
//         node.data = region;
//         node.contentfull = true;
//       }
//     }
//   }

//   return newLayout;
// }

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
