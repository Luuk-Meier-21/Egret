import { Outlet, RouterProvider } from "react-router";
import { createBrowserRouter } from "react-router-dom";
import { isWithoutTauri } from "./utils/tauri";
import Actions from "./components/Actions/Actions";
import AppDocumentsOverview from "./components/DocumentsOverview/AppDocumentsOverview";
import { useHotkeyOverride } from "./utils/hotkeys";
import {
  generateDocumentMeta,
  parseFileToDocumentDirectory,
} from "./services/document/document-generator";
import { generateLayoutWithContent } from "./services/layout/layout-content";
import DialogProvider from "./components/Dialog/DialogProvider";
import { documentsPath, pathInDirectory } from "./services/store/store";
import { generateDefaultLayout } from "./config/layout";
import { useAbstractStore } from "./services/store/store-hooks";
import { validate } from "uuid";
import { ONBOARDING_CONTENT } from "./config/onboarding";
import { keywordsRecordOptions, keywordsRecordPath } from "./config/keywords";
import { Keyword } from "./types/keywords";
import { StrictMode, Suspense, lazy } from "react";

const Env = lazy(() => import("./components/EnvProvider/EnvProvider"));
import DocumentDetail from "./components/DocumentDetail/DocumentDetail";

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

            if (directory === null) {
              return;
            }

            const layout = await store
              .loadStore(
                pathInDirectory(directory, "layout.json"),
                generateLayoutWithContent(generateDefaultLayout("squares"), [
                  ONBOARDING_CONTENT,
                ]),
              )
              .then((store) => store.load());

            console.log("loaded state: ", layout);

            const document = await store
              .loadStore(
                pathInDirectory(directory, "meta.json"),
                generateDocumentMeta({
                  name: directory.name,
                }),
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
    <StrictMode>
      <div data-component-name="App">
        <Suspense>
          <Env>
            <DialogProvider>
              <RouterProvider router={router} />
            </DialogProvider>
          </Env>
        </Suspense>
      </div>
    </StrictMode>
  );
}

export default App;
