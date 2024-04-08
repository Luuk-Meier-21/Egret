import { useLoaderData } from "react-router";
import { deleteDocumentById } from "../../utils/documents";
import { Keyword } from "../../types/keywords";
import { useTitle } from "../../utils/title";
import { LayoutBranchOrNode } from "../LayoutBranch/LayoutBranch";
import { ContentfullLayout } from "../../types/layout-service";
import { DocumentData } from "../../types/document-service";
import { IBlockEditor } from "../../types/block";
import { useRegisterAction } from "../../services/actions-registry";
import { useEffect, useRef, useState } from "react";
import { LayoutNavigator } from "../../services/layout/layout-navigator";
import { LayoutRegionNavigator } from "../../services/layout/layout-region-navigator";
import DocumentRegion from "../DocumentRegion/DocumentRegion";
import { createKeyword } from "../../utils/keywords";
import { validate } from "uuid";
import { invoke } from "@tauri-apps/api";

interface DocumentDetailProps {}

function DocumentDetail({}: DocumentDetailProps) {
  const [staticDocumentData, staticLayout, _] = useLoaderData() as [
    DocumentData,
    ContentfullLayout,
    Keyword[],
  ];

  const ref = useRef<HTMLElement>(null);

  // const [structuredView, setStructuredView] = useState<ContentfullLayout>(
  //   generateContentfullLayout(view, staticLayout),
  // );

  const navigator = new LayoutNavigator(
    new LayoutRegionNavigator(staticLayout),
  );

  const [rowId, setRowId] = useState<string | null>(staticLayout.tree[0].id);
  const [nodeId, setNodeId] = useState<string | null>(navigator.getFirst().id);

  useEffect(() => {
    const row = staticLayout.tree.find((row) => row.id === rowId);
    if (row?.type === "branch") {
      const columnInRow = row.children.find((column) => column.id === nodeId);

      if (columnInRow) {
        setNodeId(columnInRow.id);
      } else {
        setNodeId(row.children[0].id);
      }
    } else if (row?.type === "node") {
      setNodeId(row.id);
    }
  }, [rowId]);

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

  useRegisterAction("Move up", "option+up", async () => {
    const index = staticLayout.tree.findIndex((row) => row.id === rowId);
    const previousRow = staticLayout.tree[index - 1];
    if (previousRow) {
      setRowId(previousRow.id);
    } else {
      // Create new row
    }
  });

  useRegisterAction("Move down", "option+down", async () => {
    const index = staticLayout.tree.findIndex((row) => row.id === rowId);
    const nextRow = staticLayout.tree[index + 1];
    if (nextRow) {
      setRowId(nextRow.id);
    } else {
      // Create new row
    }
  });

  useRegisterAction("Move right", "option+left", async () => {
    const row = staticLayout.tree.find((row) => row.id === rowId);
    if (row?.type === "branch") {
      const index = row.children.findIndex((column) => column.id === nodeId);
      const previousColumn = row.children[index - 1];
      if (previousColumn) {
        setNodeId(previousColumn.id);
      } else {
        // Create new column
      }
    } else {
      // Create new column
    }
  });

  useRegisterAction("Move left", "option+right", async () => {
    const row = staticLayout.tree.find((row) => row.id === rowId);
    if (row?.type === "branch") {
      const index = row.children.findIndex((column) => column.id === nodeId);
      const nextColumn = row.children[index + 1];
      if (nextColumn) {
        setNodeId(nextColumn.id);
      } else {
        // Create new column
      }
    } else {
      // Create new column
    }
  });

  useRegisterAction("Move left", "k", async () => {
    await invoke("sound");
  });

  // useRegisterAction("b", "cmd+down", async () => {
  //   navigator.down();
  // });

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

      <main ref={ref}>
        {staticLayout.tree.map((branchOrNode) => (
          <LayoutBranchOrNode
            key={branchOrNode.id}
            value={branchOrNode}
            renderNode={(node) => {
              const isFocused = node.id === nodeId;

              if (node.data === undefined) {
                return <div>Blank</div>;
              }

              return (
                <DocumentRegion
                  onSave={handleSave}
                  onChange={handleChange}
                  isFocused={isFocused}
                  onFocus={() => {
                    setNodeId(node.id);
                    setRowId(branchOrNode.id);
                  }}
                  onBlur={() => {
                    setNodeId(null);
                    setRowId(null);
                  }}
                  region={node.data as any}
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
