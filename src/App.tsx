import { Outlet, RouterProvider } from "react-router";
import { createBrowserRouter } from "react-router-dom";
import DocumentDetail from "./components/DocumentDetail/DocumentDetail";
import { fetchDocumentsReferences } from "./utils/documents";
import { isWithoutTauri } from "./utils/tauri";
import PromptProvider from "./components/Prompt/PromptProvider";
import Actions from "./components/Actions/Actions";
import { fetchKeywords } from "./utils/keywords";
import AppDocumentsOverview from "./components/DocumentsOverview/AppDocumentsOverview";
import { useHotkeyOverride } from "./utils/hotkeys";
import {
  generateDocumentContentData,
  generateDocumentData,
  generateDocumentMetaData,
  generateDocumentRegion,
  generateDocumentView,
} from "./services/document/document-generator";
import { DocumentData } from "./types/document-service";
import {
  generateLayout,
  generateLayoutBranch,
  generateLayoutNode,
} from "./services/layout/layout-generator";
import {
  addRelationsToLayout,
  generateLayoutToDocumentRelation,
} from "./services/layout/layout-relations";
import {
  flattenLayoutNodes,
  generateContentfullLayout,
} from "./services/layout/layout-document";
import { ContentfullLayout, Layout } from "./types/layout-service";

const TEST_DOCUMENT: Readonly<DocumentData> = generateDocumentData({
  name: "test document",
  data: generateDocumentContentData({
    meta: generateDocumentMetaData({
      version: 1,
    }),
    views: [
      generateDocumentView({
        label: "test view",
        content: [
          generateDocumentRegion({
            label: "region a",
          }),
          generateDocumentRegion({
            label: "region b",
          }),
          generateDocumentRegion({
            label: "region c",
          }),
          generateDocumentRegion({
            label: "region d",
          }),
        ],
      }),
    ],
  }),
});

const TEST_LAYOUT: Readonly<Layout> = generateLayout({
  name: "test layout",
  tree: [
    generateLayoutBranch({
      flow: "horizontal",
      children: [
        generateLayoutNode({}),
        generateLayoutNode({}),
        generateLayoutNode({}),
      ],
    }),
    generateLayoutNode({}),
    generateLayoutBranch({
      flow: "horizontal",
      children: [generateLayoutNode({}), generateLayoutNode({})],
    }),
    generateLayoutNode({}),
  ],
});

const TEST_LAYOUT_NODES = flattenLayoutNodes(TEST_LAYOUT);

const TEST_REGIONS = TEST_DOCUMENT.data.views[0].content;

const TEST_RELATIONS = [
  generateLayoutToDocumentRelation(
    TEST_LAYOUT,
    TEST_LAYOUT_NODES[6],
    TEST_REGIONS[0],
  ),
];

function App() {
  if (isWithoutTauri) {
    return (
      <div data-component-name="App" className="text-red-500">
        Unable to open app
      </div>
    );
  }

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <Actions>
          <Outlet />
        </Actions>
      ),
      children: [
        {
          path: "/",
          element: <AppDocumentsOverview />,
          loader: async ({}) => [
            await fetchDocumentsReferences(),
            await fetchKeywords(),
          ],
        },
        {
          path: "documents/:id",
          element: <DocumentDetail />,
          loader: async ({ params }) => {
            const a: ContentfullLayout = generateContentfullLayout(
              TEST_DOCUMENT.data.views[0],
              addRelationsToLayout(TEST_LAYOUT, TEST_RELATIONS),
            );

            return [
              // params.id ? await fetchDocumentById(params.id) : null,
              TEST_DOCUMENT,
              a,
              await fetchKeywords(),
            ];
          },
        },
      ],
    },
  ]);

  useHotkeyOverride();

  return (
    <div data-component-name="App">
      <DialogProvider>
        <PromptProvider>
          <RouterProvider router={router} />
        </PromptProvider>
      </DialogProvider>
    </div>
  );
}

export default App;
