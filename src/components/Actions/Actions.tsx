import {
  ReactNode,
  createContext,
  useContext,
  useReducer,
  useRef,
} from "react";
import { useNavigate } from "react-router";
import {
  ActionConfiguration,
  action,
} from "../../services/actions/actions-registry";
import { handleError, handleSucces } from "../../utils/announce";
import { DialogContext } from "../Dialog/DialogProvider";
import { useAbstractStore } from "../../services/store/store-hooks";
import {
  documentsPath,
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
import {
  useInjectedAction,
  useScopedAction,
} from "../../services/actions/actions-hook";
import { keyAction, keyExplicitAction } from "../../config/shortcut";
import { formatShortcutsForSpeech } from "../../utils/speech";
import { prompt, selectSingle } from "../../services/window/window-manager";
import { announceError } from "../../utils/error";

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

  const { elementWithShortcut: NewDocument } = useInjectedAction(
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

        // TODO: share succes state
        setTimeout(() => {
          navigate(`/`);
          handleSucces();
          navigate(`/documents/${directory.id}`);
        }, 100);
      } catch (error) {
        handleError("Failed to create document: ", error);
      }
    },
  );

  const { elementWithShortcut: NewKeyword } = useInjectedAction(
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
        } // merge

        const keyword = generateKeyword({ label });

        keywordStore.set([...keywords, keyword]).save();
      } catch (error) {
        handleError("Failed to create keyword: ", error);
      }

      handleSucces();
    },
  );

  useInjectedAction(
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

      const documentName = await selectSingle(
        "Open document",
        "Search for documents",
        documents.map((document) => document.name),
      );
      const document = documents.find(
        (value) => slugify(value.name) === slugify(documentName),
      );

      if (document === undefined) {
        announceError();
        return;
      }

      navigate("/");
      setTimeout(() => {
        navigate(`/documents/${document?.id}`);
      }, 100);
    },
    true,
  );

  const { elementWithShortcut: OpenActionsPanel } = useInjectedAction(
    dispatch,
    "Open action panel",
    keyExplicitAction("p"),
    async () => {
      const actionLabel = await selectSingle(
        "Execute action",
        "Search for actions",
        actions.map((action) => action.label),
      );
      const action = getActionBySlug(slugify(actionLabel));
      action?.callback();
    },
    true,
  );

  return (
    <div data-component-name="Actions" className="flex flex-col p-4">
      <ActionsContext.Provider value={[actions, dispatch, getActionBySlug]}>
        <div ref={mainRef}>{children}</div>
        <ul
          aria-label="Actions"
          className="flex flex-col items-start p-4 opacity-50 focus-within:opacity-100  "
          role="menu"
          ref={actionsRef}
        >
          <li>
            <OpenActionsPanel />
          </li>
          <li>
            <NewDocument />
          </li>
          <li>
            <NewKeyword />
          </li>
          {/* {actions.map((action) => (
            <button
              className="block"
              onClick={() => {
                action.callback();
              }}
            >
              {action.label}{" "}
              <em className="text-white/40">
                (
                {formatShortcutsForSpeech(action.shortcut.split("+")).join(
                  ", ",
                )}
                )
              </em>
            </button>
          ))} */}
        </ul>
      </ActionsContext.Provider>
    </div>
  );
}
export default Actions;
