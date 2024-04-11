import {
  generateLayout,
  generateLayoutBranch,
  generateLayoutNode,
} from "../services/layout/layout-generator";
import { Layout } from "../types/layout/layout";

const defaultLayoutMapping = {
  website: generateLayoutWebsite,
  simple: generateLayoutSimple,
};

export function generateDefaultLayout(key: keyof typeof defaultLayoutMapping) {
  const generator = defaultLayoutMapping[key];

  if (generator === undefined) {
    return generateLayoutSimple();
  }

  return generator();
}

function generateLayoutWebsite(): Layout {
  return generateLayout({
    name: "Website",
    tree: [
      generateLayoutBranch({
        flow: "wrap",
        children: [
          generateLayoutNode({}),
          generateLayoutNode({}),
          generateLayoutNode({}),
          generateLayoutNode({}),
          generateLayoutNode({}),
        ],
      }),
      generateLayoutNode({}),
      generateLayoutNode({}),
      generateLayoutBranch({
        flow: "horizontal",
        children: [generateLayoutNode({}), generateLayoutNode({})],
      }),
      generateLayoutBranch({
        flow: "horizontal",
        children: [generateLayoutNode({}), generateLayoutNode({})],
      }),
      generateLayoutBranch({
        flow: "wrap",
        children: [
          generateLayoutNode({}),
          generateLayoutNode({}),
          generateLayoutNode({}),
          generateLayoutNode({}),
          generateLayoutNode({}),
        ],
      }),
    ],
  });
}

function generateLayoutSimple(): Layout {
  return generateLayout({
    name: "Equal",
    tree: [
      generateLayoutBranch({
        flow: "horizontal",
        children: [generateLayoutNode({}), generateLayoutNode({})],
      }),
      generateLayoutBranch({
        flow: "horizontal",
        children: [generateLayoutNode({}), generateLayoutNode({})],
      }),
    ],
  });
}
