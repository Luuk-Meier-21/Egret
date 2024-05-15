import {
  generateLayout,
  generateLayoutBranch,
  generateLayoutNode,
} from "../services/layout/layout-generator";
import { Layout } from "../types/layout/layout";

export const defaultLayoutMapping = {
  squares: generateLayoutSimple,
  grid: generateLayoutGrid,
  triangle: generateLayoutTriangle,
};

export function generateDefaultLayout(key: keyof typeof defaultLayoutMapping) {
  const generator = defaultLayoutMapping[key];

  if (generator === undefined) {
    return generateLayoutSimple();
  }

  return generator();
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

function generateLayoutGrid(): Layout {
  return generateLayout({
    name: "Grid 3 by 3",
    tree: [
      generateLayoutBranch({
        flow: "horizontal",
        children: [
          generateLayoutNode({}),
          generateLayoutNode({}),
          generateLayoutNode({}),
        ],
      }),
      generateLayoutBranch({
        flow: "horizontal",
        children: [
          generateLayoutNode({}),
          generateLayoutNode({}),
          generateLayoutNode({}),
        ],
      }),
      generateLayoutBranch({
        flow: "horizontal",
        children: [
          generateLayoutNode({}),
          generateLayoutNode({}),
          generateLayoutNode({}),
        ],
      }),
    ],
  });
}

function generateLayoutTriangle(): Layout {
  return generateLayout({
    name: "Triangle 5 to 1",
    tree: [
      generateLayoutBranch({
        flow: "horizontal",
        children: [
          generateLayoutNode({}),
          generateLayoutNode({}),
          generateLayoutNode({}),
          generateLayoutNode({}),
          generateLayoutNode({}),
        ],
      }),
      generateLayoutBranch({
        flow: "horizontal",
        children: [
          generateLayoutNode({}),
          generateLayoutNode({}),
          generateLayoutNode({}),
        ],
      }),
      generateLayoutBranch({
        flow: "horizontal",
        children: [generateLayoutNode({})],
      }),
    ],
  });
}
