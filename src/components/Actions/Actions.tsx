import { ReactNode, useContext, useRef } from "react";
import { useHotkeyOverride, useHotkeys } from "../../utils/hotkeys";
import { PromptContext } from "../Prompt/PromptProvider";
import { createDocument, saveDocument } from "../../utils/documents";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { Document } from "../../types/documents";

interface ActionsProps {
  children: ReactNode | ReactNode[];
}

function Actions({ children }: ActionsProps) {
  const mainRef = useRef<HTMLElement>(null);
  const actionsRef = useRef<HTMLUListElement>(null);

  const prompt = useContext(PromptContext);
  const navigate = useNavigate();

  const newDocument = async () => {
    const name = await prompt("What will the document be called?");
    if (name === null) {
      console.error("Returned from prompt");
      return;
    }

    const document: Document = createDocument(name);
    const succes = await saveDocument(document);

    if (!succes) {
      // creating failed
      return;
    }

    setTimeout(() => {
      navigate(`/documents/${document.id}`);
    }, 100);
  };

  const focusFirstAction = () => {
    console.log(actionsRef?.current);
    actionsRef?.current?.focus();
  };

  useHotkeyOverride();
  useHotkeys("cmd+n", () => {
    newDocument();
  });

  useHotkeys("control+space", () => {
    focusFirstAction();
  });

  return (
    <div data-component-name="Actions" className="flex flex-col">
      <Link to="/">Back to all documents.</Link>

      <main ref={mainRef}>{children}</main>
      <ul
        role="group"
        ref={actionsRef}
        className="opacity-0 focus-within:opacity-100"
      >
        <li>
          <button className="text-left" onClick={newDocument}>
            New Document "command, n"
          </button>
        </li>
      </ul>
    </div>
  );
}
export default Actions;
