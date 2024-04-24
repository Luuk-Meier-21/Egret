import {
  ReactNode,
  createContext,
  useContext,
  useReducer,
  useRef,
} from "react";
import { useNavigate } from "react-router";
import { ActionConfiguration } from "../../services/actions/actions-registry";
import { handleError, handleSucces } from "../../utils/announce";
import { DialogContext } from "../Dialog/DialogProvider";
import { useAbstractStore } from "../../services/store/store-hooks";
import { pathOfDocumentsDirectory } from "../../services/store/store";
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
import { useInjectedAction } from "../../services/actions/actions-hook";
import { keyAction } from "../../config/shortcut";
import { formatShortcutsForSpeech } from "../../utils/speech";

interface ActionsProps {
  children: ReactNode | ReactNode[];
}

export const ActionsContext = createContext<
  [ActionConfiguration[], React.Dispatch<ActionReducerAction>]
>([[], () => {}]);

function Actions({ children }: ActionsProps) {
  const mainRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLUListElement>(null);

  const store = useAbstractStore();

  const [actions, dispatch] = useReducer(actionsReducer, []);

  const navigate = useNavigate();
  const { prompt } = useContext(DialogContext);

  useInjectedAction(dispatch, "Back to home", keyAction("1"), async () => {
    navigate("/");
  });

  useInjectedAction(dispatch, "New document", keyAction("n"), async () => {
    try {
      const name = await prompt("Project name?");
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
  });

  useInjectedAction(dispatch, "New keyword", keyAction("m"), async () => {
    try {
      const keywordStore = await store.loadStore(
        keywordsRecordPath,
        [] as Keyword[],
        keywordsRecordOptions,
      );

      const keywords = await keywordStore.load();
      const label = await prompt("Keyword name?");
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
  });

  useInjectedAction(
    dispatch,
    "Open actions panel",
    keyAction("g"),
    () => {
      actionsRef?.current?.querySelector("button")?.focus();
    },
    true,
  );

  return (
    <div data-component-name="Actions" className="flex flex-col p-4">
      <ActionsContext.Provider value={[actions, dispatch]}>
        <div ref={mainRef}>{children}</div>
        <ul
          aria-label="Actions"
          ref={actionsRef}
          className="flex flex-col items-start p-4"
          role="menu"
        >
          {actions.map((action) => (
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
          ))}
        </ul>
      </ActionsContext.Provider>
    </div>
  );
}
export default Actions;
