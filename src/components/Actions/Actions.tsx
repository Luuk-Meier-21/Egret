import { ReactNode, createContext, useReducer, useRef } from "react";
import { useNavigate } from "react-router";
import { ActionConfiguration } from "../../services/actions/actions-registry";
import { handleError, handleSucces } from "../../utils/announce";
import { useAbstractStore } from "../../services/store/store-hooks";
import {
  documentsPath,
  pathInDirectory,
  pathOfDocumentsDirectory,
} from "../../services/store/store";
import {
  generateDirectoryName,
  parseFileToDocumentDirectory,
} from "../../services/document/document-generator";
import {
  keywordsRecordOptions,
  keywordsRecordPath,
} from "../../config/keywords";
import { Keyword } from "../../types/keywords";
import { generateKeyword } from "../../services/keyword/keyword-generator";
import { slugify } from "../../utils/url";
import {
  ActionReducerAction,
  actionsReducer,
} from "../../services/actions/actions-reducer";
import { useInjectedScopedAction } from "../../services/actions/actions-hook";
import { keyAction, keyExplicitAction } from "../../config/shortcut";
import { prompt, selectSingle } from "../../services/window/window-manager";
import { announceError } from "../../utils/error";
import { navigateDropState } from "../../utils/navigation";
import { formatShortcutsForSpeech } from "../../utils/speech";
import { generateLayoutWithContent } from "../../services/layout/layout-content";
import {
  defaultLayoutMapping,
  generateDefaultLayout,
} from "../../config/layout";
import { ONBOARDING_CONTENT } from "../../config/onboarding";
import { ARIA_DETAIL_MAPPING, setAriaDetail } from "../../services/aria/detail";
import { selectConfigFromMapping } from "../../utils/config";
import { emit } from "@tauri-apps/api/event";
import {
  DocumentEvent,
  emitDocumentEvent,
} from "../../services/document/event";

interface ActionsProps {
  children: ReactNode | ReactNode[];
}

export const ActionsContext = createContext<
  [
    ActionConfiguration[],
    React.Dispatch<ActionReducerAction>,
    (slug: string) => ActionConfiguration | null,
  ]
>([[], () => {}, (_slug: string) => null]);

function Actions({ children }: ActionsProps) {
  const mainRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLUListElement>(null);
  const store = useAbstractStore();
  const [actions, dispatch] = useReducer(actionsReducer, []);
  const navigate = useNavigate();

  const getActionBySlug = (slug: string): ActionConfiguration | null => {
    const action = actions.find((value) => slugify(value.label) === slug);

    if (action === undefined) {
      return null;
    }

    return action;
  };

  window.addEventListener("keydown", (event) => {
    if (
      event.key === "Backspace" &&
      //@ts-ignore
      (event.target.tagName === "BODY" || event.target.tagName === "BUTTON")
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  const { elementWithShortcut: GoToHome } = useInjectedScopedAction(
    dispatch,
    "Navigate to home",
    keyAction("Escape"),
    async () => {
      const path = window.location.pathname;

      if (path.includes("documents/")) {
        emit(
          ...emitDocumentEvent(
            DocumentEvent.CLOSE,
            path.split("/").pop() || "-1",
          ),
        );
      }

      navigate("/");
    },
  );

  const { elementWithShortcut: NewDocument } = useInjectedScopedAction(
    dispatch,
    "New document",
    keyAction("n"),
    async () => {
      try {
        const name = await prompt("New document", "Document name");
        const path = pathOfDocumentsDirectory(generateDirectoryName(name));

        const directory = await store.createDirectory(
          path,
          parseFileToDocumentDirectory,
        );

        const layoutOptions = Object.keys(defaultLayoutMapping).map((key) => ({
          value: key,
          label: key,
        }));

        const layoutKey = (await selectSingle(
          "Document layout",
          "Select a document layout",
          layoutOptions,
        )) as keyof typeof defaultLayoutMapping;

        await store
          .createStore(
            generateLayoutWithContent(generateDefaultLayout(layoutKey), [
              ONBOARDING_CONTENT,
            ]),
            pathInDirectory(directory, "layout.json"),
          )
          .save();

        navigateDropState(navigate, `/documents/${directory.id}`);
        handleSucces();
      } catch (error) {
        handleError("Failed to create document: ", error);
      }
    },
  );

  const { elementWithShortcut: NewKeyword } = useInjectedScopedAction(
    dispatch,
    "New keyword",
    keyAction("m"),
    async () => {
      try {
        const keywordStore = await store.loadStore(
          keywordsRecordPath,
          [] as Keyword[],
          keywordsRecordOptions,
        );

        const keywords = await keywordStore.load();
        const label = await prompt("New keyword", "Keyword name");
        const matchingKeyword = keywords.find(
          (keyword) => keyword.slug === slugify(label),
        );

        if (matchingKeyword) {
          throw Error("Keyword of name found");
        }

        const keyword = generateKeyword({ label });

        keywordStore.set([...keywords, keyword]).save();
      } catch (error) {
        handleError("Failed to create keyword: ", error);
      }

      handleSucces();
    },
  );

  useInjectedScopedAction(
    dispatch,
    "Open documents panel",
    keyAction("p"),
    async () => {
      const documents = await store.searchDirectory(
        documentsPath(),
        parseFileToDocumentDirectory,
      );

      if (documents.length <= 0) {
        announceError();
        return;
      }

      const documentId = await selectSingle(
        "Open document",
        "Search for documents",
        documents.map((document) => ({
          label: document.name,
          value: document.id,
        })),
      );

      navigateDropState(navigate, `/documents/${documentId}`);
    },
  );

  const { elementWithShortcut: OpenActionsPanel } = useInjectedScopedAction(
    dispatch,
    "Open action panel",
    keyExplicitAction("p"),
    async (config) => {
      const availableActions = actions
        .map((action) => ({
          label: `${action.label} (${formatShortcutsForSpeech(action.shortcut.split("+")).join(" + ")})`,
          value: slugify(action.label),
        }))
        .sort((a, b) => a.label.localeCompare(b.label))
        .filter((action) => action.value !== slugify(config.label));

      const actionSlug = await selectSingle(
        "Execute action",
        "Search for actions",
        availableActions,
      );

      const action = getActionBySlug(actionSlug);
      action?.callback(action);
    },
  );

  const { elementWithShortcut: SetDetailLevel } = useInjectedScopedAction(
    dispatch,
    "Set detail level",
    keyExplicitAction("1"),
    async () => {
      const succes = await selectConfigFromMapping(
        ARIA_DETAIL_MAPPING,
        setAriaDetail,
      );
      if (!succes) {
        announceError();
      }
    },
  );

  const elements = [
    GoToHome,
    OpenActionsPanel,
    NewDocument,
    NewKeyword,
    SetDetailLevel,
  ];

  return (
    <div
      data-component-name="Actions"
      className="flex min-h-screen flex-col gap-y-5 p-4 pt-8"
    >
      <ActionsContext.Provider value={[actions, dispatch, getActionBySlug]}>
        <div className="flex flex-1 flex-col" ref={mainRef}>
          {children}
        </div>
        <ul
          aria-label="Actions"
          className="bento-light sr-only flex flex-col divide-y-[1px] divide-white/20 py-1 focus-within:not-sr-only"
          role="menu"
          ref={actionsRef}
        >
          {elements.map((Element) => (
            <li>
              <Element className="bento-focus-light my-1 rounded-[1rem] px-5 py-1.5" />
            </li>
          ))}
        </ul>
      </ActionsContext.Provider>
    </div>
  );
}
export default Actions;
