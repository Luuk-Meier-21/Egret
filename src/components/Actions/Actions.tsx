import { ReactNode, useContext, useRef } from "react";
import { useHotkeyOverride, useHotkeys } from "../../utils/hotkeys";
import { PromptContext } from "../Prompt/PromptProvider";
import { createDocument } from "../../utils/documents";
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
    // const succes = await saveDocument(document);

    // TODO: share succes state
    setTimeout(() => {
      navigate(`/documents/${document.id}`);
    }, 100);
  };

  // const newKeyword = async () => {
  //   try {
  //     const label = await prompt("What will the keyword label be?");
  //     if (label === null) {
  //       console.error("Null label not allowed");
  //       return;
  //     }
  //     const succes = await saveKeyword(createKeyword(label));
  //     // TODO: share succes state
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

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

  // useHotkeys("cmd+k", () => {
  //   newKeyword();
  // });

  return (
    <div data-component-name="Actions" className="flex flex-col">
      <Link to="/">Back to all documents.</Link>

      <main ref={mainRef} className="ring-1 ring-black">
        {children}
      </main>
      <ul
        role="group"
        ref={actionsRef}
        className="flex flex-col ring-1 ring-black"
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
