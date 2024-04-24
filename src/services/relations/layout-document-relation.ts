// import { DocumentViewData } from "../../types/document/document";
// import { Layout } from "../../types/layout/layout";
// import { LayoutRegionRelation } from "../../types/relations/layout-document-relation";
// import { deepJSONClone } from "../../utils/object";
// import { flattenLayoutNodesByReference } from "../layout/layout-content";

// export function generateRelations(
//   currentRelations: Readonly<LayoutRegionRelation[]>,
//   layout: Readonly<Layout>,
//   view: Readonly<DocumentViewData>,
// ): LayoutRegionRelation[] {
//   const nodes = flattenLayoutNodesByReference(layout.tree);
//   const regions = deepJSONClone(view.content);
//   let relations: LayoutRegionRelation[] = [];

//   for (let node of nodes) {
//     // Has current relation
//     // const relation = relations.find((relation) => relation.nodeId === node.id);
//     // const relationRegion = view.contentDict[relation?.regionId];

//     const region = regions.shift();

//     if (region === undefined) {
//       // No more regions to map to. TOOD: create more regions here.
//       break;
//     }

//     const relation: LayoutRegionRelation = {
//       nodeId: node.id,
//       regionId: region.id,
//       layoutId: layout.id,
//     };
//     relations.push(relation);
//   }

//   return relations;
// }
