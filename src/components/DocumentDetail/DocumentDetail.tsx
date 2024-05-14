import { useNavigate } from "react-router";
import { deleteDocumentById } from "../../utils/documents";
import { LayoutBranchOrNode } from "../LayoutBranch/LayoutBranch";
import { DocumentRegionData } from "../../types/document/document";
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
import { LayoutNodeData } from "../../types/layout/layout";
import { useStateStore } from "../../services/store/store-hooks";
import {
  defaultFsOptions,
  pathInDirectory,
  pathOfDocumentsDirectory,
} from "../../services/store/store";
import DocumentRegion from "../DocumentRegion/DocumentRegion";
import { useScopedAction } from "../../services/actions/actions-hook";
import { systemSound } from "../../bindings";
import { useLayoutHTMLExporter } from "../../services/layout/layout-export";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { useDocumentViewLoader } from "../../services/loader/loader";
import { ariaItemOfList, ariaLines, ariaList } from "../../services/aria/label";
import { announceError } from "../../utils/error";
import { useStrictEffect } from "../../services/layout/layout-change";
import { flattenLayoutNodesByReference } from "../../services/layout/layout-content";
import { prompt, selectSingle } from "../../services/window/window-manager";
import { FILE_BIN } from "../../config/files";
import { requireDir } from "../../utils/filesystem";
import { copyFile, removeDir, removeFile } from "@tauri-apps/api/fs";
import { navigateDropState } from "../../utils/navigation";

interface DocumentDetailProps {}

const STYLE_KEYS = ["serif", "sans"];

function DocumentDetail({}: DocumentDetailProps) {
  const [directory, staticDocumentData, staticLayout, _keywords] =
    useDocumentViewLoader();

  const builder = useLayoutBuilder(staticLayout);
  const selection = useLayoutState(builder.layout);
  const navigator = useLayoutNavigator(selection, builder.layout);

  const [styleIndex, setStyleIndex] = useState(0);

  const saveDocument = useStateStore(
    builder.layout,
    pathInDirectory(directory, "layout.json"),
  );

  const exportToHtml = useLayoutHTMLExporter(staticDocumentData.name);
  const navigate = useNavigate();

  // const [keywords, setKeywords] = useState<Keyword[]>(staticKeywords);

  // useStateStore(keywords, keywordsRecordPath, keywordsRecordOptions);

  useStrictEffect(
    () => {
      saveDocument();
    },
    ([layout]) => JSON.stringify(layout),
    [builder.layout],
  );

  const handleSave = (region: DocumentRegionData, node: LayoutNodeData) => {
    builder.insertContent(region, node);
    saveDocument();
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
    systemSound("Glass", 1, 1, 1);
  });

  useScopedAction("Export document", keyAction("e"), async () => {
    await exportToHtml(builder.layout);
    systemSound("Glass", 1, 1, 1);
  });

  useScopedAction(
    "Delete document",
    keyExplicitAction("backspace"),
    async () => {
      const confirmText = "document";
      const text = await prompt(
        "Confirm deletion",
        `Type the word '${confirmText}' to confirm deletion`,
      );

      if (confirmText !== text) {
        announceError();
        return;
      }

      await removeDir(pathOfDocumentsDirectory(directory.fileName), {
        ...defaultFsOptions,
        recursive: true,
      });

      navigate("/");
    },
  );

  useScopedAction("Move up", keyNavigation("up"), async () => {
    navigator.focusRowUp();
  });

  useScopedAction("Move down", keyNavigation("down"), async () => {
    navigator.focusRowDown();
  });

  useScopedAction("Move left", keyNavigation("left"), async () => {
    navigator.focusColumnLeft();
  });

  useScopedAction("Move right", keyNavigation("right"), async () => {
    navigator.focusColumnRight();
  });

  const deleteNode = (force: boolean = false) => {
    const currentRow = navigator.getCurrentRow();
    const currentNode = navigator.getCurrentNode();

    if (currentRow === null || currentNode === null) {
      announceError();
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

  const insertRow = (position: "before" | "after") => {
    const currentRow = navigator.getCurrentRow();

    if (currentRow === null) {
      announceError();
      return;
    }

    const newNode = builder.insertRow(currentRow, position);
    selection.setNodeId(newNode.id);
  };

  const insertColumn = (position: "before" | "after") => {
    const currentRow = navigator.getCurrentRow();
    const currentNode = navigator.getCurrentNode();

    if (currentRow === null || currentNode === null) {
      announceError();
      return;
    }

    if (currentRow.type === "branch") {
      const newNode = builder.insertColumn(currentRow, currentNode, position);
      selection.setNodeId(newNode.id);
    } else {
      const newNode = builder.addColumnToNodeRow(currentRow, position);
      selection.setNodeId(newNode.id);
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

  useScopedAction("Insert row above", keyExplicitNavigation("up"), async () => {
    insertRow("before");
  });

  useScopedAction(
    "Insert row under",
    keyExplicitNavigation("down"),
    async () => {
      insertRow("after");
    },
  );

  useScopedAction(
    "Insert column left",
    keyExplicitNavigation("left"),
    async () => {
      insertColumn("before");
    },
  );

  useScopedAction(
    "Insert column right",
    keyExplicitNavigation("right"),
    async () => {
      insertColumn("after");
    },
  );

  useScopedAction(`Find landmark`, keyExplicitAction("l"), async () => {
    const options = flattenLayoutNodesByReference(builder.layout.tree)
      .filter((value) => value.data?.landmark !== undefined)
      .map((value) => ({
        value: value.id,
        label: value.data?.landmark?.label || "",
      }));

    if (options.length <= 0) {
      return false;
    }

    const nodeId = await selectSingle("label", "Landmark label", options);
    selection.setNodeId(nodeId);
  });

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

  // useScopedAction("Cycle styles", keyAction("t"), async () => {
  //   styleIndex < STYLE_KEYS.length - 1
  //     ? setStyleIndex(styleIndex + 1)
  //     : setStyleIndex(0);
  // });

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
              const label = ariaLines({
                [`${data.landmark?.label}`]: data.landmark !== undefined,
                [ariaList(columnLength)]: columnIndex <= 0 && isFocused,
                [ariaItemOfList(columnIndex + 1, columnLength)]:
                  columnLength > 1,
              });

              return (
                <DocumentRegion
                  label={label}
                  onSave={(region, _editor) => {
                    handleSave(region, node);
                  }}
                  onChange={(region) => {
                    handleChange(region, node);
                  }}
                  onAddLandmark={(region, landmark) => {
                    builder.addLandmark(node, landmark);
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
