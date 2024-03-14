import { Outlet, RouterProvider } from "react-router";
import { createBrowserRouter } from "react-router-dom";
import DocumentsOverview from "./components/DocumentsOverview/DocumentsOverview";
import DocumentDetail from "./components/DocumentDetail/DocumentDetail";
import { fetchDocumentById, fetchDocumentsReferences } from "./utils/documents";
import { isWithoutTauri } from "./utils/tauri";
import PromptProvider from "./components/Prompt/PromptProvider";
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

  // const [name, setName] = useState("");
  // const [users, setUsers] = useState<{ id: number; name: string | null }[]>([]);

  // async function addKeyword() {
  //   // await db.delete(dbShema.)
  //   await db.insert(dbShema.keywords).values({ name, slug: slugify(name) });
  //   setName("");
  //   loadUsers();
  // }

  // async function addDocument() {
  //   const content: IBlock[] = [
  //     {
  //       type: "paragraph",
  //       content: "test",
  //     },
  //   ];

  //   // const keyword = await db.query.keywords.findFirst().execute();
  //   const document = await db
  //     .insert(dbShema.documents)
  //     .values({ name: "test-document" })
  //     .returning({ test: dbShema.documents.id })
  //     .execute();

  //   console.log(document);
  //   // await db
  //   //   .insert(dbShema.keywordsToDocuments)
  //   //   .values({ documentId: document[0].id, keywordId: keyword!.id });

  //   // await db.query.documents.findFirst({
  //   //   with: {
  //   //     keywords: true,
  //   //   },
  //   // });
  // }

  // useHotkeys("cmd+y", () => {
  //   addDocument();
  // });

  // useEffect(() => {
  //   async function init() {
  //     loadUsers();
  //   }
  //   init();
  // }, []);

  // const loadUsers = async () => {
  //   const documents = await db.query.documents.findMany().execute();
  //   console.log(documents);
  //   // setUsers(a);
  // };

  return (
    <div data-component-name="App">
      {/* <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          addKeyword();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          value={name}
          placeholder="Enter a name..."
        />
        <button type="submit">Add name to the db</button>
      </form> */}
      <PromptProvider>
        <RouterProvider router={router} />
      </PromptProvider>
    </div>
  );
}

export default App;
