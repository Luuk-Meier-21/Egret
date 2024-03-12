import { Outlet, RouterProvider } from "react-router";
import { Link, createBrowserRouter } from "react-router-dom";
import DocumentsOverview from "./components/DocumentsOverview/DocumentsOverview";
import DocumentDetail from "./components/DocumentDetail/DocumentDetail";
import { fetchDocumentById, fetchDocumentsReferences } from "./utils/documents";
import { isWithoutTauri } from "./utils/tauri";
import PromptProvider from "./components/Prompt/PromptProvider";
import { useHotkeyOverride, useHotkeys } from "./utils/hotkeys";
import Actions from "./components/Actions/Actions";

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
          element: <DocumentsOverview />,
          loader: ({}) => fetchDocumentsReferences(),
        },
        {
          path: "documents/:id",
          element: <DocumentDetail />,
          loader: ({ params }) => {
            return params.id ? fetchDocumentById(params.id) : null;
          },
        },
        // {
        //   path: "documents/:id",
        //   Component: (a) => {
        //     console.log(a);
        //     return <div>b</div>;
        //   },
        //   loader: ({ request, params }) => {
        //     console.log(params);
        //     return fetch("/api/dashboard.json", {
        //       signal: request.signal,
        //     });
        //   },
        // },
      ],
    },
  ]);

  return (
    <div data-component-name="App">
      <PromptProvider>
        <RouterProvider router={router} />
      </PromptProvider>
    </div>
  );
}

export default App;
