import { useLoaderData, useNavigate } from "react-router";
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
import {
  keyAction,
  keyExplicitAction,
  keyExplicitNavigation,
  keyNavigation,
} from "../../config/shortcut";
import { DocumentDirectory } from "../../types/documents";
import { Layout, LayoutNodeData } from "../../types/layout/layout";
import { useStateStore } from "../../services/store/store-hooks";
import { pathInDirectory } from "../../services/store/store";
import DocumentRegion from "../DocumentRegion/DocumentRegion";
import {
  useConditionalAction,
  useScopedAction,
} from "../../services/actions/actions-hook";
import { startCompanionMode, systemSound } from "../../bindings";
import { useLayoutHTMLExporter } from "../../services/layout/layout-export";
import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";

interface DocumentDetailProps {}

function DocumentDetail({}: DocumentDetailProps) {
  const [directory, staticDocumentData, staticLayout, _] = useLoaderData() as [
    DocumentDirectory,
    DocumentData,
    Layout,
    Keyword[],
  ];

  const builder = useLayoutBuilder(staticLayout);
  const selection = useLayoutState(builder);
  const navigator = useLayoutNavigator(selection, builder);

  const [isInCompanionMode, setCompanionMode] = useState(false);

  const saveDocument = useStateStore(
    builder.layout,
    pathInDirectory(directory, `${directory.name}.layout.json`),
  );

  const exportToHtml = useLayoutHTMLExporter(staticDocumentData.name);

  const navigate = useNavigate();

  // const [keywords, setKeywords] = useState<Keyword[]>(staticKeywords);

  // useStateStore(keywords, keywordsRecordPath, keywordsRecordOptions);

  const handleSave = (region: DocumentRegionData, node: LayoutNodeData) => {
    builder.insertContent(region, node);
  };

  // const handleChange = (region: DocumentRegionData, node: LayoutNodeData) => {
  //   // builder.insertContent(region, node);
  // };

  const getNavigator = () => navigator;

  // Companion Events:
  useEffect(() => {
    const unlistenConnect = listen("ws-connect", (e) => {
      console.log(e.payload);
    });

    const unlistenMessage = listen("action-focus", (e) => {
      console.log(selection);
      getNavigator().focusColumnRight();
    });

    return () => {
      unlistenConnect.then((f) => f());
      unlistenMessage.then((f) => f());
    };
  }, []);

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

  useScopedAction(
    "Delete node",
    keyNavigation("backspace"),
    async () => {
      deleteNode();
    },
    true,
  );

  useScopedAction(
    "Force delete node",
    keyExplicitNavigation("backspace"),
    async () => {
      deleteNode(true);
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

  const callback = async () => {
    const isActive = await startCompanionMode();
    console.log(isActive);
    setCompanionMode(isActive);
  };

  useConditionalAction(
    "Start companion mode",
    keyExplicitAction("="),
    isInCompanionMode === false,
    callback,
    true,
  );

  useConditionalAction(
    "Stop companion mode",
    keyExplicitAction("="),
    isInCompanionMode === true,
    callback,
  );

  useScopedAction(
    "Move to first column",
    keyExplicitNavigation("left"),
    async () => {
      navigator.focusColumnStart();
    },
    true,
  );

  useScopedAction(
    "Move to last column",
    keyExplicitNavigation("right"),
    async () => {
      navigator.focusColumnEnd();
    },
    true,
  );

  useScopedAction(
    "Escape focus",
    "Escape",
    async () => {
      navigator.blurColumn();
    },
    true,
  );

  // const listener = useRef(false);

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

  // const classes = clsx("", {
  //   " prose": true,
  // });

  return (
    <div data-component-name="DocumentDetail">
      <div className="px-4 pb-2 opacity-50 focus-within:opacity-100">
        <GoToHome />
      </div>
      <main
        lang={staticDocumentData.data.meta.lang ?? "en"}
        // className={classes}
        className="font-serif text-base text-white [&_a]:text-indigo-500 [&_a]:underline"
      >
        {builder.layout.tree.map((branchOrNode, rowIndex) => (
          <LayoutBranchOrNode
            key={branchOrNode.id}
            value={branchOrNode}
            renderNode={(node, columnIndex) => {
              const isFocused = node.id === selection.nodeId;

              const data = node.data || generateDocumentRegion({});

              return (
                <DocumentRegion
                  onSave={(region) => {
                    handleSave(region, node);
                  }}
                  onExplicitAnnounce={() => {
                    return `Item ${columnIndex + 1} of Row ${rowIndex + 1} from the top`;
                  }}
                  onImplicitAnnounce={() => {
                    return null;
                  }}
                  onChange={() => {
                    // handleChange(region, node);
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
