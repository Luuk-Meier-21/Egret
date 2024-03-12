import { useLoaderData } from "react-router";
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
import { TauriEvent, listen } from "@tauri-apps/api/event";
import { fetchDocumentById, saveDocument } from "../../utils/documents";
import { useHotkeyOverride, useHotkeys } from "../../utils/hotkeys";
import { useContext, useRef } from "react";
import { IBlock } from "../../types/block";
import { toggleBlock } from "../../utils/block";
import { PromptContext } from "../Prompt/PromptProvider";
import { isValidUrl } from "../../utils/url";

interface DocumentDetailProps {}

const UNSAVED_CHANGES_MAX = 15;

function DocumentDetail({}: DocumentDetailProps) {
  const unsavedChangesCount = useRef(0);

  const documentData = useLoaderData() as Document;
  const editor = useCreateBlockNote({
    schema,
    initialContent: documentData.content,
  });

  const getDocument = (): Document => ({
    name: documentData.name,
    id: documentData.id,
    content: editor.document,
  });

  const save = async () => {
    await saveDocument(getDocument());
    console.log("🚀 ~ save ~ after:", unsavedChangesCount.current);
    unsavedChangesCount.current = 0;
  };

  const syncDocument = async () => {
    const document = await fetchDocumentById(documentData.id);
    if (document === null) {
      // Rly weird, revert to old state? this would mean a corrupted document
      return;
    }
    editor.replaceBlocks(editor.document, document.content);
  };

  const handleBlur = async () => {
    await save();
    await syncDocument();
  };

  editor.onEditorContentChange(() => {
    unsavedChangesCount.current++;

    if (unsavedChangesCount.current > UNSAVED_CHANGES_MAX) {
      save();
    }
  });

  listen(TauriEvent.WINDOW_CLOSE_REQUESTED, async () => {
    await save();
  });

  useHotkeyOverride();
  useHotkeys("cmd+s", () => {
    save();
  });

  useHotkeys("cmd+b", () => {
    const selectedBlock = editor.getTextCursorPosition().block;
    toggleBlock(editor, selectedBlock, {
      type: "title",
    });
  });

  // useHotkeys("cmd+e", () => {
  //   (async () => {
  //     console.log(await editor.blocksToHTMLLossy());
  //     console.log(await editor.blocksToMarkdownLossy());
  //   })();
  // });

  useHotkeys("cmd+u", () => {
    const url = editor.getSelectedLinkUrl();
    console.log(url);
    window.open(url);
  });

  return (
    <div data-component-name="DocumentDetail" role="application">
      <h1 aria-live="polite" role="alert">
        {documentData.name}
      </h1>
      <BlockNoteView
        className="max-w-[46em] text-black ring-1 ring-black [&_a]:underline"
        editor={editor}
        slashMenu={false}
        sideMenu={false}
        formattingToolbar={false}
        hyperlinkToolbar={false}
        onBlur={handleBlur}
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
