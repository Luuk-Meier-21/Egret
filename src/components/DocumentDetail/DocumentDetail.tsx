import { useLoaderData } from "react-router";
import { deleteDocumentById } from "../../utils/documents";
import { Keyword } from "../../types/keywords";
import { LayoutBranchOrNode } from "../LayoutBranch/LayoutBranch";
import { ContentfullLayout } from "../../types/layout-service";
import { DocumentData } from "../../types/document-service";
import { IBlockEditor } from "../../types/block";
import { useRegisterAction } from "../../services/actions-registry";
import { useLayoutNavigator } from "../../services/layout/layout-navigation";
import { generateDocumentRegion } from "../../services/document/document-generator";

import DocumentRegion from "../DocumentRegion/DocumentRegion";
import { miscPath, useStore } from "../../services/store/store";
import { useLayoutState } from "../../services/layout/layout-state";
import { useLayoutBuilder } from "../../services/layout/layout-builder";
import { useEffect } from "react";

interface DocumentDetailProps {}

function DocumentDetail({}: DocumentDetailProps) {
  const [staticDocumentData, staticLayout, _] = useLoaderData() as [
    DocumentData,
    ContentfullLayout,
    Keyword[],
  ];

  const builder = useLayoutBuilder(staticLayout);
  const store = useStore(builder.layout, miscPath("layout-test", "json"));
  const selection = useLayoutState(builder.layout);
  const navigator = useLayoutNavigator(selection, builder);

  // const saveLayout = async () => {
  //   store.set(builder.layout).save();
  // };

  useEffect(() => {}, [builder.layout]);

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
    // console.log(region);
  };

  useRegisterAction("Delete document", "shift+cmd+backspace", async () => {
    await deleteDocumentById(staticDocumentData.id);
  });

  useRegisterAction("Move up", "option+up", async () => {
    navigator.focusRowUp();
  });

  useRegisterAction("Move down", "option+down", async () => {
    navigator.focusRowDown();
  });

  useRegisterAction("Move right", "option+right", async () => {
    navigator.focusColumnRight();
  });

  useRegisterAction("Move left", "option+left", async () => {
    navigator.focusColumnLeft();
  });

  useRegisterAction("Delete column", "option+backspace", async () => {
    const currentRow = navigator.getCurrentRow();
    const currentNode = navigator.getCurrentNode();

    let availableNode;

    if (currentRow.type === "branch") {
      availableNode = builder.removeNodeFromRow(currentRow, currentNode);
    } else {
      availableNode = builder.removeRow(currentRow);
    }

    selection.setNodeId(availableNode.id);
  });

  return (
    <main
      data-component-name="DocumentDetail"
      lang={staticDocumentData.data.meta.lang ?? "en"}
    >
      {/* <h1 id="document-title" className="p-4" aria-live="polite">
        Document: {staticDocumentData.name}{" "}
        <span aria-hidden>{staticDocumentData.id}</span>
      </h1> */}

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

      <main>
        {builder.layout.tree.map((branchOrNode) => (
          <LayoutBranchOrNode
            key={branchOrNode.id}
            value={branchOrNode}
            renderNode={(node, isFirstInList) => {
              const isFocused = node.id === selection.nodeId;

              node.data = node.data || generateDocumentRegion({});

              return (
                <DocumentRegion
                  onSave={handleSave}
                  onChange={handleChange}
                  isFocused={isFocused}
                  onFocus={() => {
                    navigator.focusColumn(branchOrNode.id, node.id);
                  }}
                  onBlur={() => {
                    navigator.blurColumn();
                  }}
                  region={node?.data}
                />
              );
            }}
          />
        ))}
      </main>
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
