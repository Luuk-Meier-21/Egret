import { useLoaderData } from "react-router";
import { deleteDocumentById } from "../../utils/documents";
import { Keyword } from "../../types/keywords";
import { LayoutBranchOrNode } from "../LayoutBranch/LayoutBranch";
import {
  DocumentData,
  DocumentRegionData,
} from "../../types/document/document";
import { useLayoutNavigator } from "../../services/layout/layout-navigation";
import { generateDocumentRegion } from "../../services/document/document-generator";
import { useLayoutState } from "../../services/layout/layout-state";
import { useLayoutBuilder } from "../../services/layout/layout-builder";
import { useEffect, useRef, useState } from "react";
import { keyExplicitAction, keyNavigation } from "../../config/shortcut";
import { DocumentDirectory } from "../../types/documents";
import { Layout, LayoutNodeData } from "../../types/layout/layout";
import {
  useAbstractStore,
  useStateStore,
} from "../../services/store/store-hooks";
import { pathInDirectory } from "../../services/store/store";
import DocumentRegion from "../DocumentRegion/DocumentRegion";
import { useScopedAction } from "../../services/actions/actions-hook";
import { IBlockEditor } from "../../types/block";

interface DocumentDetailProps {}

let editorReferences: Record<string, IBlockEditor> = {};

function DocumentDetail({}: DocumentDetailProps) {
  const [directory, staticDocumentData, staticLayout, staticKeywords] =
    useLoaderData() as [DocumentDirectory, DocumentData, Layout, Keyword[]];

  const builder = useLayoutBuilder(staticLayout);

  const store = useAbstractStore();
  const selection = useLayoutState(builder.layout);
  const navigator = useLayoutNavigator(selection, builder);

  useStateStore(
    builder.layout,
    pathInDirectory(directory, `${directory.name}.layout.json`),
  );

  useEffect(() => {
    return () => {
      editorReferences = {};
    };
  }, []);

  // const [keywords, setKeywords] = useState<Keyword[]>(staticKeywords);

  // useStateStore(keywords, keywordsRecordPath, keywordsRecordOptions);

  const handleSave = (region: DocumentRegionData, node: LayoutNodeData) => {
    const affectedNode = builder.insertContent(region, node);
  };
  const handleChange = (region: DocumentRegionData, node: LayoutNodeData) => {};

  const handleExport = async (
    region: DocumentRegionData,
    editor: IBlockEditor,
  ) => {
    console.log(await editor.blocksToHTMLLossy(region.blocks as any));
  };

  useScopedAction(
    "Delete document",
    keyExplicitAction("backspace"),
    async () => {
      await deleteDocumentById(staticDocumentData.id);
    },
  );

  useScopedAction(
    "Move up",
    keyNavigation("up"),
    async () => {
      navigator.focusRowUp();
    },
    true,
  );

  useScopedAction(
    "Move down",
    keyNavigation("down"),
    async () => {
      navigator.focusRowDown();
    },
    true,
  );

  useScopedAction(
    "Move right",
    keyNavigation("right"),
    async () => {
      navigator.focusColumnRight();
    },
    true,
  );

  useScopedAction(
    "Delete column",
    keyNavigation("backspace"),
    async () => {
      const currentRow = navigator.getCurrentRow();
      const currentNode = navigator.getCurrentNode();

      if (currentRow === null || currentNode === null) {
        return;
      }

      if (currentRow.type === "branch") {
        const node = builder.removeNodeFromRow(currentRow, currentNode);
        selection.setNodeId(node.id);
      } else {
        const node = builder.removeRow(currentRow);
        selection.setNodeId(node.id);
      }
    },
    true,
  );

  useScopedAction(
    "Move left",
    keyNavigation("left"),
    async () => {
      navigator.focusColumnLeft();
    },
    true,
  );

  const [openSettings, setOpenSettings] = useState(false);

  const setKeywordRelation = async (keyword: Keyword) => {
    // const newKeywords = keywords;
    // const hasRelation = keywordHasRelation(keyword, staticDocumentData);
    // if (hasRelation) {
    //   keywords.find((k) =>)
    // }
    // hasRelation
    //   ? await dereferenceKeywordFromDocument(keyword, staticDocumentData)
    //   : await referenceKeywordToDocument(keyword, staticDocumentData);
    // await saveKeyword(keyword);
    // const keywords = await fetchKeywords();
    // setKeywords(keywords);
  };

  return (
    <main
      data-component-name="DocumentDetail"
      lang={staticDocumentData.data.meta.lang ?? "en"}
    >
      {builder.layout.tree.map((branchOrNode) => (
        <LayoutBranchOrNode
          key={branchOrNode.id}
          value={branchOrNode}
          renderNode={(node, isFirstInList) => {
            const isFocused = node.id === selection.nodeId;

            const data = node.data || generateDocumentRegion({});

            return (
              <DocumentRegion
                onSave={(region, editor) => {
                  handleSave(region, node);

                  editorReferences[node.id] = editor;
                }}
                onChange={(region, editor) => {
                  handleChange(region, node);
                }}
                onExport={(region, editor) => {
                  handleExport(region, editor);
                }}
                isFocused={isFocused}
                onFocus={() => {
                  navigator.focusColumn(branchOrNode.id, node.id);
                }}
                onBlur={() => {
                  navigator.blurColumn();
                }}
                region={data}
              />
            );
          }}
        />
      ))}
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
