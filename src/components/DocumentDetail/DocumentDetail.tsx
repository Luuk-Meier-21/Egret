import { useLoaderData, useNavigate } from "react-router";
import { deleteDocumentById } from "../../utils/documents";
import { Keyword } from "../../types/keywords";
import { LayoutBranchOrNode } from "../LayoutBranch/LayoutBranch";
import {
  DocumentMeta,
  DocumentRegionData,
} from "../../types/document/document";
import { useLayoutNavigator } from "../../services/layout/layout-navigation";
import { generateDocumentRegion } from "../../services/document/document-generator";
import { useLayoutState } from "../../services/layout/layout-state";
import { useLayoutBuilder } from "../../services/layout/layout-builder";
import {
  keyAction,
  keyExplicitAction,
  keyExplicitNavigation,
  keyNavigation,
} from "../../config/shortcut";
import { Layout, LayoutNodeData } from "../../types/layout/layout";
import { useStateStore } from "../../services/store/store-hooks";
import { pathInDirectory } from "../../services/store/store";
import DocumentRegion from "../DocumentRegion/DocumentRegion";
import { useScopedAction } from "../../services/actions/actions-hook";
import { systemSound } from "../../bindings";
import { useLayoutHTMLExporter } from "../../services/layout/layout-export";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { useDocumentViewLoader } from "../../services/loader/loader";
import { AutoSaveDispatchType } from "../../utils/editor";
import { useHistoryState } from "../../services/layout/layout-history";
import { useStrictEffect } from "../../services/layout/layout-change";
import { deepJSONClone } from "../../utils/object";
import { flattenLayoutNodesByReference } from "../../services/layout/layout-content";

interface DocumentDetailProps {}

const STYLE_KEYS = ["serif", "sans"];

function DocumentDetail({}: DocumentDetailProps) {
  const [directory, staticDocumentData, staticLayout, _keywords] =
    useDocumentViewLoader();
  const builder = useLayoutBuilder(staticLayout);
  const selection = useLayoutState(builder);
  const navigator = useLayoutNavigator(selection, builder);
  const history = useHistoryState(builder.layout);

  const [styleIndex, setStyleIndex] = useState(0);

  const layoutNodeLength = ([layout]: [Layout]) =>
    deepJSONClone(flattenLayoutNodesByReference(layout.tree)).length;

  const saveDocument = useStateStore(
    builder.layout,
    pathInDirectory(directory, "layout.json"),
  );

  const exportToHtml = useLayoutHTMLExporter(staticDocumentData.name);
  const navigate = useNavigate();

  // const [keywords, setKeywords] = useState<Keyword[]>(staticKeywords);

  // useStateStore(keywords, keywordsRecordPath, keywordsRecordOptions);

  // useStrictEffect(
  //   () => {

  //     saveDocument();
  //   },
  //   layoutNodeLength,
  //   [builder.layout],
  // );

  const handleSave = (
    region: DocumentRegionData,
    node: LayoutNodeData,
    type: AutoSaveDispatchType,
  ) => {
    builder.insertContent(region, node);
    if (type === "unknown") saveDocument();
  };

  const handleChange = (region: DocumentRegionData, node: LayoutNodeData) => {
    builder.insertContent(region, node);
  };

  const { elementWithShortcut: GoToHome } = useScopedAction(
    "Navigate to home",
    keyAction("Escape"),
    async () => {
      navigate("/");
    },
  );

  useScopedAction("Save document", keyAction("s"), async () => {
    await saveDocument();
  });

  useScopedAction("Export document", keyAction("e"), async () => {
    await exportToHtml(builder.layout);
    systemSound("Glass", 1, 1, 1);
  });

  useScopedAction(
    "Delete document",
    keyExplicitAction("backspace"),
    async () => {
      await deleteDocumentById(staticDocumentData.id);
    },
  );

  useScopedAction("Move up", keyNavigation("up"), async () => {
    navigator.focusRowUp();
  });

  useScopedAction("Move down", keyNavigation("down"), async () => {
    navigator.focusRowDown();
  });

  useScopedAction("Move right", keyNavigation("right"), async () => {
    navigator.focusColumnRight();
  });

  const deleteNode = (force: boolean = false) => {
    const currentRow = navigator.getCurrentRow();
    const currentNode = navigator.getCurrentNode();

    if (currentRow === null || currentNode === null) {
      return;
    }

    if (currentRow.type === "branch") {
      const node = builder.removeNodeFromRow(currentRow, currentNode, force);
      selection.setNodeId(node.id);
    } else {
      const node = builder.removeRow(currentRow, force);
      selection.setNodeId(node.id);
    }
  };

  useScopedAction("Delete node", keyNavigation("backspace"), async () => {
    deleteNode();
  });

  useScopedAction(
    "Force delete node",
    keyExplicitNavigation("backspace"),
    async () => {
      deleteNode(true);
    },
  );

  useScopedAction("Move left", keyNavigation("left"), async () => {
    navigator.focusColumnLeft();
  });

  useScopedAction(
    "Move to first column",
    keyExplicitNavigation("left"),
    async () => {
      navigator.focusColumnStart();
    },
  );

  useScopedAction(
    "Move to last column",
    keyExplicitNavigation("right"),
    async () => {
      navigator.focusColumnEnd();
    },
  );

  // const setKeywordRelation = async (keyword: Keyword) => {
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
  // };

  useScopedAction("Cycle styles", keyAction("t"), async () => {
    styleIndex < STYLE_KEYS.length - 1
      ? setStyleIndex(styleIndex + 1)
      : setStyleIndex(0);
  });

  useScopedAction("Undo", keyAction("z"), async () => {
    history.undo();
    console.log("undo to history", history.history);
  });

  useScopedAction("Undo", keyAction("g"), async () => {
    history.setState(builder.layout);

    console.log("set to history", history.history);
  });

  const classes = clsx({
    "font-serif text-base text-white [&_a]:text-indigo-500 [&_a]:underline":
      styleIndex === 0,
    "font-sans leading-7 bg-white text-base text-gray-900 [&_a]:bg-blue-600 [&_a]:mb-5 [&_a]:flex [&_a]:mr-auto [&_a]:mt-4 [&_a]:text-white [&_a]:p-2 [&_a]:rounded-lg data-[focused=true]:bg-red-400":
      styleIndex === 1,
  });

  return (
    <div data-component-name="DocumentDetail">
      <div className="px-4 pb-2 opacity-50 focus-within:opacity-100">
        <GoToHome />
      </div>
      <main className={classes}>
        {builder.layout.tree.map((branchOrNode, rowIndex) => (
          <LayoutBranchOrNode
            key={branchOrNode.id}
            value={branchOrNode}
            renderNode={(node, columnIndex, columnLength) => {
              const isFocused = node.id === selection.nodeId;

              const data = node.data || generateDocumentRegion({});

              const columnsLabel =
                columnIndex < 1
                  ? `List ${columnLength} items, ${columnIndex + 1} of ${columnLength}`
                  : `${columnIndex + 1} of ${columnLength}`;

              const rowLabel = `full width`;
              const label = columnLength > 1 ? columnsLabel : rowLabel;

              return (
                <DocumentRegion
                  label={label}
                  onSave={(region, _editor, type) => {
                    handleSave(region, node, type);
                  }}
                  onChange={(region, _editor) => {
                    handleChange(region, node);
                  }}
                  onExplicitAnnounce={() => {
                    return `Item ${columnIndex + 1} of Row ${rowIndex + 1} from the top`;
                  }}
                  onImplicitAnnounce={() => {
                    return null;
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
    </div>
  );
}
export default DocumentDetail;
