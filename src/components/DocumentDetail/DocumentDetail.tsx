import { useLoaderData, useNavigate } from "react-router";
import {
  BlockNoteView,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  useCreateBlockNote,
} from "@blocknote/react";
import {
  BlockIdentifier,
  filterSuggestionItems,
  insertOrUpdateBlock,
} from "@blocknote/core";
import { insertTitle } from "../../blocks/Title";
import { insertAlert } from "../../blocks/Alert";
import { schema } from "../../blocks/schema";
import { Document } from "../../types/documents";
import { useEditorAutosave, useEditorHotkeys } from "../../utils/editor";

interface DocumentDetailProps {}

function DocumentDetail({}: DocumentDetailProps) {
  // const navigate = useNavigate();

  const initialDocument = useLoaderData() as Document;
  const editor = useCreateBlockNote({
    schema,
    initialContent: initialDocument.content,
  });

  useEditorHotkeys(editor);
  useEditorAutosave(editor, initialDocument);

  return (
    <div data-component-name="DocumentDetail" role="application">
      {/* <select
        name="keywords"
        onChange={(event) => console.log(event.target.value)}
        className="flex w-full overflow-hidden"
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
