import { useLoaderData } from "react-router";
import {
  BlockNoteView,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  useCreateBlockNote,
} from "@blocknote/react";
import { filterSuggestionItems, insertOrUpdateBlock } from "@blocknote/core";
import { insertTitle } from "../../blocks/Title/Title";
import { insertAlert } from "../../blocks/Alert/Alert";
import { schema } from "../../blocks/schema";
import { Document } from "../../types/documents";
import { useEditorAutosave } from "../../utils/editor";
import { deleteDocumentById } from "../../utils/documents";
import { useRegisterAction } from "../../services/actions";
import { toggleBlock } from "../../utils/block";
import { shell } from "@tauri-apps/api";
import {
  dereferenceKeywordFromDocument,
  fetchKeywords,
  keywordHasRelation,
  referenceKeywordToDocument,
  saveKeyword,
} from "../../utils/keywords";
import { useEffect, useState } from "react";
import { Keyword } from "../../types/keywords";
import { handleError } from "../../utils/announce";
import { appWindow } from "@tauri-apps/api/window";
import { insertRow } from "../../blocks/Row/Row";

interface DocumentDetailProps {}

function DocumentDetail({}: DocumentDetailProps) {
  // const navigate = useNavigate();

  const [initialDocument, initialKeywords] = useLoaderData() as [
    Document,
    Keyword[],
  ];
  const editor = useCreateBlockNote({
    schema,
    initialContent: initialDocument.content.text,
  });

  const [keywords, setKeywords] = useState<Keyword[]>(initialKeywords);
  const [openSettings, setOpenSettings] = useState(false);

  const setKeywordRelation = async (keyword: Keyword) => {
    const hasRelation = keywordHasRelation(keyword, initialDocument);

    hasRelation
      ? await dereferenceKeywordFromDocument(keyword, initialDocument)
      : await referenceKeywordToDocument(keyword, initialDocument);

    await saveKeyword(keyword);

    const keywords = await fetchKeywords();

    setKeywords(keywords);
  };

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

  const { elementWithShortcut: EditSettings } = useRegisterAction(
    "Edit Keyword",
    "cmd+k",
    () => {
      if (keywords.length <= 0) {
        handleError("No keywords to edit");
      }

      setOpenSettings(!openSettings);
    },
  );

  useRegisterAction("Delete document", "shift+cmd+backspace", async () => {
    await deleteDocumentById(initialDocument.id);
  });

  useRegisterAction("Export document to html", "shift+cmd+enter", async () => {
    console.log(await editor.blocksToMarkdownLossy(editor.document));
  });

  useRegisterAction("insert row", "cmd+4", async () => {
    const selectedBlock = editor.getTextCursorPosition().block;
    insertOrUpdateBlock(editor, {
      type: "bullet",
    });
    // editor.insertInlineContent([
    //   "test",
    //   { type: "text", text: "World", styles: {} },
    // ]);
  });

  return (
    <div
      data-component-name="DocumentDetail"
      role="application"
      lang={initialDocument.content.meta.lang ?? "en"}
    >
      <h1 className="p-4" aria-live="polite" role="alert">
        {initialDocument.name}
      </h1>

      <section className="p-4">
        <EditSettings aria-expanded={openSettings} />
        {openSettings && (
          <ul>
            {keywords.map((keyword) => (
              <li key={keyword.id}>
                <input
                  id={keyword.id}
                  type="checkbox"
                  checked={keywordHasRelation(keyword, initialDocument)}
                  onChange={() => setKeywordRelation(keyword)}
                />
                <label htmlFor={keyword.id}>{keyword.label}</label>
              </li>
            ))}
          </ul>
        )}
      </section>

      <BlockNoteView
        className="max-w-[46em] p-4 text-white ring-1 ring-white [&_a]:underline"
        editor={editor}
        autoFocus
        slashMenu={false}
        autoCorrect="false"
        spellCheck="false"
        onFocusCapture={(event) => {
          event.preventDefault();
        }}
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
                insertRow(editor),
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
