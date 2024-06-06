import { useNavigate } from "react-router";
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
  concatPath,
  defaultFsOptions,
  pathInDirectory,
  pathOfDocumentsDirectory,
} from "../../services/store/store";
import DocumentRegion from "../DocumentRegion/DocumentRegion";
import { useScopedAction } from "../../services/actions/actions-hook";
import { systemSound } from "../../bindings";
import { useDocumentViewLoader } from "../../services/loader/loader";
import { ariaItemOfList, ariaList } from "../../services/aria/label";
import { announceError } from "../../utils/error";
import { useStrictEffect } from "../../services/layout/layout-change";
import { flattenLayoutNodesByReference } from "../../services/layout/layout-content";
import { selectSingle } from "../../services/window/window-manager";
import { removeDir, writeTextFile } from "@tauri-apps/api/fs";
import { save } from "@tauri-apps/api/dialog";
import {
  ExportFormat,
  ExportSize,
  ExportStyle,
  exportDocument,
  getAllExportSizeKeys,
  getAllExportStyleKeys,
  getAllExporterKeys,
} from "../../services/export/export";
import { ariaLines } from "../../services/aria/aria";
import { getMatches } from "@tauri-apps/api/cli";

interface DocumentDetailProps {}

function DocumentDetail({}: DocumentDetailProps) {
  const [directory, _staticDocumentData, staticLayout, _keywords] =
    useDocumentViewLoader();

  const builder = useLayoutBuilder(staticLayout);
  const selection = useLayoutState(builder.layout);
  const navigator = useLayoutNavigator(selection, builder.layout);

  const saveDocument = useStateStore(
    builder.layout,
    pathInDirectory(directory, "layout.json"),
  );

  // const exportToHtml = useLayoutHTMLExporter(staticDocumentData.name);
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

  useScopedAction("Preview document", keyAction("e"), async () => {
    await saveDocument();

    const format = (await selectSingle(
      "Select format",
      "Export format",
      getAllExporterKeys().map((key) => ({ label: key, value: key })),
    )) as ExportFormat;
    const size = (await selectSingle(
      "Select size",
      "Export size",
      getAllExportSizeKeys().map((key) => ({ label: key, value: key })),
    )) as ExportSize;
    const style = (await selectSingle(
      "Select style preset",
      "Export style",
      getAllExportStyleKeys().map((key) => ({ label: key, value: key })),
    )) as ExportStyle;

    const layoutFilePath = concatPath(directory.filePath, "layout.json");

    const svg = await exportDocument(layoutFilePath, format, size, style);

    const path = await save({
      title: `Save as ${format}`,
      defaultPath: `~/Documents/${directory.name}`,
      filters: [
        {
          name: "Export",
          extensions: [format],
        },
      ],
    });

    if (path === null) {
      return;
    }

    await writeTextFile(path, svg);
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
      announceError();
      return;
    }

    const nodeId = await selectSingle("label", "Landmark label", options);
    selection.setNodeId(nodeId);
  });

  // useScopedAction(`Find landmark`, keyExplicitAction(""), async () => {
  //   window.print();
  // });

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

  useScopedAction("test feature flag", keyAction("7"), async () => {
    console.log("getting flags...");
    const flags = await getMatches();
    console.log("Flags: ", flags);
  });

  return (
    <div data-component-name="DocumentDetail">
      <div className="sr-only focus-within:not-sr-only">
        <GoToHome className="bento-focus-light my-1 mb-3 rounded-[1rem] px-3 py-1.5 text-white" />
      </div>

      <main className="bento-dark overflow-hidden font-serif text-base tracking-[0.01em] text-white prose-headings:mb-3 prose-headings:text-2xl prose-headings:font-normal prose-p:mb-3 prose-a:text-yellow-500 prose-a:underline [&_figcaption]:mt-1 [&_figcaption]:italic [&_img]:rounded-sm">
        <div className="divide-y-[1px] divide-white/20">
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
                    onAddLandmark={(_region, landmark) => {
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
        </div>
      </main>
    </div>
  );
}
export default DocumentDetail;
