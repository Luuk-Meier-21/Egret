import { ReactNode, useContext, useRef } from "react";
import { useHotkeyOverride, useHotkeys } from "../../utils/hotkeys";
import { PromptContext } from "../Prompt/PromptProvider";
import { createDocument, saveDocument } from "../../utils/documents";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { Document } from "../../types/documents";
import {
  action,
  actionsRegistry,
  useRegisterAction,
} from "../../services/actions";
import { createKeyword, saveKeyword } from "../../utils/keywords";

interface ActionsProps {
  children: ReactNode | ReactNode[];
}

function Actions({ children }: ActionsProps) {
  const mainRef = useRef<HTMLElement>(null);
  const actionsRef = useRef<HTMLUListElement>(null);

  const prompt = useContext(PromptContext);
  const navigate = useNavigate();

  const { elementWithShortcut: NewDocumentButton } = useRegisterAction(
    "New document",
    "cmd+n",
    async () => {
      try {
        const name = await prompt("What will the document be called?");
        const document: Document = createDocument(name);
        await saveDocument(document);

        // TODO: share succes state
        setTimeout(() => {
          navigate(`/documents/${document.id}`);
        }, 100);
      } catch (error) {
        console.error("Failed to create document: ", error);
      }
    },
  );

  const { elementWithShortcut: NewKeywordButton } = useRegisterAction(
    "New keyword",
    "cmd+m",
    async () => {
      try {
        const label = await prompt("What will the keyword be called?");
        const keyword = await createKeyword(label);

        await saveKeyword(keyword);
      } catch (error) {
        console.error("Failed to create keyword: ", error);
      }
    },
  );

  useRegisterAction("Focus main content", "control+space", () => {
    actionsRef?.current?.focus();
  });

  return (
    <div data-component-name="Actions" className="flex flex-col">
      <Link to="/">Back to all documents.</Link>

      <main ref={mainRef} className="ring-1 ring-black">
        {children}
      </main>
      {/* {actionsRegistry.map((action) => (
        <li key={action.shortcut}>
          <button onClick={action.callback}>
            {action.label} <em>{action.shortcut}</em>
          </button>
        </li>
      ))} */}
    </div>
  );
}
export default Actions;
