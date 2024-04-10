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
} from "./services/layout/layout-content";
import { ContentfullLayout, Layout } from "./types/layout-service";
import DialogProvider from "./components/Dialog/DialogProvider";

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
            blocks: [
              {
                type: "title",
                content: "Apple",
              },
            ],
          }),
          generateDocumentRegion({
            label: "region a",
            blocks: [
              {
                type: "paragraph",
                content: "Home",
              },
            ],
          }),
          generateDocumentRegion({
            label: "region a",
            blocks: [
              {
                type: "paragraph",
                content: "About us",
              },
            ],
          }),
          generateDocumentRegion({
            label: "region a",
            blocks: [
              {
                type: "paragraph",
                content: "Products",
              },
            ],
          }),
          generateDocumentRegion({
            label: "region a",
            blocks: [
              {
                type: "paragraph",
                content: "Contact",
              },
            ],
          }),
          generateDocumentRegion({
            label: "region a",
            blocks: [
              {
                type: "title",
                content: "Strak. Sterk. Nu met M3.",
              },
              {
                type: "paragraph",
                content:
                  "Met MacBook Air kun je werken en spelen naar hartenlust en de M3 chip geeft de populairste laptop ter wereld nog meer kracht en mogelijkheden. De batterij gaat tot wel 18 uur mee,1 dus je neemt de superhandzame MacBook Air makkelijk overal mee naartoe voor alles wat je het liefste doet.",
              },
              {
                type: "paragraph",
                content: [
                  {
                    type: "link",
                    href: "https://www.apple.com/nl/macbook-air/",
                    content: "Macbook Air",
                  },
                ],
              },
            ],
          }),
          generateDocumentRegion({
            label: "region a",
            blocks: [
              {
                type: "image",
                props: {
                  src: "https://www.apple.com/v/macbook-air/s/images/overview/design/lifestyle-gallery/design_portability_1__gfw34rh367u6_large_2x.jpg",
                  alt: "De superlichte en dunne MacBook Air past makkelijk in je rugtas.",
                },
                content:
                  "De superlichte en dunne MacBook Air past makkelijk in je rugtas.",
              },
            ],
          }),
          generateDocumentRegion({
            label: "region a",
            blocks: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "link",
                    href: "https://www.apple.com/nl/macbook-air/",
                    content: "MacBook Air 13 M2-chip",
                  },
                ],
              },
            ],
          }),
          generateDocumentRegion({
            label: "region a",
            blocks: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "link",
                    href: "https://www.apple.com/nl/macbook-air/",
                    content: "MacBook Air 13 en 15 M3-chip",
                  },
                ],
              },
            ],
          }),
          generateDocumentRegion({
            label: "region a",
            blocks: [
              {
                type: "title",
                content:
                  "Van zodra je je MacBook Air openklapt, is hij overal klaar voor. En dankzij het design zonder ventilator hoor je ’m ook bij de zwaarste workloads niet. Of je nu multitaskt met meerdere apps, video’s bewerkt in iMovie of Baldur’s Gate 3 speelt in de gamemodus, de M3-chip laat alles nog sneller en vloeiender gaan.",
              },
              {
                type: "paragraph",
                content: "",
              },
              {
                type: "paragraph",
                content:
                  "De ongekende AI-prestaties van de Neural Engine van MacBook Air met de M3-chip maken intelligente macOS-features mogelijk die je productiviteit en creativiteit verhogen. Denk aan krachtige camera­features, een realtime dicteer­functie en manieren om alles duidelijker te verbeelden.",
              },
              {
                type: "paragraph",
                content: "",
              },
              {
                type: "paragraph",
                content:
                  "Dankzij het brede ecosysteem van apps kun je geavanceerde AI-features gebruiken op je MacBook Air. Kijk je huiswerk na met AI-wiskunde­hulp in Goodnotes, verbeter automatisch je foto’s in Pixelmator Pro, of verwijder het achtergrondgeluid van een video met CapCut",
              },
              {
                type: "paragraph",
                content: "",
              },
              {
                type: "paragraph",
                content:
                  "Batterij voor een hele dag. De batterij van zowel MacBook Air met M2 als MacBook Air met M3 gaat tot 18 uur mee, dus laat de oplader gerust thuis.1",
              },
            ],
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
    generateLayoutNode({}),
    generateLayoutNode({}),
  ],
});

// const TEST_LAYOUT_NODES = flattenLayoutNodes(TEST_LAYOUT);

// const TEST_REGIONS = TEST_DOCUMENT.data.views[0].content;

// const TEST_RELATIONS = [
//   generateLayoutToDocumentRelation(
//     TEST_LAYOUT,
//     TEST_LAYOUT_NODES[6],
//     TEST_REGIONS[0],
//   ),
// ];

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
          loader: async ({}) => {
            const a: ContentfullLayout = generateContentfullLayout(
              TEST_DOCUMENT.data.views[0],
              addRelationsToLayout(TEST_LAYOUT, []),
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
