import { ReactNode, useContext, useRef } from "react";
import {
  createDocument,
  fetchDocumentsReferences,
  saveDocument,
} from "../../utils/documents";
import { useNavigate } from "react-router";
import { Document } from "../../types/documents";
import { useRegisterAction } from "../../services/actions";
import { createKeyword, saveKeyword } from "../../utils/keywords";
import { handleError, handleSucces } from "../../utils/announce";
import { ONBOARDING_CONTENT } from "../../config/onboarding";
import { DialogContext } from "../Dialog/DialogProvider";

interface ActionsProps {
  children: ReactNode | ReactNode[];
}

function Actions({ children }: ActionsProps) {
  const mainRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLUListElement>(null);

  const navigate = useNavigate();
  const { prompt, select } = useContext(DialogContext);

  const { elementWithShortcut: BackHomeButton } = useRegisterAction(
    "Back to home",
    "cmd+1",
    async () => {
      navigate("/");
    },
  );

  useRegisterAction("Focus first action", "cmd+2", async () => {
    (
      mainRef.current?.querySelector("#documents > button") as HTMLButtonElement
    )?.focus();
  });

  useRegisterAction("Focus first action", "cmd+3", async () => {
    actionsRef.current?.querySelector("button")?.focus();
  });

  const { elementWithShortcut: NewDocumentButton } = useRegisterAction(
    "New document",
    "cmd+n",
    async () => {
      try {
        const documents = await fetchDocumentsReferences();
        const name = await prompt("What will the document be called?");

        const introductionContent =
          documents.length <= 0 ? ONBOARDING_CONTENT : undefined;

        const document: Document = createDocument(name, introductionContent);
        await saveDocument(document);
        console.log(name);

        // TODO: share succes state
        setTimeout(() => {
          navigate(`/`);
          handleSucces();
          navigate(`/documents/${document.id}`);
        }, 100);
      } catch (error) {
        handleError("Failed to create document: ", error);
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
        handleError("Failed to create keyword: ", error);
      }

      handleSucces();
    },
  );

  useRegisterAction("Focus main content", "control+space", () => {
    actionsRef?.current?.focus();
  });

  return (
    <div data-component-name="Actions menu" className="flex flex-col">
      <div className="p-4">
        <BackHomeButton />
      </div>

      <div ref={mainRef} className="ring-1 ring-white">
        {children}
      </div>
      <ul
        aria-label="Actions menu"
        ref={actionsRef}
        className=" p-4"
        role="menu"
      >
        <li role="menuitem">
          <NewDocumentButton />
        </li>
        <li role="menuitem">
          <NewKeywordButton />
        </li>
      </ul>
    </div>
  );
}
export default Actions;
