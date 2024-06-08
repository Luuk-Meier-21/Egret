import { useEffect, useRef, useState } from "react";
import { useLayoutBuilder } from "../../services/layout/layout-builder";
import { flattenLayoutNodesByReference } from "../../services/layout/layout-content";
import { useLayoutNavigator } from "../../services/layout/layout-navigation";
import { useLayoutState } from "../../services/layout/layout-state";
import { useDocumentViewLoader } from "../../services/loader/loader";
import {
  Layout,
  LayoutNodeData,
  SanitizedLayout,
} from "../../types/layout/layout";
import { deepJSONClone } from "../../utils/object";
import { useStateStore } from "../../services/store/store-hooks";
import {
  concatPath,
  defaultFsOptions,
  pathInDirectory,
  pathOfDocumentsDirectory,
} from "../../services/store/store";
import { useNavigate } from "react-router";
import { DocumentRegionData } from "../../types/document/document";
import { useScopedAction } from "../../services/actions/actions-hook";
import {
  keyAction,
  keyExplicitAction,
  keyExplicitNavigation,
  keyNavigation,
} from "../../config/shortcut";
import {
  closeCompanionSocket,
  getMacNetworkIp,
  openCompanionSocket,
  systemSound,
} from "../../bindings";
import { selectSingle } from "../../services/window/window-manager";
import {
  ExportFormat,
  ExportSize,
  ExportStyle,
  exportDocument,
  getAllExportSizeKeys,
  getAllExportStyleKeys,
  getAllExporterKeys,
} from "../../services/export/export";
import { save } from "@tauri-apps/api/dialog";
import { removeDir, writeTextFile } from "@tauri-apps/api/fs";
import { announceError } from "../../utils/error";
import { emit, listen } from "@tauri-apps/api/event";
import { getMatches } from "@tauri-apps/api/cli";
import { LayoutBranchOrNode } from "../LayoutBranch/LayoutBranch";
import { generateDocumentRegion } from "../../services/document/document-generator";
import { ariaLines } from "../../services/aria/aria";
import { ariaItemOfList, ariaList } from "../../services/aria/label";
import DocumentRegion from "../DocumentRegion/DocumentRegion";

interface DocumentDetailProps {}

function sanitizeLayout(layout: Layout): SanitizedLayout {
  const cloneLayout: SanitizedLayout = {
    ...deepJSONClone(layout),
    clean: true,
  };
  const nodes = flattenLayoutNodesByReference(cloneLayout.tree);
  nodes.forEach((node) => {
    node.data = undefined;
  });

  return cloneLayout;
}

function DocumentDetail({}: DocumentDetailProps) {
  const [directory, _staticDocumentData, staticLayout, _keywords] =
    useDocumentViewLoader();

  const builder = useLayoutBuilder(staticLayout);
  const selection = useLayoutState(builder.layout);
  const navigator = useLayoutNavigator(selection, builder.layout);

  const [isInCompanionMode, setCompanionMode] = useState(false);

  const layoutCache = useRef(builder.layout);

  const saveDocument = useStateStore(
    builder.layout,
    pathInDirectory(directory, "layout.json"),
  );

  const navigate = useNavigate();

  // useStrictEffect(
  //   () => {
  //     saveDocument();
  //   },
  //   ([layout]) => JSON.stringify(layout),
  //   [builder.layout],
  // );

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

  // companion mode start
  useScopedAction(
    "Start companion mode",
    keyExplicitNavigation("left"),
    async () => {
      await openCompanionSocket();
    },
  );

  useScopedAction(
    "Stop companion mode",
    keyExplicitNavigation("left"),
    async () => {
      await closeCompanionSocket();
    },
  );

  useScopedAction("Refresh event", keyExplicitNavigation("left"), async () => {
    emit("refresh-client", "none");
  });

  useScopedAction("test", keyAction("8"), async () => {
    const networkIp = await getMacNetworkIp();
    console.log(networkIp);
  });

  useEffect(() => {
    const focusCallback = (e: any) => {
      navigator.focusColumn(e.payload.row_id, e.payload.column_id);
    };

    const unlistenFocus = listen("focus", focusCallback);
    return () => {
      unlistenFocus.then((f) => f());
    };

    // No dependancy array! Function needs to be redefined on every effect, otherwise it will use stale state when fired.
    // https://stackoverflow.com/questions/57847594/accessing-up-to-date-state-from-within-a-callback
  });

  // const layoutIsChanged = (layout: SanitizedLayout): boolean => {
  //   return (
  //     layout.tree.length > 0 &&
  //     JSON.stringify(layout) !== JSON.stringify(layoutCache.current)
  //   );
  // };

  // useEffect(() => {
  //   console.log(layoutIsChanged(sanitizeLayout(builder.layout)));

  //   setLayoutState(sanitizeLayout(builder.layout)).then(() => {});

  //   layoutCache.current = builder.layout;
  // }, [builder.layout]);

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
