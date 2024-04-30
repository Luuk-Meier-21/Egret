import { Outlet, RouterProvider } from "react-router";
import { createBrowserRouter } from "react-router-dom";
import DocumentDetail from "./components/DocumentDetail/DocumentDetail";
import { isWithoutTauri } from "./utils/tauri";
import PromptProvider from "./components/Prompt/PromptProvider";
import Actions from "./components/Actions/Actions";
import AppDocumentsOverview from "./components/DocumentsOverview/AppDocumentsOverview";
import { useHotkeyOverride } from "./utils/hotkeys";
import { parseFileToDocumentDirectory } from "./services/document/document-generator";
import { generateLayoutWithContent } from "./services/layout/layout-content";
import DialogProvider from "./components/Dialog/DialogProvider";
import { documentsPath, pathInDirectory } from "./services/store/store";
import { generateDefaultLayout } from "./config/layout";
import { useAbstractStore } from "./services/store/store-hooks";
import { validate } from "uuid";
import { generateBlankDocument } from "./config/document";
import { ONBOARDING_CONTENT } from "./config/onboarding";
import { keywordsRecordOptions, keywordsRecordPath } from "./config/keywords";
import { Keyword } from "./types/keywords";

function App() {
  if (isWithoutTauri) {
    return (
      <div data-component-name="App" className="text-red-500">
        Unable to open app
      </div>
    );
  }

  const store = useAbstractStore();

  const getDocumentDirectories = async () => {
    return await store.searchDirectory(
      documentsPath(),
      parseFileToDocumentDirectory,
    );
  };

  const getDocumentDirectoryOfId = async (id: string) => {
    if (!validate(id)) {
      return null;
    }

    const dirs = await store.searchDirectory(
      documentsPath(),
      parseFileToDocumentDirectory,
    );

    return dirs.find((dir) => dir.id === id) || null;
  };

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
          loader: async ({}) => {
            const refs = await getDocumentDirectories();

            const keywords = await store
              .loadStore(
                keywordsRecordPath,
                [] as Keyword[],
                keywordsRecordOptions,
              )
              .then((store) => store.load());

            return [refs, keywords];
          },
        },
        {
          path: "documents/:id",
          element: <DocumentDetail />,
          loader: async ({ params }) => {
            if (params.id === undefined) {
              return;
            }

            const directory = await getDocumentDirectoryOfId(params.id);
            console.log(directory);

            if (directory === null) {
              return;
            }

            const layout = await store
              .loadStore(
                pathInDirectory(directory, `${directory.name}.layout.json`),
                generateLayoutWithContent(generateDefaultLayout("simple"), [
                  ONBOARDING_CONTENT,
                ]),
              )
              .then((store) => store.load());

            const document = await store
              .loadStore(
                pathInDirectory(directory, `${directory.name}.document.json`),
                generateBlankDocument(directory.name),
              )
              .then((store) => store.load());

            const keywords = await store
              .loadStore(
                keywordsRecordPath,
                [] as Keyword[],
                keywordsRecordOptions,
              )
              .then((store) => store.load());

            // const relationsStore = await store.loadStore<
            //   RegionLayoutRelation[]
            // >(
            //   pathInDirectory(directory, `${directory.name}.relations.json`),
            //   [],
            // );

            // const relations = await relationsStore
            //   .set(
            //     generateRelations(
            //       await relationsStore.load(),
            //       layout,
            //       document.data.views[0],
            //     ),
            //   )
            //   .save();

            return [directory, document, layout, keywords];
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
