import { useLoaderData } from "react-router";
import {
  BlockNoteView,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  useCreateBlockNote,
} from "@blocknote/react";
import { filterSuggestionItems } from "@blocknote/core";
import { insertTitle } from "../../blocks/Title";
import { insertAlert } from "../../blocks/Alert";
import { schema } from "../../blocks/schema";
import { Document } from "../../types/documents";
import { useEditorAutosave } from "../../utils/editor";
import { deleteDocumentById } from "../../utils/documents";
import { useRegisterAction } from "../../services/actions";
import { toggleBlock } from "../../utils/block";
import { shell } from "@tauri-apps/api";

interface DocumentDetailProps {}

function DocumentDetail({}: DocumentDetailProps) {
  // const navigate = useNavigate();

  const initialDocument = useLoaderData() as Document;
  const editor = useCreateBlockNote({
    schema,
    initialContent: initialDocument.content,
  });

  useEditorAutosave(editor, initialDocument);

  useRegisterAction("Selection to title", "cmd+b", () => {
    const selectedBlock = editor.getTextCursorPosition().block;
    toggleBlock(editor, selectedBlock, {
      type: "title",
    });
  });

  useRegisterAction("Open selected url", "cmd+u", () => {
    const url = editor.getSelectedLinkUrl();
    if (url === undefined) {
      return;
    }
    shell.open(url);
  });

  useRegisterAction("Relate keyword", "cmd+r", async () => {
    console.log("jhi");
  });

  useRegisterAction("Delete document", "shift+cmd+backspace", async () => {
    await deleteDocumentById(initialDocument.id);
  });

  return (
    <div data-component-name="DocumentDetail" role="application">
      {/* <select
        name="keywords"
        onChange={(event) => console.log(event.target.value)}
        className="flex w-full overflow-hidden"http://localhost:1420/
        id="keywords"
      >
        {globalKeywords.map((keyword) => (
          <option key={keyword.id} id={keyword.id}>
            {keyword.label}
          </option>
        ))}
      </select> */}
      <h1 aria-live="polite" role="alert">
        {initialDocument.name}
      </h1>

      <BlockNoteView
        className="max-w-[46em] text-black ring-1 ring-black [&_a]:underline"
        editor={editor}
        autoFocus
        slashMenu={false}
        sideMenu={false}
        formattingToolbar={false}
        hyperlinkToolbar={false}
      >
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={async (query) =>
            filterSuggestionItems(
              [
                ...getDefaultReactSlashMenuItems(editor),
                insertTitle(editor),
                insertAlert(editor),
              ],
              query,
            )
          }
        />
      </BlockNoteView>
    </div>
  );
}
export default DocumentDetail;
