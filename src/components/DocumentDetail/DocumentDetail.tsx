import { useEffect } from "react";
import {
  layoutDeleteNode,
  layoutInsertColumn,
  layoutInsertRow,
  sanitizeLayout,
  useLayoutBuilder,
} from "../../services/layout/layout-builder";
import { flattenLayoutNodesByReference } from "../../services/layout/layout-content";
import { useLayoutNavigator } from "../../services/layout/layout-navigation";
import { useLayoutState } from "../../services/layout/layout-state";
import { useDocumentViewLoader } from "../../services/loader/loader";
import { LayoutNodeData } from "../../types/layout/layout";
import { useStateStore } from "../../services/store/store-hooks";
import {
  defaultFsOptions,
  pathInDirectory,
  pathOfDocumentsDirectory,
} from "../../services/store/store";
import { useNavigate } from "react-router";
import { DocumentRegionData } from "../../types/document/document";
import {
  useConditionalScopedAction,
  useScopedAction,
} from "../../services/actions/actions-hook";
import {
  keyAction,
  keyExplicitAction,
  keyExplicitNavigation,
  keyNavigation,
} from "../../config/shortcut";
import {
  closeCompanionSocket,
  openCompanionSocket,
  setLayoutState,
  systemSound,
} from "../../bindings";
import { selectSingle } from "../../services/window/window-manager";
import { exportDocumentByDirectory } from "../../services/export/export";
import { removeDir } from "@tauri-apps/api/fs";
import { announceError } from "../../utils/error";
import { emit, listen } from "@tauri-apps/api/event";
import { useContext } from "react";
import { EnvContext } from "../EnvProvider/EnvProvider";
import { LayoutBranchOrNode } from "../LayoutBranch/LayoutBranch";
import { generateDocumentRegion } from "../../services/document/document-generator";
import { ariaItemOfList, ariaList } from "../../services/aria/label";
import DocumentRegion from "../DocumentRegion/DocumentRegion";
import { ariaLines } from "../../services/aria/aria";

import { clientEndpoint } from "../../services/socket/tactile-socket";
import { useStrictEffect } from "../../services/layout/layout-change";
import { deepJSONClone } from "../../utils/object";
import { FOCUS_MODE_MAPPING, setFocusMode } from "../../services/focus/focus";
import { selectConfigFromMapping } from "../../utils/config";

interface DocumentDetailProps {}

// update is sync with state when document is open
// when navigating out of document to / or other document state updates to (presumably) the state that was active when first opend

function DocumentDetail({}: DocumentDetailProps) {
  const [directory, _staticDocumentData, staticLayout, _keywords] =
    useDocumentViewLoader();

  const env = useContext(EnvContext);
  const builder = useLayoutBuilder(staticLayout);
  const selection = useLayoutState(builder.layout);
  const navigator = useLayoutNavigator(selection, builder.layout);

  const navigate = useNavigate();
  const save = useStateStore(
    builder.layout,
    pathInDirectory(directory, "layout.json"),
  );

  // useLayoutAutoSaveHandle(builder.layout, save);

  // useStrictEffect(
  //   () => {
  //     save();
  //   },
  //   ([layout]) =>
  //     deepJSONClone(flattenLayoutNodesByReference(layout.tree)).length,
  //   [builder.layout],
  // );

  const hasFeature = (key: string) =>
    env?.features?.value ? env?.features?.value?.includes(key) ?? false : false;

  const deleteNode = (force: boolean = false) =>
    layoutDeleteNode(navigator, builder, selection, force);
  const insertRow = (position: "before" | "after") =>
    layoutInsertRow(navigator, builder, selection, position);
  const insertColumn = (position: "before" | "after") =>
    layoutInsertColumn(navigator, builder, selection, position);

  const handleRegionSave = (
    region: DocumentRegionData,
    node: LayoutNodeData,
  ) => {
    builder.insertContent(region, node);
  };

  const handleRegionChange = (
    region: DocumentRegionData,
    node: LayoutNodeData,
  ) => {
    builder.insertContent(region, node);
  };

  const { elementWithShortcut: GoToHome } = useScopedAction(
    "Navigate to home",
    keyAction("Escape"),
    async () => {
      // await save();
      // console.log("saved: ", builder.layout);
      navigate("/");
    },
  );

  useScopedAction("Save document", keyAction("s"), async () => {
    console.log("manual save");
    await save();
    systemSound("Glass", 1, 1, 1);
  });

  useConditionalScopedAction(
    "Export document",
    keyAction("e"),
    hasFeature("export"),
    async () => {
      try {
        console.log("export save");
        await save();
        await exportDocumentByDirectory(directory);

        systemSound("Glass", 1, 1, 1);
      } catch (error) {
        console.error(error);
        announceError();
      }
    },
  );

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

  useScopedAction(
    "Delete empty column",
    keyNavigation("backspace"),
    async () => {
      deleteNode();
    },
  );

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

  useScopedAction(`Set focus contrast`, keyExplicitAction("0"), async () => {
    const succes = await selectConfigFromMapping(
      FOCUS_MODE_MAPPING,
      setFocusMode,
    );
    if (!succes) {
      announceError();
    }
  });

  useConditionalScopedAction(
    `Find landmark`,
    keyExplicitAction("l"),
    hasFeature("landmarks"),
    async () => {
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
    },
  );

  // Companion mode
  useConditionalScopedAction(
    "Start tactile mode",
    keyExplicitNavigation("9"),
    hasFeature("tactile"),
    async () => {
      await openCompanionSocket();

      console.log(clientEndpoint(window.location.hostname));
    },
  );

  useConditionalScopedAction(
    "Stop tactile mode",
    keyExplicitNavigation("8"),
    hasFeature("tactile"),
    async () => {
      await closeCompanionSocket();
    },
  );

  useConditionalScopedAction(
    "Refresh event",
    keyExplicitNavigation("left"),
    hasFeature("tactile"),
    async () => {
      emit("refresh-client", "none");
    },
  );

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
  // }

  // const layoutIsChanged = (layout: SanitizedLayout): boolean => {
  //   return (
  //     layout.tree.length > 0 &&
  //     JSON.stringify(layout) !== JSON.stringify(layoutCache.current)
  //   );
  // };

  useStrictEffect(
    () => {
      console.log("SET");
      setLayoutState(sanitizeLayout(builder.layout)).then(() => {});
    },
    ([layout]) =>
      deepJSONClone(flattenLayoutNodesByReference(layout.tree)).length,
    [builder.layout],
  );

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
                      handleRegionSave(region, node);
                    }}
                    onChange={(region) => {
                      handleRegionChange(region, node);
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
