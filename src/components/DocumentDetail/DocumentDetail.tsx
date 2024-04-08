import { useLoaderData } from "react-router";
import { deleteDocumentById } from "../../utils/documents";
import { Keyword } from "../../types/keywords";
import { useTitle } from "../../utils/title";
import DocumentRegion from "../DocumentRegion/DocumentRegion";
import { LayoutBranchOrNode } from "../LayoutBranch/LayoutBranch";
import { ContentfullLayout } from "../../types/layout-service";
import {
  DocumentData,
  TextDocumentRegionData,
} from "../../types/document-service";
import { IBlockEditor } from "../../types/block";
import { useRegisterAction } from "../../services/actions-registry";

interface DocumentDetailProps {}

function DocumentDetail({}: DocumentDetailProps) {
  const [staticDocumentData, staticLayout, _] = useLoaderData() as [
    DocumentData,
    ContentfullLayout,
    Keyword[],
  ];

  // const view = staticDocumentData.data.views[0];

  // const [structuredView, setStructuredView] = useState<ContentfullLayout>(
  //   generateContentfullLayout(view, staticLayout),
  // );

  // const [tempViewStorage, setTempViewStorage] =
  //   useState<DocumentViewData>(view);

  // const getViewWithUpdatedRegion = (
  //   region: TextDocumentRegionData,
  // ): DocumentViewData => {
  //   const newView = { ...view };
  //   const index = newView.content.findIndex((r) => {
  //     return r.id === region.id;
  //   });

  //   if (index === -1) {
  //     return newView;
  //   }

  //   newView.content[index] = region;
  //   return newView;
  // };

  //@ts-ignore
  const handleSave = (region: TextDocumentRegionData, editor: IBlockEditor) => {
    // setTempViewStorage(getViewWithUpdatedRegion(region));
  };

  const handleChange = (
    //@ts-ignore
    region: TextDocumentRegionData,
    //@ts-ignore
    editor: IBlockEditor,
  ) => {
    // setTempViewStorage(getViewWithUpdatedRegion(region));
  };

  useTitle(staticDocumentData.name);

  // const [keywords, setKeywords] = useState<Keyword[]>(staticKeywords);
  // const [openSettings, setOpenSettings] = useState(false);

  // const setKeywordRelation = async (keyword: Keyword) => {
  //   const hasRelation = keywordHasRelation(keyword, staticDocumentData);

  //   hasRelation
  //     ? await dereferenceKeywordFromDocument(keyword, staticDocumentData)
  //     : await referenceKeywordToDocument(keyword, staticDocumentData);

  //   await saveKeyword(keyword);

  //   const keywords = await fetchKeywords();

  //   setKeywords(keywords);
  // };

  // const { elementWithShortcut: EditSettings } = useRegisterAction(
  //   "Edit Keyword",
  //   "cmd+k",
  //   () => {
  //     editRef.current?.querySelector("button")?.focus();

  //     if (keywords.length <= 0) {
  //       handleError("No keywords to edit");
  //     }

  //     setOpenSettings(!openSettings);
  //   },
  // );

  useRegisterAction("Delete document", "shift+cmd+backspace", async () => {
    await deleteDocumentById(staticDocumentData.id);
  });

  return (
    <main
      aria-labelledby="document-title"
      data-component-name="DocumentDetail"
      lang={staticDocumentData.data.meta.lang ?? "en"}
    >
      <h1 id="document-title" className="p-4" aria-live="polite">
        Document: {staticDocumentData.name}{" "}
        <span aria-hidden>{staticDocumentData.id}</span>
      </h1>

      {/* <section
        aria-label="Edit document settings"
        ref={editRef}
        className="p-4"
      >
        <EditSettings aria-expanded={openSettings} />
        {openSettings && (
          <ul>
            {keywords.map((keyword) => (
              <li key={keyword.id}>
                <input
                  id={keyword.id}
                  type="checkbox"
                  checked={keywordHasRelation(keyword, initialDocument)}
                  onChange={() => setKeywordRelation(keyword)}
                />
                <label htmlFor={keyword.id}>{keyword.label}</label>
              </li>
            ))}
          </ul>
        )}
      </section> */}

      <section>
        {staticLayout.tree.map((branchOrNode) => (
          <LayoutBranchOrNode
            key={branchOrNode.id}
            value={branchOrNode}
            renderRegion={(region) => (
              <DocumentRegion
                onSave={handleSave}
                onChange={handleChange}
                region={region}
              />
            )}
          />
        ))}
      </section>
    </main>
  );
}
export default DocumentDetail;

{
  /* <BlockNoteView
          aria-label="Document editor"
          className="max-w-[46em] p-4 text-white ring-1 ring-white [&_a]:underline"
          editor={editor}
          autoFocus
          slashMenu={false}
          autoCorrect="false"
          spellCheck="false"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              editor;
            }
          }}
          sideMenu={false}
          formattingToolbar={false}
          hyperlinkToolbar={false}
        >
          <SuggestionMenuController
            triggerCharacter="/"
            getItems={async (query) =>
              filterSuggestionItems(
                [
                  ...getDefaultReactSlashMenuItems(editor),
                  insertTitle(editor),
                  insertAlert(editor),
                ],
                query,
              )
            }
        />
      </BlockNoteView> */
}
