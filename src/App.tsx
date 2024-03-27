import { Outlet, RouterProvider } from "react-router";
import { createBrowserRouter } from "react-router-dom";
import DocumentDetail from "./components/DocumentDetail/DocumentDetail";
import { fetchDocumentById, fetchDocumentsReferences } from "./utils/documents";
import { isWithoutTauri } from "./utils/tauri";
import PromptProvider from "./components/Prompt/PromptProvider";
import Actions from "./components/Actions/Actions";
import { fetchKeywords } from "./utils/keywords";
import AppDocumentsOverview from "./components/DocumentsOverview/AppDocumentsOverview";
import { useHotkeyOverride } from "./utils/hotkeys";
import DialogProvider from "./components/Dialog/DialogProvider";

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
            return [
              params.id ? await fetchDocumentById(params.id) : null,
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
